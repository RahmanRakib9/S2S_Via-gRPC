export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProfileRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

