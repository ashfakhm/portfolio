import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  playerMoving?: boolean;
  playerDirection?: { x: number; y: number };
}

export default function ThreeBackground({
  playerMoving = false,
  playerDirection = { x: 0, y: 0 },
}: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    stars: THREE.Points;
    spaceStation: THREE.Group;
    nebula: THREE.Points;
  } | null>(null);

  const playerMovingRef = useRef(playerMoving);
  const playerDirectionRef = useRef(playerDirection);

  useEffect(() => {
    playerMovingRef.current = playerMoving;
    playerDirectionRef.current = playerDirection;
  }, [playerMoving, playerDirection]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a16, 0.002);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 150;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn(
        "ThreeBackground: WebGL is not supported, using CSS background fallback:",
        err,
      );
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Interactive Starfield
    const starCount = 350;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Create random positions in a sphere/box
      starPositions[i * 3] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      // Color variation: mostly white, some blue, some red/yellow
      const rand = Math.random();
      if (rand > 0.85) {
        // Soft blue
        starColors[i * 3] = 0.5;
        starColors[i * 3 + 1] = 0.7;
        starColors[i * 3 + 2] = 1.0;
      } else if (rand > 0.7) {
        // Red giant tint
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.5;
        starColors[i * 3 + 2] = 0.5;
      } else {
        // Standard white brightness
        starColors[i * 3] = 0.9;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      }
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    starGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starColors, 3),
    );

    // Custom star texture using simple canvas
    const createCircleTexture = () => {
      const matCanvas = document.createElement("canvas");
      matCanvas.width = 16;
      matCanvas.height = 16;
      const matContext = matCanvas.getContext("2d");
      if (matContext) {
        const gradient = matContext.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(240, 240, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(100, 150, 255, 0.3)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        matContext.fillStyle = gradient;
        matContext.fillRect(0, 0, 16, 16);
      }
      const texture = new THREE.CanvasTexture(matCanvas);
      return texture;
    };

    const starMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      map: createCircleTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 3. Galactic Nebulous dust spots (colored dust clusters)
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 600;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 300 - 150;

      // Purple/Pink/Blue colors
      const coin = Math.random();
      if (coin > 0.5) {
        // Cyan / Blue
        dustColors[i * 3] = 0.1;
        dustColors[i * 3 + 1] = 0.5;
        dustColors[i * 3 + 2] = 0.9;
      } else {
        // Magenta / Red
        dustColors[i * 3] = 0.7;
        dustColors[i * 3 + 1] = 0.15;
        dustColors[i * 3 + 2] = 0.6;
      }
    }

    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );
    dustGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(dustColors, 3),
    );

    const dustMaterial = new THREE.PointsMaterial({
      size: 32,
      vertexColors: true,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const nebula = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(nebula);

    // 4. A Rotating 3D Outlined "Space Station" Structure from math primitives
    // This looks super retro-futuristic, clean, and runs fast. No external file dependencies.
    const spaceStation = new THREE.Group();

    // Central core sphere
    const coreGeom = new THREE.IcosahedronGeometry(15, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x1a9eff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const core = new THREE.Mesh(coreGeom, wireframeMat);
    spaceStation.add(core);

    // Outer orbital ring
    const ringGeom = new THREE.TorusGeometry(35, 1.2, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc51111, // Ashfakh's Red Accent
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    spaceStation.add(ring);

    // Solar panels details
    const panelGeom = new THREE.BoxGeometry(45, 4, 0.5);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x1a9eff,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const solarPanel = new THREE.Mesh(panelGeom, panelMat);
    solarPanel.position.z = -5;
    spaceStation.add(solarPanel);

    // Outer radar ring
    const radarGeom = new THREE.TorusGeometry(22, 0.5, 6, 24);
    const radar = new THREE.Mesh(radarGeom, wireframeMat);
    radar.rotation.y = Math.PI / 3;
    spaceStation.add(radar);

    spaceStation.position.set(-80, 40, -100);
    scene.add(spaceStation);

    // Store state in context
    contextRef.current = {
      scene,
      camera,
      renderer,
      stars,
      spaceStation,
      nebula,
    };

    // 5. Ambient Mouse Movement interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 30;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop (replaces HMR and maintains continuous flow)
    let animationFrameId: number;
    const starSpeed = 0.08;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Interpolate mouse coordinates for fluid camera motion
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX;
      camera.position.y = -mouseY;
      camera.lookAt(0, 0, 0);

      // Rotate space station
      spaceStation.rotation.y += 0.003;
      spaceStation.rotation.x += 0.001;

      // Rotate nebulia cluster slightly
      nebula.rotation.z -= 0.0003;

      // Star-scrolling effect on player movement
      const posAttr = stars.geometry.attributes
        .position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      // Adjust speed depending on player movement
      const currentSpeed = playerMovingRef.current ? starSpeed * 4 : starSpeed;
      const dirX = playerMovingRef.current
        ? playerDirectionRef.current.x * 2.5
        : 0;
      const dirY = playerMovingRef.current
        ? playerDirectionRef.current.y * 2.5
        : 0;

      for (let i = 0; i < starCount; i++) {
        // Stars scroll towards camera (z decreasing)
        positions[i * 3 + 2] += currentSpeed;

        // Apply visual drift based on player moving direction
        positions[i * 3] -= dirX * 0.02;
        positions[i * 3 + 1] += dirY * 0.02;

        // If star scrolls past camera, recycle it to the back
        if (positions[i * 3 + 2] > 200) {
          positions[i * 3 + 2] = -250;
          positions[i * 3] = (Math.random() - 0.5) * 500;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const currentContext = contextRef.current;
        if (currentContext) {
          currentContext.renderer.setSize(width, height);
          currentContext.camera.aspect = width / height;
          currentContext.camera.updateProjectionMatrix();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      resizeObserver.disconnect();

      // Dispose of Three.js objects to prevent WebGL memory leaks
      starGeometry.dispose();
      starMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      coreGeom.dispose();
      wireframeMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      panelGeom.dispose();
      panelMat.dispose();
      radarGeom.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-stars-background"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#070712]"
      style={{ opacity: 0.75 }}
    />
  );
}
