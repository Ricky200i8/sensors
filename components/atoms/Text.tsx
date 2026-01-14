import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
    variant?: 'header' | 'body' | 'caption';
    className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'body', className, ...props }) => {
    const variantClasses = {
        header: 'text-2xl font-bold text-black mb-2',
        body: 'text-base text-gray-800',
        caption: 'text-xs text-gray-600',
    };

    return (
        <RNText className={`${variantClasses[variant]} ${className || ''}`} {...props}>
            {children}
        </RNText>
    );
};
