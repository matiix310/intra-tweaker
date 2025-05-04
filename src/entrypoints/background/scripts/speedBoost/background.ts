import type { BackgroundScriptConfig } from "../../../../types/global";

const criPPBlocker = () => {
  return {
    cancel: true,
  };
};

const start = () => {
  if (import.meta.env.BROWSER === "firefox") {
    browser.webRequest.onBeforeRequest.addListener(
      criPPBlocker,
      {
        urls: ["*://s3.cri.epita.fr/cri-intranet-photos/*", "*://photos.cri.epita.fr/*"],
        types: ["image"],
      },
      ["blocking"]
    );
  } else if (import.meta.env.BROWSER === "chrome") {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1001,
          priority: 1,
          action: {
            type: "block",
          },
          condition: {
            urlFilter: "*://s3.cri.epita.fr/cri-intranet-photos/*",
            resourceTypes: ["image"],
          },
        },
      ],
      removeRuleIds: [1001],
    });
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1002,
          priority: 1,
          action: {
            type: "block",
          },
          condition: {
            urlFilter: "*://photos.cri.epita.fr/*",
            resourceTypes: ["image"],
          },
        },
      ],
      removeRuleIds: [1002],
    });
  }
};

const stop = () => {
  browser.webRequest.onBeforeRequest.removeListener(criPPBlocker);
};

export default {
  start,
  stop,
} as BackgroundScriptConfig;
