import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=John+Doe&size=200');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Implement profile update logic
      // await updateUserProfile({ name, email, bio, avatar });
      router.back();
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }
      ]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? COLORS.dark.text : COLORS.light.text}
          />
        </TouchableOpacity>
        <Text style={[
          styles.title,
          { color: isDark ? COLORS.dark.text : COLORS.light.text }
        ]}>
          Edit Profile
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatar }}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={[
            styles.changePhotoButton,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
          ]}
          onPress={handleImagePick}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={[styles.changePhotoText, { color: COLORS.primary }]}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Name Input */}
        <View style={[
          styles.inputContainer,
          { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
        ]}>
          <Text style={[
            styles.inputLabel,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
          ]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: isDark ? COLORS.dark.text : COLORS.light.text }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
          />
        </View>

        {/* Email Input */}
        <View style={[
          styles.inputContainer,
          { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
        ]}>
          <Text style={[
            styles.inputLabel,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
          ]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: isDark ? COLORS.dark.text : COLORS.light.text }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Bio Input */}
        <View style={[
          styles.inputContainer,
          { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
        ]}>
          <Text style={[
            styles.inputLabel,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
          ]}>
            Bio
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.bioInput,
              { color: isDark ? COLORS.dark.text : COLORS.light.text }
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING.md,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  changePhotoText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  form: {
    gap: SPACING.lg,
  },
  inputContainer: {
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    fontSize: FONTS.sizes.md,
    paddingVertical: SPACING.xs,
  },
  bioInput: {
    height: 100,
    paddingTop: SPACING.xs,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
}); 