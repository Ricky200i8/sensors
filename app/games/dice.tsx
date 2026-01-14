import "@/global.css";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/atoms/Text';
import Dice3D from '../../components/objects/Dice3D';
import { useAccelerometer } from '../../lib/modules/sensors/accelerometer/useAccelerometer';

export default function DiceGame() {
    const { x, y, z } = useAccelerometer();
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);

    useEffect(() => {
        const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);
        if (totalForce > 2.5 && !isRolling) {
            rollDice();
        }
    }, [x, y, z, isRolling]);

    const rollDice = () => {
        setIsRolling(true);
        setTimeout(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            setIsRolling(false);
        }, 500);
    };

    return (
        <LinearGradient
            colors={['#6366f1', '#a855f7', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 items-center justify-center p-6"
        >
            <View className="absolute top-10 left-0 right-0 items-center">
                <Text className="text-4xl font-bold text-white mb-2">🎲 Dice Game</Text>
                <Text variant="caption" className="text-white opacity-80 text-center px-4">
                    Shake your device to roll the dice
                </Text>
            </View>

            <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-11/12 items-center justify-center py-16 rounded-3xl shadow-2xl"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    elevation: 15,
                }}
            >
                <View className="mb-6">
                    <Dice3D value={diceValue} isRolling={isRolling} />
                </View>


                <Text variant="body" className="text-2xl font-semibold text-white mb-2">
                    {isRolling ? 'Rolling...' : `You rolled ${diceValue}`}
                </Text>

                <View className="w-full h-1 bg-white/30 rounded-full mt-4">
                    <View
                        className="h-full rounded-full bg-white"
                        style={{ width: `${(diceValue / 6) * 100}%` }}
                    />
                </View>
            </LinearGradient>

            <View className="absolute bottom-10 left-0 right-0 items-center px-6">
                <View className="w-full bg-white/20 rounded-xl p-4 border border-white/30">
                    <Text variant="caption" className="text-white opacity-90 text-center mb-2 font-semibold">
                        Accelerometer Data
                    </Text>
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text variant="caption" className="text-white opacity-70">X</Text>
                            <Text variant="caption" className="text-white">{x.toFixed(2)}</Text>
                        </View>
                        <View className="items-center">
                            <Text variant="caption" className="text-white opacity-70">Y</Text>
                            <Text variant="caption" className="text-white">{y.toFixed(2)}</Text>
                        </View>
                        <View className="items-center">
                            <Text variant="caption" className="text-white opacity-70">Z</Text>
                            <Text variant="caption" className="text-white">{z.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}
