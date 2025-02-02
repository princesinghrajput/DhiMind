import { apiClient } from './api.client';

export interface Deck {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    title: string;
    icon: string;
  };
  totalCards: number;
  lastStudied?: Date;
  dueCards: number;
  retention: number;
  isPublic: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateDeckData {
  title: string;
  description?: string;
  category: string;
  isPublic?: boolean;
}

interface UpdateDeckData {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

interface UpdateStatsData {
  totalCards?: number;
  dueCards?: number;
  retention?: number;
}

// Get all decks (optionally filtered by category)
export const getDecks = async (categoryId?: string): Promise<Deck[]> => {
  try {
    const url = categoryId ? `/decks?category=${categoryId}` : '/decks';
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    console.error('Get decks error:', error);
    throw error;
  }
};

// Get public decks
export const getPublicDecks = async (): Promise<Deck[]> => {
  try {
    const { data } = await apiClient.get('/decks/public');
    return data;
  } catch (error) {
    console.error('Get public decks error:', error);
    throw error;
  }
};

// Get single deck
export const getDeck = async (id: string): Promise<Deck> => {
  try {
    const { data } = await apiClient.get(`/decks/${id}`);
    return data;
  } catch (error) {
    console.error('Get deck error:', error);
    throw error;
  }
};

// Create new deck
export const createDeck = async (deckData: CreateDeckData): Promise<Deck> => {
  try {
    const { data } = await apiClient.post('/decks', deckData);
    return data;
  } catch (error) {
    console.error('Create deck error:', error);
    throw error;
  }
};

// Update deck
export const updateDeck = async (id: string, deckData: UpdateDeckData): Promise<Deck> => {
  try {
    const { data } = await apiClient.put(`/decks/${id}`, deckData);
    return data;
  } catch (error) {
    console.error('Update deck error:', error);
    throw error;
  }
};

// Delete deck
export const deleteDeck = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/decks/${id}`);
  } catch (error) {
    console.error('Delete deck error:', error);
    throw error;
  }
};

// Update deck stats
export const updateDeckStats = async (id: string, statsData: UpdateStatsData): Promise<Deck> => {
  try {
    const { data } = await apiClient.patch(`/decks/${id}/stats`, statsData);
    return data;
  } catch (error) {
    console.error('Update deck stats error:', error);
    throw error;
  }
}; 