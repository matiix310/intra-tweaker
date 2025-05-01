import { elementFromTag, getAllTags } from "../background/common/tags";
import { getUiBlock } from "../background/common/ui";

type SuccessTag = {
  status: "IDLE" | "PROCESSING" | "SUCCEEDED";
  percentage?: number;
};

type ErrorTag = {
  status: "ERROR";
  errorStatus?: "QUOTA_EXCEEDED" | "NOT_ACCESSIBLE";
};

type Tag = { name: string; date: Date; link: string } & (SuccessTag | ErrorTag);

const addHistoryBlock = () => {
  const tenantsBlock = getUiBlock("Tenants");
  if (tenantsBlock == null) return;

  const tagHistory: Tag[] = JSON.parse(localStorage.getItem("tagsHistory") ?? "[]");
  if (tagHistory.length == 0) return;
  tagHistory.forEach((t) => (t.date = new Date(t.date)));

  const title = document.createElement("div");
  title.classList.add("title");
  title.innerHTML = `<svg width="512" height="512" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M295 48C409.875 48 503 141.125 503 256C503 370.875 409.875 464 295 464C238.587 464 187.419 441.542 149.95 405.079L182.184 371.951C211.327 400.311 251.124 417.778 295 417.778C384.347 417.778 456.778 345.347 456.778 256C456.778 166.653 384.347 94.2222 295 94.2222C205.653 94.2222 133.222 166.653 133.222 256C133.222 260.379 133.396 264.718 133.738 269.009L179.444 223.316L212.128 256L110.111 358.017L8.09375 256L40.7778 223.316L87.4632 269.992C87.156 265.368 87 260.702 87 256C87 141.125 180.125 48 295 48ZM318.111 163.556V266.631L377.044 306.151L351.622 344.516L271.889 291.591V163.556H318.111Z"/>
</svg> Tag history`;

  const tagContainer = document.createElement("div");
  tagContainer.classList.add("projects");
  tagContainer.style.gap = "15px";

  for (let i = 0; i < tagHistory.length; i++) {
    const tag = { ...tagHistory[i], element: document.createElement("a") };
    const tagElement = elementFromTag(tag);
    tagElement.setAttribute("href", tag.link);

    tagContainer.append(tagElement);
  }

  tenantsBlock.insertAdjacentElement("afterend", tagContainer);
  tenantsBlock.insertAdjacentElement("afterend", title);
};

const gatherNewTags = () => {
  const tags = getAllTags();
  if (tags.length == 0) return;

  const storedTags: Tag[] = JSON.parse(localStorage.getItem("tagsHistory") ?? "[]");
  storedTags.forEach((t) => (t.date = new Date(t.date)));

  tags.forEach((t) => {
    const tag = storedTags.find((t2) => t2.name == t.name);
    if (tag) {
      // edit
      tag.date = t.date;
      tag.link = t.element.getAttribute("href") ?? "";
      tag.status = t.status;
      if (tag.status == "ERROR" && t.status == "ERROR") tag.errorStatus = t.errorStatus;
      else if (tag.status != "ERROR" && t.status != "ERROR")
        tag.percentage = t.percentage;
    } else {
      storedTags.push({ ...t, link: t.element.getAttribute("href") ?? "" });
    }
  });

  storedTags.sort((a, b) => {
    const r = b.date.getTime() - a.date.getTime();
    if (r == 0) return a.name.localeCompare(b.name);
    return r;
  });

  storedTags.length = Math.min(storedTags.length, 12);

  localStorage.setItem("tagsHistory", JSON.stringify(storedTags));
};

const run = () => {
  gatherNewTags();
  addHistoryBlock();
};

export default defineUnlistedScript(() => {
  run();
});
