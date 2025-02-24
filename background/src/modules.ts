import type { Module } from "./types/global";

const modules: Module[] = [
  {
    folder: "grafanaStats",
    name: "Grafana",
    author: "Matiix310",
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
    name: "Tags",
    author: "Matiix310",
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
    name: "Speed",
    author: "Matiix310",
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
    name: "Graph",
    author: "Matiix310",
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
    folder: "visuals",
    name: "Visuals",
    author: "Matiix310",
    children: [
      {
        kind: "content",
        name: "hideSubject",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
      {
        kind: "content",
        name: "changeTheme",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
      {
        kind: "content",
        name: "applyTheme",
        loadingStatus: "loading",
        filter: {
          urls: ["*://intra.forge.epita.fr/*"],
        },
      },
    ],
  },
];

export default modules;
