"use client";

import * as React from "react";

/**
 * Three.js background scene for the hero.
 *
 * Renders a row of animated vertical bars ("equalizer") with a subtle
 * wave plane behind them. Bars use the brand gradient (violet → pink →
 * amber) baked into a vertex-color buffer, so the effect feels rich
 * without per-frame shader work.
 *
 * Performance:
 *  - single InstancedMesh for the bars (one draw call)
 *  - uses CSS `prefers-reduced-motion` to freeze animation
 *  - cleanup on unmount to avoid WebGL context leaks
 */

export function HeroScene() {
  const mountRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");

      if (cancelled) return;

      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // ---- Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      mount.appendChild(renderer.domElement);

      // ---- Scene + camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 9);

      // ---- Wave plane (subtle background gradient using shader)
      const waveGeo = new THREE.PlaneGeometry(20, 12, 1, 1);
      const waveMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color("#a78bfa") }, // violet
          uColorB: { value: new THREE.Color("#f472b6") }, // pink
          uColorC: { value: new THREE.Color("#fbbf24") }, // amber
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform vec3 uColorC;
          varying vec2 vUv;

          // Hash for soft noise
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          void main() {
            vec2 uv = vUv;
            // Soft horizontal wave displacement
            float w = sin(uv.x * 6.0 + uTime * 0.6) * 0.5 + 0.5;
            float n = noise(uv * 3.0 + vec2(uTime * 0.1, 0.0));
            vec3 col = mix(uColorA, uColorB, w);
            col = mix(col, uColorC, n * 0.3);
            // Radial vignette + fade to transparent at edges
            float r = distance(uv, vec2(0.5));
            float alpha = smoothstep(0.55, 0.15, r) * 0.35;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.z = -4;
      scene.add(wave);

      // ---- Equalizer bars (InstancedMesh)
      const BAR_COUNT = 64;
      const barGeo = new THREE.BoxGeometry(0.13, 1, 0.13);
      // Translate so the bar grows upward from its center
      barGeo.translate(0, 0.5, 0);

      // Brand gradient palette (violet → pink → amber), repeated across bars
      const palette = [
        new THREE.Color("#a78bfa"),
        new THREE.Color("#c4b5fd"),
        new THREE.Color("#f472b6"),
        new THREE.Color("#ec4899"),
        new THREE.Color("#fbbf24"),
        new THREE.Color("#f59e0b"),
      ];

      const colorArray = new Float32Array(BAR_COUNT * 3);
      for (let i = 0; i < BAR_COUNT; i++) {
        const c = palette[i % palette.length];
        colorArray[i * 3 + 0] = c.r;
        colorArray[i * 3 + 1] = c.g;
        colorArray[i * 3 + 2] = c.b;
      }
      barGeo.setAttribute(
        "color",
        new THREE.InstancedBufferAttribute(colorArray, 3),
      );

      const barMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });
      const bars = new THREE.InstancedMesh(barGeo, barMat, BAR_COUNT);
      bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(bars);

      // Pre-compute per-bar phase offsets
      const phases = new Float32Array(BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        phases[i] = (i / BAR_COUNT) * Math.PI * 2;
      }

      // ---- Resize
      const onResize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      // ---- Animation
      const dummy = new THREE.Object3D();
      const SPACING = 0.22;
      const TOTAL_WIDTH = (BAR_COUNT - 1) * SPACING;
      const t0 = performance.now();

      let raf = 0;
      const tick = () => {
        if (cancelled) return;
        const t = (performance.now() - t0) * 0.001;

        // Update wave shader time
        waveMat.uniforms.uTime.value = t;

        if (!reduceMotion) {
          // Update bar heights — two stacked sine waves of different
          // frequency gives an organic, ever-changing shape.
          for (let i = 0; i < BAR_COUNT; i++) {
            const x = i * SPACING - TOTAL_WIDTH / 2;
            const phase = phases[i];
            const h1 = (Math.sin(t * 1.3 + phase) * 0.5 + 0.5) * 3.2;
            const h2 = (Math.sin(t * 0.5 + phase * 0.7) * 0.5 + 0.5) * 1.8;
            const h = 0.4 + h1 * 0.55 + h2 * 0.45;
            dummy.position.set(x, -2.2, 0);
            dummy.scale.set(1, h, 1);
            dummy.updateMatrix();
            bars.setMatrixAt(i, dummy.matrix);
          }
          bars.instanceMatrix.needsUpdate = true;
        }

        // Subtle camera sway for parallax
        camera.position.x = Math.sin(t * 0.2) * 0.3;
        camera.position.y = Math.cos(t * 0.15) * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        waveGeo.dispose();
        waveMat.dispose();
        barGeo.dispose();
        barMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ contain: "strict" }}
    />
  );
}