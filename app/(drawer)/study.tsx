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
}

const sampleCards: FlashCard[] = [
  {
    id: '1',
    front: 'What is Typography?',
    back: 'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.',
  },
  {
    id: '2',
    front: 'What is kerning in typography?',
    back: 'Kerning is the process of adjusting the spacing between characters in a proportional font, usually to achieve a visually pleasing result.',
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

  const handleResponse = (quality: number) => {
    // Here you would implement spaced repetition algorithm
    // For MVP, we'll just move to the next card
    if (currentCardIndex < sampleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsShowingAnswer(false);
      flipValue.value = 0;
    } else {
      // Session complete
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
        <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={styles.cardWrapper}>
          <Animated.View style={[styles.card, frontAnimatedStyle, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
            <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
              {currentCard.front}
            </Text>
          </Animated.View>
          
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
            <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
              {currentCard.back}
            </Text>
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
    alignItems: 'center',
    padding: 16,
  },
  progress: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardContainer: {
    width: width - 32,
    height: height * 0.5,
    marginBottom: 24,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  hintText: {
    marginLeft: 8,
    fontSize: 16,
  },
}); 