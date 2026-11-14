(function () {
  "use strict";
  var box = document.querySelector(".article-feedback");
  if (!box) return;
  var buttons = box.querySelectorAll("button");
  var status = box.querySelector(".article-feedback__status");

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      // clientlog records the click from its data-clientlog label;
      // this runs a tick later so the click reaches it first.
      setTimeout(function () {
        Array.prototype.forEach.call(buttons, function (b) {
          b.disabled = true;
          b.setAttribute("aria-pressed", b === button ? "true" : "false");
          b.classList.toggle("is-chosen", b === button);
        });
        status.textContent = "Thank you.";
      }, 0);
    });
  });
})();
