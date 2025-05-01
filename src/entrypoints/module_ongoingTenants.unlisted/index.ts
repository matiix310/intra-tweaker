import { getUiBlock } from "../background/common/ui";

const run = async () => {
  const tenants = getUiBlock("Tenants");
  if (!tenants) return;

  const projects = tenants.getElementsByClassName("project");

  for (let i = 0; i < projects.length; i++) {
    const project = projects.item(i) as HTMLElement;
    if (
      project
        .getElementsByClassName("project__dates")
        .item(0)
        ?.textContent?.includes("There is no activity currently")
    )
      project.style.opacity = "0.35";
    else tenants.prepend(project);
  }
};

export default defineUnlistedScript(() => {
  run();
});
