import React from 'react';
import { View } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <View className={`bg-white rounded-xl p-4 shadow-lg my-2 ${className || ''}`}>
            {children}
        </View>
    );
};
