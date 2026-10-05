/* ============================================================
   RevUp — intro splash animation (optional, ~7.5s)

   Plays once on initial load of the landing page:
     letters R-e-v-U-p type in over a live fluctuating trend line,
     the line morphs into the bar-chart logo beside the word,
     the lockup holds ~1s on green, then glides to the top-left
     nav position as the real landing fades in.

   To DISABLE: remove the <script src="intro.js"></script> tag from
   index.html (and, if you like, this file). Nothing else depends on it.
   ============================================================ */
(function () {
  function injectStyles() {
    if (document.getElementById('intro-styles')) return;
    var css =
      '#intro.intro-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;overflow:hidden;background:transparent;cursor:pointer;}' +
      '.intro-fill{position:absolute;inset:0;background:radial-gradient(130% 130% at 50% 32%, #0E9E68 0%, #06301F 58%, #041c12 100%);transition:opacity 1s ease;}' +
      '.intro-bg{position:absolute;inset:0;width:100%;height:100%;transition:opacity .9s ease, transform 1s cubic-bezier(.5,0,.2,1);}' +
      '.intro-center{position:relative;display:flex;align-items:center;gap:14px;transform-origin:top left;transition:transform 1.25s cubic-bezier(.65,0,.25,1), opacity .35s ease;will-change:transform,opacity;}' +
      '.intro-mark{position:relative;display:inline-grid;place-items:center;width:74px;height:74px;border-radius:21px;background:#0B8A5B;box-shadow:0 22px 50px -12px rgba(0,0,0,.55);opacity:0;transform:scale(.3) rotate(-14deg);transition:opacity .7s ease, transform .8s cubic-bezier(.2,.9,.3,1.4);}' +
      '.intro-mark svg{width:46px;height:46px;}' +
      '.intro-mark svg rect{fill:#fff;}' +
      '.intro-mark .bar{transform:scaleY(0);transform-box:fill-box;transform-origin:bottom;}' +
      '.intro-mark.on{opacity:1;transform:none;}' +
      '.intro-mark.on .bar{animation:introBar .55s cubic-bezier(.2,.8,.3,1.1) forwards;}' +
      '@keyframes introBar{to{transform:scaleY(1);}}' +
      ".intro-word{font-family:'Inter',system-ui,sans-serif;font-weight:800;font-size:76px;letter-spacing:-.03em;color:#fff;display:flex;line-height:1;transition:color .8s ease;}" +
      '.intro-word .il{display:inline-block;opacity:0;transform:translateY(16px) scale(.8);animation:introLetter .6s cubic-bezier(.2,.8,.3,1.25) both;}' +
      '@keyframes introLetter{to{opacity:1;transform:none;}}' +
      '.intro-overlay.morph .intro-bg{opacity:0;transform:scale(.4) translate(-14%,4%);}' +
      '.intro-overlay.reveal .intro-fill{opacity:0;}' +
      '.intro-overlay.reveal .intro-bg{opacity:0;}' +
      '.intro-overlay.reveal .intro-word{color:#14181C;}' +
      '@media (max-width:600px){.intro-mark{width:56px;height:56px;border-radius:16px;}.intro-mark svg{width:36px;height:36px;}.intro-word{font-size:52px;}}';
    var s = document.createElement('style');
    s.id = 'intro-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function letter(ch, delay) {
    return '<span class="il" style="animation-delay:' + delay + 's">' + ch + '</span>';
  }

  window.playIntro = function () {
    // Respect reduced-motion and never double-play.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.getElementById('intro')) return;
    injectStyles();

    var W = 1200, H = 600;
    var timers = [];
    var raf = 0;

    var overlay = document.createElement('div');
    overlay.id = 'intro';
    overlay.className = 'intro-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="intro-fill"></div>' +
      '<svg class="intro-bg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">' +
        '<defs><linearGradient id="introArea" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8FE9C4" stop-opacity=".28"/>' +
          '<stop offset="1" stop-color="#8FE9C4" stop-opacity="0"/></linearGradient></defs>' +
        '<path class="intro-area" fill="url(#introArea)"/>' +
        '<path class="intro-line" fill="none" stroke="#8FE9C4" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>' +
      '<div class="intro-center">' +
        '<span class="intro-mark">' +
          '<svg viewBox="0 0 24 24">' +
            '<rect class="bar" style="animation-delay:.05s" x="3.5" y="12" width="4.3" height="8.5" rx="1.6"/>' +
            '<rect class="bar" style="animation-delay:.16s" x="9.85" y="7.5" width="4.3" height="13" rx="1.6"/>' +
            '<rect class="bar" style="animation-delay:.27s" x="16.2" y="3" width="4.3" height="17.5" rx="1.6"/>' +
          '</svg>' +
        '</span>' +
        '<span class="intro-word">' +
          letter('R', 0.8) + letter('e', 1.35) + letter('v', 1.9) + letter('U', 2.45) + letter('p', 3.0) +
        '</span>' +
      '</div>';
    document.body.appendChild(overlay);

    var linePath = overlay.querySelector('.intro-line');
    var areaPath = overlay.querySelector('.intro-area');
    var center = overlay.querySelector('.intro-center');
    var mark = overlay.querySelector('.intro-mark');

    // ---- live line chart: a real jagged random walk that scrolls left, with an upward drift ----
    var N = 34, midY = H * 0.5, band = 165, spacing = W / (N - 1), off = 0;
    function nextVal(prev) {
      var v = prev + (Math.random() - 0.42) * 42; // volatility + slight upward bias
      if (v > band) v = band - Math.random() * 30; // soft ceiling (mean-revert)
      if (v < -band) v = -band + Math.random() * 30; // soft floor
      return v;
    }
    var pts = [];
    for (var si = 0, sv = -30; si < N + 3; si++) { pts.push(sv); sv = nextVal(sv); }
    function frame() {
      off += 1.5; // scroll speed
      while (off >= spacing) {
        off -= spacing;
        pts.shift();
        pts.push(nextVal(pts[pts.length - 1]));
      }
      var d = '';
      for (var i = 0; i < pts.length; i++) {
        var x = i * spacing - off;
        var y = midY - pts[i] - (i / (pts.length - 1)) * 40; // gentle overall uptrend
        d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      linePath.setAttribute('d', d);
      areaPath.setAttribute('d', d + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z');
      raf = requestAnimationFrame(frame);
    }
    frame();

    function finish() {
      timers.forEach(clearTimeout);
      timers = [];
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    overlay.addEventListener('click', finish); // click anywhere to skip

    // ---- morph: freeze + collapse the line into the logo; bars rise ----
    timers.push(setTimeout(function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      overlay.classList.add('morph');
      mark.classList.add('on');
    }, 3900));

    // ---- glide the lockup to the real top-left nav logo, reveal landing ----
    timers.push(setTimeout(function () {
      // Landing nav logo when logged out, sidebar logo when logged in.
      var target = document.querySelector('.land-nav .logo, .side-logo');
      var lockRect = center.getBoundingClientRect();
      var tr = target ? target.getBoundingClientRect() : { left: 32, top: 22, height: 30 };
      var scale = Math.max(0.2, tr.height / lockRect.height);
      var tx = tr.left - lockRect.left;
      var ty = tr.top - lockRect.top;
      center.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      // On the dark sidebar the wordmark is white; on the light landing it darkens (CSS).
      if (target && target.classList.contains('side-logo')) {
        var w = overlay.querySelector('.intro-word');
        if (w) w.style.color = '#fff';
      }
      overlay.classList.add('reveal');
    }, 5800));

    // ---- crossfade out onto the real nav logo, then remove ----
    timers.push(setTimeout(function () { center.style.opacity = '0'; }, 7050));
    timers.push(setTimeout(finish, 7400));
    timers.push(setTimeout(finish, 8800)); // safety net
  };
})();
