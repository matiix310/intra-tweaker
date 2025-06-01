type SuccessTag = {
  status: "IDLE" | "PROCESSING" | "SUCCEEDED";
  percentage?: number;
};

type ErrorTag = {
  status: "ERROR";
  errorStatus?: "QUOTA_EXCEEDED" | "NOT_ACCESSIBLE";
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type Tag = { name: string; date: Date; element: Element } & (
  | SuccessTag
  | ErrorTag
);

export const tagFromElement = (element: HTMLAnchorElement): Tag | undefined => {
  const name =
    element.getElementsByClassName("list__item__name").item(0)?.textContent?.trim() ??
    "N/a";

  const traceSymbol = element.getElementsByTagName("trace-symbol").item(0);

  if (!traceSymbol) return;

  const status = traceSymbol.getAttribute("status") as Tag["status"] | null;

  if (!status) return;

  const dateString = element
    .getElementsByClassName("list__item__subname")
    .item(0)
    ?.textContent?.trim();

  if (!dateString) return;

  // Submitted on February 11, 2025 - 23:29
  const [month, day, year, hours, minutes] = dateString
    .slice(13, dateString.length)
    .split(/[-:, ]/)
    .filter((s) => s.length != 0);

  const date = new Date(
    parseInt(year),
    months.indexOf(month),
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );

  if (status == "ERROR") {
    const errorStatus = traceSymbol.getAttribute(
      "errorstatus"
    ) as ErrorTag["errorStatus"];

    return {
      name,
      status,
      errorStatus,
      date,
      element,
    };
  } else {
    const percentage = parseInt(traceSymbol.getAttribute("successpercent") ?? "0");

    return {
      name,
      status,
      percentage,
      date,
      element,
    };
  }
};

export const elementFromTag = (tag: Tag) => {
  const tagElement = document.createElement("a");
  tagElement.classList.add("list__item");

  if (tag.status !== "SUCCEEDED") tagElement.classList.add("list__item__disabled");

  const left = document.createElement("div");
  left.classList.add("list__item__left");
  tagElement.append(left);
  const right = document.createElement("div");
  right.classList.add("list__item__right");
  tagElement.append(right);

  // left
  const tagName = document.createElement("div");
  tagName.classList.add("list__item__name");
  tagName.innerText = tag.name;
  left.append(tagName);

  const tagDate = document.createElement("div");
  tagDate.classList.add("list__item__subname");
  tagDate.setAttribute("style", "font-size: 11px;");
  // Submitted on February 11, 2025 - 23:29
  tagDate.innerText = `Submitted on ${months[tag.date.getMonth()]} ${tag.date
    .getDate()
    .toString()
    .padStart(2, "0")}, ${tag.date.getFullYear()} - ${tag.date.getHours()}:${tag.date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  left.append(tagDate);

  // right
  const traceSymbol = `<trace-symbol successpercent="${
    tag.status != "ERROR" && tag.percentage !== undefined ? tag.percentage : ""
  }" validated="${
    tag.status != "ERROR" && tag.percentage !== undefined && tag.percentage == 100
  }" errorstatus="${tag.status == "ERROR" ? tag.errorStatus : ""}" status="${
    tag.status
  }"></trace-symbol>`;

  right.innerHTML += traceSymbol;

  const separator = `<div style="height: 40px; width: 2px; background-color: var(--card-separator)"></div>`;

  right.innerHTML += separator;

  const arrow = `<svg style="width: 20px; height: 20px" width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.06243 15.4375C0.867986 15.2431 0.770764 15.0139 0.770764 14.75C0.770764 14.4861 0.867986 14.2569 1.06243 14.0625L7.12493 8L1.0416 1.91667C0.847153 1.72222 0.753542 1.49306 0.760764 1.22917C0.767431 0.965278 0.867986 0.736111 1.06243 0.541667C1.25688 0.347222 1.48604 0.25 1.74993 0.25C2.01382 0.25 2.24299 0.347222 2.43743 0.541667L9.3541 7.45833C9.42354 7.54167 9.47576 7.62833 9.51076 7.71833C9.54521 7.80889 9.56243 7.90278 9.56243 8C9.56243 8.09722 9.54521 8.19083 9.51076 8.28083C9.47576 8.37139 9.42354 8.45833 9.3541 8.54167L2.4166 15.4583C2.23604 15.6528 2.01382 15.7467 1.74993 15.74C1.48604 15.7328 1.25688 15.6319 1.06243 15.4375Z" fill="currentColor"></path>
                   </svg>`;

  right.innerHTML += arrow;

  return tagElement;
};

export const getAllTags = (doc = document) => {
  const tagsTitle = Array.from(doc.getElementsByClassName("title")).find((t) =>
    t.textContent?.includes("Tags")
  );
  if (!tagsTitle) return null;

  const listElement = tagsTitle.nextElementSibling;
  if (!listElement?.classList.contains("list")) return [];

  const tags = Array.from(listElement.getElementsByTagName("a"));

  const list: Tag[] = [];

  for (let tagElement of tags) {
    const tag = tagFromElement(tagElement);

    if (tag) list.push(tag);
  }

  return list;
};
