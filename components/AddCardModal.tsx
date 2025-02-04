import { useState, useRef } from 'react';
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
  ScrollView,
} from 'react-native';
import Colors from '../constants/Colors';
import { createCard, Card } from '../services/card.service';
import { Ionicons } from '@expo/vector-icons';

interface AddCardModalProps {
  visible: boolean;
  deckId: string;
  onClose: () => void;
  onSuccess: (card: Card) => void;
}

export default function AddCardModal({ visible, deckId, onClose, onSuccess }: AddCardModalProps) {
  const [cardType, setCardType] = useState<'standard' | 'cloze'>('standard');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [clozeText, setClozeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textInputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (cardType === 'standard') {
        if (!front.trim()) {
          Alert.alert('Error', 'Please enter the front of the card');
          return;
        }
        if (!back.trim()) {
          Alert.alert('Error', 'Please enter the back of the card');
          return;
        }
      } else if (cardType === 'cloze') {
        if (!clozeText.trim()) {
          Alert.alert('Error', 'Please enter text for the cloze card');
          return;
        }
        if (!clozeText.includes('{{c1::')) {
          Alert.alert('Error', 'Please add at least one cloze deletion');
          return;
        }
      }

      if (!deckId) {
        Alert.alert('Error', 'Invalid deck selected');
        return;
      }

      setSubmitting(true);

      const cardData = {
        type: cardType,
        front: cardType === 'standard' ? front.trim() : '',
        back: cardType === 'standard' ? back.trim() : '',
        clozeText: cardType === 'cloze' ? clozeText.trim() : undefined,
        deckId,
      };

      console.log('Creating card with data:', cardData);
      const newCard = await createCard(cardData);
      console.log('Card created successfully:', newCard);
      
      onSuccess(newCard);
      handleClose();
    } catch (error: any) {
      console.error('Error creating card:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create card. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFront('');
    setBack('');
    setClozeText('');
    setCardType('standard');
    onClose();
  };

  const handleClozeSelection = () => {
    if (!selectedText) return;

    const prefix = clozeText.substring(0, selectionStart);
    const suffix = clozeText.substring(selectionEnd);
    const newClozeText = `${prefix}{{c1::${selectedText}}}${suffix}`;
    setClozeText(newClozeText);
    setShowSelectionMenu(false);
    
    // Clear selection
    textInputRef.current?.setNativeProps({
      selection: {
        start: selectionStart + 6 + selectedText.length,
        end: selectionStart + 6 + selectedText.length
      }
    });
  };

  const handleSelectionChange = (event: any) => {
    const { selection } = event.nativeEvent;
    const selectedText = clozeText.substring(selection.start, selection.end);
    
    if (selectedText) {
      // Get the layout of the text input
      textInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
        // Calculate position for the menu
        const selectionMidpoint = pageX + (width * (selection.start + selection.end) / (2 * clozeText.length));
        setMenuPosition({
          x: selectionMidpoint,
          y: pageY - 40 // Position menu above the text
        });
        setShowSelectionMenu(true);
      });
      
      setSelectedText(selectedText);
      setSelectionStart(selection.start);
      setSelectionEnd(selection.end);
    } else {
      setShowSelectionMenu(false);
    }
  };

  const renderClozePreview = () => {
    if (!clozeText) return null;

    const previewText = clozeText.replace(/{{c1::(.*?)}}/g, (_, text) => {
      return `[${text}]`;
    });

    const hasValidCloze = clozeText.includes('{{c1::');

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewQuestion}>
            Question:
            <Text style={styles.previewText}>
              {clozeText.replace(/{{c1::(.*?)}}/g, '______')}
            </Text>
          </Text>
          <View style={styles.previewDivider} />
          <Text style={styles.previewAnswer}>
            Answer:
            <Text style={styles.previewText}>
              {previewText}
            </Text>
          </Text>
        </View>
        {!hasValidCloze && clozeText.trim() !== '' && (
          <Text style={styles.warningText}>
            No cloze deletions found. Select text and use "Make Cloze" to create them.
          </Text>
        )}
      </View>
    );
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
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <View style={styles.cardTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.cardTypeButton,
                    cardType === 'standard' && styles.cardTypeButtonActive,
                  ]}
                  onPress={() => setCardType('standard')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'standard' && styles.cardTypeTextActive,
                  ]}>Standard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cardTypeButton,
                    cardType === 'cloze' && styles.cardTypeButtonActive,
                  ]}
                  onPress={() => setCardType('cloze')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'cloze' && styles.cardTypeTextActive,
                  ]}>Cloze</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollView}>
              {cardType === 'standard' ? (
                <>
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
                </>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Text with Cloze Deletions *</Text>
                  <TextInput
                    ref={textInputRef}
                    style={[styles.input, styles.textArea]}
                    value={clozeText}
                    onChangeText={setClozeText}
                    onSelectionChange={handleSelectionChange}
                    placeholder="Enter text and select words to create cloze deletions"
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    autoFocus
                  />
                  {showSelectionMenu && (
                    <View style={[
                      styles.selectionMenu,
                      {
                        left: menuPosition.x,
                        top: menuPosition.y
                      }
                    ]}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleClozeSelection}
                      >
                        <Ionicons name="create-outline" size={16} color={Colors.primary} />
                        <Text style={styles.menuItemText}>Make Cloze</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {renderClozePreview()}
                  <Text style={styles.helperText}>
                    Select text to create a cloze deletion
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Save</Text>
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
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    height: '90%',
  },
  header: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  cardTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  cardTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  cardTypeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  clozeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  clozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clozeButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  submitButtonText: {
    color: '#fff',
  },
  selectionMenu: {
    position: 'absolute',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  menuItemText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  previewContainer: {
    marginTop: 16,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  previewQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  previewAnswer: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  previewText: {
    fontWeight: '400',
    marginLeft: 8,
  },
  previewDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  warningText: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 4,
  },
});