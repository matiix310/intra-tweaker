import { getGraph, getStats } from "../../common/graph";

const removeWheelListener = () => {
  document.getElementById("graph")?.addEventListener(
    "wheel",
    (e) => {
      e.stopPropagation();
    },
    true
  );
};

const addGraphStats = async () => {
  const graph = await getGraph(true);

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
      border: 1px solid var(--trivia);
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

const run = () => {
  removeWheelListener();
  addGraphStats();
};

run();
