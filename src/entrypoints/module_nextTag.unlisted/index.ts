function addNextTagsIntoSubmission() {
  const div = Array.from(document.querySelectorAll("div")).find(
    (d) => d.innerHTML.trim() === "Limit"
  );
  if (!div) return;
  const parsed = div.nextElementSibling?.innerHTML.split("/").map((s) => s.trim()) ?? [];
  if (parsed.length < 2 || parsed[1] !== "HOUR_ROLLING") return;

  const count = parseInt(parsed[0]);

  const list = Array.from(document.querySelectorAll("div[class=list]")).pop();
  if (!list) return;

  const items = Array.from(list.children);
  const enabled = items.filter(
    (i) => !i.querySelector('trace-symbol[errorstatus="QUOTA_EXCEEDED"]')
  );

  const now = new Date();
  const recent = enabled
    .map((item) => {
      const text = item
        .querySelector("div.list__item__subname")
        ?.innerHTML.split("|")[0]!;
      const [dateStr, timeStr] = text.split("-").map((s) => s.trim());
      const [h, m] = timeStr.split(":").map(Number);
      const date = new Date(dateStr.replace("Submitted on ", "") + ` ${h}:${m}`);
      date.setHours(date.getHours() + 1);
      return date;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  const baseTimes: Date[] = [];
  for (let i = 0; i < count; i++) {
    if (i < count - recent.length) {
      const d = new Date(now);
      d.setSeconds(0, 0);
      baseTimes.push(d);
    } else {
      const d = new Date(recent[i - (count - recent.length)]);
      baseTimes.push(d);
    }
  }

  const sections = Array.from(document.querySelectorAll("div.title"));
  const submissionTitle = sections.find((d) => d.textContent.trim() === "Submission");
  const submissionsWrapper = submissionTitle?.nextElementSibling;
  let info = Array.from(submissionsWrapper?.children || []).find(
    (d) =>
      d.classList.contains("activity__information__item") &&
      d.classList.contains("assignment_submission")
  );

  if (!info) {
    info = document.createElement("div");
    info.className = "activity__information__item assignment_submission";
    submissionsWrapper?.appendChild(info);
  }

  const label = Object.assign(document.createElement("div"), {
    className: "label",
    textContent: "Next tags",
  });
  const value = Object.assign(document.createElement("div"), {
    className: "item__value",
  });
  info.append(label, value);

  function updateTime() {
    const now = new Date();
    const sorted = baseTimes
      .map((t) => ({ t, diff: t.getTime() - now.getTime() }))
      .sort((a, b) => {
        if ((a.diff <= 0 && b.diff <= 0) || (a.diff > 0 && b.diff > 0))
          return a.t.getTime() - b.t.getTime();
        return a.diff - b.diff;
      });

    value.textContent = sorted
      .map(({ t, diff }) => {
        let left =
          diff > 0
            ? `${String(Math.floor(diff / 3600000)).padStart(2, "0")}:${String(
                Math.floor((diff % 3600000) / 60000)
              ).padStart(2, "0")}`
            : "00:00";
        return `${String(t.getHours()).padStart(2, "0")}:${String(
          t.getMinutes()
        ).padStart(2, "0")} (${left} left)`;
      })
      .join(" - ");
  }

  updateTime();
  setInterval(updateTime, 5000);
}

export default defineUnlistedScript(() => {
  addNextTagsIntoSubmission();
});
