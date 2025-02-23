import modules from "./modules";
import type { BackgroundScriptConfig } from "./types/global";
const backgroundScriptConfigs: { name: string; config: BackgroundScriptConfig }[] = [];

const initModules = () => {
  const disabledModules = getDisabledModules();

  for (let module of modules) {
    for (let subModule of module.children) {
      if (subModule.kind == "background") {
        import("./modules/" + module.folder + "/" + subModule.name + ".js").then(
          (backgroundScript) => {
            if (!disabledModules.includes(module.name)) backgroundScript.default.start();
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
            !getDisabledModules().includes(module.name) &&
            changeInfo.status &&
            subModule.loadingStatus == changeInfo.status
          )
            sendScript(
              "background/dist/modules/" + module.folder + "/" + subModule.name + ".js"
            );
        }, subModule.filter);
      }
    }
  }
};

const sendScript = (file: string) => {
  function onExecuted(result: any) {}

  function onError(error: any) {
    console.log(`Error: ${error}`);
  }

  const executing = browser.tabs.executeScript({
    file,
  });
  executing.then(onExecuted, onError);
};

const getDisabledModules = (): string[] => {
  const storage = localStorage.getItem("disabledModules");
  if (!storage) return [];
  const list = JSON.parse(storage);
  if (!list) return [];
  return list;
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
      const disabledModules = getDisabledModules();
      for (let module of modules) {
        const active = !disabledModules.includes(module.name);
        formattedModules.push({ name: module.name, author: module.author, active });
      }
      return formattedModules;
    } else if (message.action == "toggleModule") {
      // get module state
      const disabeledModules = getDisabledModules();
      if (disabeledModules.includes(message.name)) {
        // enable Module
        backgroundScriptConfigs
          .filter((c) => c.name == message.name)
          .forEach((c) => c.config.start());
        // remove from disabeledModules
        localStorage.setItem(
          "disabledModules",
          JSON.stringify(disabeledModules.filter((m) => m != message.name))
        );
      } else {
        // disable Module
        backgroundScriptConfigs
          .filter((c) => c.name == message.name)
          .forEach((c) => c.config.stop());
        // add to disabeledModules
        disabeledModules.push(message.name);
        localStorage.setItem("disabledModules", JSON.stringify(disabeledModules));
      }
      reloadTabsForModule(message.name);
    }
  });

  initModules();
};

init();
