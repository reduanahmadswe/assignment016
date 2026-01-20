export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyLoginOTPInput {
  email: string;
  otp?: string;
  token?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user?: UserResponse;
  accessToken?: string;
  refreshToken?: string;
  requiresOTP?: boolean;
  otpMethods?: {
    email: boolean;
    authenticator: boolean;
  };
  tempUserId?: number;
}
