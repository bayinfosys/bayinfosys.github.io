// Checklist behaviour shared by every page in _checklists.
// Expects a [data-checklist] root, .cl-q sections of <details class="cl-opt">
// answers, a #checklist-config JSON block, and render() from render.js.
(() => {
  const root = document.querySelector("[data-checklist]");
  if (!root) return;

  const id = root.dataset.checklist;
  const cfgEl = document.getElementById("checklist-config");
  const cfg = cfgEl ? JSON.parse(cfgEl.textContent) : {};
  const bands = cfg.bands || [];
  const flagText = cfg.flags || {};
  const scoreLabel = cfg.scoreLabel || "Score";

  const qs = Array.from(root.querySelectorAll(".cl-q"));
  const scored = qs.filter(q => q.dataset.type === "scored");
  const maxScore = scored.reduce((sum, q) => sum + (Number(q.dataset.max) || 0), 0);

  const out = document.getElementById("cl-results");
  const next = document.getElementById("cl-next");
  const reading = document.getElementById("cl-reading");

  const chosen = {};
  let started = false;
  let completed = false;
  let result = null;

  function track(name, data = {}) {
    try {
      if (typeof logger !== "undefined" && logger && typeof logger.event === "function") {
        logger.event(name, Object.assign({ checklist: id }, data));
        return true;
      }
    } catch (e) {}
    return false;
  }

  const labelOf = d => d.querySelector(".cl-opt__label").textContent.trim();
  const guideOf = q => chosen[q.dataset.q].querySelector(".cl-guide");
  const linksIn = el => Array.from(el.querySelectorAll("a")).map(a => ({
    url: a.getAttribute("href"),
    text: a.textContent.trim()
  }));
  const linkItems = links => links.map(l => render("cl-link", l));

  function select(q, d) {
    q.querySelectorAll(".cl-opt").forEach(o => {
      const on = o === d;
      o.classList.toggle("is-selected", on);
      o.querySelector(".cl-opt__state").textContent = on ? " (selected)" : "";
    });
    chosen[q.dataset.q] = d;
    if (!started) { started = true; track("checklist_start"); }
    update();
  }

  qs.forEach(q => {
    const opts = q.querySelectorAll(".cl-opt");
    opts.forEach(d => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        opts.forEach(o => { if (o !== d) o.open = false; });
        select(q, d);
      });
    });
  });

  function update() {
    if (!out) return;

    const left = qs.filter(q => !chosen[q.dataset.q]).length;
    if (left > 0) {
      out.replaceChildren(render("cl-status", { left: left + (left === 1 ? " question" : " questions") }));
      if (next) next.hidden = true;
      result = null;
      return;
    }

    // Weakest area: total each area's points against its maximum, take the
    // lowest share, and show the lowest-scoring question within that area.
    // With one question per area this is the same as the weakest question.
    let score = 0;
    const areas = new Map();
    scored.forEach(q => {
      const p = Number(chosen[q.dataset.q].dataset.points) || 0;
      const max = Number(q.dataset.max) || 0;
      score += p;
      const a = areas.get(q.dataset.area) || { p: 0, max: 0, worst: null, worstShare: 2 };
      a.p += p;
      a.max += max;
      const share = max > 0 ? p / max : 1;
      if (share < a.worstShare) { a.worstShare = share; a.worst = q; }
      areas.set(q.dataset.area, a);
    });

    let weakest = null;
    let lowest = 1;
    areas.forEach(a => {
      if (a.max > 0 && a.p / a.max < lowest) { lowest = a.p / a.max; weakest = a.worst; }
    });

    const band = bands.find(b => score >= b.min && score <= b.max);
    const flags = [...new Set(qs.map(q => chosen[q.dataset.q].dataset.flag).filter(f => f && flagText[f]))];

    const blocks = [];
    if (band) {
      blocks.push(render("cl-band", {
        label: scoreLabel,
        score: String(score),
        max: String(maxScore),
        name: band.name,
        text: band.text,
        links: linkItems(band.links || [])
      }));
    }
    if (weakest) {
      blocks.push(render("cl-weakest", {
        area: weakest.dataset.area,
        guidance: Array.from(guideOf(weakest).childNodes).map(n => n.cloneNode(true))
      }));
    }
    if (flags.length) {
      blocks.push(render("cl-flags", { items: flags.map(f => render("cl-flag", flagText[f])) }));
    }
    if (!blocks.length) blocks.push(render("cl-done"));
    out.replaceChildren(...blocks);

    if (reading) {
      const seen = new Set();
      const links = [];
      const add = l => { if (!seen.has(l.url)) { seen.add(l.url); links.push(l); } };
      qs.forEach(q => linksIn(guideOf(q)).forEach(add));
      if (band) (band.links || []).forEach(add);
      reading.replaceChildren(...linkItems(links));
    }
    if (next) next.hidden = false;

    result = {
      score,
      max: maxScore,
      band: band ? band.name : null,
      weakest: weakest ? weakest.dataset.area : null,
      flags: flags.map(f => flagText[f].text)
    };

    if (!completed) { completed = true; track("checklist_complete"); }
  }

  const answerList = () => qs.map(q => ({
    question: q.querySelector(".cl-q__title").textContent.trim(),
    answer: labelOf(chosen[q.dataset.q])
  }));

  const field = (f, n) => f.elements.namedItem(n);

  function bind(formId, eventName, build, okText) {
    const f = document.getElementById(formId);
    if (!f) return;
    f.addEventListener("submit", e => {
      e.preventDefault();
      if (!result) return;
      const msg = f.querySelector(".form-msg");
      msg.hidden = false;
      if (track(eventName, build(f))) {
        msg.replaceChildren(render("cl-sent", { message: okText }));
        f.querySelector("button[type=submit]").disabled = true;
      } else {
        msg.replaceChildren(render("cl-send-failed"));
      }
    });
  }

  bind("cl-form-email", "checklist_email_results", f => ({
    email: field(f, "email").value.trim(),
    consent: field(f, "consent").checked,
    result
  }), "Sent. Your results will arrive by email, usually within one working day.");

  bind("cl-form-call", "checklist_call_request", f => {
    const data = {
      email: field(f, "email").value.trim(),
      name: field(f, "name").value.trim(),
      organisation: field(f, "organisation").value.trim(),
      decision_maker: field(f, "decision_maker").value.trim(),
      timing: field(f, "timing").value
    };
    if (field(f, "include_answers").checked) {
      data.result = result;
      data.answers = answerList();
    }
    return data;
  }, "Sent. We will email you within one working day to arrange a time.");

  document.querySelectorAll("[data-cl-js]").forEach(el => { el.hidden = false; });
  const printBtn = document.getElementById("cl-print-btn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  update();
})();
