export const fetchGrafanaWithQuery = async (query: string) => {
  const domain = "https://grafana.ops.k8s.cri.epita.fr";
  const endpoint = "/api/datasources/proxy/1/api/v1/query_range";

  const formData = new FormData();

  formData.append("query", query);
  formData.append("start", (Date.now() / 1000).toString());
  formData.append("end", (Date.now() / 1000).toString());
  formData.append("step", "5");

  const response = await fetch(domain + endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  return parseInt(json.data.result[0].values[0][1]);
};

export const getAllGrafana = async () => {
  const alive_workers = "sum(srvcmaas_worker_alive_total)";
  const pipelines_running = 'sum(pipelines_running{namespace="forge-intranet"})';
  const pipelines_to_run = 'sum(pipelines_to_run{namespace="forge-intranet"})';
  const pipelines_dispatched = 'sum(pipelines_dispatched{namespace="forge-intranet"})';

  const promises = await Promise.allSettled([
    fetchGrafanaWithQuery(alive_workers),
    fetchGrafanaWithQuery(pipelines_running),
    fetchGrafanaWithQuery(pipelines_to_run),
    fetchGrafanaWithQuery(pipelines_dispatched),
  ]);

  const values = promises.map((p) => {
    if (p.status == "fulfilled") return p.value;
    return null;
  });

  return {
    aliveWorkers: values[0],
    pipelinesRunning: values[1],
    pipelinesToRun: values[2],
    pipelinesDispatched: values[3],
  };
};
