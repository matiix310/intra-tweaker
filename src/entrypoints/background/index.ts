import browser from "webextension-polyfill";

import modules from "./modules";
import type { BackgroundScriptConfig, Module, ShortModule } from "../../types/global";
import { getItem, setItem } from "../../utils/localStorage";
const backgroundScriptConfigs: { name: string; config: BackgroundScriptConfig }[] = [];

const initModules = async () => {
  const modulesState = await initModulesState(modules);

  browser.userScripts.configureWorld({
    messaging: true,
  });

  for (let module of modules) {
    let i = 0;
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
        if (modulesState.get(module.name))
          registerScript(
            `./module_${module.folder}.js`,
            subModule.matches,
            module.name + i++
          );
      }
    }
  }
};

const registerScript = async (file: string, matches: string[], id: string) => {
  if (!(await browser.permissions.contains({ permissions: ["userScripts"] }))) return;

  browser.userScripts.register([
    {
      id,
      js: [{ file }],
      matches,
    },
  ]);
};

const unregisterScript = async (id: string) => {
  browser.userScripts.unregister({
    ids: [id],
  });
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
    const tabs = await browser.tabs.query({ url: c.matches });
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
  let userScriptsPermission = await browser.permissions.contains({
    permissions: ["userScripts"],
  });
  if (import.meta.env.BROWSER === "firefox") {
    if (!userScriptsPermission) {
      const url = browser.runtime.getURL("/html/index.html");
      browser.tabs.create({
        url,
      });
    }
  }

  // must return true when async
  const handleMessage = (message: any, sendResponse: (_: any) => void): void => {
    if (!message.action) return;

    if (message.action == "fetchModules") {
      const formattedModules: ShortModule[] = [];
      for (let module of modules) {
        getModulesState().then((m) => {
          const active = m?.get(module.name) ?? false;
          formattedModules.push({ name: module.name, author: module.author, active });
          if (formattedModules.length === modules.length) sendResponse(formattedModules);
        });
      }
      return;
    } else if (message.action == "toggleModule") {
      // get module state
      getModulesState().then((m) => {
        if (!m) {
          sendResponse(null);
          return;
        }

        const module = modules.find((m) => m.name === message.name);

        if (!m.get(message.name)) {
          // enable Module
          for (let c of backgroundScriptConfigs.filter((c) => c.name == message.name)) {
            c.config.start();
            console.log("starting: " + message.name);
          }
          setModulesState(message.name, true);
          if (module) {
            let i = 0;
            for (const contentChild of module.children.filter(
              (c) => c.kind === "content"
            ))
              registerScript(
                `./module_${module.folder}.js`,
                contentChild.matches,
                module.name + i++
              );
            reloadTabsForModule(message.name);
          }
          reloadTabsForModule(message.name);
          sendResponse(null);
        } else {
          // disable Module
          for (const c of backgroundScriptConfigs.filter((c) => c.name == message.name))
            c.config.stop();
          setModulesState(message.name, false);
          if (module) {
            for (
              let i = 0;
              i < module.children.filter((c) => c.kind === "content").length;
              i++
            )
              unregisterScript(module.name + i);
            reloadTabsForModule(message.name);
          }
          sendResponse(null);
        }
      });

      return;
    } else if (message.action === "fetchUserScriptsPermission") {
      browser.permissions
        .contains({
          permissions: ["userScripts"],
        })
        .then(sendResponse);
      return;
    } else if (message.action === "initModules") {
      initModules();
      sendResponse(null);
      return;
    }
  };

  browser.runtime.onMessage.addListener(
    (message) => new Promise((res) => handleMessage(message, res))
  );

  if (userScriptsPermission) initModules();
};

export default defineBackground(() => {
  init();
});
