import { grimmLogo } from "./grimmLogo";
import { snowflake1, snowflake2, snowflake3, snowflake4 } from "./snowflakes";
import { snowman } from "./snowman";

type variable = {
  name: string;
  dark: [number, number, number];
  light: [number, number, number];
};

const style = document.createElement("style");
document.head.appendChild(style);

let chromaIntervale: Timer;

export const editTheme = () => {
  const storageHDisplacement = localStorage.getItem("hDisplacement");
  const storageSDisplacement = localStorage.getItem("sDisplacement");
  const storageLDisplacement = localStorage.getItem("lDisplacement");
  let hDisplacement = storageHDisplacement ? parseFloat(storageHDisplacement) : 0;
  let sDisplacement = storageSDisplacement ? parseFloat(storageSDisplacement) : 0;
  let lDisplacement = storageLDisplacement ? parseFloat(storageLDisplacement) : 0;

  const storageStyle = localStorage.getItem("style") ?? "styleNone";

  clearInterval(chromaIntervale);

  for (const item of document.getElementsByClassName("grimm-theme-addon")) item.remove();
  for (const item of document.getElementsByClassName("grimm-theme-addon")) item.remove();

  if (storageStyle === "styleChroma") {
    sDisplacement = 100;
    lDisplacement = 0;
    chromaIntervale = setInterval(() => {
      hDisplacement = (hDisplacement + 5) % 360;
      applyDisplacement(hDisplacement, sDisplacement, lDisplacement);
    }, 50);
  }

  if (storageStyle === "styleGrimmXmas") {
    style.innerHTML = `
    body.light, body.dark {
      --background: #6a994e !important;
      --card-background: #721510 !important;
      --card-separator: #262931 !important;
      --card-footer: #490c09 !important;
      --rectangle-background: #333028 !important;
      --navigation-background: #386641 !important;
      --tag-background: #101117 !important;
      --border: #fef3da !important;
      --primary-text: #fef3da !important;
      --secondary-text: #d8cdb4ff !important;
      --breadcrumb: #386641 !important;
      --required-validated: #386641 !important;
      --trivial: #0285b9 !important;
      --required: #de9a10 !important;
    }

    body {
      --button: #386641 !important;
      --button-hover: #27472dff !important;
    }

    input[type='radio'] {
      accent-color: #386641 !important;
    }

    .transition {
      stroke: var(--primary-text) !important;
    }

    body .nodeLabel {
      color: #fef3da !important;
    }

    .node circle.state-start {
      stroke: var(--primary-text) !important;
      fill: var(--primary-text) !important;
    }

    [id^="mermaid-"] {
      fill: var(--primary-text) !important;
    }

    header, .body {
      position: relative;
    }

    .stack {
      z-index: 1;
    }
    `;

    const grimmLink = document.createElement("a");
    grimmLink.href = "https://bde-grimm.com";
    grimmLink.classList = "grimm-theme-addon";
    grimmLink.target = "blank_";
    grimmLink.innerHTML = grimmLogo;
    const links = document.getElementsByClassName("links")[0];
    links.appendChild(grimmLink);

    const snowmanDiv = document.createElement("div");
    snowmanDiv.classList = "grimm-theme-addon";
    snowmanDiv.innerHTML = snowman;
    snowmanDiv.style.position = "absolute";
    snowmanDiv.style.bottom = "-10px";
    snowmanDiv.style.right = "20px";
    snowmanDiv.style.aspectRatio = "1 / 1.3";
    snowmanDiv.style.height = "90%";

    document.getElementsByTagName("header")[0].appendChild(snowmanDiv);

    const snowflakesDiv = document.createElement("div");
    snowflakesDiv.classList = "grimm-theme-addon";
    snowflakesDiv.style.position = "absolute";
    snowflakesDiv.style.top = "0";
    snowflakesDiv.style.left = "0";
    snowflakesDiv.style.width = "100%";
    snowflakesDiv.style.height = "100%";
    snowflakesDiv.style.overflow = "hidden";
    snowflakesDiv.style.pointerEvents = "none";

    document.getElementsByClassName("body")[0].appendChild(snowflakesDiv);

    // litle snowflakes
    for (let i = 0; i < 24; i++) {
      const snowflake = document.createElement("div");
      snowflake.innerHTML = snowflake1;
      snowflake.style.position = "absolute";
      snowflake.style.top = (Math.random() * 100).toString() + "%";
      snowflake.style.left = (Math.random() * 100).toString() + "%";
      snowflake.style.opacity = (Math.random() * 20 + 10).toString() + "%";
      snowflakesDiv.appendChild(snowflake);
    }

    // litle dots
    for (let i = 0; i < 30; i++) {
      const snowflake = document.createElement("div");
      snowflake.innerHTML = snowflake2;
      snowflake.style.position = "absolute";
      snowflake.style.top = (Math.random() * 100).toString() + "%";
      snowflake.style.left = (Math.random() * 100).toString() + "%";
      snowflake.style.opacity = (Math.random() * 20 + 10).toString() + "%";
      snowflakesDiv.appendChild(snowflake);
    }

    // big snowflakes
    for (let i = 0; i < 30; i++) {
      const snowflake = document.createElement("div");
      snowflake.innerHTML = snowflake3;
      snowflake.style.position = "absolute";
      snowflake.style.top = (Math.random() * 100).toString() + "%";
      snowflake.style.left = (Math.random() * 100).toString() + "%";
      snowflake.style.opacity = (Math.random() * 20 + 10).toString() + "%";
      snowflakesDiv.appendChild(snowflake);
    }

    // big dots
    for (let i = 0; i < 0; i++) {
      const snowflake = document.createElement("div");
      snowflake.innerHTML = snowflake4;
      snowflake.style.position = "absolute";
      snowflake.style.top = (Math.random() * 100).toString() + "%";
      snowflake.style.left = (Math.random() * 100).toString() + "%";
      snowflake.style.opacity = (Math.random() * 20 + 10).toString() + "%";
      snowflakesDiv.appendChild(snowflake);
    }

    return;
  }

  if (storageStyle == "styleNone") {
    style.innerHTML = "";
    return;
  }

  applyDisplacement(hDisplacement, sDisplacement, lDisplacement);
};

