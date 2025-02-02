import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import { createCard, Card } from '../services/card.service';

interface AddCardModalProps {
  visible: boolean;
  deckId: string;
  onClose: () => void;
  onSuccess: (card: Card) => void;
}

export default function AddCardModal({ visible, deckId, onClose, onSuccess }: AddCardModalProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Error', 'Please fill in both front and back of the card');
      return;
    }

    setSubmitting(true);
    try {
      const newCard = await createCard({
        front: front.trim(),
        back: back.trim(),
        deckId,
      });
      onSuccess(newCard);
      setFront('');
      setBack('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFront('');
    setBack('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Front *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={front}
                onChangeText={setFront}
                placeholder="Enter the front of the card"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Back *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={back}
                onChangeText={setBack}
                placeholder="Enter the back of the card"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!front.trim() || !back.trim()) && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={!front.trim() || !back.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  createButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 