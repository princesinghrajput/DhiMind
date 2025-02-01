import { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
          },
          headerTintColor: isDark ? COLORS.dark.text : COLORS.light.text,
          drawerStyle: {
            backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
            width: 280,
          },
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.5)',
          drawerLabelStyle: {
            marginLeft: -16,
            fontSize: 16,
            fontWeight: '500',
          },
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 8,
            marginVertical: 4,
          },
          drawerActiveBackgroundColor: COLORS.primary,
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: isDark ? COLORS.dark.text : COLORS.light.text,
        }}
      >
       <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: ({ focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="home"
                  size={22}
                  color={focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text)}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text),
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <Drawer.Screen
          name="decks"
          options={{
            title: 'My Decks',
            drawerLabel: ({ focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="library"
                  size={22}
                  color={focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text)}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text),
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  My Decks
                </Text>
              </View>
            ),
          }}
        />
        <Drawer.Screen
          name="stats"
          options={{
            title: 'Statistics',
            drawerLabel: ({ focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="stats-chart"
                  size={22}
                  color={focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text)}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text),
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  Statistics
                </Text>
              </View>
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Profile',
            drawerLabel: ({ focused }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="person"
                  size={22}
                  color={focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text)}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: focused ? '#ffffff' : (isDark ? COLORS.dark.text : COLORS.light.text),
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  Profile
                </Text>
              </View>
            ),
          }}
        />
        
      </Drawer>
    </GestureHandlerRootView>
  );
}
