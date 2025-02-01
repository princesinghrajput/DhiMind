import { apiClient, setAuthToken } from './api.client';
import { storeToken, storeUserData, clearAuthData, getStoredUserData } from './storage.service';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  bio?: string;
  avatar?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  name: string;
}

// Store auth data
const storeAuthData = async (user: User) => {
  try {
    await Promise.all([
      storeToken(user.token),
      storeUserData(user)
    ]);
    setAuthToken(user.token);
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

// Initialize auth state
export const initializeAuth = async () => {
  const token = await getStoredUserData();
  if (token) {
    setAuthToken(token.token);
  }
};

// Login
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const { data } = await apiClient.post('/auth/login', credentials);
    await storeAuthData(data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Signup
export const signup = async (credentials: SignupCredentials): Promise<User> => {
  try {
    const { data } = await apiClient.post('/auth/signup', credentials);
    await storeAuthData(data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await clearAuthData();
    setAuthToken(null);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  return await getStoredUserData();
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<Omit<User, '_id' | 'token'>>, avatarUri?: string): Promise<User> => {
  try {
    const formData = new FormData();

    // Add profile data
    (Object.keys(profileData) as Array<keyof typeof profileData>).forEach(key => {
      if (key !== 'avatar' && profileData[key] !== undefined) {
        formData.append(key, profileData[key] as string);
      }
    });

    // Add avatar if provided
    if (avatarUri) {
      const filename = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('avatar', {
        uri: avatarUri,
        name: filename,
        type,
      } as any);
    }

    const { data } = await apiClient.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};
