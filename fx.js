/* Lightweight visual effects: pause off-screen rendering and respect device limits. */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallDevice = window.matchMedia('(max-width: 760px)').matches;
  const g = window.gsap;

  function scene() {
    const wrap = document.getElementById('scene');
    if (!wrap || !window.THREE || reduceMotion) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSmallDevice, alpha: true, powerPreference: 'low-power' });
    } catch (_) {
      wrap.classList.add('nogl');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallDevice ? 1 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;
    wrap.appendChild(renderer.domElement);

    const scene3d = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
    camera.position.z = isSmallDevice ? 17 : 14;
    scene3d.add(new THREE.HemisphereLight(0xffffff, 0xffd2b8, .85));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 9); scene3d.add(key);
    const rim = new THREE.PointLight(0xf26a21, 1.6, 35);
    rim.position.set(-6, -3, 5); scene3d.add(rim);

    const rounded = (w, h, r) => {
      const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    };
    const extrude = (shape, depth) => new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelThickness: .035, bevelSize: .035,
      bevelSegments: isSmallDevice ? 1 : 2, curveSegments: isSmallDevice ? 6 : 10
    });
    const outline = rounded(3.5, 6.2, .7); outline.holes.push(rounded(3.3, 6, .6));
    const phone = new THREE.Mesh(extrude(outline, .6), new THREE.MeshStandardMaterial({ color: 0x151515, metalness: .45, roughness: .4 }));
    phone.position.z = -.3;

    const makeGear = (teeth, outer, inner, hole, color, x, y) => {
      const shape = new THREE.Shape(), step = Math.PI * 2 / teeth;
      for (let i = 0; i < teeth; i++) {
        [[inner, 0], [outer, .18], [outer, .46], [inner, .64]].forEach(([radius, part], j) => {
          const a = (i + part) * step, px = Math.cos(a) * radius, py = Math.sin(a) * radius;
          if (i === 0 && j === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
        });
      }
      const cutout = new THREE.Path(); cutout.absarc(0, 0, hole, 0, Math.PI * 2, true); shape.holes.push(cutout);
      const mesh = new THREE.Mesh(extrude(shape, .3), new THREE.MeshStandardMaterial({ color, metalness: .3, roughness: .45 }));
      mesh.position.set(x, y, 0); return mesh;
    };
    const gearA = makeGear(12, 1.05, .84, .3, 0xf26a21, .62, .9);
    const gearB = makeGear(10, .86, .68, .26, 0xe04437, -.62, -.3);
    const gearC = makeGear(7, .46, .35, .15, 0xe04437, .42, -1.18);
    const group = new THREE.Group(), rig = new THREE.Group();
    group.add(phone, gearA, gearB, gearC); rig.add(group); scene3d.add(rig);

    let inView = false, pageVisible = !document.hidden, raf = 0, last = 0, elapsed = 0;
    const resize = () => {
      const w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight);
      renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.z = w / h < .9 ? 17 : (isSmallDevice ? 15.5 : 14);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(wrap); resize();
    const start = () => { if (!raf && inView && pageVisible) { last = 0; raf = requestAnimationFrame(draw); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const visibilityObserver = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0.05 });
    visibilityObserver.observe(wrap);
    document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; pageVisible ? start() : stop(); });
    function draw(time) {
      raf = 0;
      if (!inView || !pageVisible) return;
      if (!last) last = time;
      const dt = Math.min((time - last) / 1000, .05); last = time; elapsed += dt;
      // Render at ~30 FPS to reduce GPU and battery usage.
      if (elapsed >= 1 / 30) {
        const step = Math.min(elapsed, .05); elapsed = 0;
        gearA.rotation.z += step * .5; gearB.rotation.z -= step * .6; gearC.rotation.z += step * .86;
        renderer.render(scene3d, camera);
      }
      raf = requestAnimationFrame(draw);
    }
    if (g && !reduceMotion) {
      g.from(rig.scale, { x: .01, y: .01, z: .01, duration: 1.2, ease: 'power3.out' });
      g.from(phone.rotation, { y: -Math.PI, duration: 1.4, ease: 'power3.out' });
    }
    start();
    window.addEventListener('pagehide', () => { stop(); resizeObserver.disconnect(); visibilityObserver.disconnect(); renderer.dispose(); }, { once: true });
  }

  // Keep product cards responsive: avoid expensive per-pointer 3D tweens and blur filters.
  window.fxCards = function (grid) {
    if (!grid || reduceMotion) return;
    grid.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.setProperty('--card-order', index);
      card.classList.add('card-ready');
    });
  };

  document.addEventListener('DOMContentLoaded', scene, { once: true });
})();
