type SuccessTag = {
  name: string;
  status: "IDLE" | "PROCESSING" | "SUCCEEDED";
  percentage?: number;
  date: Date;
  element: Element;
};

type ErrorTag = {
  name: string;
  status: "ERROR";
  errorStatus?: "QUOTA_EXCEEDED" | "NOT_ACCESSIBLE";
  date: Date;
  element: Element;
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

export type Tag = SuccessTag | ErrorTag;

const tagFromElement = (element: HTMLAnchorElement): Tag | undefined => {
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

export const getAllTags = (doc = document) => {
  const tagsTitle = Array.from(document.getElementsByClassName("title")).find((t) =>
    t.textContent?.includes("Tags")
  );
  if (!tagsTitle) return [];

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
