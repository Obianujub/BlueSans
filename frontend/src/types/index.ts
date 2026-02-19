export interface Artisan {
  id: string;
  name: string;
  phone: string;
  location: string;
  job_type: string;
  photo_url?: string;
  status: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface ArtisanCreate {
  name: string;
  phone: string;
  location: string;
  job_type: string;
  photo_url?: string;
}

export interface Review {
  id: string;
  artisan_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewCreate {
  artisan_id: string;
  user_name: string;
  rating: number;
  comment: string;
}

export interface WorkerSubmission {
  id: string;
  name: string;
  phone: string;
  location: string;
  job_type: string;
  status: string;
  submitted_at: string;
}

export interface WorkerSubmissionCreate {
  name: string;
  phone: string;
  location: string;
  job_type: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  username: string;
}

export interface JobTypesResponse {
  job_types: string[];
}
