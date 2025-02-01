import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'flat';
}

export function Card({ style, variant = 'default', ...props }: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        variant === 'default' && SHADOWS.light,
        {
          backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
}); 