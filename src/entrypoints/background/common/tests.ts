type Filter = (test: TestsCategory & { leaf: true }) => boolean;

let successFilter: boolean | null = null;

export type TestsCategory = { name: string; uiDiv: HTMLDivElement } & (
  | {
      leaf: false;
      children: TestsCategory[];
      catDiv: HTMLDivElement;
    }
  | { leaf: true; success: boolean }
);

export const parseTests = async (): Promise<TestsCategory[]> => {
  const testList = document.getElementById("test-list");

  if (!testList) return [];

  if (testList.firstElementChild)
    return parseTestsRec(testList.firstElementChild as HTMLDivElement);

  return new Promise((resolve) => {
    const MutationObserver = window.MutationObserver;
    if (MutationObserver) {
      const mutationObserver = new MutationObserver((e) => {
        mutationObserver.disconnect();
        resolve(parseTestsRec(testList.firstElementChild as HTMLDivElement));
      });

      mutationObserver.observe(testList, { childList: true });
    }
  });
};

const parseTestsRec = (category: HTMLDivElement): TestsCategory[] => {
  const cat = category.children[1];
  const arr: TestsCategory[] = [];

  for (let i = 0; i < cat.children.length; i++) {
    if (cat.children[i].classList.contains("test__item__name")) {
      // leaf: true
      arr.push({
        leaf: true,
        name: cat.children[i].textContent?.trim() ?? "[it] (item)",
        uiDiv: cat.children[i] as HTMLDivElement,
        success: cat.children[i].children[0].getAttribute("width") === "20",
      });
    } else {
      // leaf: false
      const name = cat.children[i].childNodes[2].textContent?.trim() ?? "[it] (categpry)";
      const children = parseTestsRec(cat.children[i + 1] as HTMLDivElement);

      arr.push({
        name,
        children,
        leaf: false,
        uiDiv: cat.children[i + 1] as HTMLDivElement,
        catDiv: cat.children[i] as HTMLDivElement,
      });
      i++;
    }
  }

  return arr;
};

export const testsFilter = (tests: TestsCategory[], cb: Filter): boolean => {
  if (tests.length === 0) return false;
  let hiddenCount = 0;
  let remainingTests = 0;
  for (const test of tests) {
    const isFiltered = test.leaf ? cb(test) : testsFilter(test.children, cb);
    if (
      !isFiltered ||
      (test.leaf && successFilter !== null && successFilter !== test.success)
    ) {
      if (!test.leaf) {
        test.catDiv.classList.add("test__category--active");
        test.catDiv.style.display = "none";
        test.catDiv.setAttribute("filtered", "yepyep");
      }
      test.uiDiv.style.display = "none";
      hiddenCount++;
    } else {
      if (!test.leaf) {
        test.catDiv.classList.remove("test__category--active");
        test.catDiv.style.display = "flex";
        test.catDiv.removeAttribute("filtered");
      } else {
        remainingTests++;
      }
      test.uiDiv.style.display = "flex";
    }
  }

  const delimiterContainer = tests[0].uiDiv.parentElement!.previousElementSibling!;
  for (let i = 1; i < remainingTests; i++) {
    (delimiterContainer.children.item(i) as HTMLDivElement).style.display = "block";
  }
  for (let i = Math.max(1, remainingTests); i < delimiterContainer.children.length; i++) {
    (delimiterContainer.children.item(i) as HTMLDivElement).style.display = "none";
  }

  return hiddenCount < tests.length;
};

export const testsUnfoldAll = (tests: TestsCategory[]) => {
  for (const test of tests) {
    if (!test.leaf && !test.catDiv.hasAttribute("filtered")) {
      test.catDiv.classList.remove("test__category--active");
      test.uiDiv.style.display = "flex";
      testsUnfoldAll(test.children);
    }
  }
};

export const testsFoldAll = (tests: TestsCategory[]) => {
  for (const test of tests) {
    if (!test.leaf) {
      test.catDiv.classList.add("test__category--active");
      test.uiDiv.style.display = "none";
      testsFoldAll(test.children);
    }
  }
};

export const setSuccessFilter = (success: boolean | null) => {
  successFilter = success;
};
