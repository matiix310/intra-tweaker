const run = async () => {
  const isSubject =
    window.location.pathname.split("/").at(-1) == "subject.html";
  if (!isSubject) return;

  let sections = document.querySelectorAll<HTMLButtonElement>(
    "button[aria-expanded=false]",
  );

  // Expand all subject details but the guidelines
  sections.forEach((v) => v.click());
};

export default defineUnlistedScript(() => {
  run();
});
