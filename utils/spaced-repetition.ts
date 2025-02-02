// SuperMemo 2 Algorithm Implementation
// Based on https://github.com/ankidroid/Anki-Android

const INITIAL_EASE_FACTOR = 2.5;
const MINIMUM_EASE_FACTOR = 1.3;
const EASE_BONUS = 0.15;
const MINIMUM_INTERVAL = 1; // 1 day
const GRADUATING_INTERVAL = 1; // 1 day
const EASY_INTERVAL = 4; // 4 days
const MAXIMUM_INTERVAL = 36500; // 100 years

interface ReviewResult {
  interval: number;      // Next interval in days
  easeFactor: number;    // New ease factor
  repetitions: number;   // Number of times card has been successfully reviewed
  status: 'new' | 'learning' | 'review' | 'relearning';
  nextReview: Date;      // Next review date
}

/**
 * Calculate next review schedule using SM2 algorithm with dynamic adjustments
 * @param quality Rating from 0-5 (0=blackout, 5=perfect)
 * @param previousInterval Current interval in days
 * @param previousEaseFactor Current ease factor
 * @param previousRepetitions Number of times card has been successfully reviewed
 * @param currentStatus Current learning status of the card
 * @returns Next review schedule
 */
export function calculateNextReview(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number = INITIAL_EASE_FACTOR,
  previousRepetitions: number = 0,
  currentStatus: 'new' | 'learning' | 'review' | 'relearning' = 'new'
): ReviewResult {
  // Initialize variables
  let interval = previousInterval;
  let easeFactor = previousEaseFactor;
  let repetitions = previousRepetitions;
  let status = currentStatus;

  // Handle failed reviews (quality < 3)
  if (quality < 3) {
    repetitions = 0;

    // Card goes back to learning or relearning
    if (currentStatus === 'review') {
      status = 'relearning';
      // Retain a fraction of the previous interval for smoother transitions
      interval = Math.max(MINIMUM_INTERVAL, Math.round(previousInterval * 0.5));
    } else {
      status = 'learning';
      interval = MINIMUM_INTERVAL;
    }

    // Decrease ease factor but not below minimum
    easeFactor = Math.max(
      MINIMUM_EASE_FACTOR,
      previousEaseFactor - 0.2 - (3 - quality) * 0.1 // More aggressive penalty for lower ratings
    );
  }
  // Handle successful reviews (quality >= 3)
  else {
    repetitions++;

    // Calculate new ease factor with dynamic adjustment
    const qualityBonus = (quality - 3) * EASE_BONUS * (1 + repetitions * 0.05); // Scale bonus with repetitions
    easeFactor = Math.max(
      MINIMUM_EASE_FACTOR,
      previousEaseFactor + qualityBonus
    );

    // Calculate new interval based on card status
    if (currentStatus === 'new' || currentStatus === 'learning') {
      // Graduated learning progression
      if (quality === 5) {
        // Easy rating on new/learning card
        interval = Math.max(GRADUATING_INTERVAL, Math.round(previousInterval * 2)); // Scale interval dynamically
        status = 'review';
      } else {
        // Normal graduation
        interval = GRADUATING_INTERVAL;
        status = 'review';
      }
    } else if (currentStatus === 'relearning') {
      // Return to review status with smoothed interval
      interval = Math.max(MINIMUM_INTERVAL, Math.round(previousInterval * 0.75)); // Retain 75% of previous interval
      status = 'review';
    } else {
      // Regular review - calculate next interval
      interval = Math.round(previousInterval * easeFactor);
      status = 'review';
    }
  }

  // Ensure interval is within bounds
  interval = Math.min(Math.max(interval, MINIMUM_INTERVAL), MAXIMUM_INTERVAL);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    status,
    nextReview,
  };
}

/**
 * Convert quality rating from 1-3 scale to 0-5 scale
 * @param rating Rating on 1-3 scale (1=hard, 2=good, 3=easy)
 * @returns Rating on 0-5 scale
 */
export function convertRating(rating: number): number {
  switch (rating) {
    case 1: // Hard
      return 2;
    case 2: // Good
      return 3;
    case 3: // Easy
      return 4;
    default:
      return 3;
  }
} 