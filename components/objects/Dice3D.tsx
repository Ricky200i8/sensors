import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';

interface Dice3DProps { value: number; isRolling: boolean; }

const DOT_ARGS: [number, number, number, number] = [0.08, 0.08, 0.01, 32];
const DOT_ROT = [Math.PI / 2, 0, 0] as const;
const FACES_CONFIG = [
    { id: 1, rot: [0, 0, 0] },
    { id: 2, rot: [0, Math.PI / 2, 0] },
    { id: 3, rot: [-Math.PI / 2, 0, 0] },
    { id: 4, rot: [Math.PI / 2, 0, 0] },
    { id: 5, rot: [0, -Math.PI / 2, 0] },
    { id: 6, rot: [0, Math.PI, 0] }
];

const FACE_DOTS_LAYOUTS: Record<number, number[][]> = {
    1: [[0, 0]],
    2: [[-0.25, 0.25], [0.25, -0.25]],
    3: [[-0.25, 0.25], [0, 0], [0.25, -0.25]],
    4: [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]],
    5: [[-0.25, 0.25], [0.25, 0.25], [0, 0], [-0.25, -0.25], [0.25, -0.25]],
    6: [[-0.25, 0.25], [0.25, 0.25], [-0.25, 0], [0.25, 0], [-0.25, -0.25], [0.25, -0.25]]
};

const FaceDots: React.FC<{ faceIndex: number }> = React.memo(({ faceIndex }) => {
    const config = FACES_CONFIG[faceIndex - 1];
    return (
        <group rotation={[...config.rot] as [number, number, number]}>
            {(FACE_DOTS_LAYOUTS[faceIndex] || []).map((pos, idx) => (
                <mesh key={idx} position={[pos[0], pos[1], 0.505]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={DOT_ARGS} />
                    <meshStandardMaterial color="black" />
                </mesh>
            ))}
        </group>
    );
});

const DiceMesh: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
    const meshRef = useRef<THREE.Group>(null);
    const targetRot = useRef({ x: 0, y: 0, z: 0 });

    // Target rotations for each face (Z+ facing camera)
    const TARGETS: Record<number, { x: number; y: number; z: number }> = {
        1: { x: 0, y: 0, z: 0 },
        2: { x: 0, y: -Math.PI / 2, z: 0 },
        3: { x: Math.PI / 2, y: 0, z: 0 },
        4: { x: -Math.PI / 2, y: 0, z: 0 },
        5: { x: 0, y: Math.PI / 2, z: 0 },
        6: { x: Math.PI, y: 0, z: 0 },
    };

    useEffect(() => {
        if (!isRolling && meshRef.current) {
            const t = TARGETS[value];
            const current = meshRef.current.rotation;
            const PI2 = Math.PI * 2;

            // Calculate nearest target rotation avoiding "rewind"
            targetRot.current = {
                x: t.x + Math.floor(current.x / PI2) * PI2,
                y: t.y + Math.floor(current.y / PI2) * PI2,
                z: t.z + Math.floor(current.z / PI2) * PI2
            };
        }
    }, [value, isRolling]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        if (isRolling) {
            meshRef.current.rotation.x += delta * 15;
            meshRef.current.rotation.y += delta * 10;
            meshRef.current.rotation.z += delta * 5;
        } else {
            const speed = 6 * delta;
            meshRef.current.rotation.x += (targetRot.current.x - meshRef.current.rotation.x) * speed;
            meshRef.current.rotation.y += (targetRot.current.y - meshRef.current.rotation.y) * speed;
            meshRef.current.rotation.z += (targetRot.current.z - meshRef.current.rotation.z) * speed;
        }
    });

    return (
        <group ref={meshRef}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
            {[1, 2, 3, 4, 5, 6].map(i => <FaceDots key={i} faceIndex={i} />)}
        </group>
    );
};

const Dice3D: React.FC<Dice3DProps> = ({ value, isRolling }) => (
    <View style={{ width: 200, height: 200 }}>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 7]} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} />
                <DiceMesh value={value} isRolling={isRolling} />
            </Suspense>
        </Canvas>
    </View>
);

export default React.memo(Dice3D);