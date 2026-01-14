import { Canvas, useFrame } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';

interface Dice3DProps {
    value: number;
    isRolling: boolean;
}

const FACE_DOTS_LAYOUTS: { [key: number]: [number, number][] } = {
    1: [[0, 0]],
    2: [[-0.25, 0.25], [0.25, -0.25]],
    3: [[-0.25, 0.25], [0, 0], [0.25, -0.25]],
    4: [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]],
    5: [[-0.25, 0.25], [0.25, 0.25], [0, 0], [-0.25, -0.25], [0.25, -0.25]],
    6: [[-0.25, 0.25], [0.25, 0.25], [-0.25, 0], [0.25, 0], [-0.25, -0.25], [0.25, -0.25]]
};

const DOT_GEOMETRY_ARGS: [number, number, number, number] = [0.08, 0.08, 0.01, 32];
const DOT_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];

const FaceDots: React.FC<{ faceIndex: number; dotsCount: number }> = React.memo(({ faceIndex, dotsCount }) => {
    const zSurface = 0.505;
    const positions = FACE_DOTS_LAYOUTS[dotsCount] || [];

    // Determinar rotación del grupo de puntos según la cara del cubo
    let groupRotation: [number, number, number] = [0, 0, 0];

    // Mapeo: Cara -> Rotación del grupo para colocarse en la cara correcta del cubo
    if (faceIndex === 1) groupRotation = [0, 0, 0];                  // Frente (Z+)
    if (faceIndex === 2) groupRotation = [0, Math.PI / 2, 0];        // Derecha (X+)
    if (faceIndex === 3) groupRotation = [-Math.PI / 2, 0, 0];       // Arriba (Y+)
    if (faceIndex === 4) groupRotation = [Math.PI / 2, 0, 0];        // Abajo (Y-)
    if (faceIndex === 5) groupRotation = [0, -Math.PI / 2, 0];       // Izquierda (X-)
    if (faceIndex === 6) groupRotation = [0, Math.PI, 0];            // Atrás (Z-)

    return (
        <group rotation={groupRotation}>
            {positions.map((pos, idx) => (
                <mesh key={idx} position={[pos[0], pos[1], zSurface]} rotation={DOT_ROTATION}>
                    <cylinderGeometry args={DOT_GEOMETRY_ARGS} />
                    <meshStandardMaterial color="black" />
                </mesh>
            ))}
        </group>
    );
});

// Componente del cubo 3D con puntos
const DiceMesh: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
    const meshRef = useRef<THREE.Group>(null);
    const targetRotation = useRef({ x: 0, y: 0, z: 0 });
    const currentRotation = useRef({ x: 0, y: 0, z: 0 });

    // Definición de rotaciones para mostrar cada cara frente a la cámara (Z+)
    // Three.js usa sistema de mano derecha: Y arriba, X derecha, Z hacia afuera (hacia la cámara)
    const faceRotations: { [key: number]: { x: number; y: number; z: number } } = {
        1: { x: 0, y: 0, z: 0 },                    // Cara frontal está en Z+ -> Rotación 0
        2: { x: 0, y: -Math.PI / 2, z: 0 },         // Cara derecha está en X+ -> Rotar Y -90 para traerla al frente
        3: { x: Math.PI / 2, y: 0, z: 0 },          // Cara superior está en Y+ -> Rotar X +90 para traerla al frente (bajarla)
        4: { x: -Math.PI / 2, y: 0, z: 0 },         // Cara inferior está en Y- -> Rotar X -90 para traerla al frente (subirla)
        5: { x: 0, y: Math.PI / 2, z: 0 },          // Cara izquierda está en X- -> Rotar Y +90 para traerla al frente
        6: { x: Math.PI, y: 0, z: 0 },              // Cara trasera está en Z- -> Rotar X/Y 180
    };

    useEffect(() => {
        if (!isRolling) {
            const target = faceRotations[value];
            if (target) {
                // Cálculo de vueltas completas para animación natural
                const normalize = (target: number, current: number) => {
                    const diff = target - current;
                    // Encontrar el múltiplo de 2PI más cercano para minimizar el giro
                    const rounds = Math.round(diff / (Math.PI * 2));
                    return target - (rounds * Math.PI * 2);
                    // O simplemente ir al target más cercano acumulando vueltas
                };

                // Mejor enfoque: simplemente sumar las vueltas actuales al target
                // para evitar que el dado gire "hacia atrás" de forma extraña
                const PI2 = Math.PI * 2;

                // Redondear la rotación actual a múltiplos de 2PI para saber "en qué vuelta estamos"
                const currentXRound = Math.floor(currentRotation.current.x / PI2) * PI2;
                const currentYRound = Math.floor(currentRotation.current.y / PI2) * PI2;
                const currentZRound = Math.floor(currentRotation.current.z / PI2) * PI2;

                targetRotation.current = {
                    x: target.x + currentXRound,
                    y: target.y + currentYRound,
                    z: target.z + currentZRound,
                };
            }
        }
    }, [value, isRolling]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (isRolling) {
                // Rotación rápida y caótica mientras rueda
                meshRef.current.rotation.x += delta * 15;
                meshRef.current.rotation.y += delta * 10;
                meshRef.current.rotation.z += delta * 5;

                // Mantener sync de currentRotation
                currentRotation.current = {
                    x: meshRef.current.rotation.x,
                    y: meshRef.current.rotation.y,
                    z: meshRef.current.rotation.z,
                };
            } else {
                // Interpolación suave (Spring-like) al detenerse
                const speed = 6 * delta; // Ajustar velocidad de frenado

                meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * speed;
                meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * speed;
                meshRef.current.rotation.z += (targetRotation.current.z - meshRef.current.rotation.z) * speed;
            }
        }
    });

    return (
        <group ref={meshRef}>
            {/* Cuerpo del dado */}
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Puntos en las 6 caras */}
            <FaceDots faceIndex={1} dotsCount={1} />
            <FaceDots faceIndex={2} dotsCount={2} />
            <FaceDots faceIndex={3} dotsCount={3} />
            <FaceDots faceIndex={4} dotsCount={4} />
            <FaceDots faceIndex={5} dotsCount={5} />
            <FaceDots faceIndex={6} dotsCount={6} />
        </group>
    );
};

// Componente principal
const Dice3D: React.FC<Dice3DProps> = ({ value, isRolling }) => {
    return (
        // Contenedor View para limitar tamaño
        <View style={{ width: 200, height: 200 }}>
            <Canvas
                // Ajustar cámara para encuadrar bien el dado
                camera={{ position: [0, 0, 2.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {/* Iluminación */}
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 10, 7]} intensity={1} />
                    <pointLight position={[-5, -5, -5]} intensity={0.5} />

                    <DiceMesh value={value} isRolling={isRolling} />
                </Suspense>
            </Canvas>
        </View>
    );
};

export default React.memo(Dice3D);