import type { Module } from "../../types/global";

const modules: Module[] = [
  {
    folder: "grafanaStats",
    name: "Grafana",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "betterTags",
    name: "Tags",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
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
    default: true,
    children: [
      {
        kind: "background",
        name: "background",
      },
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "betterGraph",
    name: "Graph",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "customTheme",
    name: "Custom Theme",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "hideSubject",
    name: "Hide Subject",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "ongoingTenants",
    name: "Ongoing Tenants",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/"],
      },
    ],
  },
  {
    folder: "winwheel",
    name: "Winwheel",
    author: "Matiix310",
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "tagHistory",
    name: "Tag History",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "floatingFailures",
    name: "Floating Failures",
    author: "Matiix310",
    default: false,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "testsExplorer",
    name: "Tests Explorer",
    author: "Matiix310",
    default: true,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "nextTag",
    name: "Next Tag Estimation [untested]",
    author: "lakazatong",
    default: false,
    children: [
      {
        kind: "content",
        matches: ["*://intra.forge.epita.fr/*"],
      },
    ],
  },
  {
    folder: "expandSubject",
    name: "Expand Subject",
    author: "mrnossiom",
    default: false,
    children: [
      {
        kind: "content",
        matches: ["*://s3.cri.epita.fr/documents.intranet.forge.epita.fr/*"],
      },
    ],
  },
];

export default modules;
