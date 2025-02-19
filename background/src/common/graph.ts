export type Graph = {
  name: string;
  validated: boolean;
  accessible: boolean;
  required: boolean;
  link: string;
  children: Graph[];
  subNodes: Graph[];
};

const strToGraph = (str: string, names: Map<string, string>) => {
  const graph: Graph = {
    required: false,
    validated: false,
    accessible: false,
    link: "",
    name: "N/a",
    children: [],
    subNodes: [],
  };

  if (str == "*") {
    graph.name = "_root";
    return graph;
  }

  const list = str.split(/[=/]/);
  let i = 0;
  while (list[i].startsWith("_")) {
    if (list[i].endsWith("required")) graph.required = list[++i] == "true";
    else if (list[i].endsWith("validated")) graph.validated = list[++i] == "true";
    else if (list[i].endsWith("accessible")) graph.accessible = list[++i] == "true";
    else i--;
    i++;
  }

  graph.link = list.slice(i, list.length).join("/").replaceAll("~", "-");
  graph.name = names.get(str) ?? "N/a";
  return graph;
};

const buildGraph = async (
  from: string,
  links: { from: string; to: string }[],
  names: Map<string, string>,
  recursive: boolean
): Promise<Graph> => {
  const root = strToGraph(from, names);

  let promises: Promise<void>[] = [];

  if (recursive) {
    promises.push(
      getGraph(recursive, "https://intra.forge.epita.fr/" + root.link).then(
        (subNodes) => {
          if (subNodes) root.subNodes = subNodes.children;
        }
      )
    );
  }

  promises = promises.concat(
    links
      .filter((link) => link.from == from)
      .map(({ to }) =>
        buildGraph(to, links, names, recursive)
          .then((g) => {
            root.children.push(g);
          })
          .catch((e) => console.error(e))
      )
  );

  await Promise.allSettled(promises);

  return root;
};

export const getGraph = async (recursive = true, link = location.href) => {
  const graphElement = document.getElementById("graph");

  if (graphElement == null) return;

  const response = await fetch(link);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const text = doc.getElementById("graph")?.firstChild?.textContent;

  if (!text) return;
  const lines = text.split("\n").map((line) => line.trim());
  if (lines[0].includes("stateDiagram-v2")) lines.slice(1, lines.length);

  const names: Map<string, string> = new Map();
  const links = [];

  for (let line of lines) {
    if (line.includes("-->")) {
      // link
      const [from, to] = line.split(" --> ");
      links.push({
        from: from.slice(1, from.length - 1),
        to: to.slice(1, to.length - 1),
      });
    } else {
      // name assignation
      const [node, name] = line.split(": ");
      names.set(node.slice(1, node.length - 1), name);
    }
  }

  return buildGraph("*", links, names, recursive);
};

export const getStats = (
  graph: Graph,
  done: string[] = []
): {
  required: number;
  requiredValidated: number;
  optional: number;
  optionalValidated: number;
} => {
  const stats = { required: 0, requiredValidated: 0, optional: 0, optionalValidated: 0 };

  if (done.includes(graph.name)) return stats;

  if (graph.name != "_root" && graph.name != "Tutorials") {
    if (graph.subNodes.length > 0) {
      // take its subNodes instead
      graph.subNodes.forEach((node) => {
        const childStats = getStats(node, []);
        stats.required += childStats.required;
        stats.requiredValidated += childStats.requiredValidated;
        stats.optional += childStats.optional;
        stats.optionalValidated += childStats.optionalValidated;
      });
    } else {
      if (graph.required) {
        stats.required++;
        if (graph.validated) stats.requiredValidated++;
      } else {
        stats.optional++;
        if (graph.validated) stats.optionalValidated++;
      }
    }
    done.push(graph.name);
  }

  graph.children.forEach((child) => {
    const childStats = getStats(child, done);
    stats.required += childStats.required;
    stats.requiredValidated += childStats.requiredValidated;
    stats.optional += childStats.optional;
    stats.optionalValidated += childStats.optionalValidated;
  });

  return stats;
};

export const getSubNodesStats = (graph: Graph) => {
  const stats = { required: 0, requiredValidated: 0, optional: 0, optionalValidated: 0 };

  if (graph.name != "_root" && graph.name != "Tutorials") {
    if (graph.subNodes.length > 0) {
      // take its subNodes instead
      graph.subNodes.forEach((node) => {
        const childStats = getStats(node, []);
        stats.required += childStats.required;
        stats.requiredValidated += childStats.requiredValidated;
        stats.optional += childStats.optional;
        stats.optionalValidated += childStats.optionalValidated;
      });
    }
  }

  return stats;
};