const applyDisplacement = (
  hDisplacement: number,
  sDisplacement: number,
  lDisplacement: number
) => {
  const variables: variable[] = [
    { name: "background", dark: [230, 15, 7.8], light: [210, 20, 98] },
    { name: "card-background", dark: [227, 14.8, 12], light: [200, 20, 100] },
    { name: "card-separator", dark: [224, 12.6, 17.1], light: [220, 13, 91] },
    { name: "card-footer", dark: [227, 17, 10.4], light: [220, 13, 91] },
    { name: "rectangle-background", dark: [228, 16.1, 6.1], light: [220, 14.3, 95.9] },
    { name: "navigation-background", dark: [231, 21.2, 6.5], light: [210, 20, 98] },
    { name: "tag-background", dark: [231, 17.9, 7.6], light: [220, 13, 91] },
    { name: "border", dark: [233, 9.3, 16.9], light: [220, 13, 91] },
    { name: "primary-text", dark: [231, 40, 90.2], light: [215, 27.9, 16.9] },
    { name: "secondary-text", dark: [225, 16.5, 66.7], light: [215, 13.8, 34.1] },
    { name: "breadcrumb", dark: [240, 7, 13.9], light: [220, 14.3, 95.9] },
  ];

  let newStyles = "body.dark {";

  // dark theme
  variables.forEach((v) => {
    const h = (v.dark[0] + hDisplacement) % 360;
    const s = Math.max(Math.min(v.dark[1] + sDisplacement, 100), 0);
    const l = Math.max(Math.min(v.dark[2] + lDisplacement, 100), 0);
    newStyles += `--${v.name}: hsl(${h}, ${s}%, ${l}%) !important;`;
  });

  newStyles += "} body.light {";

  variables.forEach((v) => {
    const h = (v.light[0] + hDisplacement) % 360;
    const s = Math.max(Math.min(v.light[1] + sDisplacement, 100), 0);
    const l = Math.max(Math.min(v.light[2] - lDisplacement, 100), 0);
    newStyles += `--${v.name}: hsl(${h}, ${s}%, ${l}%) !important;`;
  });

  newStyles += "}";

  window.requestAnimationFrame(() => (style.innerHTML = newStyles));
};

export const getCurrentDisplacement = () => {
  const storageHDisplacement = localStorage.getItem("hDisplacement");
  const storageSDisplacement = localStorage.getItem("sDisplacement");
  const storageLDisplacement = localStorage.getItem("lDisplacement");
  let hDisplacement = storageHDisplacement ? parseFloat(storageHDisplacement) : 0;
  let sDisplacement = storageSDisplacement ? parseFloat(storageSDisplacement) : 0;
  let lDisplacement = storageLDisplacement ? parseFloat(storageLDisplacement) : 0;
  return { hDisplacement, sDisplacement, lDisplacement };
};
