import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserProfile, logout } from '@/services/auth.service';

const settingsOptions = [
  { id: 'notifications', title: 'Notifications', icon: 'notifications' },
  { id: 'appearance', title: 'Appearance', icon: 'color-palette' },
  { id: 'language', title: 'Language', icon: 'language' },
  { id: 'backup', title: 'Backup & Sync', icon: 'cloud-upload' },
  { id: 'privacy', title: 'Privacy', icon: 'shield-checkmark' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&size=200`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <Image
          source={{ uri: userProfile?.avatar || defaultAvatar }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
          {userProfile?.name || user?.name}
        </Text>
        <Text style={[styles.email, { color: isDark ? '#aaa' : '#666' }]}>
          {userProfile?.email || user?.email}
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>156</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Cards Created</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>23</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Days Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>89%</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Success Rate</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Settings</Text>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.settingItem, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name={option.icon as any}
                size={24}
                color="#6c5ce7"
                style={styles.settingIcon}
              />
              <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                {option.title}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={24} color="#ff6b6b" style={styles.logoutIcon} />
        <Text style={[styles.logoutText, { color: '#ff6b6b' }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  settingsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 