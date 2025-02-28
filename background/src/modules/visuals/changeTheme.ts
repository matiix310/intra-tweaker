import { editTheme, getCurrentDisplacement } from "./common";

let visible = false;

const addCustomCss = () => {
  const customStyles = `
    .color-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 10px;
      background: var(--border);
      outline: none;
      opacity: 0.7;
      -webkit-transition: .2s;
      transition: opacity .2s;
    }

    .color-slider:hover {
      opacity: 1;
    }

    .color-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 10px;
      height: 10px;
      background: #ffff00;
      cursor: pointer;
      border-radius: 0;
      outline: none;
      border: none;
    }

    .color-slider::-moz-range-thumb {
      width: 10px;
      height: 10px;
      background: #ffff00;
      cursor: pointer;
      border-radius: 0;
      outline: none;
      border: none;
    }`;

  var style = document.createElement("style");
  document.head.appendChild(style);
  style.innerHTML = customStyles;
};

const addColorPicker = () => {
  // color sliders
  const main = document.getElementsByTagName("main")[0];
  if (!main) return;

  const { hDisplacement, lDisplacement, sDisplacement } =
    getCurrentDisplacement();

  const colorSliderContainer = document.createElement("div");
  colorSliderContainer.id = "colorSwitcherContainer";
  colorSliderContainer.setAttribute(
    "style",
    `position: fixed;
    bottom: 30px;
    left: 80px;
    background: var(--card-background);
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 3px;
    z-index: 99;
    transform: translateY(150px);
    transition: 0.2s transform ease-in-out;`
  );

  const listStyle = `
    display: flex;
    flex-direction: row;
    align-items: center;
  `;

  const spanStyle = `
    width: 50px;
    text-align: left;
  `;

  colorSliderContainer.innerHTML = `
  <div style="${listStyle}">
    <span id="hValue" style="${spanStyle}">${hDisplacement}</span>
    <input type="range" min="0" max="360" value="${hDisplacement}" class="color-slider" id="hSlider">
  </div>
  
  <div style="${listStyle}">
    <span id="sValue" style="${spanStyle}">${sDisplacement}</span>
    <input type="range" min="0" max="100" value="${sDisplacement}" class="color-slider" id="sSlider">
  </div>
  
  <div style="${listStyle}">
    <span id="lValue" style="${spanStyle}">${lDisplacement}</span>
    <input type="range" min="0" max="100" value="${lDisplacement}" class="color-slider" id="lSlider">
  </div>`;

  main.appendChild(colorSliderContainer);

  document.getElementById("hSlider")?.addEventListener("input", (e) => {
    const slider = e.target as HTMLInputElement;
    document.getElementById("hValue")!.textContent = slider.value;
    localStorage.setItem("hDisplacement", slider.value);
    editTheme();
  });

  document.getElementById("sSlider")?.addEventListener("input", (e) => {
    const slider = e.target as HTMLInputElement;
    document.getElementById("sValue")!.textContent = slider.value;
    localStorage.setItem("sDisplacement", slider.value);
    editTheme();
  });

  document.getElementById("lSlider")?.addEventListener("input", (e) => {
    const slider = e.target as HTMLInputElement;
    document.getElementById("lValue")!.textContent = slider.value;
    localStorage.setItem("lDisplacement", slider.value);
    editTheme();
  });

  // color picker
  const container = document.getElementsByClassName("theme-switcher")[0];

  if (!container) return;

  const anchor = document.createElement("a");
  anchor.innerHTML = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M489.478 22.522C459.449 -7.50733 411.402 -7.50733 381.372 22.522L327.32 76.5748L306.299 55.5543C294.287 43.5425 276.27 43.5425 264.258 55.5543L240.235 76.5748C228.223 88.5865 228.223 106.604 240.235 118.616L390.381 268.762C402.393 280.774 420.411 280.774 432.422 268.762L453.443 247.742C465.455 235.73 465.455 217.713 453.443 205.701L435.425 184.68L489.478 130.628C519.507 100.598 519.507 52.5513 489.478 22.522ZM87.0851 316.809C21.0205 382.874 60.0587 412.903 0 490.979L21.0205 512C99.0968 451.941 129.126 490.98 195.191 424.915L348.34 271.765L240.235 163.66L87.0851 316.809Z" fill="black"/>
    </svg>`;

  anchor.addEventListener("click", () => {
    if (visible) colorSliderContainer.style.transform = "translateY(150px)";
    else colorSliderContainer.style.transform = "translateY(0)";
    visible = !visible;
  });
  container.insertAdjacentElement("afterbegin", anchor);

  const disco = document.createElement("a");
  disco.innerHTML = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M489.478 22.522C459.449 -7.50733 411.402 -7.50733 381.372 22.522L327.32 76.5748L306.299 55.5543C294.287 43.5425 276.27 43.5425 264.258 55.5543L240.235 76.5748C228.223 88.5865 228.223 106.604 240.235 118.616L390.381 268.762C402.393 280.774 420.411 280.774 432.422 268.762L453.443 247.742C465.455 235.73 465.455 217.713 453.443 205.701L435.425 184.68L489.478 130.628C519.507 100.598 519.507 52.5513 489.478 22.522ZM87.0851 316.809C21.0205 382.874 60.0587 412.903 0 490.979L21.0205 512C99.0968 451.941 129.126 490.98 195.191 424.915L348.34 271.765L240.235 163.66L87.0851 316.809Z" fill="black"/>
    </svg>`;

  disco.addEventListener("click", () => {
    let i = 0;
    setInterval(() => {
      i += 15 % 360;
      localStorage.setItem("hDisplacement", i.toString());
      editTheme();
    }, 100);
    localStorage.setItem("sDisplacement", "100");
    localStorage.setItem("lDisplacement", "0");
  });
  container.insertAdjacentElement("afterbegin", disco);
};

const run = () => {
  addCustomCss();
  addColorPicker();
  editTheme();
};

run();
