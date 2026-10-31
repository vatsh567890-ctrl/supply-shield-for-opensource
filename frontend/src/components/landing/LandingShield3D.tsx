"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function LandingShield3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch {
      canvas.style.display = "none";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 8;

    const shape = new THREE.Shape();
    shape.moveTo(0, 2.3);
    shape.bezierCurveTo(0.9, 1.9, 1.6, 1.8, 1.9, 1.8);
    shape.bezierCurveTo(1.9, 0.3, 1.6, -1.3, 0, -2.4);
    shape.bezierCurveTo(-1.6, -1.3, -1.9, 0.3, -1.9, 1.8);
    shape.bezierCurveTo(-1.6, 1.8, -0.9, 1.9, 0, 2.3);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 6,
      curveSegments: 32,
    });
    geometry.center();

    const shieldGroup = new THREE.Group();

    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1b2233,
      metalness: 0.6,
      roughness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
    });
    const shieldMesh = new THREE.Mesh(geometry, shieldMaterial);
    shieldGroup.add(shieldMesh);

    const edges = new THREE.EdgesGeometry(geometry, 40);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6d8cff });
    const edgeLines = new THREE.LineSegments(edges, lineMaterial);
    shieldGroup.add(edgeLines);

    // Canvas Texture for SUPPLY SHIELD text
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 1024;
    const ctx = textCanvas.getContext("2d");
    const texture = new THREE.CanvasTexture(textCanvas);

    function drawShieldTexture() {
      if (!ctx) return;
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.textAlign = "center";
      const gradient = ctx.createLinearGradient(0, 300, 0, 700);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#8fa8ff");
      ctx.fillStyle = gradient;
      ctx.font = "400 235px Anton, Impact, sans-serif";
      ctx.fillText("SUPPLY", 512, 500);
      ctx.fillText("SHIELD", 512, 730);
      ctx.fillStyle = "#35f0c4";
      ctx.fillRect(262, 535, 500, 6);
      texture.needsUpdate = true;
    }

    drawShieldTexture();
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(drawShieldTexture);
    }

    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const planeGeo = new THREE.PlaneGeometry(2.9, 2.9);

    const frontPlane = new THREE.Mesh(planeGeo, planeMat);
    frontPlane.position.z = 0.335;

    const backPlane = new THREE.Mesh(planeGeo, planeMat);
    backPlane.position.z = -0.335;
    backPlane.rotation.y = Math.PI;

    shieldGroup.add(frontPlane, backPlane);
    scene.add(shieldGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    const light1 = new THREE.PointLight(0x4d7cff, 2.2, 30);
    light1.position.set(-5, 3, 6);
    const light2 = new THREE.PointLight(0x35f0c4, 1.8, 30);
    light2.position.set(5, -3, 5);
    const light3 = new THREE.DirectionalLight(0xffffff, 0.9);
    light3.position.set(0, 4, 8);
    scene.add(ambientLight, light1, light2, light3);

    function handleResize() {
      if (!renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    const STOP_AT = "#app";
    let targetProgress = 0;
    let currentProgress = 0;
    let stopDistance = 1;

    function updateScrollTarget() {
      const appSection = document.querySelector(STOP_AT) as HTMLElement | null;
      stopDistance = Math.max(
        1,
        (appSection ? appSection.offsetTop : 1) - window.innerHeight * 0.45
      );
      targetProgress = Math.min(1, window.scrollY / stopDistance);
    }

    function onScroll() {
      targetProgress = Math.min(1, window.scrollY / stopDistance);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollTarget);
    updateScrollTarget();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animId: number;
    function loop(time: number) {
      currentProgress += (targetProgress - currentProgress) * 0.06;
      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
      }

      const isMobile = window.innerWidth < 800;
      const fadeFactor = 1 - currentProgress;

      shieldGroup.rotation.y = prefersReducedMotion
        ? 0.3
        : currentProgress * Math.PI * 6 + Math.sin(time * 0.0004) * 0.12 * fadeFactor;
      shieldGroup.rotation.x = prefersReducedMotion
        ? 0
        : Math.sin(currentProgress * Math.PI * 4) * 0.22;
      shieldGroup.position.x =
        prefersReducedMotion || isMobile
          ? 0
          : Math.sin(currentProgress * Math.PI * 2) * 2.5;
      shieldGroup.position.y = prefersReducedMotion
        ? 0
        : Math.sin(time * 0.001) * 0.1 * fadeFactor;
      shieldGroup.scale.setScalar(
        (isMobile ? 0.62 : 0.88) * (1 - currentProgress * 0.12)
      );

      if (renderer) {
        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollTarget);

      geometry.dispose();
      shieldMaterial.dispose();
      edges.dispose();
      lineMaterial.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      texture.dispose();
      renderer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="gl" className="landing-gl" aria-hidden="true" />;
}

