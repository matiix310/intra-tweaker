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

  const storageStyle = localStorage.getItem("style") ?? "styleCustom";

  clearInterval(chromaIntervale);

  if (storageStyle == "styleChroma") {
    sDisplacement = 100;
    lDisplacement = 0;
    chromaIntervale = setInterval(() => {
      hDisplacement = (hDisplacement + 10) % 360;
      applyDisplacement(hDisplacement, sDisplacement, lDisplacement);
    }, 100);
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
