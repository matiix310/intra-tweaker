import { getAllGrafana } from "../../common/grafana";

const getColor = (value: number, revert = false, divisor = 20) => {
  if (value >= divisor * 10) {
    return revert ? "#C93622" : "#61BE28";
  }

  value /= divisor;

  let max = [97, 190, 40]; //rgb(97, 190, 40)
  let min = [201, 54, 34]; // rgb(201, 54, 34)

  if (revert) [max, min] = [min, max];

  let result = "#";
  for (let i = 0; i < 3; i++) {
    result += Math.round(min[i] + (max[i] - min[i]) * (value / 10))
      .toString(16)
      .padStart(2, "0");
  }
  return result;
};

const updateGrafana = async (grafanaStatElements: HTMLCollectionOf<Element>) => {
  const stats = await getAllGrafana();
  grafanaStatElements[0].innerHTML = stats.pipelinesRunning?.toString() ?? "N/a";
  grafanaStatElements[0].setAttribute(
    "style",
    `color:${getColor(
      stats.pipelinesRunning ?? 999,
      true
    )};font-size: 30px;font-weight: 500;`
  );
  grafanaStatElements[1].innerHTML = stats.pipelinesToRun?.toString() ?? "N/a";
  grafanaStatElements[1].setAttribute(
    "style",
    `color:${getColor(
      stats.pipelinesToRun ?? 999,
      true
    )};font-size: 30px;font-weight: 500;`
  );
  grafanaStatElements[2].innerHTML = stats.pipelinesDispatched?.toString() ?? "N/a";
  grafanaStatElements[2].setAttribute(
    "style",
    `color:${getColor(
      stats.pipelinesDispatched ?? 999,
      true
    )};font-size: 30px;font-weight: 500;`
  );
  grafanaStatElements[3].innerHTML = stats.aliveWorkers?.toString() ?? "N/a";
  grafanaStatElements[3].setAttribute(
    "style",
    `color:${getColor(
      stats.aliveWorkers ?? 999,
      false,
      2
    )};font-size: 30px;font-weight: 500;`
  );
};

const displayGrafana = () => {
  const tagTitle = Array.from(document.getElementsByClassName("title")).find(
    (e) => e.textContent?.trim() == "Tags"
  );

  if (!tagTitle) return;

  const title = document.createElement("div");
  title.classList.add("title");
  title.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1V14.8598M21 21H1V14.8598M1 14.8598L8.83505 7.00738L13.1502 11.3321L21 3.46494M21 3.46494V7.00738M21 3.46494H17.8336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"></path>
</svg>Stats`;
  const grafanaLink =
    "https://grafana.ops.k8s.cri.epita.fr/k8s/clusters//api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-grafana:80/proxy/d/cskZHC4Hk/maas-overview-copy?orgId=1&refresh=30s";

  const statsElementStr = `
    <div class="submissions">
      <div class="list_h" style="display: grid;grid-auto-flow: row;grid-template-columns: repeat(4, 1fr);gap: 20px">
        <a href="${grafanaLink}" target="_blank" class="list__item" style="display: flex;flex-direction: column;aspect-ratio: 2;justify-content: space-around;">
          <div class="list__item__name">Running</div>
          <div class="grafana-stat">Loading...</div>
        </a>
        <a href="${grafanaLink}" target="_blank" class="list__item" style="display: flex;flex-direction: column;aspect-ratio: 2;justify-content: space-around;">
          <div class="list__item__name">To run</div>
          <div class="grafana-stat">Loading...</div>
        </a>
        <a href="${grafanaLink}" target="_blank" class="list__item" style="display: flex;flex-direction: column;aspect-ratio: 2;justify-content: space-around;">
          <div class="list__item__name">Dispatched</div>
          <div class="grafana-stat">Loading...</div>
        </a>
        <a href="${grafanaLink}" target="_blank" class="list__item" style="display: flex;flex-direction: column;aspect-ratio: 2;justify-content: space-around;">
          <div class="list__item__name">Alive workers</div>
          <div class="grafana-stat">Loading...</div>
        </a>
      </div>
    </div>`;

  tagTitle.insertAdjacentElement("beforebegin", title);
  tagTitle.insertAdjacentHTML("beforebegin", statsElementStr);

  const grafanaStatElements = document.getElementsByClassName("grafana-stat");

  updateGrafana(grafanaStatElements);
  setInterval(async () => {
    updateGrafana(grafanaStatElements);
  }, 5000);
};

const run = async () => {
  displayGrafana();
};

run();
