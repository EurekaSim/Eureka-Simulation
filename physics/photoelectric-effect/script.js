/* ============================================================
   Photoelectric Effect Simulator — script.js
   Vanilla JS, no build step, no dependencies.
   Exposes window.PhotoelectricSim for future extension
   (e.g. add metals, hook into other UI, drive from a lesson
   plan, log stats to a backend, etc).
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- Physics constants & data ---------------- */

  var H_EV_PER_THZ = 4.1357e-3; // Planck's constant, eV per THz of frequency
  var FREQ_MIN = 300;
  var FREQ_MAX = 1600;
  var Y_MAX_EV = 5.0;

  var METALS = [
    { key: 'cs', name: 'Cesium', symbol: 'Cs', workFunction: 2.10 },
    { key: 'na', name: 'Sodium', symbol: 'Na', workFunction: 2.30 },
    { key: 'zn', name: 'Zinc', symbol: 'Zn', workFunction: 4.30 },
    { key: 'cu', name: 'Copper', symbol: 'Cu', workFunction: 4.70 },
    { key: 'pt', name: 'Platinum', symbol: 'Pt', workFunction: 6.35 }
  ];

  /* ---------------- Color science ---------------- */

  function wavelengthToRGB(wavelength) {
    var r, g, b;
    if (wavelength < 440) { r = -(wavelength - 440) / 60; g = 0; b = 1; }
    else if (wavelength < 490) { r = 0; g = (wavelength - 440) / 50; b = 1; }
    else if (wavelength < 510) { r = 0; g = 1; b = -(wavelength - 510) / 20; }
    else if (wavelength < 580) { r = (wavelength - 510) / 70; g = 1; b = 0; }
    else if (wavelength < 645) { r = 1; g = -(wavelength - 645) / 65; b = 0; }
    else { r = 1; g = 0; b = 0; }

    var factor;
    if (wavelength < 420) factor = 0.3 + 0.7 * (wavelength - 380) / 40;
    else if (wavelength < 701) factor = 1.0;
    else factor = 0.3 + 0.7 * (780 - wavelength) / 79;

    var gamma = 0.8;
    function clamp(v) {
      return Math.max(0, Math.min(255, Math.round(255 * Math.pow(Math.max(0, v * factor), gamma))));
    }
    return [clamp(r), clamp(g), clamp(b)];
  }

  function photonColor(freqTHz) {
    var wavelength = 300000 / freqTHz; // nm
    if (wavelength < 380) return 'rgb(191,150,255)'; // UV — shown as violet-white
    if (wavelength > 780) return 'rgb(120,45,35)';    // IR — shown as dim red
    var rgb = wavelengthToRGB(wavelength);
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  }

  function buildSpectrumGradient() {
    var stops = [];
    var n = 16;
    for (var i = 0; i <= n; i++) {
      var f = FREQ_MIN + (FREQ_MAX - FREQ_MIN) * (i / n);
      stops.push(photonColor(f) + ' ' + ((i / n) * 100) + '%');
    }
    return 'linear-gradient(to right, ' + stops.join(', ') + ')';
  }

  var SPECTRUM_GRADIENT = buildSpectrumGradient();

  /* ---------------- App state ---------------- */

  var state = {
    metalIdx: 1,
    frequency: 560,
    intensity: 55
  };

  /* ---------------- DOM refs (populated on init) ---------------- */

  var dom = {};

  /* ---------------- Derived-value helpers ---------------- */

  function getMetal() { return METALS[state.metalIdx]; }
  function getPhotonEnergy() { return H_EV_PER_THZ * state.frequency; }
  function getThresholdFreq(metal) { return metal.workFunction / H_EV_PER_THZ; }
  function getKeMax(metal) { return Math.max(0, getPhotonEnergy() - metal.workFunction); }
  function isEmitting(metal) { return getPhotonEnergy() > metal.workFunction; }

  /* ---------------- Particle sim (canvas) ---------------- */

  var canvas, ctx, tubeWidth = 0, tubeHeight = 0;
  var photons = [], electrons = [], flashes = [];
  var spawnAcc = 0, lastTs = null, rateAcc = 0;
  var emitTimes = [];
  var currentRate = 0;

  function resizeCanvas() {
    var rect = dom.tubeWrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    tubeWidth = rect.width;
    tubeHeight = rect.height;
    canvas.width = tubeWidth * dpr;
    canvas.height = tubeHeight * dpr;
    canvas.style.width = tubeWidth + 'px';
    canvas.style.height = tubeHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function animFrame(ts) {
    if (lastTs == null) lastTs = ts;
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    var metal = getMetal();
    var emitting = isEmitting(metal);
    var keMax = getKeMax(metal);

    var plateX = tubeWidth * 0.6;
    var plateTop = tubeHeight * 0.16;
    var plateBottom = tubeHeight * 0.84;

    /* spawn photons based on intensity */
    if (state.intensity > 1) {
      spawnAcc += dt;
      var interval = Math.max(0.035, 0.62 - state.intensity * 0.0055);
      while (spawnAcc > interval) {
        spawnAcc -= interval;
        if (photons.length < 90) {
          photons.push({
            x: 0,
            y: plateTop + Math.random() * (plateBottom - plateTop),
            vx: 250 + Math.random() * 40,
            color: photonColor(state.frequency)
          });
        }
      }
    } else {
      spawnAcc = 0;
    }

    /* update photons, resolve collisions with plate */
    var nextPhotons = [];
    for (var i = 0; i < photons.length; i++) {
      var p = photons[i];
      p.x += p.vx * dt;
      if (p.x >= plateX) {
        if (emitting && electrons.length < 60) {
          var speed = 70 + Math.min(keMax, 6.5) / 6.5 * 260;
          electrons.push({
            x: plateX, y: p.y, vx: speed,
            vy: (Math.random() - 0.5) * 60, life: 1.4
          });
          emitTimes.push(ts);
        } else {
          flashes.push({ x: plateX, y: p.y, life: 0.25 });
        }
      } else {
        nextPhotons.push(p);
      }
    }
    photons = nextPhotons;

    /* update electrons */
    var nextElectrons = [];
    for (var j = 0; j < electrons.length; j++) {
      var e = electrons[j];
      e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt;
      if (e.life > 0 && e.x < tubeWidth + 20) nextElectrons.push(e);
    }
    electrons = nextElectrons;

    /* update absorption flashes */
    var nextFlashes = [];
    for (var k = 0; k < flashes.length; k++) {
      flashes[k].life -= dt;
      if (flashes[k].life > 0) nextFlashes.push(flashes[k]);
    }
    flashes = nextFlashes;

    /* rolling emission rate (electrons/sec, trailing 1s window) */
    var cutoff = ts - 1000;
    var kept = [];
    for (var m = 0; m < emitTimes.length; m++) {
      if (emitTimes[m] > cutoff) kept.push(emitTimes[m]);
    }
    emitTimes = kept;

    rateAcc += dt;
    if (rateAcc > 0.25) {
      rateAcc = 0;
      currentRate = emitTimes.length;
      updateStatsDOM(metal, emitting, keMax);
    }

    drawScene(plateX, plateTop, plateBottom, emitting);

    requestAnimationFrame(animFrame);
  }

  function drawScene(plateX, plateTop, plateBottom, emitting) {
    ctx.clearRect(0, 0, tubeWidth, tubeHeight);

    var bgGrad = ctx.createLinearGradient(0, 0, 0, tubeHeight);
    bgGrad.addColorStop(0, 'rgba(255,255,255,0.025)');
    bgGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, tubeWidth, tubeHeight);

    if (emitting) {
      var glow = ctx.createRadialGradient(plateX, tubeHeight / 2, 4, plateX, tubeHeight / 2, 95);
      glow.addColorStop(0, 'rgba(255,179,0,0.20)');
      glow.addColorStop(1, 'rgba(255,179,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(plateX - 95, 0, 190, tubeHeight);
    }

    var plateGrad = ctx.createLinearGradient(plateX - 6, 0, plateX + 6, 0);
    plateGrad.addColorStop(0, '#4B515C');
    plateGrad.addColorStop(0.5, '#A3AAB7');
    plateGrad.addColorStop(1, '#4B515C');
    ctx.fillStyle = plateGrad;
    ctx.fillRect(plateX - 4, plateTop - 12, 8, (plateBottom - plateTop) + 24);

    for (var i = 0; i < photons.length; i++) {
      var p = photons[i];
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (var f = 0; f < flashes.length; f++) {
      var fl = flashes[f];
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(232,88,74,' + Math.max(0, fl.life / 0.25) + ')';
      ctx.lineWidth = 2;
      ctx.arc(fl.x, fl.y, (0.25 - fl.life) * 44 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (var e = 0; e < electrons.length; e++) {
      var el = electrons[e];
      ctx.beginPath();
      ctx.fillStyle = '#4FD8E8';
      ctx.shadowColor = '#4FD8E8';
      ctx.shadowBlur = 10;
      ctx.arc(el.x, el.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  /* ---------------- DOM update: stats, sliders, graph ---------------- */

  function updateStatsDOM(metal, emitting, keMax) {
    var photonEnergy = getPhotonEnergy();
    dom.statEnergy.textContent = photonEnergy.toFixed(2) + ' eV';
    dom.statEnergy.style.color = photonColor(state.frequency);
    dom.statWork.textContent = metal.workFunction.toFixed(2) + ' eV';
    dom.statMetalSym.textContent = metal.symbol;
    dom.statKE.textContent = keMax.toFixed(2) + ' eV';
    dom.statKE.style.color = emitting ? '#4FD8E8' : '#E8584A';
    dom.statRate.textContent = (emitting ? currentRate : 0) + '/s';
    dom.statRate.style.color = emitting ? '#4FD8E8' : '#4B515C';

    dom.statusDot.style.background = emitting ? '#6FCF8F' : '#E8584A';
    dom.statusDot.style.boxShadow = emitting ? '0 0 8px #6FCF8F' : 'none';
    dom.statusText.textContent = emitting ? 'ELECTRONS EMITTED' : 'NO EMISSION — below threshold';
    dom.statusText.style.color = emitting ? '#6FCF8F' : '#E8584A';

    dom.plateLabel.textContent = metal.name + ' plate';
  }

  function updateSlidersDOM(metal) {
    var thresholdFreq = getThresholdFreq(metal);
    var threshPct = Math.max(0, Math.min(100, ((thresholdFreq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 100));
    dom.threshMark.style.left = threshPct + '%';
    dom.threshLabel.style.left = threshPct + '%';

    dom.freqSlider.value = state.frequency;
    dom.freqVal.textContent = state.frequency.toFixed(0);
    var curColor = photonColor(state.frequency);
    dom.freqSlider.style.setProperty('--track-bg', SPECTRUM_GRADIENT);
    dom.freqSlider.style.setProperty('--thumb-color', curColor);
    dom.freqSlider.style.setProperty('--thumb-glow', curColor);

    dom.intensitySlider.value = state.intensity;
    dom.intensityVal.textContent = state.intensity.toFixed(0);
    dom.intensitySlider.style.setProperty(
      '--track-bg',
      'linear-gradient(to right, #FFB300 ' + state.intensity + '%, #1E232A ' + state.intensity + '%)'
    );
    dom.intensitySlider.style.setProperty('--thumb-color', '#FFB300');
  }

  function gx(f) { return 34 + ((f - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 276; }
  function gy(ke) { return 10 + (1 - Math.min(ke, Y_MAX_EV) / Y_MAX_EV) * 116; }

  function updateGraphDOM(metal, keMax) {
    var thresholdFreq = getThresholdFreq(metal);
    var keAtMax = Math.max(0, H_EV_PER_THZ * FREQ_MAX - metal.workFunction);

    var lx1 = gx(thresholdFreq), ly1 = gy(0);
    var lx2 = gx(FREQ_MAX), ly2 = gy(keAtMax);
    var dotX = gx(state.frequency), dotY = gy(keMax);
    var emitting = isEmitting(metal);

    dom.threshLine.setAttribute('x1', gx(thresholdFreq));
    dom.threshLine.setAttribute('x2', gx(thresholdFreq));

    dom.keLine.setAttribute('x1', lx1);
    dom.keLine.setAttribute('y1', ly1);
    dom.keLine.setAttribute('x2', lx2);
    dom.keLine.setAttribute('y2', ly2);

    dom.keDot.setAttribute('cx', dotX);
    dom.keDot.setAttribute('cy', dotY);
    dom.keDot.setAttribute('fill', emitting ? '#4FD8E8' : '#E8584A');

    dom.tickF1.setAttribute('x', gx(500));
    dom.tickF2.setAttribute('x', gx(1000));
    dom.tickF2.setAttribute('y', 140);
    dom.tickF3.setAttribute('x', gx(1500));
    dom.tickF3.setAttribute('y', 140);

    dom.tickK0.setAttribute('y', gy(0) + 3);
    dom.tickK1.setAttribute('x', 28); dom.tickK1.setAttribute('y', gy(2.5) + 3);
    dom.tickK2.setAttribute('x', 28); dom.tickK2.setAttribute('y', gy(5) + 3);
  }

  /* ---------------- Full re-render of derived UI ---------------- */

  function render() {
    var metal = getMetal();
    var emitting = isEmitting(metal);
    var keMax = getKeMax(metal);

    updateStatsDOM(metal, emitting, keMax);
    updateSlidersDOM(metal);
    updateGraphDOM(metal, keMax);

    var buttons = dom.metalRow.querySelectorAll('.pe-metal-btn');
    buttons.forEach(function (btn, i) {
      btn.classList.toggle('active', i === state.metalIdx);
    });
  }

  /* ---------------- Init ---------------- */

  function buildMetalButtons() {
    METALS.forEach(function (m, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pe-metal-btn' + (i === state.metalIdx ? ' active' : '');
      btn.textContent = m.symbol + ' · ' + m.name;
      btn.addEventListener('click', function () {
        state.metalIdx = i;
        render();
      });
      dom.metalRow.appendChild(btn);
    });
  }

  function init() {
    dom.tubeWrap = document.getElementById('peTubeWrap');
    canvas = document.getElementById('peCanvas');
    ctx = canvas.getContext('2d');

    dom.plateLabel = document.getElementById('pePlateLabel');
    dom.metalRow = document.getElementById('peMetalRow');

    dom.freqSlider = document.getElementById('peFrequency');
    dom.freqVal = document.getElementById('peFreqVal');
    dom.threshMark = document.getElementById('peThreshMark');
    dom.threshLabel = document.getElementById('peThreshLabel');

    dom.intensitySlider = document.getElementById('peIntensity');
    dom.intensityVal = document.getElementById('peIntensityVal');

    dom.statEnergy = document.getElementById('peStatEnergy');
    dom.statWork = document.getElementById('peStatWork');
    dom.statMetalSym = document.getElementById('peStatMetalSym');
    dom.statKE = document.getElementById('peStatKE');
    dom.statRate = document.getElementById('peStatRate');
    dom.statusDot = document.getElementById('peStatusDot');
    dom.statusText = document.getElementById('peStatusText');

    dom.threshLine = document.getElementById('peThreshLine');
    dom.keLine = document.getElementById('peKELine');
    dom.keDot = document.getElementById('peKEDot');
    dom.tickF1 = document.getElementById('peTickF1');
    dom.tickF2 = document.getElementById('peTickF2');
    dom.tickF3 = document.getElementById('peTickF3');
    dom.tickK0 = document.getElementById('peTickK0');
    dom.tickK1 = document.getElementById('peTickK1');
    dom.tickK2 = document.getElementById('peTickK2');

    buildMetalButtons();

    dom.freqSlider.addEventListener('input', function (e) {
      state.frequency = Number(e.target.value);
      render();
    });
    dom.intensitySlider.addEventListener('input', function (e) {
      state.intensity = Number(e.target.value);
      render();
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    render();
    requestAnimationFrame(animFrame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------------- Public API (for future use) ----------------
     window.PhotoelectricSim lets other scripts on the page read
     or drive the simulation without touching internals — e.g. a
     lesson script could call setFrequency(650) to walk students
     through a demo, or read getState() to log interactions.
  ------------------------------------------------------------- */
  window.PhotoelectricSim = {
    getState: function () {
      return { metal: getMetal().key, frequency: state.frequency, intensity: state.intensity };
    },
    setFrequency: function (thz) {
      state.frequency = Math.max(FREQ_MIN, Math.min(FREQ_MAX, Number(thz)));
      render();
    },
    setIntensity: function (pct) {
      state.intensity = Math.max(0, Math.min(100, Number(pct)));
      render();
    },
    setMetal: function (key) {
      var idx = METALS.findIndex(function (m) { return m.key === key; });
      if (idx !== -1) { state.metalIdx = idx; render(); }
    },
    metals: METALS.map(function (m) { return { key: m.key, name: m.name, symbol: m.symbol, workFunction: m.workFunction }; })
  };

})();
