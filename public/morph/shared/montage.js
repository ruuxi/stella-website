/* ============================================================
   Montage — all demos, as they are, back to back, at 1.4x speed.
   Each demo plays its own Claude -> morph -> variant cycle; when
   it signals "morph-shown", we hold the variant briefly then HARD
   CUT to the next demo (no transition). Double-buffered iframes so
   the next demo is already loaded on its Claude baseline at cut.
   ============================================================ */
(function () {
  var A = document.getElementById('mfa');
  var B = document.getElementById('mfb');
  var prog = document.getElementById('mprog');

  var SMALL = ['tabs', 'rail', 'slim', 'files', 'topnav', 'focus', 'split', 'compact', 'quick'];
  var BIG   = ['fitness', 'cook', 'household', 'study', 'travel', 'studio', 'trader', 'calm', 'access'];
  var DEMOS = SMALL.concat(BIG);

  var SPEED = 1.4;     // every demo runs at 1.4x
  var DWELL = 1300;    // hold the revealed variant before the hard cut (ms)
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cur = A, nxt = B, i = 0, advancing = false, lastSignal = Date.now();
  function url(idx) { return 'demos/' + DEMOS[idx % DEMOS.length] + '.html?speed=' + SPEED; }
  function setProg() { if (prog) prog.style.width = (i / (DEMOS.length - 1) * 100).toFixed(2) + '%'; }

  cur.src = url(0);
  cur.classList.add('show');
  setProg();

  function advance() {
    if (advancing) return;
    advancing = true;
    var nextIdx = (i + 1) % DEMOS.length;
    nxt.onload = function () {
      nxt.onload = null;
      nxt.classList.add('show');      // hard cut to the next demo's Claude baseline
      cur.classList.remove('show');
      var t = cur; cur = nxt; nxt = t;
      i = nextIdx; setProg();
      advancing = false; lastSignal = Date.now();
    };
    nxt.src = url(nextIdx);           // preload; cut happens on load
  }

  window.addEventListener('message', function (e) {
    if (e.data === 'morph-shown' && e.source === cur.contentWindow) {
      lastSignal = Date.now();
      if (!advancing) setTimeout(advance, DWELL);
    }
  });

  // watchdog: never get stuck if a signal is missed (or reduced-motion freezes a demo)
  setInterval(function () {
    if (!advancing && Date.now() - lastSignal > (reduced ? 3200 : 11000)) advance();
  }, 1000);
})();
