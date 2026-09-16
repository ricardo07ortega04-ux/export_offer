/*
 * COMCE Sur | Globo de rutas comerciales
 * Lightweight canvas globe inspired by the COMCE logo: a gridded sphere with
 * pixels drifting from its upper-right edge, and trade routes departing from
 * San Andrés Cholula, Puebla. No dependencies.
 *
 * Usage
 *   <canvas data-globe></canvas>                     Inicio (hero)
 *   <canvas id="g" data-globe="regions"></canvas>    Sobre nosotros
 *   <ul data-globe-regions="g"> <button data-region="europa" aria-pressed="false">…
 */
(function () {
  'use strict';

  var DEG = Math.PI / 180;
  var ROUTE_PERIOD = 6400;
  var TWEEN_MS = 1500;
  var BUCKETS = 10;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var COLORS = {
    dot: '141,187,239',   // cielo
    route: '224,166,58',  // ocre
    white: '255,255,255'
  };

  var ORIGIN = { lat: 17.07, lon: -96.72 }; // Oaxaca de Juárez, Oaxaca

  function place(lat, lon) { return { lat: lat, lon: lon }; }

  // Illustrative destinations: they are not labeled on screen
  var P = {
    panama: place(8.98, -79.52),
    losAngeles: place(34.05, -118.24),
    vancouver: place(49.28, -123.12),
    chicago: place(41.88, -87.63),
    toronto: place(43.65, -79.38),
    nuevaYork: place(40.71, -74.01),
    laHabana: place(23.11, -82.37),
    bogota: place(4.71, -74.07),
    lima: place(-12.05, -77.04),
    saoPaulo: place(-23.55, -46.63),
    santiago: place(-33.45, -70.67),
    buenosAires: place(-34.6, -58.38),
    madrid: place(40.42, -3.7),
    paris: place(48.86, 2.35),
    rotterdam: place(51.92, 4.48),
    berlin: place(52.52, 13.4),
    milan: place(45.46, 9.19),
    casablanca: place(33.57, -7.59),
    lagos: place(6.52, 3.38),
    elCairo: place(30.04, 31.24),
    nairobi: place(-1.29, 36.82),
    johannesburgo: place(-26.2, 28.05),
    amman: place(31.95, 35.93),
    riad: place(24.71, 46.68),
    doha: place(25.29, 51.53),
    dubai: place(25.2, 55.27),
    mumbai: place(19.08, 72.88),
    singapur: place(1.35, 103.82),
    shanghai: place(31.23, 121.47),
    seul: place(37.57, 126.98),
    tokio: place(35.68, 139.69),
    sidney: place(-33.87, 151.21),

    // EXIM coverage (capitals)
    laPaz: place(-16.5, -68.15),
    sanJose: place(9.93, -84.08),
    quito: place(-0.18, -78.47),
    washington: place(38.91, -77.04),
    ciudadDeMexico: place(19.43, -99.13),
    managua: place(12.11, -86.24),
    asuncion: place(-25.26, -57.58),
    montevideo: place(-34.9, -56.16),
    caracas: place(10.48, -66.9),
    daca: place(23.81, 90.41),
    manila: place(14.6, 120.98),
    nuevaDelhi: place(28.61, 77.21),
    yakarta: place(-6.21, 106.85),
    astana: place(51.17, 71.45),
    islamabad: place(33.68, 73.05),
    moscu: place(55.76, 37.62),
    colombo: place(6.93, 79.86),
    taskent: place(41.3, 69.24),
    hanoi: place(21.03, 105.85),
    bruselas: place(50.85, 4.35),
    londres: place(51.51, -0.13),
    ankara: place(39.93, 32.86),
    gaborone: place(-24.65, 25.91),
    gitega: place(-3.43, 29.93),
    yaunde: place(3.85, 11.5),
    yamusukro: place(6.83, -5.29),
    adisAbeba: place(9.03, 38.74),
    acra: place(5.6, -0.19),
    maseru: place(-29.31, 27.48),
    windhoek: place(-22.56, 17.08),
    abuya: place(9.08, 7.4),
    kigali: place(-1.94, 30.06),

    // Sur Exporta: destination markets actually declared by the listed companies
    zurich: place(47.38, 8.54),
    estocolmo: place(59.33, 18.07),
    varsovia: place(52.23, 21.01),
    hongKong: place(22.32, 114.17)
  };

  var PRESETS = {
    // Sur Exporta: the 17 markets the listed companies already ship to
    exporta: {
      lon: -40, lat: 20, sway: 12,
      destinations: [P.nuevaYork, P.toronto, P.madrid, P.londres, P.paris, P.milan, P.berlin,
        P.rotterdam, P.zurich, P.estocolmo, P.varsovia, P.moscu, P.shanghai, P.hongKong,
        P.tokio, P.singapur, P.sidney]
    },
    home: {
      lon: -64, lat: 16, sway: 12,
      destinations: [P.panama, P.losAngeles, P.chicago, P.nuevaYork, P.bogota, P.saoPaulo, P.santiago, P.madrid, P.rotterdam, P.vancouver, P.tokio]
    },
    regions: {
      lon: -38, lat: 14, sway: 14,
      destinations: [P.toronto, P.saoPaulo, P.madrid, P.lagos, P.dubai, P.tokio]
    },
    coverage: {
      lon: -80, lat: 2, sway: 10,
      destinations: [P.washington, P.bogota, P.madrid, P.acra, P.nuevaDelhi]
    }
  };

  var REGIONS = {
    'africa': { lon: 18, lat: 6, destinations: [P.casablanca, P.lagos, P.elCairo, P.nairobi, P.johannesburgo] },
    'america-del-norte': { lon: -96, lat: 36, destinations: [P.vancouver, P.losAngeles, P.chicago, P.toronto, P.nuevaYork] },
    'america-latina-y-el-caribe': { lon: -70, lat: -6, destinations: [P.laHabana, P.panama, P.bogota, P.lima, P.saoPaulo, P.buenosAires] },
    'asia-y-oceania': { lon: 118, lat: 12, destinations: [P.mumbai, P.singapur, P.shanghai, P.seul, P.tokio, P.sidney] },
    'europa': { lon: 8, lat: 42, destinations: [P.madrid, P.paris, P.rotterdam, P.berlin, P.milan] },
    'medio-oriente': { lon: 40, lat: 26, destinations: [P.amman, P.riad, P.doha, P.dubai] },

    // EXIM: the countries listed on the page, one route per country
    'exim-america': {
      lon: -80, lat: 2,
      destinations: [P.buenosAires, P.laPaz, P.santiago, P.bogota, P.sanJose, P.quito, P.washington,
        P.ciudadDeMexico, P.managua, P.panama, P.asuncion, P.lima, P.montevideo, P.caracas]
    },
    'exim-asia': {
      lon: 86, lat: 28,
      destinations: [P.daca, P.manila, P.nuevaDelhi, P.yakarta, P.astana, P.islamabad, P.moscu, P.colombo, P.taskent, P.hanoi]
    },
    'exim-europa': { lon: 12, lat: 42, destinations: [P.madrid, P.bruselas, P.londres, P.ankara] },
    'exim-africa': {
      lon: 18, lat: 2,
      destinations: [P.gaborone, P.gitega, P.yaunde, P.yamusukro, P.adisAbeba, P.acra, P.nairobi, P.maseru, P.windhoek, P.abuya, P.kigali]
    }
  };

  /* ---------- Helpers ---------- */

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function normalizeLon(lon) { return ((lon + 540) % 360 + 360) % 360 - 180; }
  function lonDelta(from, to) { return normalizeLon(to - from); }

  function toVec(lat, lon) {
    var cl = Math.cos(lat * DEG);
    return [cl * Math.cos(lon * DEG), cl * Math.sin(lon * DEG), Math.sin(lat * DEG)];
  }

  // Great-circle arc from the origin, lifted above the surface
  function buildRoute(dest) {
    var a = toVec(ORIGIN.lat, ORIGIN.lon);
    var b = toVec(dest.lat, dest.lon);
    var dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    var omega = Math.acos(dot);
    var sinO = Math.sin(omega) || 1;
    var steps = 72;
    var pts = new Float32Array((steps + 1) * 5);
    var lift = 0.06 + 0.26 * (omega / Math.PI);

    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var k1 = Math.sin((1 - t) * omega) / sinO;
      var k2 = Math.sin(t * omega) / sinO;
      var x = k1 * a[0] + k2 * b[0];
      var y = k1 * a[1] + k2 * b[1];
      var z = k1 * a[2] + k2 * b[2];
      var len = Math.sqrt(x * x + y * y + z * z) || 1;
      x /= len; y /= len; z /= len;
      var cosLat = Math.sqrt(x * x + y * y) || 1e-6;
      var o = s * 5;
      pts[o] = z;                 // sinLat
      pts[o + 1] = cosLat;        // cosLat
      pts[o + 2] = y / cosLat;    // sinLon
      pts[o + 3] = x / cosLat;    // cosLon
      pts[o + 4] = lift * Math.sin(Math.PI * t); // altitude
    }
    return { pts: pts, steps: steps, shift: 0 };
  }

  /* ---------- Globe instance ---------- */

  function createGlobe(canvas, preset) {
    var ctx = canvas.getContext('2d', { alpha: true });
    var host = canvas.closest('section') || document.body;

    var s = {
      w: 0, h: 0, cx: 0, cy: 0, R: 0,
      baseLon: preset.lon, baseLat: preset.lat,
      shownLon: preset.lon, shownLat: preset.lat,
      fromLon: 0, fromLat: 0, toLon: 0, toLat: 0, tweenStart: -1,
      cosL0: 1, sinL0: 0, cosP0: 1, sinP0: 0,
      pointerLon: 0, pointerLat: 0, targetLon: 0, targetLat: 0,
      step: 0, degraded: false, frames: 0, slowFrames: 0,
      begun: false, started: false, running: false,
      inView: !('IntersectionObserver' in window),
      raf: 0, t0: 0, swayStart: 0, routesBase: 0, last: 0
    };

    var grid = null, gridX = null, gridY = null, gridB = null;
    var routes = [];
    var particles = [];
    var proj = { x: 0, y: 0, z: 0, r2: 0 };

    function pushPoint(list, lat, lon) {
      list.push(Math.sin(lat * DEG), Math.cos(lat * DEG), Math.sin(lon * DEG), Math.cos(lon * DEG));
    }

    function buildGrid(step) {
      var list = [];
      var lat, lon, i, n;
      for (lat = -75; lat <= 75; lat += 15) {
        n = Math.max(16, Math.round((360 * Math.cos(lat * DEG)) / step));
        for (i = 0; i < n; i++) pushPoint(list, lat, (i / n) * 360 - 180);
      }
      for (lon = -180; lon < 180; lon += 15) {
        for (lat = -80; lat <= 80; lat += step) {
          if (Math.abs(lat % 15) < step * 0.35) continue;
          pushPoint(list, lat, lon);
        }
      }
      grid = new Float32Array(list);
      var count = grid.length / 4;
      gridX = new Float32Array(count);
      gridY = new Float32Array(count);
      gridB = new Uint8Array(count);
    }

    // launch = true: arcs depart now, one after another; false: arcs already in flight
    function setRoutes(destinations, launch) {
      routes = destinations.map(function (d, idx) {
        var r = buildRoute(d);
        r.shift = launch
          ? idx * 240
          : -((idx / destinations.length) * ROUTE_PERIOD * 1.35 + (idx % 3) * 380);
        return r;
      });
    }

    function project(sinLat, cosLat, sinLon, cosLon, alt) {
      var cosD = cosLon * s.cosL0 + sinLon * s.sinL0;
      var sinD = sinLon * s.cosL0 - cosLon * s.sinL0;
      var x = cosLat * sinD;
      var y = s.cosP0 * sinLat - s.sinP0 * cosLat * cosD;
      var z = s.sinP0 * sinLat + s.cosP0 * cosLat * cosD;
      var k = 1 + alt;
      proj.x = s.cx + s.R * x * k;
      proj.y = s.cy - s.R * y * k;
      proj.z = z;
      proj.r2 = (x * x + y * y) * k * k;
      return proj;
    }

    function visible(p, alt) { return p.z > 0 || (alt > 0 && p.r2 > 1); }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      var dpr = Math.min(window.devicePixelRatio || 1, w < 600 ? 1.5 : 2);

      s.w = w; s.h = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      s.cx = w / 2;
      s.cy = h / 2;
      s.R = Math.min(w, h) * 0.39;

      var step = s.R < 170 ? 4.2 : s.R < 260 ? 3.4 : 2.7;
      if (s.degraded) step *= 1.5;
      if (step !== s.step || !grid) {
        s.step = step;
        buildGrid(step);
      }
      if (!s.running && (s.started || (s.begun && reduceMotion.matches))) drawFrame(performance.now());
    }

    /* ---------- Drawing ---------- */

    function dot(x, y, r, color, alpha) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    function drawAtmosphere(intro) {
      var g = ctx.createRadialGradient(s.cx, s.cy, s.R * 0.82, s.cx, s.cy, s.R * 1.28);
      g.addColorStop(0, 'rgba(' + COLORS.dot + ',0)');
      g.addColorStop(0.3, 'rgba(' + COLORS.dot + ',' + (0.07 * intro).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + COLORS.dot + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.cx - s.R * 1.3, s.cy - s.R * 1.3, s.R * 2.6, s.R * 2.6);

      ctx.beginPath();
      ctx.arc(s.cx, s.cy, s.R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + COLORS.dot + ',' + (0.22 * intro).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawGrid(intro) {
      var count = gridX.length;
      var i, o, p, b;
      var dotSize = Math.max(1.1, s.R / 210);

      for (i = 0; i < count; i++) {
        o = i * 4;
        p = project(grid[o], grid[o + 1], grid[o + 2], grid[o + 3], 0);
        gridX[i] = p.x;
        gridY[i] = p.y;
        gridB[i] = Math.floor(((p.z + 1) / 2) * (BUCKETS - 1) + 0.5);
      }

      for (b = 0; b < BUCKETS; b++) {
        var depth = b / (BUCKETS - 1);
        var front = depth > 0.5;
        var alpha = front ? 0.16 + (depth - 0.5) * 1.5 : 0.035 + depth * 0.09;
        var size = front ? dotSize : dotSize * 0.8;
        var half = size / 2;

        ctx.beginPath();
        for (i = 0; i < count; i++) {
          if (gridB[i] === b) ctx.rect(gridX[i] - half, gridY[i] - half, size, size);
        }
        ctx.fillStyle = 'rgba(' + COLORS.dot + ',' + (alpha * intro).toFixed(3) + ')';
        ctx.fill();
      }
    }

    function strokeRouteSegment(route, from, to, color, alpha, width) {
      var pts = route.pts;
      var start = Math.floor(from * route.steps);
      var end = Math.ceil(to * route.steps);
      var drawing = false;

      ctx.beginPath();
      for (var i = start; i <= end; i++) {
        var o = i * 5;
        var alt = pts[o + 4];
        var p = project(pts[o], pts[o + 1], pts[o + 2], pts[o + 3], alt);
        if (visible(p, alt)) {
          if (drawing) ctx.lineTo(p.x, p.y);
          else { ctx.moveTo(p.x, p.y); drawing = true; }
        } else {
          drawing = false;
        }
      }
      ctx.strokeStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
      ctx.lineWidth = width;
      ctx.stroke();
    }

    function pointAt(route, t) {
      var o = Math.round(clamp01(t) * route.steps) * 5;
      var alt = route.pts[o + 4];
      var p = project(route.pts[o], route.pts[o + 1], route.pts[o + 2], route.pts[o + 3], alt);
      return { x: p.x, y: p.y, ok: visible(p, alt) };
    }

    function drawRoutes(now, intro, staticMode) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (var i = 0; i < routes.length; i++) {
        var r = routes[i];

        strokeRouteSegment(r, 0, 1, COLORS.route, 0.14 * intro, 1);

        if (staticMode) {
          strokeRouteSegment(r, 0, 1, COLORS.route, 0.5 * intro, 1.2);
          var end = pointAt(r, 1);
          if (end.ok) dot(end.x, end.y, 2.2, COLORS.route, 0.9 * intro);
          continue;
        }

        var elapsed = now - (s.routesBase + r.shift);
        if (elapsed < 0) continue;
        var p = (elapsed % ROUTE_PERIOD) / ROUTE_PERIOD;
        var head = easeInOut(clamp01(p / 0.46));
        var tail = easeInOut(clamp01((p - 0.16) / 0.46));

        if (head > tail + 0.001) {
          strokeRouteSegment(r, tail, head, COLORS.route, 0.95 * intro, 1.6);
          if (head < 1) {
            var hp = pointAt(r, head);
            if (hp.ok) {
              dot(hp.x, hp.y, 5, COLORS.route, 0.22 * intro);
              dot(hp.x, hp.y, 2, COLORS.white, 0.95 * intro);
            }
          }
        }

        if (p > 0.46 && p < 0.78) {
          var k = (p - 0.46) / 0.32;
          var ep = pointAt(r, 1);
          if (ep.ok) {
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, 2 + k * 12, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(' + COLORS.route + ',' + ((1 - k) * 0.8 * intro).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
            dot(ep.x, ep.y, 2.2, COLORS.route, (1 - k * 0.6) * intro);
          }
        }
      }

      var op = project(Math.sin(ORIGIN.lat * DEG), Math.cos(ORIGIN.lat * DEG), Math.sin(ORIGIN.lon * DEG), Math.cos(ORIGIN.lon * DEG), 0);
      if (op.z > 0) {
        if (!staticMode) {
          var pulse = (now % 2400) / 2400;
          ctx.beginPath();
          ctx.arc(op.x, op.y, 4 + pulse * 18, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(' + COLORS.route + ',' + ((1 - pulse) * 0.7 * intro).toFixed(3) + ')';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        dot(op.x, op.y, 7, COLORS.route, 0.25 * intro);
        dot(op.x, op.y, 3.4, COLORS.route, intro);
      }
    }

    // Pixels leaving the globe toward the upper right, like the COMCE logo
    function updateParticles(dt, intro) {
      var max = s.w < 600 ? 12 : 24;
      if (particles.length < max && Math.random() < dt * 0.012) {
        var ang = (18 + Math.random() * 52) * DEG;
        var r0 = s.R * (0.96 + Math.random() * 0.08);
        var speed = (0.008 + Math.random() * 0.018) * s.R / 100;
        particles.push({
          x: s.cx + Math.cos(ang) * r0,
          y: s.cy - Math.sin(ang) * r0,
          vx: Math.cos(ang) * speed,
          vy: -Math.sin(ang) * speed,
          size: 1.5 + Math.random() * Math.max(2, s.R / 90),
          life: 0,
          ttl: 2600 + Math.random() * 2600,
          white: Math.random() < 0.45
        });
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var pt = particles[i];
        pt.life += dt;
        if (pt.life >= pt.ttl) { particles.splice(i, 1); continue; }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        var k = pt.life / pt.ttl;
        var a = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * 0.85 * intro;
        ctx.fillStyle = 'rgba(' + (pt.white ? COLORS.white : COLORS.dot) + ',' + a.toFixed(3) + ')';
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }
    }

    function drawFrame(now) {
      var staticMode = reduceMotion.matches;
      var intro = staticMode ? 1 : easeOutCubic(clamp01((now - s.t0) / 1600));
      var lon, lat;

      if (s.tweenStart >= 0 && !staticMode) {
        var k = clamp01((now - s.tweenStart) / TWEEN_MS);
        var e = easeInOut(k);
        lon = s.fromLon + lonDelta(s.fromLon, s.toLon) * e;
        lat = s.fromLat + (s.toLat - s.fromLat) * e;
        if (k >= 1) {
          s.baseLon = s.toLon;
          s.baseLat = s.toLat;
          s.tweenStart = -1;
          s.swayStart = now; // sway resumes from zero, so there is no jump
        }
      } else {
        lon = s.baseLon + (staticMode ? 0 : Math.sin((now - s.swayStart) / 9000) * preset.sway);
        lat = s.baseLat;
      }
      s.shownLon = normalizeLon(lon);
      s.shownLat = lat;

      s.pointerLon += (s.targetLon - s.pointerLon) * 0.045;
      s.pointerLat += (s.targetLat - s.pointerLat) * 0.045;
      var L = (lon + s.pointerLon) * DEG;
      var PHI = (lat + s.pointerLat) * DEG;
      s.cosL0 = Math.cos(L); s.sinL0 = Math.sin(L);
      s.cosP0 = Math.cos(PHI); s.sinP0 = Math.sin(PHI);

      ctx.clearRect(0, 0, s.w, s.h);
      drawAtmosphere(intro);
      drawGrid(intro);
      drawRoutes(now, intro, staticMode);
      if (!staticMode) updateParticles(Math.min(48, now - (s.last || now)), intro);
    }

    /* ---------- Loop ---------- */

    function loop(now) {
      if (!s.running) return;
      var dt = now - (s.last || now);

      // Adaptive quality: if frames are consistently slow, thin out the grid once
      if (!s.degraded && s.frames > 30) {
        if (dt > 24) s.slowFrames++;
        if (s.slowFrames > 45) {
          s.degraded = true;
          buildGrid(s.step * 1.5);
        }
      }
      s.frames++;

      drawFrame(now);
      s.last = now;
      s.raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!s.begun || s.running || reduceMotion.matches || !s.inView || document.hidden) return;
      if (!s.started) {
        // First time on screen: the intro fade starts here
        var now = performance.now();
        s.t0 = now;
        s.swayStart = now;
        s.routesBase = now;
        s.started = true;
      }
      s.running = true;
      s.last = 0;
      s.raf = requestAnimationFrame(loop);
    }

    function stop() {
      s.running = false;
      cancelAnimationFrame(s.raf);
    }

    function renderStatic() {
      s.started = true;
      drawFrame(performance.now());
    }

    /* ---------- Public: rotate to a region (or back to the overview) ---------- */

    function focus(key) {
      var target = (key && REGIONS[key]) || preset;
      var now = performance.now();

      setRoutes(target.destinations, true);
      s.routesBase = now;

      if (reduceMotion.matches || !s.running) {
        s.baseLon = target.lon;
        s.baseLat = target.lat;
        s.tweenStart = -1;
        s.swayStart = now;
        if (s.started) drawFrame(now);
        return;
      }

      s.fromLon = s.shownLon;
      s.fromLat = s.shownLat;
      s.toLon = target.lon;
      s.toLat = target.lat;
      s.tweenStart = now;
    }

    /* ---------- Wiring ---------- */

    function onPointer(e) {
      if (!finePointer.matches) return;
      s.targetLon = -(e.clientX / window.innerWidth - 0.5) * 14;
      s.targetLat = (e.clientY / window.innerHeight - 0.5) * 8;
    }

    setRoutes(preset.destinations, false);
    resize();

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        s.inView = entries[0].isIntersecting;
        if (s.inView) start(); else stop();
      }).observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    host.addEventListener('pointermove', onPointer, { passive: true });

    var onMotionChange = function () {
      stop();
      if (reduceMotion.matches) { if (s.begun) renderStatic(); }
      else start();
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);

    // Begin together with the page-load choreography
    var begin = function () {
      if (s.begun) return;
      s.begun = true;
      if (reduceMotion.matches) renderStatic();
      else start();
    };
    if (document.documentElement.classList.contains('is-ready')) begin();
    else {
      document.addEventListener('comce:ready', begin);
      setTimeout(begin, 2600); // safety net if the ready event never fires
    }

    return { focus: focus };
  }

  /* ---------- Init ---------- */

  var globes = {};
  Array.prototype.forEach.call(document.querySelectorAll('canvas[data-globe]'), function (canvas, i) {
    if (!canvas.getContext) return;
    var preset = PRESETS[canvas.getAttribute('data-globe')] || PRESETS.home;
    globes[canvas.id || 'globe-' + i] = createGlobe(canvas, preset);
  });

  // Region buttons: one pressed at a time.
  // Default mode: pressing the active region again returns to the overview.
  // data-globe-regions-mode="single": a region is always selected (EXIM).
  // Optional [data-region-panel="key"] elements in the same section show the selected region's content.
  Array.prototype.forEach.call(document.querySelectorAll('[data-globe-regions]'), function (list) {
    var globe = globes[list.getAttribute('data-globe-regions')];
    if (!globe) return;
    var single = list.getAttribute('data-globe-regions-mode') === 'single';
    var buttons = Array.prototype.slice.call(list.querySelectorAll('[data-region]'));
    var scope = list.closest('section') || document;
    var panels = Array.prototype.slice.call(scope.querySelectorAll('[data-region-panel]'));

    function showPanel(key, animate) {
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-region-panel') === key;
        panel.hidden = !on;
        if (on && animate) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth; // restart the entrance animation
          panel.classList.add('is-entering');
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wasPressed = btn.getAttribute('aria-pressed') === 'true';
        if (wasPressed && single) return;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        if (wasPressed) {
          globe.focus(null);
        } else {
          btn.setAttribute('aria-pressed', 'true');
          globe.focus(btn.getAttribute('data-region'));
          if (panels.length) showPanel(btn.getAttribute('data-region'), true);
        }
      });
    });

    // A region marked as pressed in the HTML starts selected
    var initial = buttons.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
    if (initial) {
      globe.focus(initial.getAttribute('data-region'));
      if (panels.length) showPanel(initial.getAttribute('data-region'), false);
    }
  });
})();
