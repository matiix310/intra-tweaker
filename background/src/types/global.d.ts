export type BackgroundScriptConfig = {
  start: () => void;
  stop: () => void;
};

export type SubModule =
  | { kind: "content"; filter: browser.tabs.UpdateFilter; name: string }
  | { kind: "background"; name: string };

export type Module = {
  folder: string;
  children: SubModule[];
};
