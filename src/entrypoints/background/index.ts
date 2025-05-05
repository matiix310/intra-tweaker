import modules from "./modules";
import type { BackgroundScriptConfig, Module, ShortModule } from "../../types/global";
import { getItem, setItem } from "../../utils/localStorage";
import { matchPattern } from "browser-extension-url-match";
const backgroundScriptConfigs: { name: string; config: BackgroundScriptConfig }[] = [];

const chromeCheckUrlFilter = (currentUrl: string, urls: string[]) => {
  for (const url of urls) {
    const matcher = matchPattern(url).assertValid();
    if (matcher.match(currentUrl)) return true;
  }

  return false;
};

const chromeCheckFilter = (
  filter: browser.tabs.UpdateFilter,
  currentUrl?: string,
  currentTabId?: number
) => {
  if (filter.urls && currentUrl && chromeCheckUrlFilter(currentUrl, filter.urls))
    return true;
  if (filter.tabId && currentTabId && filter.tabId === currentTabId) return true;

  return false;
};

const initModules = async () => {
  const modulesState = await initModulesState(modules);

  for (let module of modules) {
    for (let subModule of module.children) {
      if (subModule.kind == "background") {
        import(`./scripts/${module.folder}/${subModule.name}.ts`)
          .then((backgroundScript) => {
            if (modulesState.get(module.name)) backgroundScript.default.start();
            backgroundScriptConfigs.push({
              name: module.name,
              config: backgroundScript.default,
            });
          })
          .catch(console.error);
      } else if (subModule.kind == "content") {
        if (import.meta.env.BROWSER === "firefox") {
          browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
            if (
              (await getModulesState())?.get(module.name) &&
              changeInfo.status &&
              changeInfo.status === "complete"
            )
              sendScript(`./module_${module.folder}.js`, tabId);
          }, subModule.filter);
        } else if (import.meta.env.BROWSER === "chrome") {
          chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
            if (!chromeCheckFilter(subModule.filter, tabInfo.url, tabId)) return;
            if (
              (await getModulesState())?.get(module.name) &&
              changeInfo.status &&
              changeInfo.status === "complete"
            )
              sendScript(`./module_${module.folder}.js`, tabId);
          });
        }
      }
    }
  }
};

const sendScript = async (file: string, tabId: number) => {
  if (import.meta.env.BROWSER === "chrome") {
    chrome.scripting.executeScript({
      files: [file],
      target: {
        tabId,
      },
    });
  } else if (import.meta.env.BROWSER === "firefox") {
    browser.tabs.executeScript(tabId, { file });
  }
};

const getModulesState = async () => {
  const storage = await getItem("modulesState");
  if (!storage) return;
  return new Map(JSON.parse(storage)) as Map<string, boolean>;
};

const setModulesState = async (moduleName: string, state: boolean) => {
  const modulesState = await getModulesState();
  if (!modulesState) return;

  modulesState.set(moduleName, state);

  setItem("modulesState", JSON.stringify([...modulesState.entries()]));
};

const initModulesState = async (modules: Module[]) => {
  const modulesState = (await getModulesState()) ?? new Map<string, boolean>();
  modules.forEach((m) => {
    if (!modulesState.has(m.name)) modulesState.set(m.name, m.default ?? false);
  });
  setItem("modulesState", JSON.stringify([...modulesState.entries()]));
  return modulesState;
};

const reloadTabsForModule = async (name: string) => {
  const module = modules.find((m) => m.name == name);
  if (!module) return;

  // reaload all pages matching its filters
  const tabsToReaload: number[] = [];

  const children = module.children.filter((c) => c.kind == "content");

  for (let c of children) {
    const tabs = await browser.tabs.query({ url: c.filter.urls });
    for (let tab of tabs) {
      if (tab.id && !tabsToReaload.includes(tab.id)) {
        tabsToReaload.push(tab.id);
      }
    }
  }

  for (let tabId of tabsToReaload) {
    browser.tabs.reload(tabId);
  }
};

export const init = async () => {
  // must return true when async
  const handleMessage = (message: any, sendResponse: (_: any) => void) => {
    if (!message.action) return null;

    if (message.action == "fetchModules") {
      const formattedModules: ShortModule[] = [];
      for (let module of modules) {
        getModulesState().then((m) => {
          const active = m?.get(module.name) ?? false;
          formattedModules.push({ name: module.name, author: module.author, active });
          if (formattedModules.length === modules.length) sendResponse(formattedModules);
        });
      }
      return true;
    } else if (message.action == "toggleModule") {
      // get module state
      getModulesState().then((m) => {
        if (!m) {
          sendResponse(null);
          return;
        }

        if (!m.get(message.name)) {
          // enable Module
          for (let c of backgroundScriptConfigs.filter((c) => c.name == message.name)) {
            c.config.start();
            console.log("starting: " + message.name);
          }
          setModulesState(message.name, true);
          reloadTabsForModule(message.name);
          sendResponse(null);
        } else {
          // disable Module
          for (const c of backgroundScriptConfigs.filter((c) => c.name == message.name))
            c.config.stop();
          setModulesState(message.name, false);
          reloadTabsForModule(message.name);
          sendResponse(null);
        }
      });

      return true;
    }

    return null;
  };

  if (import.meta.env.BROWSER === "firefox")
    browser.runtime.onMessage.addListener(
      (message) => new Promise((res) => handleMessage(message, res))
    );
  else if (import.meta.env.BROWSER === "chrome")
    chrome.runtime.onMessage.addListener((message, _, sendMessage) =>
      handleMessage(message, sendMessage)
    );

  initModules();
};

export default defineBackground(() => {
  init();
});
