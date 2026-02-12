const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* ===================== THEME ===================== */
const setTheme = (mode) => {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
};
const getTheme = () => localStorage.getItem("theme") || "dark";
setTheme(getTheme());

$("#themeToggle")?.addEventListener("click", () => {
  setTheme(getTheme() === "dark" ? "light" : "dark");
});

/* ===================== DRAWER ===================== */
const drawer = $("#drawer");
const openBtn = $("#menuBtn");
const closeBtn = $("#closeDrawer");
const backdrop = $("#drawerBackdrop");
const openDrawer = () => { drawer?.classList.add("open"); drawer?.setAttribute("aria-hidden", "false"); };
const closeDrawer = () => { drawer?.classList.remove("open"); drawer?.setAttribute("aria-hidden", "true"); };
openBtn?.addEventListener("click", openDrawer);
closeBtn?.addEventListener("click", closeDrawer);
backdrop?.addEventListener("click", closeDrawer);
drawer?.addEventListener("click", (e) => { if (e.target.closest("a")) closeDrawer(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

/* ===================== FOOTER YEAR ===================== */
$("#year").textContent = new Date().getFullYear();

/* ===================== CONTACT FORM (DEMO) ===================== */
$("#contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = $("#formStatus");
  status.textContent = "Sending…";

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      status.textContent = "✅ Sent! I’ll get back to you soon.";
      form.reset();
    } else {
      status.textContent = "❌ Couldn’t send. Try again or email me directly.";
    }
  } catch (err) {
    status.textContent = "❌ Network error. Try again or email me directly.";
  }
});

/* ===================== REVEAL ON SCROLL ===================== */
const revealEls = $$(".reveal");
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("show"); });
}, { threshold: 0.12 });
revealEls.forEach(el => revealIO.observe(el));

/* ===================== SCROLL PROGRESS ===================== */
const bar = $("#scrollBar");
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  if (bar) bar.style.width = `${scrolled}%`;
};
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ===================== SMOOTH SECTION TRANSITIONS ===================== */
const sections = $$(".section-snap");
const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("active");
      e.target.classList.remove("inactive");
    } else {
      e.target.classList.add("inactive");
      e.target.classList.remove("active");
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionIO.observe(s));

/* ===================== TILT ===================== */
const tiltCards = $$(".hover-tilt");
tiltCards.forEach((card) => {
  const isTouch = matchMedia("(pointer: coarse)").matches;
  if (isTouch) return;

  let raf = null;
  const onMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * -7.5;
    const ry = (x - 0.5) * 9.5;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
  };
  const onLeave = () => { cancelAnimationFrame(raf); card.style.transform = ""; };

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", onLeave);
});

