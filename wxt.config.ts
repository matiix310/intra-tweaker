import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  targetBrowsers: ["firefox", "chrome"],
  webExt: {
    startUrls: ["https://intra.forge.epita.fr"],
  },
  manifest: ({ manifestVersion }) => ({
    version: process.env.EXT_VERSION ?? "1.0.0",
    name: "Intra tweaker",

    description: "Set of tools to make the intra better",

    icons: {
      "256": "./icons/anvil.png",
    },

    action: {
      default_title: "Intra tweaker",
      default_icon: "./icons/anvil.png",
    },

    permissions: [
      "notifications",
      "storage",
      ...(manifestVersion === 2
        ? ["webRequest", "webRequestBlocking"]
        : ["declarativeNetRequestWithHostAccess"]),
    ],

    host_permissions: [
      "*://intra.forge.epita.fr/*",
      "*://grafana.ops.k8s.cri.epita.fr/k8s/clusters/api/*",
      "*://s3.cri.epita.fr/cri-intranet-photos/*",
      "*://photos.cri.epita.fr/*",
    ],

    browser_specific_settings: {
      gecko: {
        id: "{9d7b266a-9484-42d3-a1ef-ec87ee4fa0e1}",
      },
    },
  }),
});
