import type { BackgroundScriptConfig } from "../../types/global";

const getDisabledModules = () => {
  const storage = localStorage.getItem("disabledModules");
  if (!storage) return [];
  const list = JSON.parse(storage);
  if (!list) return [];
  return list;
};

async function notify(title: string, content: string) {
  if (
    content.startsWith("At ") &&
    !(await browser.runtime.sendMessage({ action: "fetchModules" })).includes("Winwheel")
  )
    content = "At *** (winwheel enabled)";
  browser.notifications.create({
    type: "basic",
    // iconUrl: browser.extension.getURL("icons/link-48.png"),
    title: title,
    message: content,
  });
}

const cb = (m: any) => {
  if (m.action && m.action == "notify") notify(m.title, m.content);
};

const start = () => {
  browser.runtime.onMessage.addListener(cb);
  console.log(getDisabledModules());
};

const stop = () => {
  browser.runtime.onMessage.removeListener(cb);
};

const config: BackgroundScriptConfig = {
  start,
  stop,
};

export default config;
