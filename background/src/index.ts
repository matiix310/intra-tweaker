import modules from "./modules";
import type { BackgroundScriptConfig } from "./types/global";

let disabled = false;

const backgroundScriptConfigs: BackgroundScriptConfig[] = [];

for (let module of modules) {
  for (let subModule of module.children) {
    if (subModule.kind == "background") {
      import("./modules/" + module.folder + "/" + subModule.name + ".js").then(
        (backgroundScript) => {
          if (!disabled) backgroundScript.default.start();
          backgroundScriptConfigs.push(backgroundScript.default);
        }
      );
    } else if (subModule.kind == "content") {
      if (!subModule.loadingStatus) subModule.loadingStatus = "complete";
      browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
        if (
          !disabled &&
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

browser.browserAction.onClicked.addListener(async () => {
  disabled = !disabled;
  browser.storage.local.set({ disabled });
  browser.browserAction.setIcon({
    path: disabled ? "icons/anvil_disabled.png" : "icons/anvil.png",
  });
  backgroundScriptConfigs.forEach((s) => (disabled ? s.stop() : s.start()));
  const tabs = await browser.tabs.query({ url: "*://intra.forge.epita.fr/*" });
  for (const { id } of tabs) if (id) await browser.tabs.reload(id);
});

const init = async () => {
  const { disabledStorage } = await browser.storage.local.get("disabled");
  if (disabledStorage != undefined) disabled = disabledStorage;
};

init();
