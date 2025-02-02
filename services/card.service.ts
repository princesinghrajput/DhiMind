import { apiClient } from './api.client';

export interface Card {
  _id: string;
  front: string;
  back: string;
  deck: string;
  user: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: 'new' | 'learning' | 'review' | 'relearning';
  lastReviewed?: string;
  lastRating?: number;
  needsMorePractice?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCardData {
  front: string;
  back: string;
  deckId: string;
}

interface ReviewData {
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: 'new' | 'learning' | 'review' | 'relearning';
  nextReview: string;
}

// Get all cards in a deck
export const getDeckCards = async (deckId: string): Promise<Card[]> => {
  try {
    const { data } = await apiClient.get(`/cards/deck/${deckId}`);
    return data;
  } catch (error) {
    console.error('Get deck cards error:', error);
    throw error;
  }
};

// Get due cards in a deck
export const getDueCards = async (deckId: string): Promise<Card[]> => {
  try {
    const { data } = await apiClient.get(`/cards/deck/${deckId}/due`);
    return data;
  } catch (error) {
    console.error('Get due cards error:', error);
    throw error;
  }
};

// Create new card
export const createCard = async (cardData: CreateCardData): Promise<Card> => {
  try {
    const { data } = await apiClient.post('/cards', cardData);
    return data;
  } catch (error) {
    console.error('Create card error:', error);
    throw error;
  }
};

// Update card
export const updateCard = async (id: string, front: string, back: string): Promise<Card> => {
  try {
    const { data } = await apiClient.put(`/cards/${id}`, { front, back });
    return data;
  } catch (error) {
    console.error('Update card error:', error);
    throw error;
  }
};

// Delete card
export const deleteCard = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/cards/${id}`);
  } catch (error) {
    console.error('Delete card error:', error);
    throw error;
  }
};

// Update card review status
export const updateCardReview = async (id: string, quality: number, reviewData: ReviewData): Promise<Card> => {
  try {
    const { data } = await apiClient.patch(`/cards/${id}/review`, {
      quality,
      needsMorePractice: quality <= 3,
      lastRating: quality,
      ...reviewData
    });
    return data;
  } catch (error) {
    console.error('Update card review error:', error);
    throw error;
  }
}; 