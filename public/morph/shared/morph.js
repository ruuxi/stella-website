/* ============================================================
   Morph timeline controller (zero deps).
   Reads #stage[data-prompt] / [data-persona].
   Types the prompt into #cdPrompt, "thinks", sweeps the band,
   crossfades #before -> #after, holds, loops.
   ?seek=before|morph|after freezes a state (for screenshots).
   ?speed=N runs the whole loop N times faster (montage uses 2).
   Posts "morph-shown" to the parent when the variant is revealed
   (the montage listens to advance to the next demo).
   ============================================================ */
(function () {
  var stage = document.getElementById("stage");
  if (!stage) return;
  var cdPrompt = document.getElementById("cdPrompt");
  var capPrompt = stage.querySelector(".cap-prompt");
  var capName = stage.querySelector(".cap-name");
  var replay = document.getElementById("replay");
  var prompt = stage.getAttribute("data-prompt") || "";
  var persona = stage.getAttribute("data-persona") || "";
  if (capPrompt) capPrompt.textContent = prompt;
  if (capName) capName.textContent = persona;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var seek = params.get("seek");
  var speed = Math.max(0.25, parseFloat(params.get("speed")) || 1);
  var token = 0;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms / speed); }); }
  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function post(m) { try { if (window.parent && window.parent !== window) window.parent.postMessage(m, "*"); } catch (e) {} }

  function clearState() {
    stage.classList.remove("show-after", "is-morphing", "thinking", "typing");
    if (cdPrompt) cdPrompt.innerHTML = "";
  }
  function freezeBefore() { clearState(); if (cdPrompt) cdPrompt.textContent = prompt; }
  function freezeAfter() { clearState(); stage.classList.add("show-after"); if (cdPrompt) cdPrompt.textContent = prompt; }
  function freezeMorph() { freezeBefore(); stage.classList.add("thinking", "is-morphing", "show-after"); }

  function type(text, id) {
    return new Promise(function (resolve) {
      var i = 0, s = "";
      (function step() {
        if (id !== token) return resolve();
        if (i >= text.length) {
          if (cdPrompt) cdPrompt.innerHTML = esc(text) + '<span class="cd-caret"></span>';
          return resolve();
        }
        s += text[i++];
        if (cdPrompt) cdPrompt.innerHTML = esc(s) + '<span class="cd-caret"></span>';
        setTimeout(step, (30 + Math.random() * 36) / speed);
      })();
    });
  }

  async function run() {
    var id = ++token;
    while (id === token) {
      clearState();
      await sleep(700); if (id !== token) return;
      stage.classList.add("typing");
      await type(prompt, id); if (id !== token) return;
      await sleep(420); if (id !== token) return;
      stage.classList.remove("typing");
      stage.classList.add("thinking");           // clay asterisk works
      await sleep(720); if (id !== token) return;
      stage.classList.add("is-morphing");         // band sweep + frost begins
      await sleep(560); if (id !== token) return; // band reaches mid-screen
      stage.classList.add("show-after");          // reveal the new app under the band
      await sleep(1090); if (id !== token) return;// band exits, frost lifts
      stage.classList.remove("is-morphing", "thinking", "typing");
      post("morph-shown");                        // variant fully revealed
      await sleep(4400); if (id !== token) return;// hold on the transformed app
      stage.classList.remove("show-after");       // ease back to Claude
      await sleep(950);
    }
  }

  if (replay) replay.addEventListener("click", function () { run(); });
  window.addEventListener("message", function (e) {
    if (e && e.data === "replay-demo") run();
    if (e && e.data === "pause-demo") token++;
  });

  if (seek === "after" || reduced) freezeAfter();
  else if (seek === "before") freezeBefore();
  else if (seek === "morph") freezeMorph();
  else run();
})();
