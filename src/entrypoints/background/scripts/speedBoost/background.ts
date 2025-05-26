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

const start = () => {
  blockImage("*://s3.cri.epita.fr/cri-intranet-photos/*", 1001);
  blockImage("*://photos.cri.epita.fr/*", 1002);
  blockImage("*://s3.cri.epita.fr/cri-intranet/img/blank.jpg", 1003);
};

const stop = () => {
  browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1001, 1002, 1003],
  });
};

export default {
  start,
  stop,
} as BackgroundScriptConfig;
