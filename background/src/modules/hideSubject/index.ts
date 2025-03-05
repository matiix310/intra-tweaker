let isSubjectVisible = false;

const shrinkSubject = () => {
  const subjectLoader = document.getElementsByTagName("subject-loader").item(0);
  if (!subjectLoader) return;

  subjectLoader.setAttribute("style", "display: none;");
  const showCta = document.createElement("div");
  showCta.innerHTML = `
  <div class="list__item__left">
    <div id="showSubjectLabel" class="list__item__name">Show subject<div>
  </div>
  `;
  showCta.classList.add("list__item");
  showCta.style.marginBottom = "20px";
  showCta.addEventListener("click", () => {
    const buttonLabel = document.getElementById("showSubjectLabel");
    if (!buttonLabel) return;
    if (isSubjectVisible) {
      subjectLoader.setAttribute("style", "display: none;");
      buttonLabel.textContent = "Show subject";
    } else {
      subjectLoader.setAttribute("style", "display: inherit;");
      buttonLabel.textContent = "Hide subject";
    }
    isSubjectVisible = !isSubjectVisible;
  });

  subjectLoader.insertAdjacentElement("beforebegin", showCta);
};

const run = () => {
  shrinkSubject();
};

run();
