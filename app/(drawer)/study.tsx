import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  type: 'basic' | 'cloze';
  clozeText?: string;
}

const sampleCards: FlashCard[] = [
  {
    id: '1',
    type: 'basic',
    front: 'What is Typography?',
    back: 'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.',
  },
  {
    id: '2',
    type: 'cloze',
    front: '',
    back: '',
    clozeText: '{{c1::Kerning}} is the process of adjusting the spacing between characters in a proportional font, usually to achieve a visually pleasing result.',
  },
];

export default function StudyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flipValue = useSharedValue(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);

  const currentCard = sampleCards[currentCardIndex];

  const handleFlip = () => {
    const toValue = isShowingAnswer ? 0 : 1;
    flipValue.value = withSequence(
      withTiming(toValue, { duration: 300 }),
    );
    setIsShowingAnswer(!isShowingAnswer);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipValue.value,
      [0, 1],
      [0, 180]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipValue.value,
      [0, 1],
      [180, 360]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const renderCardContent = () => {
    if (!currentCard) return null;

    if (currentCard.type === 'basic') {
      return (
        <View style={styles.basicCardContent}>
          <Text style={[styles.cardLabel, { color: isDark ? '#aaa' : '#666' }]}>
            {isShowingAnswer ? 'Answer' : 'Question'}
          </Text>
          <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
            {isShowingAnswer ? currentCard.back : currentCard.front}
          </Text>
        </View>
      );
    }

    // Handle cloze card
    if (currentCard.type === 'cloze' && currentCard.clozeText) {
      const clozeText = currentCard.clozeText;
      const parts = clozeText.split(/({{c1::.*?}})/g).filter(Boolean);

      return (
        <View style={styles.clozeCardContent}>
          <Text style={[styles.cardLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Fill in the blank
          </Text>
          <View style={styles.clozeTextContainer}>
            <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
              {parts.map((part, index) => {
                const clozeMatch = part.match(/{{c1::(.*?)}}/);
                if (clozeMatch) {
                  if (isShowingAnswer) {
                    return (
                      <Text key={index} style={[
                        styles.highlightedCloze,
                        { backgroundColor: isDark ? '#6c5ce730' : '#6c5ce715' }
                      ]}>
                        {clozeMatch[1]}
                      </Text>
                    );
                  }
                  return (
                    <View key={index} style={styles.blankContainer}>
                      <Text style={[styles.clozeBlank, { 
                        borderBottomColor: isDark ? '#666' : '#ddd',
                        color: isDark ? '#666' : '#999'
                      }]}>
                        _____
                      </Text>
                    </View>
                  );
                }
                return <Text key={index}>{part}</Text>;
              })}
            </Text>
          </View>
          {!isShowingAnswer && (
            <Text style={[styles.hintText, { color: isDark ? '#aaa' : '#666' }]}>
              Tap to reveal the answer
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  const handleResponse = (quality: number) => {
    if (currentCardIndex < sampleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsShowingAnswer(false);
      flipValue.value = 0;
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={styles.progress}>
        <Text style={[styles.progressText, { color: isDark ? '#fff' : '#000' }]}>
          {currentCardIndex + 1} / {sampleCards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={handleFlip} 
          style={styles.cardWrapper}
        >
          <Animated.View 
            style={[
              styles.card, 
              frontAnimatedStyle, 
              { 
                backgroundColor: isDark ? '#1a1b1e' : '#fff',
                borderColor: isDark ? '#333' : '#eee',
              }
            ]}
          >
            {renderCardContent()}
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.card, 
              styles.cardBack, 
              backAnimatedStyle, 
              { 
                backgroundColor: isDark ? '#1a1b1e' : '#fff',
                borderColor: isDark ? '#333' : '#eee',
              }
            ]}
          >
            {renderCardContent()}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isShowingAnswer && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ff6b6b' }]}
            onPress={() => handleResponse(1)}
          >
            <Text style={styles.buttonText}>Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ffd93d' }]}
            onPress={() => handleResponse(2)}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#6c5ce7' }]}
            onPress={() => handleResponse(3)}
          >
            <Text style={styles.buttonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#51cf66' }]}
            onPress={() => handleResponse(4)}
          >
            <Text style={styles.buttonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isShowingAnswer && (
        <View style={styles.hint}>
          <Ionicons name="finger-print-outline" size={24} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.hintText, { color: isDark ? '#fff' : '#000' }]}>
            Tap to reveal answer
          </Text>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardWrapper: {
    width: width - 48,
    height: height * 0.45,
    position: 'relative',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  basicCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clozeCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  clozeTextContainer: {
    backgroundColor: '#00000008',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
  },
  cardText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  blankContainer: {
    display: 'inline',
  },
  highlightedCloze: {
    color: '#6c5ce7',
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  clozeBlank: {
    borderBottomWidth: 2,
    paddingHorizontal: 20,
    fontWeight: '500',
    fontSize: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 16,
  },
});