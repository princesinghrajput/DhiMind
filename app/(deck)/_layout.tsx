import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function DeckLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1a1b1e' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#f5f5f5',
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Deck Details',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="new-card"
        options={{
          title: 'Add New Card',
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit-card"
        options={{
          title: 'Edit Card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 