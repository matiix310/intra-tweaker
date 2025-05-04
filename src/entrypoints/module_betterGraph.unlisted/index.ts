import { getGraph, getStats, getSubNodes, type Graph } from "../background/common/graph";

const removeWheelListener = () => {
  document.getElementById("graph")?.addEventListener(
    "wheel",
    (e) => {
      e.stopPropagation();
    },
    true
  );
};

const addGraphStats = (graph?: Graph) => {
  if (!graph) return;

  const stats = getStats(graph);

  const customStyles = `
    .graph-node {
      border-radius: 5px;
      font-size: 16px;
      padding: 5px 10px;
      font-weight: 500;
      margin: 5px 0;
      text-align: center;
    }

    .graph-required-node {
      border: 2px solid var(--required);
    }

    .graph-required-node.node-validated {
      border: none;
      background-color: var(--required-validated);
    }

    .graph-optional-node {
      border: 1px solid #81B1DB;
    }

    .graph-optional-node.node-validated {
      border: none;
      background-color: var(--trivial);
    }
      
    .graph-stats-container {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
    }
      
    #graph {
      position: relative;
    }
      
    .subnode-button {
      transition: .3s opacity;
    }
      
    a:has(> .subnode-button):hover > .subnode-button:not(:hover) {
      opacity: .35;
    }`;

  var style = document.createElement("style");
  style.innerHTML = customStyles;
  document.head.appendChild(style);

  const graphElement = document.getElementById("graph");

  const graphStatsContainer = document.createElement("div");
  graphStatsContainer.classList.add("graph-stats-container");

  const requiredStats =
    stats.required > 0
      ? `<span class="graph-node graph-required-node${
          stats.required == stats.requiredValidated ? " node-validated" : ""
        }">${stats.requiredValidated}/${stats.required}</span>`
      : "";

  const optionalStats =
    stats.optional > 0
      ? `<span class="graph-node graph-optional-node${
          stats.optional == stats.optionalValidated ? " node-validated" : ""
        }">${stats.optionalValidated}/${stats.optional}</span>`
      : "";

  graphStatsContainer.insertAdjacentHTML(
    "afterbegin",
    `${requiredStats}${optionalStats}`
  );

  graphElement?.appendChild(graphStatsContainer);
};

const addSubNodesToGraph = (
  root: Graph,
  nodes: {
    name: string | undefined;
    anchor: HTMLAnchorElement;
  }[]
) => {
  const subNodes = getSubNodes(root);
  const node = nodes.find((n) => n.name == root.name);

  const nodeHeight = parseFloat(
    node?.anchor.firstElementChild?.getAttribute("height") ?? "33"
  );
  const nodeWidth = parseFloat(
    node?.anchor.firstElementChild?.getAttribute("width") ?? "63"
  );
  const radius = nodeHeight / 6;

  let x = -nodeWidth / 2 + radius;
  const y = nodeHeight / 2;

  const maxNodes = (node?.anchor.getBoundingClientRect().width ?? 0) / (radius * 2.5);

  if (node) {
    let nodesStr = "";
    if (subNodes.length <= maxNodes) {
      subNodes.sort((a, b) => {
        if (a.validated == b.validated) return +b.required - +a.required;
        return +b.validated - +a.validated;
      });

      for (let i = 0; i < subNodes.length; i++) {
        nodesStr += `${
          import.meta.env.BROWSER === "firefox"
            ? `<a class="subnode-button" title="${subNodes[i].name}" href="/${subNodes[i].link}">`
            : ""
        }<circle `;
        if (subNodes[i].validated) {
          if (subNodes[i].required)
            nodesStr += `fill="var(--required-validated)" stroke="var(--background)"`;
          else nodesStr += `fill="var(--trivial)" stroke="var(--background)"`;
        } else {
          if (subNodes[i].required)
            nodesStr += `fill="var(--background)" stroke-width="2px" stroke="var(--required)"`;
          else nodesStr += `fill="var(--background)" stroke="#81B1DB"`;
        }
        nodesStr += ` r="${radius}" cy="${y}" cx="${x}"></circle>${
          import.meta.env.BROWSER === "firefox" ? "</a>" : ""
        }`;
        x += radius * 2.5;
      }
    } else {
      // compact nodes
      let requiredValidated = 0;
      let requiredNValidated = 0;
      let optionalValidated = 0;
      let optionalNValidated = 0;

      subNodes.forEach((n) => {
        if (n.required) {
          if (n.validated) requiredValidated++;
          else requiredNValidated++;
        } else {
          if (n.validated) optionalValidated++;
          else optionalNValidated++;
        }
      });

      if (requiredValidated > 0) {
        nodesStr += `${
          import.meta.env.BROWSER === "firefox" ? '<a class="subnode-button">' : ""
        }<rect style="fill: var(--required-validated); stroke: var(--background)" width="${
          radius * 3
        }" height="${radius * 2}" x="${x - radius}" y="${
          y - radius
        }" rx="5" ry="5"></rect>${import.meta.env.BROWSER === "firefox" ? "</a>" : ""}`;
        x += radius * 3.5;
      }

      if (requiredNValidated > 0) {
        nodesStr += `${
          import.meta.env.BROWSER === "firefox" ? '<a class="subnode-button">' : ""
        }<rect style="fill: var(--background); stroke: var(--required)" width="${
          radius * 3
        }" height="${radius * 2}" x="${x - radius}" y="${
          y - radius
        }" rx="5" ry="5"></rect>${import.meta.env.BROWSER === "firefox" ? "</a>" : ""}`;
        x += radius * 3.5;
      }

      if (optionalValidated > 0) {
        nodesStr += `${
          import.meta.env.BROWSER === "firefox" ? '<a class="subnode-button">' : ""
        }<rect style="fill: var(--trivial); stroke: var(--background)" width="${
          radius * 3
        }" height="${radius * 2}" x="${x - radius}" y="${
          y - radius
        }" rx="5" ry="5"></rect>${import.meta.env.BROWSER === "firefox" ? "</a>" : ""}`;
        x += radius * 3.5;
      }

      if (optionalNValidated > 0) {
        nodesStr += `${
          import.meta.env.BROWSER === "firefox" ? '<a class="subnode-button">' : ""
        }<rect style="fill: var(--background); stroke: #81B1DB" width="${
          radius * 3
        }" height="${radius * 2}" x="${x - radius}" y="${
          y - radius
        }" rx="5" ry="5"></rect>${import.meta.env.BROWSER === "firefox" ? "</a>" : ""}`;
        x += radius * 3.5;
      }
    }

    if (nodesStr.length > 0) node.anchor.insertAdjacentHTML("beforeend", nodesStr);
  }

  root.children.forEach((child) => addSubNodesToGraph(child, nodes));
};

const addSubNodes = (graph?: Graph) => {
  if (!graph) return;

  const graphElement = document.getElementById("graph");

  if (!graphElement) return;

  const anchors = Array.from(graphElement.getElementsByTagName("a")).map((anchor) => {
    return {
      name: anchor.textContent?.trim(),
      anchor,
    };
  });

  addSubNodesToGraph(graph, anchors);
};

const run = async () => {
  removeWheelListener();
  const graph = await getGraph(true);
  addGraphStats(graph);
  addSubNodes(graph);
};

export default defineUnlistedScript(() => {
  run();
});
