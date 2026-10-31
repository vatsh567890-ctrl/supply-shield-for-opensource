"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface ShieldSceneProps {
  scrollProgressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  isReducedMotion: boolean;
}

export const ShieldScene: React.FC<ShieldSceneProps> = ({
  scrollProgressRef,
  pointerRef,
  isReducedMotion,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);

  const { gl, scene } = useThree();

  // Environment lighting using Three.js bundled RoomEnvironment + PMREMGenerator
  // Strictly zero external network requests, 100% CSP-compliant
  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvironment = new RoomEnvironment();
    const envRenderTarget = pmremGenerator.fromScene(roomEnvironment);
    scene.environment = envRenderTarget.texture;

    return () => {
      envRenderTarget.dispose();
      roomEnvironment.dispose();
      pmremGenerator.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  // Procedural geometries for base shield and inset outline rim
  const { baseGeometry, rimGeometry } = useMemo(() => {
    // 1. Base shield shape: flat top, sides curving to a point at bottom
    const shape = new THREE.Shape();
    shape.moveTo(-1.0, 1.2);
    shape.lineTo(1.0, 1.2);
    shape.bezierCurveTo(1.05, 0.3, 0.75, -0.55, 0, -1.35);
    shape.bezierCurveTo(-0.75, -0.55, -1.05, 0.3, -1.0, 1.2);
    shape.closePath();

    const baseExtrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };
    const baseGeo = new THREE.ExtrudeGeometry(shape, baseExtrudeSettings);
    baseGeo.center();

    // 2. Inset outline rim: hollow outline shape inset from the edge
    const outerRim = new THREE.Shape();
    outerRim.moveTo(-0.88, 1.08);
    outerRim.lineTo(0.88, 1.08);
    outerRim.bezierCurveTo(0.93, 0.28, 0.67, -0.48, 0, -1.2);
    outerRim.bezierCurveTo(-0.67, -0.48, -0.93, 0.28, -0.88, 1.08);
    outerRim.closePath();

    const innerHole = new THREE.Path();
    innerHole.moveTo(-0.76, 0.96);
    innerHole.lineTo(0.76, 0.96);
    innerHole.bezierCurveTo(0.8, 0.24, 0.58, -0.42, 0, -1.05);
    innerHole.bezierCurveTo(-0.58, -0.42, -0.8, 0.24, -0.76, 0.96);
    innerHole.closePath();
    outerRim.holes.push(innerHole);

    const rimExtrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };
    const rimGeo = new THREE.ExtrudeGeometry(outerRim, rimExtrudeSettings);
    rimGeo.center();

    return { baseGeometry: baseGeo, rimGeometry: rimGeo };
  }, []);

  // Silver-white metallic material with faint warm tint
  const shieldMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#FAF7F8"),
      metalness: 1.0,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
  }, []);

  // Frame animation loop
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isReducedMotion) {
      // Fixed presentation angle when reduced motion is preferred
      groupRef.current.rotation.set(0.08, 0.45, 0);
      groupRef.current.position.set(0, 0, 0);
      return;
    }

    // 1. Scroll-linked rotation (0 to 1.25 turns around Y axis)
    const progress = scrollProgressRef.current ?? 0;
    const maxScrollRotation = 1.25 * (2 * Math.PI); // 2.5 * PI
    const baseRotationY = progress * maxScrollRotation;

    // 2. Pointer tilt (up to ~8 degrees = 0.1396 rad with damping)
    const maxTilt = 8 * (Math.PI / 180);
    const pointer = pointerRef.current ?? { x: 0, y: 0 };
    const targetTiltY = pointer.x * maxTilt;
    const targetTiltX = -pointer.y * maxTilt;

    currentTiltX.current += (targetTiltX - currentTiltX.current) * 0.08;
    currentTiltY.current += (targetTiltY - currentTiltY.current) * 0.08;

    groupRef.current.rotation.y = baseRotationY + currentTiltY.current;
    groupRef.current.rotation.x = currentTiltX.current;

    // 3. Very slow vertical float of ~0.05 units
    const elapsedTime = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(elapsedTime * 1.4) * 0.05;
  });

  return (
    <group ref={groupRef} scale={[1.35, 1.35, 1.35]}>
      {/* Base Extruded Shield */}
      <mesh geometry={baseGeometry} material={shieldMaterial} castShadow receiveShadow />

      {/* Slightly smaller extruded outline rim raised slightly in front */}
      <mesh
        geometry={rimGeometry}
        material={shieldMaterial}
        position={[0, 0, 0.08]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

