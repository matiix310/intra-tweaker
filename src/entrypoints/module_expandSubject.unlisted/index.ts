const run = async () => {
  const isSubject =
    window.location.hostname == "s3.cri.epita.fr"
    && window.location.pathname.split("/").at(-1) == "subject.html";
  if (!isSubject) return;

  // Expand all subject details
  document.querySelectorAll('[aria-expanded=false]').forEach((v) => v.click());
};

export default defineUnlistedScript(() => {
  run();
});
