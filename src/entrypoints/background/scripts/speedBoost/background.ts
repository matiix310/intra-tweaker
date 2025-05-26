import type { BackgroundScriptConfig } from "../../../../types/global";

const criPPBlocker = () => {
  return {
    cancel: true,
  };
};

const blockImageChrome = (url: string, id: number) => {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id,
        priority: 1,
        action: {
          type: "block",
        },
        condition: {
          urlFilter: url,
          resourceTypes: ["image"],
        },
      },
    ],
    removeRuleIds: [id],
  });
};

const start = () => {
  console.log("starting url blocker");
  if (import.meta.env.BROWSER === "firefox") {
    browser.webRequest.onBeforeRequest.addListener(
      criPPBlocker,
      {
        urls: [
          "*://s3.cri.epita.fr/cri-intranet-photos/*",
          "*://photos.cri.epita.fr/*",
          "*://s3.cri.epita.fr/cri-intranet/img/blank.jpg",
        ],
        types: ["image"],
      },
      ["blocking"]
    );
  } else if (import.meta.env.BROWSER === "chrome") {
    blockImageChrome("*://s3.cri.epita.fr/cri-intranet-photos/*", 1001);
    blockImageChrome("*://photos.cri.epita.fr/*", 1002);
    blockImageChrome("*://s3.cri.epita.fr/cri-intranet/img/blank.jpg", 1003);
  }
};

const stop = () => {
  if (import.meta.env.BROWSER === "firefox")
    browser.webRequest.onBeforeRequest.removeListener(criPPBlocker);
  else if (import.meta.env.BROWSER === "chrome")
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1001, 1002, 1003],
    });
};

export default {
  start,
  stop,
} as BackgroundScriptConfig;
