export type RootStackParamList = {
  '(home)': undefined;
  'decks': undefined;
  'stats': undefined;
  '(deck)': undefined;
};

export type HomeTabParamList = {
  'index': undefined;
  'study': undefined;
  'profile': undefined;
};

export type DeckStackParamList = {
  '[id]': { id: string };
  'new-card': undefined;
  'edit-card': { id: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 