import React, { useEffect, useRef, forwardRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./Robot.css";

// Dynamically position the camera based on model height (not width.......)
function CameraSetup({ model }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!model.current) return;

    // Get bounding box and center
    const box = new THREE.Box3().setFromObject(model.current);
    const sizeBox = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Padding and FOV
    const fov = 18;
    const padding = 1.0;

    // Focus on vertical framing (Y axis only)
    const distanceForHeight =
      (sizeBox.y / 2) / Math.tan((fov / 2) * Math.PI / 180);
    const distance = distanceForHeight * padding;

    // Adjust camera
    camera.position.set(0, sizeBox.y * 0.1, distance);
    camera.lookAt(center.x, center.y, center.z);
    camera.fov = fov;
    camera.updateProjectionMatrix();

    // Align robot to bottom of container
    model.current.position.set(-center.x, -box.min.y, -center.z);
  }, [camera, size, model]);

  return null;
}

// Robot model component
const RobotModel = forwardRef((props, ref) => {
  const { scene, animations } = useGLTF("/robot/test.gltf");
  const mixer = useRef();

  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive ref={ref} object={scene} />;
});

useGLTF.preload("/robot/test.gltf");

// Main robot component
const Robot = () => {
  const modelRef = useRef();

  return (
    <div className="robot-model-container">
      <Canvas
        className="robot-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 18 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <RobotModel ref={modelRef} />
        <CameraSetup model={modelRef} />
      </Canvas>
    </div>
  );
};

export default Robot;
