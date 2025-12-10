export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}


