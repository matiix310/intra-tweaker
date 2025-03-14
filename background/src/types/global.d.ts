export type BackgroundScriptConfig = {
  start: () => void;
  stop: () => void;
};

export type SubModule = (
  | {
      kind: "content";
      filter: browser.tabs.UpdateFilter;
      loadingStatus?: "complete" | "loading";
    }
  | { kind: "background" }
) & { name: string };

export type Module = {
  folder: string;
  name: string;
  author: string;
  default?: boolean;
  children: SubModule[];
};
