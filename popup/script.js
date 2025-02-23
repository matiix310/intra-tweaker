const generateModule = (name, author, active) => {
  const div = document.createElement("div");
  div.classList.add("module-card");
  if (active) div.classList.add("active");
  div.addEventListener("click", () => onModuleClicked(name));
  const content = `<div class="left">
                        <span class="module-name">${name}</span>
                        <span class="module-author">By ${author}</span>
                    </div>
                    <div class="right">
                        <span class="on">ON</span>
                        <span class="off">OFF</span>
                    </div>`;

  div.innerHTML = content;
  return div;
};

const fetchModules = async () => {
  const list = document.getElementById("list");

  let modules = await browser.runtime.sendMessage({ action: "fetchModules" });
  if (!modules) return;

  const moduleSearch = document.getElementById("moduleSearch");
  if (!moduleSearch) return;
  const filter = moduleSearch.value.trim().toLowerCase();
  if (filter != "")
    modules = modules.filter((m) => m.name.toLowerCase().includes(filter));

  const resultCount = document.getElementById("resultCount");
  if (!resultCount) return;

  resultCount.textContent =
    modules.length + (modules.length > 1 ? " modules found" : " module found");

  modules.sort((m1, m2) => {
    if (m1.active == m2.active) return m1.name > m2.name;
    if (m1.active) return -1;
    return 1;
  });

  list.innerHTML = "";

  for (let module of modules) {
    list.appendChild(generateModule(module.name, module.author, module.active));
  }
};

function onModuleClicked(name) {
  browser.runtime.sendMessage({ action: "toggleModule", name });

  fetchModules();
}

const moduleSearch = document.getElementById("moduleSearch");
moduleSearch.addEventListener("input", (e) => {
  fetchModules();
});

fetchModules();
