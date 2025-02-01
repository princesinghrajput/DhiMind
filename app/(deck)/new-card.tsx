import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NewCardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    // Here you would implement the save logic
    // For MVP, we'll just go back
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Front of Card */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>
              Front
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1a1b1e' : '#fff',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              value={front}
              onChangeText={setFront}
              placeholder="Enter the question"
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Back of Card */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>
              Back
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.backInput,
                {
                  backgroundColor: isDark ? '#1a1b1e' : '#fff',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              value={back}
              onChangeText={setBack}
              placeholder="Enter the answer"
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>
              Tags (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1a1b1e' : '#fff',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              value={tags}
              onChangeText={setTags}
              placeholder="Add tags separated by commas"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={[styles.previewTitle, { color: isDark ? '#fff' : '#000' }]}>
              Preview
            </Text>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: isDark ? '#1a1b1e' : '#fff' },
              ]}
            >
              <Text style={[styles.previewText, { color: isDark ? '#fff' : '#000' }]}>
                {front || 'Question will appear here'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: isDark ? '#fff' : '#000' }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Card</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backInput: {
    minHeight: 120,
  },
  previewSection: {
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 