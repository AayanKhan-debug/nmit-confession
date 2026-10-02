export interface User {
  username: string;
  role: 'ADMIN' | 'MODERATOR';
}

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
  reactions?: Record<string, number>;
  status?: string;
  screeningFlags?: string[];
  flagExplanations?: Record<string, string>;
  reportCount?: number;
}

export interface AdminReport {
  id: number;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  confessionId: number;
  confessionTitle?: string;
  confessionContent: string;
  confessionCategory: string;
  confessionStatus: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface AuditActivityResponse {
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  username?: string;
}

export interface AdminDashboardResponse {
  pendingConfessions: number;
  flaggedPendingConfessions: number;
  pendingReports: number;
  hiddenConfessions: number;
  publishedConfessions: number;
  rejectedConfessions: number;
  flagCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  recentActivity: AuditActivityResponse[];
}