/* ==========================================================
   ✅ 3D PARALLAX BLOBS (cursor + scroll)
========================================================== */
(function parallaxBlobs(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const blobs = {
    a: document.querySelector(".blob-a"),
    b: document.querySelector(".blob-b"),
    c: document.querySelector(".blob-c"),
    d: document.querySelector(".blob-d"),
  };

  let mx = 0, my = 0, tx = 0, ty = 0;
  let scrollY = 0, scrollT = 0;

  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;   // -1..1
    ty = (e.clientY / innerHeight - 0.5) * 2; // -1..1
  }, { passive: true });

  window.addEventListener("scroll", () => {
    scrollT = window.scrollY || 0;
  }, { passive: true });

  const lerp = (a,b,t) => a + (b-a)*t;

  function tick(){
    mx = lerp(mx, tx, 0.035);
    my = lerp(my, ty, 0.035);
    scrollY = lerp(scrollY, scrollT, 0.055);

    const s = scrollY * 0.028;

    // different depths
    blobs.a.style.transform = `translate3d(${mx*22}px, ${my*18 + s}px, 0)`;
    blobs.b.style.transform = `translate3d(${mx*-28}px, ${my*16 + s*0.8}px, 0)`;
    blobs.c.style.transform = `translate3d(${mx*18}px, ${my*-20 + s*1.2}px, 0)`;
    blobs.d.style.transform = `translate3d(${mx*-12}px, ${my*-16 + s*0.9}px, 0)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ==========================================================
   ✅ AURORA RIBBON WAVES (silk ribbons, always running)
========================================================== */
(function auroraRibbons(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const canvas = document.getElementById("auroraCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  let w=0, h=0, dpr = Math.min(2, window.devicePixelRatio || 1);

  const resize = () => {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  addEventListener("resize", resize, { passive: true });
  resize();

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const hexToRgb = (hex) => {
    const h = hex.replace("#","");
    const full = h.length===3 ? h.split("").map(c=>c+c).join("") : h;
    const n = parseInt(full,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  };

  let t = 0;

  function drawRibbon(yBase, amp, speed, color, thickness){
    ctx.beginPath();
    const wave = (x) => Math.sin((x*0.006) + t*speed) * amp
                      + Math.sin((x*0.012) - t*speed*0.7) * (amp*0.45);

    ctx.moveTo(0, yBase + wave(0));
    for (let x=0; x<=w; x+=18){
      ctx.lineTo(x, yBase + wave(x));
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function frame(){
    t += 0.0075;

    const isLight = document.documentElement.getAttribute("data-theme")==="light";

    const c1 = hexToRgb(cssVar("--a1") || "#7c3aed");
    const c2 = hexToRgb(cssVar("--a3") || "#06b6d4");
    const c3 = hexToRgb(cssVar("--a2") || "#22c55e");
    const c4 = hexToRgb(cssVar("--a4") || "#f97316");

    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = "lighter";

    // soft global haze
    const haze = ctx.createRadialGradient(w*0.5, h*0.35, 40, w*0.5, h*0.35, Math.max(w,h)*0.7);
    haze.addColorStop(0, isLight ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.07)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0,0,w,h);

    // ribbons (multi-layer)
    drawRibbon(h*0.24, 44, 0.78, `rgba(${c2.r},${c2.g},${c2.b},${isLight?0.13:0.11})`, 30);
    drawRibbon(h*0.34, 36, 0.92, `rgba(${c1.r},${c1.g},${c1.b},${isLight?0.12:0.10})`, 26);
    drawRibbon(h*0.46, 30, 1.08, `rgba(${c3.r},${c3.g},${c3.b},${isLight?0.11:0.09})`, 22);
    drawRibbon(h*0.60, 24, 1.22, `rgba(${c4.r},${c4.g},${c4.b},${isLight?0.09:0.08})`, 18);

    /* extra faint cinematic layer (adds richness without looking busy) */
    drawRibbon(h*0.72, 18, 1.35, `rgba(${c2.r},${c2.g},${c2.b},${isLight?0.06:0.06})`, 14);

    // subtle fade at edges for cleanliness
    ctx.globalCompositeOperation = "source-over";
    const vign = ctx.createLinearGradient(0,0,0,h);
    vign.addColorStop(0, isLight ? "rgba(246,247,251,0.45)" : "rgba(11,15,25,0.35)");
    vign.addColorStop(0.25, "rgba(0,0,0,0)");
    vign.addColorStop(0.75, "rgba(0,0,0,0)");
    vign.addColorStop(1, isLight ? "rgba(246,247,251,0.55)" : "rgba(14,20,36,0.45)");
    ctx.fillStyle = vign;
    ctx.fillRect(0,0,w,h);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

/* ==========================================================
   ✅ PARTICLES (glow dots + connection lines)
========================================================== */
(function particles(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  let w=0, h=0, dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  addEventListener("resize", resize, { passive:true });
  resize();

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hexToRgb = (hex) => {
    const h = hex.replace("#","");
    const full = h.length===3 ? h.split("").map(c=>c+c).join("") : h;
    const n = parseInt(full,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  };
  const rand = (a,b)=> a + Math.random()*(b-a);

  const targetCount = () => {
    const base = Math.round((w*h)/30000);
    return Math.max(45, Math.min(140, base));
  };

  let particles = Array.from({length: targetCount()}, () => ({
    x: rand(0,w), y: rand(0,h),
    vx: rand(-0.26,0.26), vy: rand(-0.20,0.20),
    r: rand(1.0,2.2),
    phase: rand(0, Math.PI*2),
    speed: rand(0.55, 1.25)
  }));

  const mouse = {x:w*0.5, y:h*0.35, active:false};
  addEventListener("mousemove", (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true; }, {passive:true});
  addEventListener("mouseleave", ()=> mouse.active=false);

  let t=0;
  function frame(){
    t += 0.008;
    const isLight = document.documentElement.getAttribute("data-theme")==="light";

    const c1 = hexToRgb(cssVar("--a1")||"#7c3aed");
    const c2 = hexToRgb(cssVar("--a3")||"#06b6d4");
    const c3 = hexToRgb(cssVar("--a2")||"#22c55e");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = isLight ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
    ctx.fillRect(0,0,w,h);

    // mouse glow
    if (mouse.active){
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
      g.addColorStop(0, `rgba(${c2.r},${c2.g},${c2.b},${isLight?0.12:0.10})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x-260, mouse.y-260, 520, 520);
    }

    ctx.globalCompositeOperation = "lighter";

    for (let i=0;i<particles.length;i++){
      const p = particles[i];

      const fx = Math.sin(p.y*0.006 + t + p.phase)*0.12;
      const fy = Math.cos(p.x*0.006 + t + p.phase)*0.10;
      p.vx += fx*0.02; p.vy += fy*0.02;

      if (mouse.active){
        const dx = mouse.x-p.x, dy = mouse.y-p.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 160000){ p.vx += dx*0.000002; p.vy += dy*0.000002; }
      }

      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx*p.speed; p.y += p.vy*p.speed;

      if (p.x < -40) p.x = w+40;
      if (p.x > w+40) p.x = -40;
      if (p.y < -40) p.y = h+40;
      if (p.y > h+40) p.y = -40;

      const mix = (i%3===0)?c1:(i%3===1)?c2:c3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${mix.r},${mix.g},${mix.b},${isLight?0.18:0.14})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 135){
          const alpha = (1-d/135) * (isLight?0.085:0.075);
          ctx.strokeStyle = `rgba(${c2.r},${c2.g},${c2.b},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  addEventListener("resize", () => {
    const desired = targetCount();
    if (particles.length < desired){
      while (particles.length < desired) particles.push({
        x: rand(0,w), y: rand(0,h),
        vx: rand(-0.26,0.26), vy: rand(-0.20,0.20),
        r: rand(1.0,2.2),
        phase: rand(0, Math.PI*2),
        speed: rand(0.55, 1.25)
      });
    } else if (particles.length > desired){
      particles.length = desired;
    }
  });

  requestAnimationFrame(frame);
})();

/* ===================== AI LAB: subtle pulse + scanline phase ===================== */
(function aiLabPulse(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const grid = document.querySelector(".ai-grid");
  const sweep = document.querySelector(".ai-sweep");
  if (!grid || !sweep) return;

  let t = 0;
  function tick(){
    t += 0.008;
    // Tiny breathing: feels like an instrument panel
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.9);
    grid.style.opacity = (0.10 + breathe * 0.05).toFixed(3);

    // Slight sweep intensity modulation
    const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.7));
    sweep.style.filter = `blur(${6 + glow*1.8}px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ==========================================================
   ✅ HOLOGRAPHIC DOT-MATRIX / POINT CLOUD (3D-ish)
   - animated field of points with depth + links
   - cursor adds “focus” + subtle perspective
========================================================== */
(function pointCloud(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const canvas = document.getElementById("pointCloudCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w=0, h=0, dpr=Math.min(2, window.devicePixelRatio||1);
  const resize = () => {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(2, window.devicePixelRatio||1);
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  addEventListener("resize", resize, { passive:true });
  resize();

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hexToRgb = (hex) => {
    const h = hex.replace("#","");
    const full = h.length===3 ? h.split("").map(c=>c+c).join("") : h;
    const n = parseInt(full,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  };

  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

  const targetCount = () => {
    const base = Math.round((w*h)/26000);
    return Math.max(70, Math.min(190, base));
  };

  // pseudo-3D points: x,y,z where z controls size & speed
  let points = [];
  const makePoint = () => ({
    x: rand(0,w),
    y: rand(0,h),
    z: rand(0.1, 1.0),     // depth 0..1
    vx: rand(-0.35, 0.35),
    vy: rand(-0.30, 0.30),
    seed: rand(0, 9999)
  });

  const reset = () => {
    points = Array.from({length: targetCount()}, makePoint);
  };
  reset();

  const mouse = { x: w*0.5, y: h*0.35, tx: 0, ty: 0, active:false };
  addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active=true;
    mouse.tx = (e.clientX / w - 0.5) * 2;  // -1..1
    mouse.ty = (e.clientY / h - 0.5) * 2;
  }, { passive:true });
  addEventListener("mouseleave", ()=> mouse.active=false);

  let t=0;
  function frame(){
    t += 0.010;
    const isLight = document.documentElement.getAttribute("data-theme")==="light";

    const cA = hexToRgb(cssVar("--a3") || "#06b6d4");
    const cB = hexToRgb(cssVar("--a1") || "#7c3aed");

    // clear with very soft fade so it looks like a hologram layer
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0,0,w,h);

    // gentle vignette to keep it cinematic
    const vg = ctx.createRadialGradient(w*0.5, h*0.35, 40, w*0.5, h*0.35, Math.max(w,h)*0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, isLight ? "rgba(255,255,255,0.0)" : "rgba(0,0,0,0.25)");
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);

    ctx.globalCompositeOperation = "lighter";

    // perspective drift based on cursor ("camera tilt")
    const camX = mouse.active ? mouse.tx : 0;
    const camY = mouse.active ? mouse.ty : 0;

    for (let i=0;i<points.length;i++){
      const p = points[i];

      // depth affects movement
      const speed = 0.25 + p.z * 0.85;
      const flowX = Math.sin((p.y*0.006) + t + p.seed) * 0.12;
      const flowY = Math.cos((p.x*0.006) - t*0.8 + p.seed) * 0.10;

      p.vx += flowX * 0.02;
      p.vy += flowY * 0.02;
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx * speed;
      p.y += p.vy * speed;

      // wrap
      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y < -40) p.y = h + 40;
      if (p.y > h + 40) p.y = -40;

      // pseudo perspective projection (subtle)
      const px = p.x + camX * (18 * p.z);
      const py = p.y + camY * (14 * p.z);

      // dot size by depth
      const r = 0.9 + p.z * 1.9;

      // color shift across depth
      const mix = p.z;
      const rr = Math.round(cA.r*(1-mix) + cB.r*mix);
      const gg = Math.round(cA.g*(1-mix) + cB.g*mix);
      const bb = Math.round(cA.b*(1-mix) + cB.b*mix);

      // dot alpha
      let a = isLight ? 0.12 : 0.10;
      a += p.z * (isLight ? 0.10 : 0.08);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${a})`;
      ctx.arc(px, py, r, 0, Math.PI*2);
      ctx.fill();
    }

    // Links (like point-cloud connections)
    ctx.lineWidth = 1;
    for (let i=0;i<points.length;i++){
      for (let j=i+1;j<points.length;j++){
        const a = points[i], b = points[j];

        // only link similar depth => nicer 3D feel
        if (Math.abs(a.z - b.z) > 0.25) continue;

        const ax = a.x + camX*(18*a.z);
        const ay = a.y + camY*(14*a.z);
        const bx = b.x + camX*(18*b.z);
        const by = b.y + camY*(14*b.z);

        const dx = ax - bx, dy = ay - by;
        const d = Math.sqrt(dx*dx + dy*dy);

        const maxD = 120 + 60 * ((a.z + b.z) * 0.5);
        if (d < maxD){
          const depth = (a.z + b.z) * 0.5;
          const alpha = (1 - d/maxD) * (isLight ? 0.05 : 0.06) * (0.6 + depth);

          ctx.strokeStyle = `rgba(${cA.r},${cA.g},${cA.b},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  // keep density on resize
  addEventListener("resize", () => {
    const desired = targetCount();
    if (points.length < desired){
      while (points.length < desired) points.push(makePoint());
    } else if (points.length > desired){
      points.length = desired;
    }
  });

  requestAnimationFrame(frame);
})();

/* AI LAB: make ping originate near cursor position inside cards */
(function cardPingCursor(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;

    card.style.setProperty("--ping-x", x.toFixed(2) + "%");
    card.style.setProperty("--ping-y", y.toFixed(2) + "%");
  }, { passive: true });
})();

(function focusContact(){
  const name = $("#name");
  if (!name) return;

  window.addEventListener("hashchange", () => {
    if (location.hash === "#contact") setTimeout(() => name.focus(), 250);
  });
})();