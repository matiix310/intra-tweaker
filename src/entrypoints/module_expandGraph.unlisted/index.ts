import { waitForElm } from "@/utils/document";

const resetGraphPosition = () => {
  const resetBtn = document.getElementById("svg-pan-zoom-reset-pan-zoom");
  resetBtn?.dispatchEvent(new Event("click"));
};

const addButton = async () => {
  const el = await waitForElm("#graph .statediagram");

  await new Promise((res) => setTimeout(res, 500));

  if (el === null) {
    console.error('[expandGraph] "#graph .statediagram" could not be found');
    return;
  }

  const customStyles = `
    #graph {
      position: relative;
    }

    .statediagram {
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    }

    .graph-expand-btn {
      position: absolute;
      top: 1em;
      right: 1em;
    }
    
    .expanded-diagram {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--background);
    }`;

  var style = document.createElement("style");
  style.innerHTML = customStyles;
  document.head.appendChild(style);

  const expandButton = document.createElement("button");
  expandButton.classList.add("graph-expand-btn");
  expandButton.innerText = "Expand";

  const graphElement = document.getElementById("graph");
  graphElement?.appendChild(expandButton);

  let expand = false;
  let mermaidDiagramHeight: string | null = null;
  const mermaidDiagram = graphElement?.getElementsByClassName("statediagram").item(0);

  if (mermaidDiagram == null) return;

  expandButton.addEventListener("click", () => {
    if (expand) {
      expandButton.innerText = "Expand";
      if (mermaidDiagramHeight)
        mermaidDiagram.setAttribute("height", mermaidDiagramHeight);
      graphElement?.classList.remove("expanded-diagram");
    } else {
      expandButton.innerText = "Shrink";
      mermaidDiagramHeight = mermaidDiagram.getAttribute("height");
      mermaidDiagram.setAttribute("height", "100%");
      graphElement?.classList.add("expanded-diagram");
    }

    resetGraphPosition();
    expand = !expand;
  });
};

const run = () => {
  addButton();
};

export default defineUnlistedScript(() => {
  run();
});
