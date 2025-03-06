import { getAllTags } from "../../common/tags";

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const shuffle = (array: string[]) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
};

const canvas: HTMLCanvasElement = document.createElement("canvas");

canvas.style.position = "absolute";
canvas.style.top = "50%";
canvas.style.left = "50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.width = "50vh";
canvas.style.height = "50vh";
canvas.style.pointerEvents = "none";
canvas.style.opacity = "0";
canvas.style.transition = "0.3s opacity ease-in-out";
canvas.style.zIndex = "10";

canvas.width = 1000;
canvas.height = 1000;

const ctx = canvas.getContext("2d")!;
const colors = [
  ["#9b3228", "black", "#9b3228", "black", "#9b3228", "black", "#9b3228", "black"],
  ["orange", "green", "yellow", "blue", "purple", "grey", "aqua", "lime"],
  ["#0969e8", "white", "#0969e8", "white", "#0969e8", "white", "#0969e8", "white"],
  [
    "#330baa",
    "#6342c4",
    "#330baa",
    "#6342c4",
    "#330baa",
    "#6342c4",
    "#330baa",
    "#6342c4",
  ],
];
let colorIdx = 2;
let possibilities: string[] = [];
let target = Math.PI * 2 * 5;
let duration = 8000;
let start = Date.now();
let offset = 0;

const count = 8;
const segment = (Math.PI * 2) / count;

document.body.appendChild(canvas);

const draw = (turn = true) => {
  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(offset);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[colorIdx][i % colors[colorIdx].length];
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2 - 5,
      -(Math.PI * 5) / count,
      -(Math.PI * 5) / count + segment,
      false
    );

    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "normal bold 70px Inter";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.fillText(possibilities[i], canvas.width / 2, 130);
    ctx.strokeText(possibilities[i], canvas.width / 2, 130);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.PI * 2) / count);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.restore();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 8, 0, Math.PI * 2, false);
  ctx.fill();

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 25, 0);
  ctx.lineTo(canvas.width / 2 + 25, 0);
  ctx.lineTo(canvas.width / 2, 50);
  ctx.fill();

  const now = Date.now();
  const progress = (now - start) / duration;
  offset = target * easeOutQuart(progress);

  if (progress >= 1) return;

  if (turn) requestAnimationFrame(() => draw());
};

const turnWheel = async (percentage: number) => {
  return new Promise<void>((resolve, reject) => {
    colorIdx = Math.floor(Math.random() * 3);
    possibilities = [percentage + "%"];
    if (percentage != 0) possibilities.push("0%");
    if (percentage != 100) possibilities.push("100%");
    for (let i = 0; possibilities.length < count; i++) {
      let r: string;
      do {
        r = Math.floor(Math.random() * 99 + 1) + "%";
      } while (possibilities.includes(r));
      possibilities.push(r);
    }

    // randomize the list of possibilities
    shuffle(possibilities);

    // get the index of the correct percentage
    let currentIndex = 0;
    while (possibilities[currentIndex] != percentage + "%") currentIndex++;

    // between 7s and 10s
    duration = Math.random() * 3000 + 7000;

    // random amount of turn ([3, 5[)
    target =
      Math.PI * 2 * (3 + Math.floor(Math.random() * 2)) -
      (currentIndex * (Math.PI * 2)) / count +
      (Math.random() * (Math.PI * 2)) / count -
      Math.PI / count;

    // init
    offset = 0;

    setTimeout(() => {
      start = Date.now();
      draw(true);
    }, 1000);

    draw(false);

    canvas.style.opacity = "1";

    setTimeout(() => {
      canvas.style.opacity = "0";
      resolve();
    }, duration + 2000);
  });
};

const tags = getAllTags();

tags.forEach((t) => {
  if (t.status == "SUCCEEDED" && t.percentage) {
    const tracePercentage = t.element
      .getElementsByTagName("trace-symbol")
      .item(0) as HTMLElement;
    tracePercentage.style.display = "none";
    const button = document.createElement("button");
    button.classList.add("button__big");
    button.innerText = "Turn the wheel";
    button.addEventListener("click", (e) => {
      e.preventDefault();
      if (canvas.style.opacity == "1") return;
      turnWheel(t.percentage!).then(() => {
        button.remove();
        tracePercentage.style.display = "inherit";
      });
    });
    t.element.getElementsByClassName("list__item__right").item(0)?.prepend(button);
  }
});
