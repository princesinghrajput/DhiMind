import { apiClient } from './api.client';

export interface Card {
  _id: string;
  front: string;
  back: string;
  type: 'standard' | 'cloze' | 'fill_blank' | 'image_mask' | 'bidirectional' | 'optional_reverse';
  clozeText?: string;  // Full text with cloze markers {{c1::text}}
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
  type: 'standard' | 'cloze' | 'fill_blank' | 'image_mask' | 'bidirectional' | 'optional_reverse';
  clozeText?: string;
  deckId: string;
}

// Get all cards in a deck
export const getDeckCards = async (deckId: string): Promise<Card[]> => {
  try {
    if (!deckId) {
      throw new Error('Deck ID is required');
    }
    const { data } = await apiClient.get(`/cards/deck/${deckId}`);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Get deck cards error:', error);
    if (error.response?.status === 404) {
      return []; // Return empty array if deck not found
    }
    throw new Error(error.response?.data?.message || 'Failed to get deck cards');
  }
};

// Get due cards in a deck
export const getDueCards = async (deckId: string): Promise<Card[]> => {
  try {
    if (!deckId) {
      throw new Error('Deck ID is required');
    }
    const { data } = await apiClient.get(`/cards/deck/${deckId}/due`);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Get due cards error:', error);
    if (error.response?.status === 404) {
      return []; // Return empty array if deck not found
    }
    throw new Error(error.response?.data?.message || 'Failed to get due cards');
  }
};

// Create new card
export const createCard = async (cardData: CreateCardData): Promise<Card> => {
  try {
    // Validate required fields
    if (!cardData.deckId) {
      throw new Error('Deck ID is required');
    }

    if (cardData.type === 'standard') {
      if (!cardData.front?.trim()) {
        throw new Error('Front of card is required');
      }
      if (!cardData.back?.trim()) {
        throw new Error('Back of card is required');
      }
    } else if (cardData.type === 'cloze') {
      if (!cardData.clozeText?.trim()) {
        throw new Error('Cloze text is required');
      }
      if (!cardData.clozeText.includes('{{c1::')) {
        throw new Error('Cloze text must contain at least one cloze deletion');
      }
    }

    // Create the card
    const { data } = await apiClient.post('/cards', {
      ...cardData,
      front: cardData.front?.trim(),
      back: cardData.back?.trim(),
      clozeText: cardData.clozeText?.trim(),
    });

    return data;
  } catch (error: any) {
    console.error('Create card error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create card'
    );
  }
};

// Update card
export const updateCard = async (id: string, front: string, back: string): Promise<Card> => {
  try {
    if (!id) {
      throw new Error('Card ID is required');
    }
    const { data } = await apiClient.put(`/cards/${id}`, { 
      front: front.trim(), 
      back: back.trim() 
    });
    return data;
  } catch (error: any) {
    console.error('Update card error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update card');
  }
};

// Delete card
export const deleteCard = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Card ID is required');
    }
    await apiClient.delete(`/cards/${id}`);
  } catch (error: any) {
    console.error('Delete card error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete card');
  }
};

// Update card review status
export const updateCardReview = async (id: string, quality: number, reviewData: ReviewData): Promise<Card> => {
  try {
    if (!id) {
      throw new Error('Card ID is required');
    }
    const { data } = await apiClient.patch(`/cards/${id}/review`, {
      quality,
      needsMorePractice: quality <= 3,
      lastRating: quality,
      ...reviewData
    });
    return data;
  } catch (error: any) {
    console.error('Update card review error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update card review');
  }
};