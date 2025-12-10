import React, { useState } from 'react';
import { productService, Product } from '../services/product.service';
import { userProductService } from '../services/userProduct.service';
import { purchaseService } from '../services/purchase.service';
import { ResponseDisplay } from '../components/ResponseDisplay';

type TabType = 'grpc' | 'direct';

export const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('grpc');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState('');
  const [productId, setProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | undefined>();
  const [lastAction, setLastAction] = useState<string>('');
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  const handleGetAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedProduct(null);
    const startTime = Date.now();
    setLastAction('getAllProducts');

    try {
      const response =
        activeTab === 'grpc'
          ? await userProductService.getAllProducts()
          : await productService.getAllProducts();
      setProducts(response.data);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProductById = async () => {
    if (!productId.trim()) {
      setError('Please enter a product ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProducts([]);
    const startTime = Date.now();
    setLastAction('getProductById');

    try {
      const response =
        activeTab === 'grpc'
          ? await userProductService.getProductById(productId)
          : await productService.getProductById(productId);
      setSelectedProduct(response.data);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch product');
      setSelectedProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProductsByCategory = async () => {
    if (!category.trim()) {
      setError('Please enter a category');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedProduct(null);
    const startTime = Date.now();
    setLastAction('getProductsByCategory');

    try {
      const response =
        activeTab === 'grpc'
          ? await userProductService.getProductsByCategory(category)
          : await productService.getProductsByCategory(category);
      setProducts(response.data);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const getEndpointInfo = () => {
    if (activeTab === 'grpc') {
      switch (lastAction) {
        case 'getAllProducts':
          return 'GET /user/products (gRPC: User Service → Product Service)';
        case 'getProductById':
          return `GET /user/products/${productId} (gRPC: User Service → Product Service)`;
        case 'getProductsByCategory':
          return `GET /user/products/category/${category} (gRPC: User Service → Product Service)`;
        default:
          return 'User Service → Product Service (via gRPC)';
      }
    } else {
      switch (lastAction) {
        case 'getAllProducts':
          return 'GET /product (Direct Product Service)';
        case 'getProductById':
          return `GET /product/${productId} (Direct Product Service)`;
        case 'getProductsByCategory':
          return `GET /product/category/${category} (Direct Product Service)`;
        default:
          return 'Direct Product Service';
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h1>Product Service Testing</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Test s2s gRPC communication by comparing User Service endpoints (gRPC) with direct Product Service endpoints.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => {
            setActiveTab('grpc');
            setProducts([]);
            setSelectedProduct(null);
            setError(null);
            setLastAction('');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'grpc' ? '#4CAF50' : 'transparent',
            color: activeTab === 'grpc' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'grpc' ? '3px solid #4CAF50' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'grpc' ? 'bold' : 'normal',
          }}
        >
          🚀 Products via User Service (gRPC)
        </button>
        <button
          onClick={() => {
            setActiveTab('direct');
            setProducts([]);
            setSelectedProduct(null);
            setError(null);
            setLastAction('');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'direct' ? '#1976d2' : 'transparent',
            color: activeTab === 'direct' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'direct' ? '3px solid #1976d2' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'direct' ? 'bold' : 'normal',
          }}
        >
          📦 Products via Product Service (Direct)
        </button>
      </div>

      {activeTab === 'grpc' && (
        <div
          style={{
            backgroundColor: '#e8f5e9',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '2px solid #4CAF50',
          }}
        >
          <strong style={{ color: '#2e7d32' }}>
            ⚡ gRPC Communication Mode: These endpoints demonstrate s2s gRPC communication.
            <br />
            User Service calls Product Service via gRPC protocol.
          </strong>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleGetAllProducts}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            Get All Products
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Product ID"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '150px',
              }}
            />
            <button
              onClick={handleGetProductById}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#388e3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Get Product by ID
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g., Electronics)"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '200px',
              }}
            />
            <button
              onClick={handleGetProductsByCategory}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f57c00',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Get Products by Category
            </button>
          </div>
        </div>
      </div>

      {/* Response Display */}
      <ResponseDisplay
        title={getEndpointInfo()}
        data={selectedProduct || (products.length > 0 ? products : null)}
        error={error}
        isLoading={isLoading}
        responseTime={responseTime}
        isGrpc={activeTab === 'grpc'}
      />

      {/* Products List */}
      {products.length > 0 && !selectedProduct && (
        <div style={{ marginTop: '20px' }}>
          <h3>Products ({products.length})</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>{product.name}</h4>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  ${product.price}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                  {product.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Product Details */}
      {selectedProduct && (
        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #1976d2', borderRadius: '5px' }}>
          <h3>Product Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>ID:</strong> {selectedProduct.id}
            </div>
            <div>
              <strong>Name:</strong> {selectedProduct.name}
            </div>
            <div>
              <strong>Price:</strong> ${selectedProduct.price}
            </div>
            <div>
              <strong>Category:</strong> {selectedProduct.category}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Description:</strong> {selectedProduct.description}
            </div>
          </div>
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '80px',
                }}
              />
            </div>
            <button
              onClick={async () => {
                if (!selectedProduct) return;
                setBuyingProductId(selectedProduct.id);
                try {
                  await purchaseService.buyProduct(selectedProduct.id, buyQuantity);
                  alert(`Successfully purchased ${buyQuantity} x ${selectedProduct.name}!`);
                  setSelectedProduct(null);
                  setBuyQuantity(1);
                } catch (err: any) {
                  alert(err.response?.data?.error || 'Failed to purchase product');
                } finally {
                  setBuyingProductId(null);
                }
              }}
              disabled={buyingProductId === selectedProduct.id}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: buyingProductId === selectedProduct.id ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {buyingProductId === selectedProduct.id ? 'Buying...' : '🛒 Buy Product (gRPC)'}
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

