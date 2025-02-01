import { Text as RNText, TextProps, useColorScheme, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

interface CustomTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  weight?: keyof typeof FONTS.weights;
  color?: string;
}

export function Text({
  style,
  variant = 'body',
  weight = 'regular',
  color,
  ...props
}: CustomTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold };
      case 'subtitle':
        return { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.semibold };
      case 'caption':
        return { fontSize: FONTS.sizes.xs };
      case 'label':
        return { fontSize: FONTS.sizes.sm };
      default:
        return { fontSize: FONTS.sizes.md };
    }
  };

  return (
    <RNText
      style={[
        {
          color: color || (isDark ? COLORS.dark.text : COLORS.light.text),
          fontWeight: FONTS.weights[weight],
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    />
  );
} 