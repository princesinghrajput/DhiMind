import { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/theme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { initializeAuth } from '../services/auth.service';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === 'auth';
      if (!user && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        router.replace('/');
      }
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    );
  }

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

export default function RootLayout() {
  const [loaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize auth state when app starts
    initializeAuth();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
