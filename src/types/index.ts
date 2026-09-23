export type PostStatus = 'Pending' | 'Approved' | 'Published' | 'Rejected';

export interface Post {
  id: string;
  date: string;
  title: string;
  caption: string;
  status: PostStatus;
  img: string;
  hashtags: string;
}

export interface BusinessInfo {
  id?: string | number;
  name?: string;
  email?: string;
}

export interface OfferInfo {
  offer_text?: string;
  text?: string;
  end_date?: string;
  date?: string;
  start_date?: string;
}

export interface DashboardData {
  success?: boolean;
  message?: string;
  business?: BusinessInfo;
  offer?: OfferInfo;
  posts?: Post[];
  total_posts?: number;
  pending_count?: number;
  published_count?: number;
  monthly_usage?: number;
}

export interface UserSession {
  token: string;
  clientId: string;
  expiresAt: string;
  email?: string;
}

export interface ApiEndpoints {
  baseUrl: string;
  loginUrl: string;
  dashboardUrl: string;
  offerUrl: string;
  approveUrl: string;
  regenerateUrl: string;
  createPostUrl: string;
}
