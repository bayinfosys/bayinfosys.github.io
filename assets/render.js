// render(name, values): clone <template id="tpl-NAME"> and fill it.
//   data-bind="text:key"    sets textContent
//   data-bind="append:key"  appends a node, a fragment, or an array of them
//   data-bind="href:key"    any other name sets that attribute
//   data-optional="key"     removes the element when values[key] is empty
// Separate several bindings on one element with ";".
window.render = function render(name, values = {}) {
  const frag = document.getElementById("tpl-" + name).content.cloneNode(true);
  const empty = v => v === undefined || v === null || v === "";

  frag.querySelectorAll("[data-optional]").forEach(el => {
    if (empty(values[el.dataset.optional])) el.remove();
  });

  frag.querySelectorAll("[data-bind]").forEach(el => {
    el.dataset.bind.split(";").forEach(pair => {
      const [how, key] = pair.split(":").map(s => s.trim());
      const v = values[key];
      if (empty(v)) return;
      if (how === "text") el.textContent = v;
      else if (how === "append") [].concat(v).forEach(n => el.appendChild(n));
      else el.setAttribute(how, v);
    });
    el.removeAttribute("data-bind");
  });

  return frag;
};
