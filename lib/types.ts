export type Team = 'Turing' | 'Asgard';

export type MRItem = {
  id: string;
  mr: string;
  dev: string;
  team: Team;
  addedAt: string;
  current: boolean;
};

export type HistoryItem = MRItem & {
  doneAt: string;
};
