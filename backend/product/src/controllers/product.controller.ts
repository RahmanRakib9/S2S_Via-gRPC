import { Request, Response } from 'express';
import * as productService from '../services/product.service';

/**
 * Get all products
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
      count: products.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    res.status(500).json({ error: message });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve product';
    const statusCode = message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const products = await productService.getProductsByCategory(category);

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
      count: products.length,
      category,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    res.status(500).json({ error: message });
  }
};


