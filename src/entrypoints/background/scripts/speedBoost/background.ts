import type { BackgroundScriptConfig } from "../../../../types/global";

const criPPBlocker = () => {
  return {
    cancel: true,
  };
};

const start = () => {
  browser.webRequest.onBeforeRequest.addListener(
    criPPBlocker,
    {
      urls: ["*://s3.cri.epita.fr/cri-intranet-photos/*", "*://photos.cri.epita.fr/*"],
      types: ["image"],
    },
    ["blocking"]
  );
};

const stop = () => {
  browser.webRequest.onBeforeRequest.removeListener(criPPBlocker);
};

export default {
  start,
  stop,
} as BackgroundScriptConfig;
