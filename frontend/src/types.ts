
export interface Confession {
  id: number;
  title: string | null;
  content: string;
  category: string;
  createdAt: string;
  reactionLoveCount: number;
  reactionFunnyCount: number;
  reactionSadCount: number;
  reactionFireCount: number;
  status?: string;
  screeningFlags?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}
