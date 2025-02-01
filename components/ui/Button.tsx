import { TouchableOpacity, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
}

export function Button({
  style,
  variant = 'filled',
  size = 'medium',
  leftIcon,
  rightIcon,
  title,
  color = COLORS.primary,
  disabled,
  ...props
}: ButtonProps) {
  const getContainerStyle = () => {
    const baseStyle = [styles.container, getSizeStyle()];

    switch (variant) {
      case 'outline':
        return [
          ...baseStyle,
          {
            borderWidth: 1,
            borderColor: color,
            backgroundColor: 'transparent',
          },
        ];
      case 'ghost':
        return [...baseStyle, { backgroundColor: 'transparent' }];
      default:
        return [...baseStyle, { backgroundColor: color }, SHADOWS.light];
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getTextColor = () => {
    if (disabled) return '#999';
    return variant === 'filled' ? '#fff' : color;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), disabled && styles.disabled, style]}
      disabled={disabled}
      {...props}
    >
      <View style={styles.content}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={getIconSize()}
            color={getTextColor()}
            style={styles.leftIcon}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: size === 'small' ? FONTS.sizes.sm : FONTS.sizes.md,
            },
          ]}
          weight="semibold"
        >
          {title}
        </Text>
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={getIconSize()}
            color={getTextColor()}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 