import {
  parseTests,
  setSuccessFilter,
  testsFilter,
  testsFoldAll,
  testsUnfoldAll,
} from "../background/common/tests";
import { getUiBlock } from "../background/common/ui";

const foldSvg = `<svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.9998 6.97498C5.86647 6.97498 5.73747 6.94998 5.6128 6.89998C5.48747 6.84998 5.38314 6.78332 5.2998 6.69998L0.699804 2.09998C0.516471 1.91665 0.424805 1.68332 0.424805 1.39998C0.424805 1.11665 0.516471 0.883317 0.699804 0.699984C0.883138 0.51665 1.11647 0.424984 1.3998 0.424984C1.68314 0.424984 1.91647 0.51665 2.0998 0.699984L5.9998 4.59998L9.8998 0.699984C10.0831 0.51665 10.3165 0.424984 10.5998 0.424984C10.8831 0.424984 11.1165 0.51665 11.2998 0.699984C11.4831 0.883317 11.5748 1.11665 11.5748 1.39998C11.5748 1.68332 11.4831 1.91665 11.2998 2.09998L6.6998 6.69998C6.5998 6.79998 6.49147 6.87065 6.3748 6.91198C6.25814 6.95398 6.13314 6.97498 5.9998 6.97498Z" fill="currentColor"></path>
                 </svg>`;

const run = async () => {
  const uiBlock = getUiBlock("Tests");

  if (!uiBlock) return;

  const tests = await parseTests();

  if (tests.length === 0) return;

  const filterContainer = document.createElement("div");
  filterContainer.style.maxWidth = "calc(50vw - 130px)";
  filterContainer.style.display = "flex";
  filterContainer.style.alignItems = "center";
  filterContainer.style.marginBottom = "15px";

  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.style.width = "50%";
  searchBar.style.marginRight = "10px";
  searchBar.style.marginLeft = "10px";

  const applyFilter = () => {
    const search = searchBar.value.trim();
    testsFilter(tests, (t) =>
      t.name
        .toLocaleLowerCase()
        .replaceAll(" ", "")
        .includes(search.toLocaleLowerCase().replaceAll(" ", ""))
    );
  };

  searchBar.addEventListener("input", () => {
    applyFilter();
  });

  const foldAllBtn = document.createElement("a");
  foldAllBtn.style.backgroundColor = "var(--rectangle-background)";
  foldAllBtn.style.border = "1px solid var(--border)";
  foldAllBtn.style.borderRadius = "5px";
  foldAllBtn.style.outline = "none";
  foldAllBtn.style.cursor = "pointer";
  foldAllBtn.style.height = "38px";
  foldAllBtn.style.aspectRatio = "1";
  foldAllBtn.style.display = "flex";
  foldAllBtn.style.alignItems = "center";
  foldAllBtn.style.justifyContent = "center";
  foldAllBtn.innerHTML = foldSvg;

  const svg = foldAllBtn.firstElementChild as SVGElement;

  svg.style.transition = "transform ease-in-out .3s";
  svg.style.transform = "rotate(-90deg)";

  let folded = true;
  foldAllBtn.addEventListener("click", () => {
    if (folded) {
      svg.style.transform = "rotate(0)";
      testsUnfoldAll(tests);
    } else {
      svg.style.transform = "rotate(-90deg)";
      testsFoldAll(tests);
    }
    folded = !folded;
  });

  const selection = document.createElement("select");
  const addOption = (str: string) => {
    const opt = document.createElement("option");
    opt.value = str;
    opt.innerHTML = str;
    selection.options.add(opt);
  };
  addOption("DEFAULT");
  addOption("SUCCESS");
  addOption("FAIL");
  selection.style.color = "var(--primary-text)";
  selection.style.fontSize = "12px";
  selection.style.fontWeight = "500";
  selection.style.backgroundColor = "var(--rectangle-background)";
  selection.style.border = "1px solid var(--border)";
  selection.style.borderRadius = "5px";
  selection.style.outline = "none";
  selection.style.padding = "10px";
  selection.style.cursor = "pointer";

  selection.addEventListener("change", (e) => {
    if (selection.value === "DEFAULT") setSuccessFilter(null);
    else if (selection.value === "SUCCESS") setSuccessFilter(true);
    else if (selection.value === "FAIL") setSuccessFilter(false);

    applyFilter();
  });

  filterContainer.appendChild(foldAllBtn);
  filterContainer.appendChild(searchBar);
  filterContainer.append(selection);
  uiBlock.insertAdjacentElement("beforebegin", filterContainer);
};

export default defineUnlistedScript(() => {
  run();
});
