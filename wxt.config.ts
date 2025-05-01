import { defineConfig } from "wxt";

import { glob } from "glob";
import path from "path";

// export default defineConfig(async () => {
//   const entryFiles = await glob("./src/background/contentScripts/**/*.ts");

//   const entry = Object.fromEntries(
//     entryFiles.map((file) => {
//       const entryName = `content_scripts_${path.basename(path.dirname(file))}_${
//         path.parse(file).name
//       }`;
//       return [entryName, `./${file}`];
//     })
//   );

//   console.log(entry);

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 2,
  targetBrowsers: ["firefox"],
  webExt: {
    startUrls: ["https://intra.forge.epita.fr"],
  },
  manifest: {
    version: process.env.EXT_VERSION ?? "1.0.0",
    name: "Intra tweaker",

    description: "Set of tools to make the intra better",

    icons: {
      "256": "./icons/anvil.png",
    },

    browser_action: {
      default_title: "Intra tweaker",
      default_icon: "./icons/anvil.png",
    },

    permissions: [
      "notifications",
      "storage",
      "webRequest",
      "webRequestBlocking",
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
  },
});
