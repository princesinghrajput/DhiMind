/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    textSecondary: '#666',
    textTertiary: '#999',
    background: '#f5f5f5',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#007AFF',
    white: '#FFFFFF',
    border: '#E5E5E5',
  },
  dark: {
    text: '#fff',
    textSecondary: '#aaa',
    textTertiary: '#666',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#0A84FF',
    white: '#FFFFFF',
    border: '#333333',
  },
};

// Get the current theme's colors
const isDarkMode = false; // You can make this dynamic based on the system theme
export default Colors[isDarkMode ? 'dark' : 'light'];
