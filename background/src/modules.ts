import type { Module } from "./types/global";

const modules: Module[] = [
  {
    folder: "grafanaStats",
    children: [
      {
        kind: "content",
        name: "index",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
    ],
  },
  {
    folder: "betterTags",
    children: [
      {
        kind: "content",
        name: "content",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
      {
        kind: "background",
        name: "background",
      },
    ],
  },
  {
    folder: "speedBoost",
    children: [
      {
        kind: "background",
        name: "background",
      },
      {
        kind: "content",
        name: "content",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
    ],
  },
  {
    folder: "betterGraph",
    children: [
      {
        kind: "content",
        name: "index",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
    ],
  },
];

export default modules;
