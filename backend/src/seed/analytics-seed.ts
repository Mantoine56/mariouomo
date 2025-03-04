/**
 * Analytics Database Seed Script
 * 
 * This script generates realistic data for testing the analytics API endpoints.
 * It creates historical sales data, customer acquisition metrics, product performance,
 * and category breakdown for different time periods.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { Store } from '../modules/stores/entities/store.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';

@Injectable()
export class AnalyticsSeedService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
  ) {}
  
  /**
   * Generate random dates within a range
   */
  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  
  /**
   * Generate random number within a range
   */
  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  /**
   * Generate random decimal within a range, with specified decimal places
   */
  private randomDecimal(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
  }
  
  /**
   * Create a default store for our products
   */
  async createStore(): Promise<Store> {
    const store = this.storeRepository.create({
      name: 'Mario Uomo Main Store',
      description: 'Flagship store for Mario Uomo luxury products',
      status: 'active',
      currency: 'USD',
      contact_email: 'store@mariouomo.com',
      contact_phone: '+1-555-123-4567',
      metadata: {
        location: 'New York',
        established: '2020',
        flagship: true
      }
    });
    
    return await this.storeRepository.save(store);
  }
  
  /**
   * Create sample product categories
   */
  async createSampleCategories(): Promise<Category[]> {
    const categoryData = [
      { name: 'Shoes', slug: 'shoes', description: 'Footwear collection' },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel collection' },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and other accessories' },
      { name: 'Equipment', slug: 'equipment', description: 'Sports and fitness equipment' },
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and electronics' },
    ];
    
    const savedCategories: Category[] = [];
    
    for (const data of categoryData) {
      const category = this.categoryRepository.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        isVisible: true,
        position: savedCategories.length,
        childCount: 0,
        totalProducts: 0
      });
      
      savedCategories.push(await this.categoryRepository.save(category));
    }
    
    return savedCategories;
  }
  
  /**
   * Create sample products in each category
   */
  async createSampleProducts(store: Store, categories: Category[]): Promise<Product[]> {
    const products: Product[] = [];
    
    // Sample products by category name
    const productsByCategory: Record<string, Array<{name: string, price: number, description: string}>> = {
      'Shoes': [
        { name: 'Luxury Leather Loafers', price: 249.99, description: 'Premium Italian leather loafers' },
        { name: 'Signature Suede Sneakers', price: 189.99, description: 'Casual suede sneakers with unique sole' },
        { name: 'Classic Oxford Shoes', price: 299.99, description: 'Timeless Oxford design in genuine leather' },
        { name: 'Designer Derby Shoes', price: 275.00, description: 'Contemporary take on the classic Derby' },
        { name: 'Handcrafted Boots', price: 350.00, description: 'Rugged boots made by master craftsmen' },
      ],
      'Clothing': [
        { name: 'Tailored Wool Suit', price: 899.99, description: 'Premium wool suit with expert tailoring' },
        { name: 'Cashmere Sweater', price: 250.00, description: 'Luxurious 100% cashmere knit' },
        { name: 'Silk Dress Shirt', price: 185.00, description: 'Smooth silk shirt with mother-of-pearl buttons' },
        { name: 'Designer Denim Jeans', price: 220.00, description: 'Premium denim with signature wash' },
        { name: 'Merino Wool Coat', price: 450.00, description: 'Elegant overcoat in fine merino wool' },
      ],
      'Accessories': [
        { name: 'Italian Leather Belt', price: 120.00, description: 'Handcrafted leather belt with designer buckle' },
        { name: 'Designer Sunglasses', price: 195.00, description: 'UV protective lenses with signature frames' },
        { name: 'Luxury Watch', price: 2500.00, description: 'Swiss-made automatic watch' },
        { name: 'Silk Necktie', price: 95.00, description: 'Hand-finished silk tie in signature pattern' },
        { name: 'Leather Wallet', price: 150.00, description: 'Full-grain leather wallet with multiple compartments' },
      ],
      'Equipment': [
        { name: 'Premium Golf Set', price: 1250.00, description: 'Professional-grade golf club set' },
        { name: 'Designer Tennis Racket', price: 220.00, description: 'Performance carbon fiber tennis racket' },
        { name: 'Luxury Yoga Mat', price: 120.00, description: 'Extra-thick sustainable yoga mat' },
        { name: 'Sport Duffel Bag', price: 175.00, description: 'Water-resistant gym bag with compartments' },
        { name: 'Professional Fitness Tracker', price: 199.99, description: 'Advanced activity and health monitor' },
      ],
      'Electronics': [
        { name: 'Smart Fitness Watch', price: 299.99, description: 'Advanced fitness tracker with heart monitoring' },
        { name: 'Wireless Earbuds', price: 179.99, description: 'Premium sound quality with noise cancellation' },
        { name: 'Bluetooth Speaker', price: 129.99, description: 'Portable speaker with crystal clear sound' },
        { name: 'Smartphone Case', price: 59.99, description: 'Protective designer case' },
        { name: 'Charging Station', price: 89.99, description: 'Multi-device charging dock' },
      ],
    };
    
    for (const category of categories) {
      const categoryProducts = productsByCategory[category.name] || [];
      
      for (const productData of categoryProducts) {
        // Create the product
        const product = this.productRepository.create({
          store_id: store.id,
          name: productData.name,
          description: productData.description,
          status: 'active',
          type: 'physical',
          category: category.name,
          base_price: productData.price,
          tags: [category.name.toLowerCase(), 'premium', 'luxury'],
          store: store,
          categories: [category]
        });
        
        const savedProduct = await this.productRepository.save(product);
        
        // Create a default variant
        const variant = this.variantRepository.create({
          product_id: savedProduct.id,
          name: 'Default',
          sku: `${category.name.substring(0, 3).toUpperCase()}-${this.randomNumber(10000, 99999)}`,
          price: productData.price,
          inventory_quantity: this.randomNumber(10, 100),
          product: savedProduct
        });
        
        await this.variantRepository.save(variant);
        
        // Create a product image
        const image = this.imageRepository.create({
          product_id: savedProduct.id,
          url: `https://source.unsplash.com/random/800x600/?${category.name.toLowerCase()},${productData.name.split(' ')[0].toLowerCase()}`,
          alt_text: productData.name,
          position: 0,
          is_primary: true,
          product: savedProduct
        });
        
        await this.imageRepository.save(image);
        
        products.push(savedProduct);
      }
    }
    
    return products;
  }
  
  /**
   * Create sample users for orders
   */
  async createSampleUsers(): Promise<Profile[]> {
    const users: Profile[] = [];
    
    for (let i = 0; i < 100; i++) {
      const user = this.profileRepository.create({
        full_name: `User ${i}`,
        role: 'customer',
        status: 'active',
        email: `user${i}@example.com`,
        phone: `+1-555-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`,
        preferences: {
          newsletter: Math.random() > 0.5,
          marketing: Math.random() > 0.7,
          theme: Math.random() > 0.5 ? 'light' : 'dark'
        },
        metadata: {
          registration_date: this.randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
          source: ['direct', 'search', 'referral', 'social'][Math.floor(Math.random() * 4)]
        }
      });
      
      users.push(await this.profileRepository.save(user));
    }
    
    return users;
  }
  
  /**
   * Generate historical orders with reasonable patterns
   */
  async generateOrders(users: Profile[], products: Product[]): Promise<void> {
    // Start date: 90 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    // End date: today
    const endDate = new Date();
    
    // Create 500-1000 orders 
    const totalOrders = this.randomNumber(500, 1000);
    
    for (let i = 0; i < totalOrders; i++) {
      // Create order with random date
      const orderDate = this.randomDate(startDate, endDate);
      
      // Get random user
      const user = users[this.randomNumber(0, users.length - 1)];
      
      // Create 1-5 order items
      const itemCount = this.randomNumber(1, 5);
      const orderItems: OrderItem[] = [];
      let subtotal = 0;
      
      // Create the order first
      const order = this.orderRepository.create({
        user_id: user.id,
        status: OrderStatus.DELIVERED,
        total_amount: 0, // Will update after adding items
        subtotal: 0, // Will update after adding items
        tax: 0, // Will update after adding items
        shipping: this.randomDecimal(5, 25),
        shipping_address: {
          street: `${this.randomNumber(100, 9999)} Main St`,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postal_code: `${this.randomNumber(10000, 99999)}`
        },
        billing_address: {
          street: `${this.randomNumber(100, 9999)} Main St`,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postal_code: `${this.randomNumber(10000, 99999)}`
        },
        user: user
      });
      
      const savedOrder = await this.orderRepository.save(order);
      
      // Select random products for this order
      const selectedProducts: Product[] = [];
      while (selectedProducts.length < itemCount) {
        const product = products[this.randomNumber(0, products.length - 1)];
        if (!selectedProducts.includes(product)) {
          selectedProducts.push(product);
        }
      }
      
      // Create order items for selected products
      for (const product of selectedProducts) {
        // Get the first variant
        const variants = await this.variantRepository.find({ 
          where: { product_id: product.id },
          take: 1
        });
        
        if (variants.length > 0) {
          const variant = variants[0];
          const quantity = this.randomNumber(1, 3);
          const unitPrice = variant.price;
          
          const orderItem = this.orderItemRepository.create({
            order_id: savedOrder.id,
            variant_id: variant.id,
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: unitPrice * quantity,
            product_name: product.name,
            variant_name: variant.name,
            product_metadata: {
              sku: variant.sku
            },
            order: savedOrder,
            variant: variant
          });
          
          const savedItem = await this.orderItemRepository.save(orderItem);
          orderItems.push(savedItem);
          subtotal += unitPrice * quantity;
        }
      }
      
      // Calculate tax
      const tax = subtotal * 0.08; // 8% tax
      
      // Update order with final amounts
      savedOrder.subtotal = subtotal;
      savedOrder.tax = tax;
      savedOrder.total_amount = subtotal + tax + savedOrder.shipping;
      
      // Set status based on date
      const daysDiff = Math.floor((endDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 2) {
        savedOrder.status = Math.random() > 0.5 ? OrderStatus.PROCESSING : OrderStatus.SHIPPED;
      } else if (daysDiff < 5 && Math.random() > 0.8) {
        savedOrder.status = OrderStatus.CANCELLED;
      } else {
        savedOrder.status = OrderStatus.DELIVERED;
      }
      
      // Set the created_at date to match our random order date
      savedOrder.created_at = orderDate;
      savedOrder.updated_at = orderDate;
      
      await this.orderRepository.save(savedOrder);
    }
  }
  
  /**
   * Run the full seed operation
   */
  async seed(): Promise<void> {
    // Create store
    const store = await this.createStore();
    
    // Create categories
    const categories = await this.createSampleCategories();
    
    // Create products in each category
    const products = await this.createSampleProducts(store, categories);
    
    // Create users
    const users = await this.createSampleUsers();
    
    // Generate orders
    await this.generateOrders(users, products);
  }
} 