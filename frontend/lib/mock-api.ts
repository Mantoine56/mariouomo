////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

// Define the shape of Product data
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
  inventory: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock product data store
export const fakeProducts = {
  records: [] as Product[], // Holds the list of product objects

  // Initialize with sample data
  initialize() {
    this.records = [
      { 
        id: 'PROD-001', 
        name: 'Classic Cotton T-Shirt',
        category: 'Apparel',
        price: 29.99,
        inventory: 125,
        status: 'Active',
        description: 'Premium cotton t-shirt with classic fit and reinforced seams.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/1.png',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-03-01T14:22:00Z',
      },
      { 
        id: 'PROD-002', 
        name: 'Slim Fit Denim Jeans',
        category: 'Apparel',
        price: 79.99,
        inventory: 83,
        status: 'Active',
        description: 'Modern slim-fit jeans with stretch denim for ultimate comfort.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/2.png',
        created_at: '2024-01-20T11:45:00Z',
        updated_at: '2024-03-05T09:17:00Z',
      },
      { 
        id: 'PROD-003', 
        name: 'Leather Weekend Bag',
        category: 'Accessories',
        price: 159.99,
        inventory: 21,
        status: 'Low Stock',
        description: 'Full-grain leather weekender with brass hardware and cotton lining.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/3.png',
        created_at: '2024-01-25T08:15:00Z',
        updated_at: '2024-03-10T16:33:00Z',
      },
      { 
        id: 'PROD-004', 
        name: 'Wool Blend Overcoat',
        category: 'Outerwear',
        price: 249.99,
        inventory: 17,
        status: 'Low Stock',
        description: 'Classic silhouette in a luxurious wool blend for warmth and style.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/4.png',
        created_at: '2024-02-01T15:20:00Z',
        updated_at: '2024-03-12T11:05:00Z',
      },
      { 
        id: 'PROD-005', 
        name: 'Italian Leather Loafers',
        category: 'Footwear',
        price: 189.99,
        inventory: 32,
        status: 'Active',
        description: 'Hand-crafted loafers from premium Italian leather with stitched soles.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/5.png',
        created_at: '2024-02-05T09:40:00Z',
        updated_at: '2024-03-15T13:27:00Z',
      },
      { 
        id: 'PROD-006', 
        name: 'Silk Dress Tie',
        category: 'Accessories',
        price: 49.99,
        inventory: 65,
        status: 'Active',
        description: 'Luxury silk tie with a modern width and classic patterns.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/6.png',
        created_at: '2024-02-10T13:55:00Z',
        updated_at: '2024-03-18T10:42:00Z',
      },
      { 
        id: 'PROD-007', 
        name: 'Cashmere Scarf',
        category: 'Accessories',
        price: 79.99,
        inventory: 42,
        status: 'Active',
        description: 'Ultra-soft cashmere scarf in versatile colors for year-round style.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/7.png',
        created_at: '2024-02-15T16:30:00Z',
        updated_at: '2024-03-20T14:18:00Z',
      },
      { 
        id: 'PROD-008', 
        name: 'Aviator Sunglasses',
        category: 'Accessories',
        price: 129.99,
        inventory: 18,
        status: 'Low Stock',
        description: 'Classic aviator style with polarized lenses and gold-tone frames.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/8.png',
        created_at: '2024-02-20T10:15:00Z',
        updated_at: '2024-03-22T15:50:00Z',
      },
      { 
        id: 'PROD-009', 
        name: 'Pima Cotton Dress Shirt',
        category: 'Apparel',
        price: 89.99,
        inventory: 0,
        status: 'Out of Stock',
        description: 'Premium Pima cotton dress shirt with mother-of-pearl buttons.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/9.png',
        created_at: '2024-02-25T14:45:00Z',
        updated_at: '2024-03-25T09:33:00Z',
      },
      { 
        id: 'PROD-010', 
        name: 'Merino Wool Sweater',
        category: 'Apparel',
        price: 109.99,
        inventory: 28,
        status: 'Active',
        description: 'Lightweight merino wool sweater in a versatile crew neck style.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/10.png',
        created_at: '2024-03-01T08:30:00Z',
        updated_at: '2024-03-28T11:15:00Z',
      },
      { 
        id: 'PROD-011', 
        name: 'Leather Oxford Shoes',
        category: 'Footwear',
        price: 199.99,
        inventory: 24,
        status: 'Active',
        description: 'Classic oxford shoes with premium leather uppers and Goodyear welting.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/11.png',
        created_at: '2024-03-05T11:20:00Z',
        updated_at: '2024-03-30T13:40:00Z',
      },
      { 
        id: 'PROD-012', 
        name: 'Cashmere Beanie',
        category: 'Accessories',
        price: 59.99,
        inventory: 37,
        status: 'Active',
        description: 'Luxuriously soft cashmere beanie in a versatile ribbed design.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/12.png',
        created_at: '2024-03-08T15:35:00Z',
        updated_at: '2024-04-01T10:25:00Z',
      },
      { 
        id: 'PROD-013', 
        name: 'Linen Summer Blazer',
        category: 'Outerwear',
        price: 179.99,
        inventory: 15,
        status: 'Low Stock',
        description: 'Lightweight linen blazer perfect for summer events and casual business wear.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/13.png',
        created_at: '2024-03-12T09:50:00Z',
        updated_at: '2024-04-03T16:55:00Z',
      },
      { 
        id: 'PROD-014', 
        name: 'Designer Cufflinks',
        category: 'Accessories',
        price: 69.99,
        inventory: 0,
        status: 'Out of Stock',
        description: 'Elegant silver-tone cufflinks with subtle logo engraving.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/14.png',
        created_at: '2024-03-15T14:10:00Z',
        updated_at: '2024-04-05T11:30:00Z',
      },
      { 
        id: 'PROD-015', 
        name: 'Canvas Sneakers',
        category: 'Footwear',
        price: 79.99,
        inventory: 53,
        status: 'Active',
        description: 'Lightweight canvas sneakers with rubber soles and premium comfort insoles.',
        photo_url: 'https://api.slingacademy.com/public/sample-products/15.png',
        created_at: '2024-03-18T10:25:00Z',
        updated_at: '2024-04-08T14:45:00Z',
      },
    ];
  },

  // Get all products with optional filtering
  async getAll({
    categories = [],
    search,
    status,
    priceRange
  }: {
    categories?: string[];
    search?: string;
    status?: string;
    priceRange?: string;
  } = {}) {
    let products = [...this.records];

    // Filter products based on selected categories
    if (categories.length > 0) {
      products = products.filter((product) =>
        categories.includes(product.category)
      );
    }

    // Filter by status if provided
    if (status) {
      products = products.filter((product) => product.status === status);
    }

    // Filter by price range if provided
    if (priceRange) {
      products = products.filter((product) => {
        const price = product.price;
        
        switch(priceRange) {
          case '0-50': 
            return price < 50;
          case '50-100': 
            return price >= 50 && price < 100;
          case '100-200': 
            return price >= 100 && price < 200;
          case '200+': 
            return price >= 200;
          default:
            return true;
        }
      });
    }

    // Search functionality across multiple fields
    if (search) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return products;
  },

  // Get paginated results with filtering
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search,
    status,
    priceRange
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
    status?: string;
    priceRange?: string;
  } = {}) {
    // Simulate a much shorter API delay (50ms) for a snappier experience
    await delay(50);
    
    // Make sure we have data
    if (this.records.length === 0) {
      this.initialize();
    }
    
    const categoriesArray = categories ? categories.split(',') : [];
    const allProducts = await this.getAll({
      categories: categoriesArray,
      search,
      status,
      priceRange
    });
    const totalProducts = allProducts.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Return paginated response
    return {
      totalProducts,
      products: paginatedProducts,
      page,
      limit
    };
  },

  /**
   * Delete a product by ID
   * @param id - Product ID to delete
   * @returns Success status
   */
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    // Simulate API delay
    await delay(600);
    
    const initialLength = this.records.length;
    this.records = this.records.filter(p => p.id !== id);
    
    return { success: this.records.length < initialLength };
  }
};

// Initialize sample products - ensure this is called
fakeProducts.initialize(); 