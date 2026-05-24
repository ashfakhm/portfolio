import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CrewmateColor, CrewmateHat } from "./CrewmateSprite";

interface ThreeCrewmateProps {
	color: CrewmateColor;
	hat: CrewmateHat;
	size?: number;
}

export default function ThreeCrewmate({
	color,
	hat,
	size = 150,
}: ThreeCrewmateProps) {
	const mountRef = useRef<HTMLDivElement>(null);
	const contextRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		crewmateGroup: THREE.Group;
		bodyMesh: THREE.Mesh;
		backpackMesh: THREE.Mesh;
		visorMesh: THREE.Mesh;
		leftLegMesh: THREE.Mesh;
		rightLegMesh: THREE.Mesh;
		hatGroup: THREE.Group;
	} | null>(null);

	// Convert color keys to hexadecimal values for ThreeJS materials
	const getColorHex = (col: CrewmateColor): number => {
		switch (col) {
			case "red":
				return 0xc51111;
			case "cyan":
				return 0x38fede;
			case "lime":
				return 0x50f01e;
			case "pink":
				return 0xed54ba;
			case "yellow":
				return 0xf5f033;
			case "orange":
				return 0xf07d0d;
			case "purple":
				return 0x6b2fbc;
			case "blue":
				return 0x132ed1;
			case "white":
				return 0xd6e0f0;
			case "black":
				return 0x2c3035;
			default:
				return 0xc51111;
		}
	};

	useEffect(() => {
		if (!mountRef.current) return;

		// 1. Scene setup
		const scene = new THREE.Scene();

		// 2. Camera setup
		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
		camera.position.set(0, 1.5, 12);
		camera.lookAt(0, 0, 0);

		// 3. Renderer setup
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(size, size);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		mountRef.current.appendChild(renderer.domElement);

		// 4. Lighting Configuration
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
		scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
		dirLight.position.set(5, 8, 5);
		dirLight.castShadow = true;
		scene.add(dirLight);

		const backLight = new THREE.DirectionalLight(0xa5c4fc, 0.45);
		backLight.position.set(-5, 3, -5);
		scene.add(backLight);

		// 5. Build Procedural Crewmate 3D Mesh Assemblies
		const crewmateGroup = new THREE.Group();

		// Standard Toon/Standard shaded dynamic materials
		const mainColor = getColorHex(color);
		const bodyMat = new THREE.MeshToonMaterial({
			color: mainColor,
		});

		const visorMat = new THREE.MeshPhongMaterial({
			color: 0x38e3fd,
			specular: 0xffffff,
			shininess: 85,
		});

		// 5a. Capsule Body (Built with Cylinder + Spheres)
		const bodyGroup = new THREE.Group();

		const bodyGeom = new THREE.CylinderGeometry(1.6, 1.6, 2.6, 24);
		const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
		bodyMesh.position.y = 0;
		bodyMesh.castShadow = true;
		bodyGroup.add(bodyMesh);

		const topCapGeom = new THREE.SphereGeometry(
			1.6,
			24,
			16,
			0,
			Math.PI * 2,
			0,
			Math.PI / 2,
		);
		const topCap = new THREE.Mesh(topCapGeom, bodyMat);
		topCap.position.y = 1.3;
		topCap.castShadow = true;
		bodyGroup.add(topCap);

		const bottomCapGeom = new THREE.SphereGeometry(
			1.6,
			24,
			16,
			0,
			Math.PI * 2,
			Math.PI / 2,
			Math.PI / 2,
		);
		const bottomCap = new THREE.Mesh(bottomCapGeom, bodyMat);
		bottomCap.position.y = -1.3;
		bottomCap.castShadow = true;
		bodyGroup.add(bottomCap);

		crewmateGroup.add(bodyGroup);

		// 5b. Oxygen Tank Backpack (Rounded Box offset along Z / Back)
		const backpackGeom = new THREE.BoxGeometry(1.0, 2.4, 1.8);
		const backpackMesh = new THREE.Mesh(backpackGeom, bodyMat);
		backpackMesh.position.set(-1.6, 0.1, 0);
		backpackMesh.castShadow = true;
		crewmateGroup.add(backpackMesh);

		// 5c. Large Glass Visor (Squashed Spherical Capsule offset along visual front Z/X)
		const visorGeom = new THREE.SphereGeometry(1.0, 24, 16);
		const visorMesh = new THREE.Mesh(visorGeom, visorMat);
		visorMesh.scale.set(0.65, 0.85, 1.5);
		visorMesh.position.set(1.1, 0.6, 0); // Outward facing
		visorMesh.castShadow = true;
		crewmateGroup.add(visorMesh);

		// Visor edge rim silhouette
		const visorRimGeom = new THREE.SphereGeometry(1.08, 24, 16);
		const visorRimMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
		const visorRim = new THREE.Mesh(visorRimGeom, visorRimMat);
		visorRim.scale.set(0.63, 0.9, 1.54);
		visorRim.position.set(1.05, 0.6, 0);
		crewmateGroup.add(visorRim);

		// 5d. Legs
		const legGeom = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16);

		// Left Leg
		const leftLegMesh = new THREE.Mesh(legGeom, bodyMat);
		leftLegMesh.position.set(0.6, -2.1, 0.65);
		leftLegMesh.castShadow = true;
		crewmateGroup.add(leftLegMesh);

		// Right Leg
		const rightLegMesh = new THREE.Mesh(legGeom, bodyMat);
		rightLegMesh.position.set(0.6, -2.1, -0.65);
		rightLegMesh.castShadow = true;
		crewmateGroup.add(rightLegMesh);

		// 5e. Procedural Dynamic 3D Hat attachments
		const hatGroup = new THREE.Group();
		hatGroup.position.set(0, 2.8, 0);
		crewmateGroup.add(hatGroup);

		// Apply the requested dimensions adjustments: taller and thinner
		crewmateGroup.scale.set(0.7, 1.3, 0.7);

		scene.add(crewmateGroup);

		// Store references in contextual structure
		contextRef.current = {
			scene,
			camera,
			renderer,
			crewmateGroup,
			bodyMesh,
			backpackMesh,
			visorMesh,
			leftLegMesh,
			rightLegMesh,
			hatGroup,
		};

		// 6. Draw any active 3D hats
		const build3DHat = (type: CrewmateHat) => {
			// Clear previous hat components
			while (hatGroup.children.length > 0) {
				hatGroup.remove(hatGroup.children[0]);
			}

			switch (type) {
				case "crown": {
					// A 3D Golden crown ring!
					const crownRingGeom = new THREE.CylinderGeometry(
						0.8,
						0.9,
						0.5,
						12,
						1,
						true,
					);
					const goldMat = new THREE.MeshPhongMaterial({
						color: 0xf1c40f,
						shininess: 80,
						specular: 0xffffff,
					});
					const baseRing = new THREE.Mesh(crownRingGeom, goldMat);
					baseRing.position.y = -0.15;
					hatGroup.add(baseRing);

					// Small spikes around crown
					for (let i = 0; i < 5; i++) {
						const spikeGeom = new THREE.ConeGeometry(0.18, 0.45, 4);
						const spike = new THREE.Mesh(spikeGeom, goldMat);
						const angle = (i / 5) * Math.PI * 2;
						spike.position.set(
							Math.cos(angle) * 0.82,
							0.2,
							Math.sin(angle) * 0.82,
						);
						spike.rotation.y = angle;
						spike.rotation.z = -0.2;
						hatGroup.add(spike);
					}
					break;
				}

				case "plant": {
					// Double leaf green sprout stem
					const stemGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 8);
					const leafMat = new THREE.MeshPhongMaterial({
						color: 0x4cd137,
						shininess: 30,
					});
					const stem = new THREE.Mesh(stemGeom, leafMat);
					stem.position.y = 0.2;
					hatGroup.add(stem);

					// Left leaf
					const leaf1Geom = new THREE.SphereGeometry(0.28, 8, 8);
					const leaf1 = new THREE.Mesh(leaf1Geom, leafMat);
					leaf1.scale.set(0.65, 0.15, 0.45);
					leaf1.position.set(0.22, 0.55, 0);
					leaf1.rotation.z = 0.45;
					hatGroup.add(leaf1);

					// Right leaf
					const leaf2 = leaf1.clone();
					leaf2.position.set(-0.22, 0.55, 0);
					leaf2.rotation.z = -0.45;
					hatGroup.add(leaf2);
					break;
				}

				case "egg": {
					// Decrated fried egg pancake
					const eggWhiteGeom = new THREE.CylinderGeometry(0.9, 1.1, 0.12, 16);
					const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
					const eggWhite = new THREE.Mesh(eggWhiteGeom, whiteMat);
					eggWhite.position.y = -0.3;
					eggWhite.scale.set(1.2, 1, 0.95);
					hatGroup.add(eggWhite);

					// Egg yolk
					const yolkGeom = new THREE.SphereGeometry(0.35, 12, 12);
					const yolkMat = new THREE.MeshPhongMaterial({
						color: 0xffbf00,
						shininess: 60,
					});
					const yolk = new THREE.Mesh(yolkGeom, yolkMat);
					yolk.scale.set(1, 0.45, 1);
					yolk.position.set(0.05, -0.22, 0.05);
					hatGroup.add(yolk);
					break;
				}

				case "sticky": {
					// Yellow notepad square note
					const noteGeom = new THREE.BoxGeometry(1.0, 0.05, 1.0);
					const yellowMat = new THREE.MeshLambertMaterial({ color: 0xffe14c });
					const note = new THREE.Mesh(noteGeom, yellowMat);
					note.position.set(0.1, -0.2, 0.1);
					note.rotation.y = 0.2;
					note.rotation.x = 0.1;
					hatGroup.add(note);
					break;
				}

				case "chef": {
					// Puffy catering cylinder base
					const chefBaseGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
					const whiteMat = new THREE.MeshLambertMaterial({ color: 0xefefef });
					const chefBase = new THREE.Mesh(chefBaseGeom, whiteMat);
					chefBase.position.y = -0.1;
					hatGroup.add(chefBase);

					// Ballooned puff on top
					const chefPuffGeom = new THREE.SphereGeometry(0.85, 16, 12);
					const chefPuff = new THREE.Mesh(chefPuffGeom, whiteMat);
					chefPuff.position.y = 0.4;
					chefPuff.scale.set(1, 0.75, 1);
					hatGroup.add(chefPuff);
					break;
				}

				case "pompom": {
					// Red balloon and thin anchor line
					const stemGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6);
					const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
					const stem = new THREE.Mesh(stemGeom, blackMat);
					stem.position.y = 0.65;
					hatGroup.add(stem);

					const balloonGeom = new THREE.SphereGeometry(0.65, 16, 16);
					const balloonMat = new THREE.MeshPhongMaterial({
						color: 0xe74c3c,
						shininess: 100,
						specular: 0xffffff,
					});
					const balloon = new THREE.Mesh(balloonGeom, balloonMat);
					balloon.position.set(0, 1.8, 0);
					hatGroup.add(balloon);
					break;
				}

				default:
					break;
			}
		};

		build3DHat(hat);

		// 7. Interactive rotation animation cycle
		let animationId: number;
		const animate = () => {
			animationId = requestAnimationFrame(animate);

			// Rotate whole crewmate around Y Axis
			crewmateGroup.rotation.y += 0.015;

			// Gentle vertical floating bounce
			crewmateGroup.position.y = Math.sin(Date.now() * 0.003) * 0.24;

			renderer.render(scene, camera);
		};

		animate();

		return () => {
			cancelAnimationFrame(animationId);
			if (mountRef.current && renderer.domElement) {
				mountRef.current.removeChild(renderer.domElement);
			}
		};
	}, [size, color, hat, getColorHex]);

	// Handle updates to colors, shadow mappings, and hats without rebuilding scene!
	useEffect(() => {
		const currentContext = contextRef.current;
		if (!currentContext) return;

		const mainHex = getColorHex(color);

		// Update body & oxygen mesh materials
		currentContext.bodyMesh.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				(child.material as THREE.MeshToonMaterial).color.setHex(mainHex);
			}
		});

		currentContext.backpackMesh.material = new THREE.MeshToonMaterial({
			color: mainHex,
		});

		currentContext.leftLegMesh.material = new THREE.MeshToonMaterial({
			color: mainHex,
		});

		currentContext.rightLegMesh.material = new THREE.MeshToonMaterial({
			color: mainHex,
		});

		// Rebuild active 3D hat
		const rebuildHatsFunc = (type: CrewmateHat) => {
			const hGroup = currentContext.hatGroup;
			while (hGroup.children.length > 0) {
				hGroup.remove(hGroup.children[0]);
			}

			switch (type) {
				case "crown": {
					const crownRingGeom = new THREE.CylinderGeometry(
						0.8,
						0.9,
						0.5,
						12,
						1,
						true,
					);
					const goldMat = new THREE.MeshPhongMaterial({
						color: 0xf1c40f,
						shininess: 80,
						specular: 0xffffff,
					});
					const baseRing = new THREE.Mesh(crownRingGeom, goldMat);
					baseRing.position.y = -0.15;
					hGroup.add(baseRing);

					for (let i = 0; i < 5; i++) {
						const spikeGeom = new THREE.ConeGeometry(0.18, 0.45, 4);
						const spike = new THREE.Mesh(spikeGeom, goldMat);
						const angle = (i / 5) * Math.PI * 2;
						spike.position.set(
							Math.cos(angle) * 0.82,
							0.2,
							Math.sin(angle) * 0.82,
						);
						spike.rotation.y = angle;
						spike.rotation.z = -0.2;
						hGroup.add(spike);
					}
					break;
				}

				case "plant": {
					const stemGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 8);
					const leafMat = new THREE.MeshPhongMaterial({
						color: 0x4cd137,
						shininess: 30,
					});
					const stem = new THREE.Mesh(stemGeom, leafMat);
					stem.position.y = 0.2;
					hGroup.add(stem);

					const leaf1Geom = new THREE.SphereGeometry(0.28, 8, 8);
					const leaf1 = new THREE.Mesh(leaf1Geom, leafMat);
					leaf1.scale.set(0.65, 0.15, 0.45);
					leaf1.position.set(0.22, 0.55, 0);
					leaf1.rotation.z = 0.45;
					hGroup.add(leaf1);

					const leaf2 = leaf1.clone();
					leaf2.position.set(-0.22, 0.55, 0);
					leaf2.rotation.z = -0.45;
					hGroup.add(leaf2);
					break;
				}

				case "egg": {
					const eggWhiteGeom = new THREE.CylinderGeometry(0.9, 1.1, 0.12, 16);
					const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
					const eggWhite = new THREE.Mesh(eggWhiteGeom, whiteMat);
					eggWhite.position.y = -0.3;
					eggWhite.scale.set(1.2, 1, 0.95);
					hGroup.add(eggWhite);

					const yolkGeom = new THREE.SphereGeometry(0.35, 12, 12);
					const yolkMat = new THREE.MeshPhongMaterial({
						color: 0xffbf00,
						shininess: 60,
					});
					const yolk = new THREE.Mesh(yolkGeom, yolkMat);
					yolk.scale.set(1, 0.45, 1);
					yolk.position.set(0.05, -0.22, 0.05);
					hGroup.add(yolk);
					break;
				}

				case "sticky": {
					const noteGeom = new THREE.BoxGeometry(1.0, 0.05, 1.0);
					const yellowMat = new THREE.MeshLambertMaterial({ color: 0xffe14c });
					const note = new THREE.Mesh(noteGeom, yellowMat);
					note.position.set(0.1, -0.2, 0.1);
					note.rotation.y = 0.2;
					note.rotation.x = 0.1;
					hGroup.add(note);
					break;
				}

				case "chef": {
					const chefBaseGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
					const whiteMat = new THREE.MeshLambertMaterial({ color: 0xefefef });
					const chefBase = new THREE.Mesh(chefBaseGeom, whiteMat);
					chefBase.position.y = -0.1;
					hGroup.add(chefBase);

					const chefPuffGeom = new THREE.SphereGeometry(0.85, 16, 12);
					const chefPuff = new THREE.Mesh(chefPuffGeom, whiteMat);
					chefPuff.position.y = 0.4;
					chefPuff.scale.set(1, 0.75, 1);
					hGroup.add(chefPuff);
					break;
				}

				case "pompom": {
					const stemGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6);
					const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
					const stem = new THREE.Mesh(stemGeom, blackMat);
					stem.position.y = 0.65;
					hGroup.add(stem);

					const balloonGeom = new THREE.SphereGeometry(0.65, 16, 16);
					const balloonMat = new THREE.MeshPhongMaterial({
						color: 0xe74c3c,
						shininess: 100,
						specular: 0xffffff,
					});
					const balloon = new THREE.Mesh(balloonGeom, balloonMat);
					balloon.position.set(0, 1.8, 0);
					hGroup.add(balloon);
					break;
				}

				default:
					break;
			}
		};

		rebuildHatsFunc(hat);
	}, [color, hat, getColorHex]);

	return (
		<div className="relative flex items-center justify-center">
			{/* 3D Canvas Mounting anchor */}
			<div
				ref={mountRef}
				style={{ width: `${size}px`, height: `${size}px` }}
				className="cursor-pointer hover:scale-105 active:scale-95 transition-all drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
			/>
			{/* Ambient shadow gradient base background inside card */}
			<div className="absolute bottom-2 w-28 h-4 bg-black/60 rounded-full blur-[4px] filter opacity-50 pointer-events-none" />
		</div>
	);
}
