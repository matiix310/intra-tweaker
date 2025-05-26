import browser from "webextension-polyfill";
import type { BackgroundScriptConfig } from "../../../../types/global";

const blockImage = (url: string, id: number) => {
  browser.declarativeNetRequest.updateDynamicRules({
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

const redirectToExtension = (source: string, destination: string, id: number) => {
  browser.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: browser.runtime.getURL("/mermaid.min.js"),
          },
        },
        condition: {
          urlFilter: source,
          resourceTypes: ["script"],
        },
      },
    ],
    removeRuleIds: [id],
  });
};

const start = () => {
  blockImage("*://s3.cri.epita.fr/cri-intranet-photos/*", 1001);
  blockImage("*://photos.cri.epita.fr/*", 1002);
  blockImage("*://s3.cri.epita.fr/cri-intranet/img/blank.jpg", 1003);
  redirectToExtension(
    "*://intra.forge.epita.fr/assets/js/lib/mermaid.min.js",
    "/mermaid.min.js",
    1004
  );
};

const stop = () => {
  browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1001, 1002, 1003, 1004],
  });
};

export default {
  start,
  stop,
} as BackgroundScriptConfig;
