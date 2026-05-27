import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  playerMoving?: boolean;
  playerDirection?: { x: number; y: number };
}

function useThreeScene(
  containerRef: React.RefObject<HTMLDivElement | null>,
  playerMovingRef: React.RefObject<boolean>,
  playerDirectionRef: React.RefObject<{ x: number; y: number }>,
) {
  const contextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    stars: THREE.Points;
    spaceStation: THREE.Group;
    nebula: THREE.Points;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a16, 0.002);

    const width = container.clientWidth;
    const height = container.clientHeight;
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
    container.appendChild(renderer.domElement);

    // 2. Interactive Starfield
    const starCount = 350;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const rand = Math.random();
      if (rand > 0.85) {
        starColors[i * 3] = 0.5;
        starColors[i * 3 + 1] = 0.7;
        starColors[i * 3 + 2] = 1.0;
      } else if (rand > 0.7) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.5;
        starColors[i * 3 + 2] = 0.5;
      } else {
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

    // 3. Galactic Nebulous dust spots
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 600;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 300 - 150;

      const coin = Math.random();
      if (coin > 0.5) {
        dustColors[i * 3] = 0.1;
        dustColors[i * 3 + 1] = 0.5;
        dustColors[i * 3 + 2] = 0.9;
      } else {
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

    // 4. Space Station Structure
    const spaceStation = new THREE.Group();

    const coreGeom = new THREE.IcosahedronGeometry(15, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x1a9eff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const core = new THREE.Mesh(coreGeom, wireframeMat);
    spaceStation.add(core);

    const ringGeom = new THREE.TorusGeometry(35, 1.2, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc51111,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    spaceStation.add(ring);

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

    const radarGeom = new THREE.TorusGeometry(22, 0.5, 6, 24);
    const radar = new THREE.Mesh(radarGeom, wireframeMat);
    radar.rotation.y = Math.PI / 3;
    spaceStation.add(radar);

    spaceStation.position.set(-80, 40, -100);
    scene.add(spaceStation);

    contextRef.current = {
      scene,
      camera,
      renderer,
      stars,
      spaceStation,
      nebula,
    };

    // 5. Mouse Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 30;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    const starSpeed = 0.08;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX;
      camera.position.y = -mouseY;
      camera.lookAt(0, 0, 0);

      spaceStation.rotation.y += 0.003;
      spaceStation.rotation.x += 0.001;

      nebula.rotation.z -= 0.0003;

      const posAttr = stars.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      const currentSpeed = playerMovingRef.current ? starSpeed * 4 : starSpeed;
      const dirX = playerMovingRef.current ? playerDirectionRef.current.x * 2.5 : 0;
      const dirY = playerMovingRef.current ? playerDirectionRef.current.y * 2.5 : 0;

      for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 2] += currentSpeed;
        positions[i * 3] -= dirX * 0.02;
        positions[i * 3 + 1] += dirY * 0.02;

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

    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      resizeObserver.disconnect();

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
  }, [containerRef, playerMovingRef, playerDirectionRef]);
}

export default function ThreeBackground({
  playerMoving = false,
  playerDirection = { x: 0, y: 0 },
}: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerMovingRef = useRef(playerMoving);
  const playerDirectionRef = useRef(playerDirection);

  useEffect(() => {
    playerMovingRef.current = playerMoving;
    playerDirectionRef.current = playerDirection;
  }, [playerMoving, playerDirection]);

  useThreeScene(containerRef, playerMovingRef, playerDirectionRef);

  return (
    <div
      ref={containerRef}
      id="three-stars-background"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#070712]"
      style={{ opacity: 0.75 }}
    />
  );
}
