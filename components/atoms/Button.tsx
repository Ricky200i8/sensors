import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'primary', className }) => {
    const variantClasses = {
        primary: 'bg-blue-500',
        secondary: 'bg-transparent border border-blue-500',
    };

    const textClasses = {
        primary: 'text-white',
        secondary: 'text-blue-500',
    };

    return (
        <TouchableOpacity
            className={`py-3 px-6 rounded-lg items-center justify-center min-w-[120px] ${variantClasses[variant]} ${className || ''}`}
            onPress={onPress}
        >
            <Text className={`text-base font-semibold ${textClasses[variant]}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};
