export type BackgroundScriptConfig = {
  start: () => void;
  stop: () => void;
};

export type SubModule =
  | {
      kind: "content";
      matches: string[];
    }
  | { kind: "background"; name: string };

export type Module = {
  folder: string;
  name: string;
  author: string;
  default?: boolean;
  children: SubModule[];
};

export type ShortModule = {
  name: string;
  author: string;
  active: boolean;
};
