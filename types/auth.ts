// Authentication-related TypeScript types

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface ProtectedApiHeaders {
  Authorization: string;
}