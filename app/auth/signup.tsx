import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { signup } from '../../services/auth.service';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const handleSignup = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Call signup service
      await signup({ name, email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.response?.data?.message || 'Error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background }
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/login-img.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDark ? COLORS.dark.text : COLORS.light.text }
          ]}>
            Create Account
          </Text>
          <Text style={[
            styles.subtitle,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
          ]}>
            Join our community of learners
          </Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
          ]}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? COLORS.dark.text : COLORS.light.text }
              ]}
              placeholder="Full Name"
              placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
          ]}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? COLORS.dark.text : COLORS.light.text }
              ]}
              placeholder="Email"
              placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
          ]}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? COLORS.dark.text : COLORS.light.text }
              ]}
              placeholder="Password"
              placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
          ]}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </View>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? COLORS.dark.text : COLORS.light.text }
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.showPasswordButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.signupButtonIcon} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
            <Text style={[
              styles.dividerText,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
            ]}>
              or sign up with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
              ]}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
              ]}
            >
              <Ionicons name="logo-apple" size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }
              ]}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
            ]}>
              Already have an account?{' '}
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 100,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 60,
    ...SHADOWS.medium,
  },
  inputIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    height: '100%',
  },
  showPasswordButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  signupButtonIcon: {
    marginLeft: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    marginHorizontal: SPACING.xs,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  footerText: {
    fontSize: FONTS.sizes.md,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
}); 