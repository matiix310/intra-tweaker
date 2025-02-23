import fs, { existsSync } from "fs";
import modules from "./src/modules";

// clear old build
if (existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });

// main script and modules
await Bun.build({
  entrypoints: ["src/index.ts", "src/modules.ts"],
  env: "inline",
  outdir: "dist",
});

// modules
fs.mkdirSync("dist/modules");
for (let module of modules) {
  for (let subModule of module.children) {
    Bun.build({
      entrypoints: ["src/modules/" + module.folder + "/" + subModule.name],
      env: "inline",
      outdir: "dist/modules/" + module.folder,
    });
  }
}
