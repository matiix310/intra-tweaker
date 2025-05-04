import type { BackgroundScriptConfig } from "../../../../types/global";
import { getItem } from "../../../../utils/localStorage";

async function notify(title: string, content: string) {
  if (content.startsWith("At "))
    if (new Map(JSON.parse((await getItem("modulesState"))!)).get("Winwheel"))
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
};

const stop = () => {
  browser.runtime.onMessage.removeListener(cb);
};

const config: BackgroundScriptConfig = {
  start,
  stop,
};

export default config;
