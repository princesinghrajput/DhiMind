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
  Image,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    try {
      setLoading(true);
      // TODO: Implement login logic
      // const response = await loginUser(email, password);
      // router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
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
            Welcome Back
          </Text>
          <Text style={[
            styles.subtitle,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
          ]}>
            Sign in to continue your learning journey
          </Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={[
              styles.forgotPasswordText,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
            ]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.loginButtonIcon} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
            <Text style={[
              styles.dividerText,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }
            ]}>
              or continue with
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
              Don't have an account?{' '}
            </Text>
            <Link href="/auth/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  loginButtonIcon: {
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
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.sizes.md,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
}); 