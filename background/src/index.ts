import modules from "./modules";
import type { BackgroundScriptConfig, Module } from "./types/global";
const backgroundScriptConfigs: { name: string; config: BackgroundScriptConfig }[] = [];

const initModules = () => {
  const modulesState = initModulesState(modules);

  for (let module of modules) {
    for (let subModule of module.children) {
      if (subModule.kind == "background") {
        import("./modules/" + module.folder + "/" + subModule.name + ".js").then(
          (backgroundScript) => {
            if (modulesState.get(module.name)) backgroundScript.default.start();
            backgroundScriptConfigs.push({
              name: module.name,
              config: backgroundScript.default,
            });
          }
        );
      } else if (subModule.kind == "content") {
        if (!subModule.loadingStatus) subModule.loadingStatus = "complete";
        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
          if (
            getModulesState()?.get(module.name) &&
            changeInfo.status &&
            subModule.loadingStatus == changeInfo.status
          )
            sendScript(
              "background/dist/modules/" + module.folder + "/" + subModule.name + ".js",
              tabId
            );
        }, subModule.filter);
      }
    }
  }
};

const sendScript = (file: string, tabId: number) => {
  function onExecuted(result: any) {}

  function onError(error: any) {
    console.log(`Error: ${error}`);
  }

  const executing = browser.tabs.executeScript(tabId, {
    file,
  });
  executing.then(onExecuted, onError);
};

const getModulesState = () => {
  const storage = localStorage.getItem("modulesState");
  if (!storage) return;
  return new Map(JSON.parse(storage)) as Map<string, boolean>;
};

const setModulesState = (moduleName: string, state: boolean) => {
  const modulesState = getModulesState();
  if (!modulesState) return;

  modulesState.set(moduleName, state);

  localStorage.setItem("modulesState", JSON.stringify([...modulesState.entries()]));
};

const initModulesState = (modules: Module[]) => {
  const modulesState = getModulesState() ?? new Map<string, boolean>();
  modules.forEach((m) => {
    if (!modulesState.has(m.name)) modulesState.set(m.name, m.default ?? false);
  });
  localStorage.setItem("modulesState", JSON.stringify([...modulesState.entries()]));
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

const init = async () => {
  browser.runtime.onMessage.addListener(async (message: any) => {
    if (!message.action) return;

    if (message.action == "fetchModules") {
      const formattedModules = [];
      for (let module of modules) {
        const active = getModulesState()?.get(module.name) ?? false;
        formattedModules.push({ name: module.name, author: module.author, active });
      }
      return formattedModules;
    } else if (message.action == "toggleModule") {
      // get module state
      if (!getModulesState()?.get(message.name)) {
        // enable Module
        backgroundScriptConfigs
          .filter((c) => c.name == message.name)
          .forEach((c) => c.config.start());
        setModulesState(message.name, true);
      } else {
        // disable Module
        backgroundScriptConfigs
          .filter((c) => c.name == message.name)
          .forEach((c) => c.config.stop());
        setModulesState(message.name, false);
      }
      reloadTabsForModule(message.name);
    }
  });

  initModules();
};

init();
