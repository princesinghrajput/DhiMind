import { Drawer } from 'expo-router/drawer';
import { useColorScheme, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
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
      <Drawer.Screen
        name="study"
        options={{ headerShown: false, drawerStyle:{display:'none'}}}
      />
    </Drawer>
  );
} 