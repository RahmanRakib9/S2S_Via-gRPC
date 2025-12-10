import path from 'path';
import dotenv from 'dotenv';
import process from 'process';
import mongoose from 'mongoose';
import { Product as ProductType } from '../types/product.types';
import { Product, IProduct } from '../models/product.model';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.development';
const envPath = path.join(process.cwd(), envFile);
dotenv.config({ path: envPath });

// Database configuration
const config = {
  database_url: process.env.MONGODB_URI || 'mongodb://localhost:27017/product',
  env: process.env.NODE_ENV || 'development',
};

export default config;

const MONGODB_URI = config.database_url;

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Seed dummy products if database is empty
    await seedDummyProducts();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

/**
 * Convert MongoDB document to Product type
 */
const toProductType = (product: IProduct | any): ProductType => {
  const id = product._id ? product._id.toString() : product.id;
  return {
    id,
    name: product.name,
    price: product.price,
    description: product.description,
    category: product.category,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Seed dummy products if database is empty
 */
const seedDummyProducts = async (): Promise<void> => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const dummyProducts = [
        {
          name: 'Laptop Pro 15',
          price: 1299.99,
          description: 'High-performance laptop with 16GB RAM and 512GB SSD',
          category: 'Electronics',
        },
        {
          name: 'Wireless Headphones',
          price: 199.99,
          description: 'Premium noise-cancelling wireless headphones',
          category: 'Electronics',
        },
        {
          name: 'Cotton T-Shirt',
          price: 29.99,
          description: 'Comfortable 100% cotton t-shirt',
          category: 'Clothing',
        },
        {
          name: 'Denim Jeans',
          price: 79.99,
          description: 'Classic fit denim jeans',
          category: 'Clothing',
        },
        {
          name: 'The Great Gatsby',
          price: 12.99,
          description: 'Classic American novel by F. Scott Fitzgerald',
          category: 'Books',
        },
        {
          name: 'JavaScript: The Definitive Guide',
          price: 49.99,
          description: 'Comprehensive guide to JavaScript programming',
          category: 'Books',
        },
        {
          name: 'Organic Coffee Beans',
          price: 24.99,
          description: 'Premium organic coffee beans, 1kg',
          category: 'Food',
        },
        {
          name: 'Dark Chocolate Bar',
          price: 8.99,
          description: '70% dark chocolate, 200g',
          category: 'Food',
        },
        {
          name: 'Yoga Mat',
          price: 34.99,
          description: 'Non-slip yoga mat with carrying strap',
          category: 'Sports',
        },
        {
          name: 'Running Shoes',
          price: 119.99,
          description: 'Lightweight running shoes with cushioned sole',
          category: 'Sports',
        },
      ];

      await Product.insertMany(dummyProducts);
      console.log(`✅ Seeded ${dummyProducts.length} dummy products`);
    }
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};

/**
 * Find product by ID
 * @param id - Product ID
 * @returns Product or undefined
 */
export const findProductById = async (id: string): Promise<ProductType | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  const product = await Product.findById(id).lean();
  return product ? toProductType(product) : undefined;
};

/**
 * Find all products
 * @returns Array of products
 */
export const findAllProducts = async (): Promise<ProductType[]> => {
  const products = await Product.find().lean().sort({ createdAt: -1 });
  return products.map(toProductType);
};

/**
 * Find products by category
 * @param category - Product category
 * @returns Array of products
 */
export const findProductsByCategory = async (category: string): Promise<ProductType[]> => {
  const products = await Product.find({ category }).lean().sort({ createdAt: -1 });
  return products.map(toProductType);
};

/**
 * Create a new product
 * @param productData - Product data
 * @returns Created product
 */
export const createProduct = async (
  productData: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductType> => {
  const product = new Product({
    name: productData.name,
    price: productData.price,
    description: productData.description,
    category: productData.category,
  });
  const savedProduct = await product.save();
  return toProductType(savedProduct);
};

/**
 * Update product by ID
 * @param id - Product ID
 * @param updateData - Update data
 * @returns Updated product or undefined
 */
export const updateProduct = async (
  id: string,
  updateData: Partial<Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ProductType | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  const product = await Product.findByIdAndUpdate(id, updateData, { new: true, lean: true });
  return product ? toProductType(product) : undefined;
};

/**
 * Delete product by ID
 * @param id - Product ID
 * @returns True if deleted, false otherwise
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  const result = await Product.findByIdAndDelete(id);
  return !!result;
};


