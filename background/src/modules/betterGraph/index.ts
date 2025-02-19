import { getGraph, getStats, getSubNodesStats, type Graph } from "../../common/graph";

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
  const stats = getSubNodesStats(root);
  const node = nodes.find((n) => n.name == root.name);

  if (node && stats.required + stats.optional <= 6) {
    let nodesStr = "";

    const nodeHeight = parseFloat(
      node.anchor.firstElementChild?.getAttribute("height") ?? "33"
    );
    const nodeWidth = parseFloat(
      node.anchor.firstElementChild?.getAttribute("width") ?? "63"
    );
    const radius = nodeHeight / 6;
    let x = -nodeWidth / 2 + radius;
    const y = nodeHeight / 2;

    for (let i = 0; i < stats.requiredValidated; i++) {
      nodesStr += `<circle fill="var(--required-validated)" stroke="var(--background)" r="${radius}" cy="${y}" cx="${x}"></circle>`;
      x += radius * 2.5;
    }

    for (let i = 0; i < stats.required - stats.requiredValidated; i++) {
      nodesStr += `<circle fill="var(--background)" stroke-width="2px" stroke="var(--required)" r="${radius}" cy="${y}" cx="${x}"></circle>`;
      x += radius * 2.5;
    }

    for (let i = 0; i < stats.optionalValidated; i++) {
      nodesStr += `<circle fill="var(--trivial)" stroke="var(--background)" r="${radius}" cy="${y}" cx="${x}"></circle>`;
      x += radius * 2.5;
    }

    for (let i = 0; i < stats.optional - stats.optionalValidated; i++) {
      nodesStr += `<circle fill="var(--background)" stroke="#81B1DB" r="${radius}" cy="${y}" cx="${x}"></circle>`;
      x += radius * 2.5;
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

run();
