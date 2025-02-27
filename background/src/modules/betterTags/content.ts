import { getAllTags, type Tag } from "../../common/tags";

const customStyles = `
    .list__item {
        position: relative;
        overflow: hidden;
    }

    .list__item.loading::before {
        content: "";
        width: var(--percentage);
        height: 100%;
        position: absolute;
        background: var(--card-backgroud);
        top: 0;
        left: 0;
        filter: brightness(80%);
        transition: .5s all ease-in-out;
    }

    .list__item__left, .list__item__right {
        z-index: 5;
    }`;

const getEndingPipelines = async (date: Date) => {
  const domain = "https://grafana.ops.k8s.cri.epita.fr";
  const endpoint = "/api/datasources/proxy/1/api/v1/query_range";

  const formData = new FormData();

  formData.append("query", "sum(rate(pipelines_ended_total[1m]))*60");
  formData.append("start", (Math.floor(date.getTime() / 1000) - 300).toString());
  formData.append("end", Math.floor(date.getTime() / 1000).toString());
  formData.append("step", "15");

  const response = await fetch(domain + endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  let sum = 0;
  let count = 0;
  for (let i = 0; i < json.data.result[0].values.length; i++) {
    sum += parseInt(json.data.result[0].values[i][1]);
    count++;
  }

  return sum / count;
};

const getToRunPipelines = async (date: Date) => {
  const domain = "https://grafana.ops.k8s.cri.epita.fr";
  const endpoint = "/api/datasources/proxy/1/api/v1/query_range";

  const formData = new FormData();

  formData.append("query", 'sum(pipelines_to_run{namespace="forge-intranet"})');
  formData.append("start", Math.floor(date.getTime() / 1000).toString());
  formData.append("end", Math.floor(date.getTime() / 1000).toString());
  formData.append("step", "120");

  const response = await fetch(domain + endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  return parseInt(json.data.result[0].values[0][1]);
};

const getRunningPipelines = async (date: Date) => {
  const domain = "https://grafana.ops.k8s.cri.epita.fr";
  const endpoint = "/api/datasources/proxy/1/api/v1/query_range";

  const formData = new FormData();

  formData.append("query", 'sum(pipelines_running{namespace="forge-intranet"})');
  formData.append("start", Math.floor(date.getTime() / 1000).toString());
  formData.append("end", Math.floor(date.getTime() / 1000).toString());
  formData.append("step", "120");

  const response = await fetch(domain + endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  return parseInt(json.data.result[0].values[0][1]);
};

const getTagStat = async (tag: Tag, rank: number, endingPipelines: number) => {
  const runningTags = await getRunningPipelines(new Date());
  // TODO change 10 to running tags
  if (rank <= runningTags) rank = 1;
  const remaining = (rank * 60) / endingPipelines;
  const totalTime = remaining + (Date.now() - tag.date.getTime());
  const percentage = (remaining * 100) / totalTime;

  return {
    // in seconds
    remaining: Math.max(Math.round(remaining), 0),
    percentage: Math.max(Math.min(percentage, 100), 0),
  };
};

const getTagsNow = async () => {
  const response = await fetch(location.href);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return getAllTags(doc);
};

const run = async () => {
  var style = document.createElement("style");
  style.innerHTML = customStyles;
  document.head.appendChild(style);

  const tags = getAllTags();

  if (tags.length == 0) return;

  // add total number of tags
  const titles = Array.from(document.getElementsByClassName("title")).filter((t) =>
    t.textContent?.includes("Tags")
  );
  if (titles.length > 0) titles[0].innerHTML += ` (${tags.length})`;

  // add info on error tags
  tags
    .filter((t) => t.status == "ERROR")
    .forEach(
      (t) =>
        (t.element.getElementsByClassName("list__item__subname")[0].textContent +=
          " | Reason: " + t.errorStatus)
    );

  // get all the running tag
  const processingTags = tags.filter((t) => t.status == "PROCESSING");
  processingTags[0].date = new Date();

  processingTags.forEach(async (tag) => {
    const toRunPipelines = await getToRunPipelines(tag.date);
    const runningPipelines = await getRunningPipelines(tag.date);
    let rank = toRunPipelines + runningPipelines;
    let lastTime = Date.now();

    tag.element.classList.add("loading");

    setInterval(async () => {
      // compute the new rank
      const endingPipelines = await getEndingPipelines(new Date());
      const time = Date.now();
      rank = Math.max(0, rank - (time - lastTime) * (endingPipelines / (1_000 * 60)));
      lastTime = time;
      const tagStat = await getTagStat(tag, rank, endingPipelines);
      const subName = tag.element.getElementsByClassName("list__item__subname")[0];
      subName.textContent =
        subName.textContent?.split(" | Rank: ")[0] +
        ` | Rank: ${Math.floor(rank)} | ETA: ${tagStat.remaining} seconds`;
      tag.element.setAttribute("style", `--percentage: ${tagStat.percentage}%`);
    }, 500);
  });

  watchTags(processingTags);
};

const watchTags = async (processingTags: Tag[]) => {
  const start = Date.now();
  const newTags = await getTagsNow();
  console.log(newTags);
  for (let tag of processingTags) {
    if (newTags.filter((t) => t.name == tag.name)[0].status != "PROCESSING") {
      const titleStr = tag.status == "ERROR" ? `Tag error` : `Tag succeded`;
      const contentStr =
        tag.status == "ERROR"
          ? `Tag ${tag.name} is in error state: ${tag.errorStatus}`
          : `Tag ${tag.name} finished running and is at ${tag.percentage}%`;
      browser.runtime.sendMessage({
        action: "notify",
        title: titleStr,
        content: contentStr,
      });

      window.location.reload();
      return;
    }
  }

  const processingTime = Date.now() - start;

  // 3 seconds
  if (processingTime < 2000)
    await new Promise((r) => setTimeout(r, 2000 - processingTime));

  watchTags(processingTags);
};

run();
