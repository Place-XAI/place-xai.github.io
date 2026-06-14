/* =========================================================
   Place XAI — Animated fiber-optic globe (p5.js, 2D projection)
   A rotating sphere of nodes densely wrapped in glowing fibers:
   short great-circle arcs + tight orbital rings hugging the
   surface, with traveling light pulses. Theme-aware.
   ========================================================= */
(function () {
  const sketch = (p) => {
    let W, H, cx, cy, R;
    let nodes = [];
    let arcs = [];       // short great-circle arcs
    let rings = [];      // full great-circle rings wrapping the globe
    let pulses = [];
    let rotY = 0, rotX = -0.42;
    let dragVX = 0;
    let theme = 'dark';

    const NODE_COUNT = 360;
    const ARC_COUNT = 150;   // dense on-globe fibers
    const RING_COUNT = 7;    // tight wrapping rings

    function palette() {
      const dark = theme === 'dark';
      return {
        node: dark ? [120, 165, 255] : [70, 110, 230],
        nodeFar: dark ? [60, 90, 170] : [150, 175, 235],
        wire: dark ? [90, 130, 240] : [120, 150, 230],
        arc: dark ? [90, 180, 255] : [60, 120, 235],
        arc2: dark ? [70, 230, 220] : [30, 190, 190],
        ring: dark ? [120, 200, 255] : [60, 130, 230],
        pulse: dark ? [190, 235, 255] : [40, 120, 255],
        halo: dark ? [40, 80, 200] : [120, 150, 240],
        frame: dark ? [80, 235, 220] : [22, 175, 180],
        axis:  dark ? [180, 205, 255] : [70, 110, 220],
      };
    }

    /* ---------- helpers ---------- */
    function fibSphere(n) {
      const pts = [];
      const off = 2 / n, inc = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = i * off - 1 + off / 2;
        const r = Math.sqrt(1 - y * y);
        const phi = i * inc;
        pts.push({ x: Math.cos(phi) * r, y: y, z: Math.sin(phi) * r });
      }
      return pts;
    }
    function norm(v){ const m=Math.hypot(v.x,v.y,v.z)||1; return {x:v.x/m,y:v.y/m,z:v.z/m}; }
    function cross(a,b){ return {x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x}; }
    function slerp(a, b, tt) {
      let dot = a.x*b.x + a.y*b.y + a.z*b.z;
      dot = Math.max(-1, Math.min(1, dot));
      const om = Math.acos(dot);
      if (om < 1e-4) return a;
      const so = Math.sin(om);
      const w1 = Math.sin((1 - tt) * om) / so, w2 = Math.sin(tt * om) / so;
      return { x: a.x*w1 + b.x*w2, y: a.y*w1 + b.y*w2, z: a.z*w1 + b.z*w2 };
    }
    function rotate(pt) {
      const cyR = Math.cos(rotY), syR = Math.sin(rotY);
      let x = pt.x * cyR - pt.z * syR;
      let z = pt.x * syR + pt.z * cyR;
      const cxR = Math.cos(rotX), sxR = Math.sin(rotX);
      const y2 = pt.y * cxR - z * sxR;
      const z2 = pt.y * sxR + z * cxR;
      return { x: x, y: y2, z: z2 };
    }
    function project(rp) {
      const persp = 1.0 / (1.9 - rp.z * 0.45);
      return { sx: cx + rp.x * R * persp, sy: cy + rp.y * R * persp, depth: rp.z };
    }

    /* ---------- decorative frame (screen-space): a big arc + a diagonal line
       (its axis of symmetry). Both fade to transparent at their two ends,
       terminate in a round dot, and carry travelling light points. ---------- */
    const arcPulses = [0.0, 0.5];      // positions (0..1) of lights on the arc
    const linePulses = [0.25, 0.75];   // positions of lights on the line

    function buildArcPts(ox, oy, r, a0, a1) {
      const N = Math.max(24, Math.round(Math.abs(a1 - a0) / 0.04));
      const pts = [];
      for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; pts.push({ x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) }); }
      return pts;
    }
    // draw a polyline whose alpha fades to 0 at both ends (transparent tips)
    function drawFaded(pts, col, maxA) {
      p.noFill();
      const n = pts.length;
      for (let pass = 0; pass < 2; pass++) {
        const wide = pass === 0;
        p.strokeWeight(wide ? 4.4 : 1.7);
        const mul = wide ? 0.32 : 1;
        for (let i = 1; i < n; i++) {
          const t = (i - 0.5) / (n - 1);
          const a = maxA * Math.sin(Math.PI * t) * mul;   // 0 at ends, peak mid
          p.stroke(col[0], col[1], col[2], a);
          p.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
        }
      }
    }
    function endDot(px, py, col) {
      p.noStroke();
      for (let g = 3; g >= 1; g--) { p.fill(col[0], col[1], col[2], (theme === 'dark' ? 34 : 26) / g); p.circle(px, py, 4 + g * 2.4); }
      p.fill(col[0], col[1], col[2], theme === 'dark' ? 210 : 190); p.circle(px, py, 4.5);
    }
    function samplePt(pts, frac) {
      const idx = Math.max(0, Math.min(1, frac)) * (pts.length - 1);
      const i0 = Math.floor(idx), f = idx - i0;
      const a = pts[i0], b = pts[Math.min(i0 + 1, pts.length - 1)];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
    function travellers(pts, fracs, speed, col) {
      p.noStroke();
      for (let k = 0; k < fracs.length; k++) {
        fracs[k] += speed; if (fracs[k] > 1) fracs[k] -= 1;
        const pp = samplePt(pts, fracs[k]);
        const vis = Math.sin(Math.PI * fracs[k]);          // dim near the faded ends
        for (let g = 3; g >= 1; g--) { p.fill(col[0], col[1], col[2], (theme === 'dark' ? 46 : 32) * vis / g); p.circle(pp.x, pp.y, 3 + g * 2.4); }
        p.fill(col[0], col[1], col[2], 230 * vis + 25); p.circle(pp.x, pp.y, 3);
      }
    }

    function drawFrame(pal) {
      if (theme === 'dark') p.blendMode(p.ADD);
      const S = 0.7 * 0.85;                      // overall scale of the frame
      const tilt = 0.5;                          // line tilt from vertical; also the arc's rotation
      const RA = R * 1.16 * S, L = R * 1.5 * S;
      const dx = Math.sin(tilt), dy = -Math.cos(tilt);
      const maxA = theme === 'dark' ? 130 : 140; // lowered overall opacity

      // orbital arc (~270°), rotated so the diagonal line is its symmetry axis
      const aStart = -Math.PI / 4 + tilt, aSweep = Math.PI * 1.5, aEnd = aStart + aSweep;
      const arcPts = buildArcPts(cx, cy, RA, aStart, aEnd);
      drawFaded(arcPts, pal.frame, maxA);

      // diagonal line = symmetry axis
      const linePts = [
        { x: cx + dx * L, y: cy + dy * L },
        { x: cx - dx * L, y: cy - dy * L },
      ];
      const lineSamp = [];
      for (let i = 0; i <= 40; i++) lineSamp.push(samplePt(linePts, i / 40));
      drawFaded(lineSamp, pal.axis, maxA);

      // round-dot terminals at the four ends
      endDot(arcPts[0].x, arcPts[0].y, pal.frame);
      endDot(arcPts[arcPts.length - 1].x, arcPts[arcPts.length - 1].y, pal.frame);
      endDot(linePts[0].x, linePts[0].y, pal.axis);
      endDot(linePts[1].x, linePts[1].y, pal.axis);

      // travelling light points along both the arc and the line
      travellers(arcPts, arcPulses, 0.0030, pal.pulse);
      travellers(lineSamp, linePulses, 0.0052, pal.pulse);

      if (theme === 'dark') p.blendMode(p.BLEND);
    }

    function buildArcs() {
      arcs = [];
      for (let i = 0; i < ARC_COUNT; i++) {
        const a = nodes[(Math.random() * nodes.length) | 0].base;
        const b = nodes[(Math.random() * nodes.length) | 0].base;
        const seg = 22;
        const path = [];
        for (let s = 0; s <= seg; s++) {
          const sp = slerp(a, b, s / seg);
          const lift = 1 + 0.05 * Math.sin((s / seg) * Math.PI); // hug the surface
          path.push({ x: sp.x*lift, y: sp.y*lift, z: sp.z*lift });
        }
        arcs.push(path);
      }
      pulses = [];
      for (let i = 0; i < ARC_COUNT; i++) {
        if (Math.random() < 0.5) pulses.push({ arc: i, t: Math.random(), speed: 0.0018 + Math.random()*0.003 });
      }
    }

    function buildRings() {
      rings = [];
      for (let i = 0; i < RING_COUNT; i++) {
        // random great circle from two orthonormal vectors
        const u = norm({ x: Math.random()*2-1, y: Math.random()*2-1, z: Math.random()*2-1 });
        let v = norm(cross(u, { x: Math.random()*2-1, y: Math.random()*2-1, z: Math.random()*2-1 }));
        const seg = 96;
        const path = [];
        const lift = 1.012;
        for (let s = 0; s <= seg; s++) {
          const a = (s / seg) * Math.PI * 2;
          path.push({ x:(u.x*Math.cos(a)+v.x*Math.sin(a))*lift,
                      y:(u.y*Math.cos(a)+v.y*Math.sin(a))*lift,
                      z:(u.z*Math.cos(a)+v.z*Math.sin(a))*lift });
        }
        rings.push({ path, t: Math.random(), speed: 0.0012 + Math.random()*0.0018 });
      }
    }

    function layout() {
      W = p.windowWidth;
      const heroEl = document.querySelector('.hero');
      H = heroEl ? heroEl.offsetHeight : p.windowHeight;
      p.resizeCanvas(W, H);
      cx = W > 900 ? W * 0.70 : W * 0.5;
      cy = H * 0.5;
      R = Math.min(W * 0.46, H * 0.92) * (W > 900 ? 0.5 : 0.62);
    }

    p.setup = () => {
      theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const c = p.createCanvas(10, 10);
      c.parent(document.body);
      p.pixelDensity(1);
      nodes = fibSphere(NODE_COUNT).map(b => ({ base: b }));
      buildArcs();
      buildRings();
      layout();
    };
    p.windowResized = () => layout();

    function drawPath(path, col, baseA, frontA, weight, closed) {
      p.noFill();
      let maxFront = 0;
      const proj2 = [];
      for (let s = 0; s < path.length; s++) {
        const rp = rotate(path[s]);
        const pj = project(rp);
        proj2.push({ sx: pj.sx, sy: pj.sy, z: rp.z });
        const f = (rp.z + 1) / 2; if (f > maxFront) maxFront = f;
      }
      // split into visible front segments so the back of the globe stays dim
      p.stroke(col[0], col[1], col[2], baseA + maxFront * frontA);
      p.strokeWeight(weight + maxFront * 0.9);
      let drawing = false;
      for (let s = 0; s < proj2.length; s++) {
        if (proj2[s].z > -0.18) {
          if (!drawing) { p.beginShape(); drawing = true; }
          p.vertex(proj2[s].sx, proj2[s].sy);
        } else if (drawing) { p.endShape(); drawing = false; }
      }
      if (drawing) p.endShape();
      return proj2;
    }

    p.draw = () => {
      p.clear();
      const pal = palette();
      rotY += 0.0017 + dragVX;
      dragVX *= 0.92;
      rotX += (-0.42 - rotX) * 0.005;

      // halo
      p.noStroke();
      for (let i = 6; i >= 1; i--) {
        const a = (theme === 'dark' ? 8 : 5) * (i / 6);
        p.fill(pal.halo[0], pal.halo[1], pal.halo[2], a);
        p.circle(cx, cy, R * (2.0 + i * 0.16));
      }

      // projected nodes
      const proj = nodes.map(n => { const r = rotate(n.base); return { ...project(r), z: r.z }; });

      // wireframe mesh
      p.strokeWeight(1);
      for (let i = 0; i < proj.length; i += 1) {
        const a = proj[i];
        if (a.depth < -0.12) continue;
        for (let j = i + 1; j < Math.min(i + 7, proj.length); j++) {
          const b = proj[j];
          if (b.depth < -0.12) continue;
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const d2 = dx*dx + dy*dy;
          if (d2 < (R*0.2)*(R*0.2)) {
            const alpha = (theme === 'dark' ? 24 : 18) * (1 - Math.sqrt(d2)/(R*0.2));
            p.stroke(pal.wire[0], pal.wire[1], pal.wire[2], alpha);
            p.line(a.sx, a.sy, b.sx, b.sy);
          }
        }
      }

      if (theme === 'dark') p.blendMode(p.ADD);

      // tight wrapping rings
      for (const ring of rings) {
        drawPath(ring.path, pal.ring, theme === 'dark' ? 14 : 12, theme === 'dark' ? 46 : 54, 0.7, true);
      }
      // dense short arcs
      for (let ai = 0; ai < arcs.length; ai++) {
        drawPath(arcs[ai], ai % 3 === 0 ? pal.arc2 : pal.arc, theme === 'dark' ? 12 : 11, theme === 'dark' ? 54 : 60, 0.6, false);
      }
      if (theme === 'dark') p.blendMode(p.BLEND);

      // nodes
      p.noStroke();
      for (let i = 0; i < proj.length; i++) {
        const a = proj[i];
        const front = (a.depth + 1) / 2;
        const col = a.depth > 0 ? pal.node : pal.nodeFar;
        const alpha = (theme === 'dark' ? 65 : 50) + front * 120;
        const sz = (a.depth > 0 ? 1.5 : 0.9) + front * 1.6;
        p.fill(col[0], col[1], col[2], alpha);
        p.circle(a.sx, a.sy, sz);
      }

      // travelling pulses along arcs + rings
      if (theme === 'dark') p.blendMode(p.ADD);
      p.noStroke();
      const allPulseSets = [{ list: pulses, src: arcs }];
      for (const set of allPulseSets) {
        for (const pulse of set.list) {
          pulse.t += pulse.speed; if (pulse.t > 1) pulse.t -= 1;
          const path = set.src[pulse.arc];
          const idx = pulse.t * (path.length - 1);
          const i0 = Math.floor(idx), frac = idx - i0;
          const a = path[i0], b = path[Math.min(i0+1, path.length-1)];
          const pos = { x:a.x+(b.x-a.x)*frac, y:a.y+(b.y-a.y)*frac, z:a.z+(b.z-a.z)*frac };
          const rp = rotate(pos); const pj = project(rp);
          const front = (rp.z + 1) / 2;
          if (rp.z < -0.25) continue;
          const col = pal.pulse;
          for (let g = 3; g >= 1; g--) {
            p.fill(col[0], col[1], col[2], (theme==='dark'?42:30) * front / g);
            p.circle(pj.sx, pj.sy, (3 + g*2.2) * (0.6 + front));
          }
          p.fill(col[0], col[1], col[2], 180 * front + 40);
          p.circle(pj.sx, pj.sy, 2.4 * (0.7 + front));
        }
      }
      // ring pulses
      for (const ring of rings) {
        ring.t += ring.speed; if (ring.t > 1) ring.t -= 1;
        const path = ring.path;
        const idx = ring.t * (path.length - 1);
        const i0 = Math.floor(idx), frac = idx - i0;
        const a = path[i0], b = path[Math.min(i0+1, path.length-1)];
        const pos = { x:a.x+(b.x-a.x)*frac, y:a.y+(b.y-a.y)*frac, z:a.z+(b.z-a.z)*frac };
        const rp = rotate(pos); const pj = project(rp);
        const front = (rp.z + 1) / 2;
        if (rp.z < -0.2) continue;
        const col = pal.pulse;
        for (let g = 3; g >= 1; g--) {
          p.fill(col[0], col[1], col[2], (theme==='dark'?40:28) * front / g);
          p.circle(pj.sx, pj.sy, (3.5 + g*2.4) * (0.6 + front));
        }
        p.fill(col[0], col[1], col[2], 190 * front + 40);
        p.circle(pj.sx, pj.sy, 2.6 * (0.7 + front));
      }
      if (theme === 'dark') p.blendMode(p.BLEND);

      // armillary frame (half-circle arc + rotation axis) over the globe
      drawFrame(pal);
    };

    let lastMX = null;
    p.mouseDragged = () => { if (lastMX !== null) dragVX += (p.mouseX - lastMX) * 0.00004; lastMX = p.mouseX; };
    p.mouseReleased = () => { lastMX = null; };

    window.__setGlobeTheme = (th) => { theme = th; };
    window.__pauseGlobe = () => p.noLoop();
    window.__resumeGlobe = () => p.loop();
  };

  function boot() {
    new p5(sketch);
    let tries = 0;
    (function place() {
      const cnv = document.querySelector('body > canvas');
      const hero = document.querySelector('.hero');
      if (cnv && hero) {
        cnv.style.position = 'absolute';
        cnv.style.top = '0'; cnv.style.left = '0';
        cnv.style.zIndex = '0'; cnv.style.pointerEvents = 'none';
        hero.prepend(cnv);
        return;
      }
      if (tries++ < 120) requestAnimationFrame(place);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
