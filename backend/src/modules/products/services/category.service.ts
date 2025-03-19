import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, MoveCategoryDto } from '../dtos/category.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { slugify } from '../../../common/utils/string.utils';
import { Connection } from 'typeorm';
import { PaginationQueryDto, PaginatedResponseDto } from '../../../common/dtos/pagination.dto';

/**
 * Service for managing product categories
 * Handles category CRUD operations and tree structure management
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  private readonly CACHE_KEY = 'categories:tree';

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cacheService: CacheService,
    private readonly connection: Connection,
  ) {}

  /**
   * Create a new category
   * @param createCategoryDto Category creation data
   * @returns Created category
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;

    // Generate slug from name if not provided
    const slug = slugify(categoryData.name);

    // Check if slug exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new BadRequestException('Category slug already exists');
    }

    try {
      // Find parent category if parentId is provided
      let parent: Category | null = null;
      if (parentId) {
        parent = await this.categoryRepository.findOne({
          where: { id: parentId },
        });
      }

      // Create and save category
      const category = this.categoryRepository.create({
        ...categoryData,
        slug,
        parent: parent || undefined,
      } as Partial<Category>);

      const savedCategory = await this.categoryRepository.save(category);
      await this.cacheService.del(this.CACHE_KEY);
      return savedCategory;
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing category
   * @param id Category ID
   * @param updateCategoryDto Update data
   * @returns Updated category
   */
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check slug uniqueness if changed
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existingCategory) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    try {
      Object.assign(category, updateCategoryDto);
      const updatedCategory = await this.categoryRepository.save(category);
      await this.cacheService.del(this.CACHE_KEY);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a category
   * @param id Category ID
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      await this.categoryRepository.delete(id);
      await this.cacheService.del(this.CACHE_KEY);
    } catch (error) {
      this.logger.error(`Error deleting category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get category tree
   * @returns Category tree structure
   */
  async getCategoryTree(): Promise<Category[]> {
    try {
      // Try to get from cache
      const cachedTree = await this.cacheService.get(this.CACHE_KEY);
      if (cachedTree) {
        const parsedTree = JSON.parse(cachedTree);
        // Convert date strings back to Date objects
        return this.convertDates(parsedTree);
      }

      // Get all categories from database
      const allCategories = await this.categoryRepository.find({
        order: { position: 'ASC' }
      });

      // Build tree structure manually
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // First pass: create a map of all categories
      allCategories.forEach(category => {
        // Ensure children array exists
        category.children = [];
        // Add to map
        categoryMap.set(category.id, category);
      });

      // Second pass: populate children and build root categories list
      allCategories.forEach(category => {
        if (category.parentId) {
          // This is a child category
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(category);
          } else {
            // Parent not found, treat as root
            this.logger.warn(`Parent category ${category.parentId} not found for ${category.name}, treating as root`);
            rootCategories.push(category);
          }
        } else {
          // This is a root category
          rootCategories.push(category);
        }
      });

      // Recursively build path for each category
      rootCategories.forEach(category => {
        this.buildCategoryPath(category);
      });

      // Sort root categories by position
      rootCategories.sort((a, b) => a.position - b.position);

      // Cache the result
      await this.cacheService.set(this.CACHE_KEY, JSON.stringify(rootCategories), 3600); // Cache for 1 hour
      
      return rootCategories;
    } catch (error) {
      this.logger.error(`Error getting category tree: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Recursively build path for category and its children
   * @private
   */
  private buildCategoryPath(category: Category, parentPath: string = ''): void {
    // Set the path for this category
    category.path = parentPath ? `${parentPath} > ${category.name}` : category.name;
    
    // Process children
    if (category.children && category.children.length > 0) {
      // Sort children by position
      category.children.sort((a, b) => a.position - b.position);
      
      // Build path for each child
      category.children.forEach(child => {
        this.buildCategoryPath(child, category.path);
      });
    }
  }

  /**
   * Convert date strings to Date objects in category tree
   * @private
   */
  private convertDates(categories: any[]): Category[] {
    return categories.map(category => ({
      ...category,
      created_at: new Date(category.created_at),
      updated_at: new Date(category.updated_at),
      deleted_at: category.deleted_at ? new Date(category.deleted_at) : undefined,
      children: category.children ? this.convertDates(category.children) : []
    }));
  }

  /**
   * Move a category in the tree
   * @param id Category ID
   * @param moveCategoryDto Move data
   */
  async moveCategory(id: string, moveCategoryDto: MoveCategoryDto): Promise<Category> {
    const { parentId, position } = moveCategoryDto;

    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parent;
      category.position = position;

      const updatedCategory = await this.categoryRepository.save(category);
      await this.cacheService.del(this.CACHE_KEY);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error moving category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get category by ID with full path
   * @param id Category ID
   * @returns Category with ancestors
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Build category path
    category.path = await this.buildCategoryAncestorPath(category);

    return category;
  }

  /**
   * Get category by slug with full path
   * @param slug Category slug
   * @returns Category with ancestors
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ 
      where: { slug },
      relations: ['parent'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Build category path
    category.path = await this.buildCategoryAncestorPath(category);

    return category;
  }

  /**
   * Update category product counts
   * This should be called when products are added/removed from categories
   */
  async updateCategoryProductCounts(): Promise<void> {
    try {
      // Get all categories 
      const categories = await this.categoryRepository.find();
      
      for (const category of categories) {
        // Direct query to count products in this category
        const result = await this.connection
          .createQueryBuilder()
          .select('COUNT(DISTINCT product_id)', 'count')
          .from('product_categories', 'pc')
          .where('pc.category_id = :categoryId', { categoryId: category.id })
          .getRawOne();
        
        // Update category total_products count
        const productCount = parseInt(result.count, 10) || 0;
        
        // Log for debugging
        this.logger.log(`Updating category ${category.name} (${category.id}) product count: ${productCount}`);
        
        // Update database directly for efficiency
        await this.categoryRepository.update(category.id, { 
          totalProducts: productCount,
          updated_at: new Date()
        });
      }

      // Invalidate cache
      await this.cacheService.del(this.CACHE_KEY);
      
      // Clear individual category caches
      // Since we don't have a keys method, directly delete known cache patterns
      await this.cacheService.del('category:*:products');
      
    } catch (error) {
      this.logger.error(`Error updating category product counts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build the full path for a category by traversing up its ancestors
   * @param category The category to build the path for
   * @returns The full path string (e.g. "Parent > Child > Grandchild")
   */
  private async buildCategoryAncestorPath(category: Category): Promise<string> {
    const pathParts: string[] = [category.name];
    let currentCategory = category;
    
    // Loop up through parents to build the full path
    while (currentCategory.parentId) {
      // Find the parent
      const parent = await this.categoryRepository.findOne({ 
        where: { id: currentCategory.parentId } 
      });
      
      if (!parent) {
        break;
      }
      
      // Add to the beginning of the path
      pathParts.unshift(parent.name);
      currentCategory = parent;
    }
    
    return pathParts.join(' > ');
  }

  /**
   * Find all descendant category IDs (children, grandchildren, etc.)
   * @param categoryId The parent category ID
   * @returns Array of descendant category IDs
   */
  private async findAllDescendantIds(categoryId: string): Promise<string[]> {
    // Get direct children first
    const children = await this.categoryRepository.find({
      where: { parentId: categoryId },
      select: ['id']
    });
    
    if (!children || children.length === 0) {
      return [];
    }
    
    const childIds = children.map(child => child.id);
    const descendantIds: string[] = [...childIds];
    
    // Recursively get descendants for each child
    for (const childId of childIds) {
      const childDescendants = await this.findAllDescendantIds(childId);
      descendantIds.push(...childDescendants);
    }
    
    return descendantIds;
  }

  /**
   * Get products for a specific category
   * @param categoryId The category ID
   * @param options Pagination and filter options
   * @returns Paginated list of products
   */
  async getCategoryProducts(
    categoryId: string,
    options: PaginationQueryDto & { query?: string } = {}
  ): Promise<PaginatedResponseDto<any>> {
    // Set default pagination values
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'name';
    const sortDirection = options.sortDirection || 'ASC';
    
    try {
      // Check if category exists
      const category = await this.getCategoryById(categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      
      // Create query builder for product-categories relationship
      const queryBuilder = this.connection.createQueryBuilder()
        .select('p.id', 'id')
        .addSelect('p.name', 'name')
        .addSelect('p.description', 'description')
        .addSelect('p.price', 'price')
        .addSelect('p.status', 'status')
        .addSelect('p.metadata', 'metadata')
        .from('product_categories', 'pc')
        .innerJoin('products', 'p', 'p.id = pc.product_id')
        .where('pc.category_id = :categoryId', { categoryId })
        .andWhere('p.deleted_at IS NULL');
      
      // Apply search filter if provided
      if (options.query) {
        queryBuilder.andWhere('p.name ILIKE :query', { query: `%${options.query}%` });
      }
      
      // Apply sorting
      queryBuilder.orderBy(`p.${sortBy}`, sortDirection);
      
      // Add pagination
      queryBuilder
        .offset(offset)
        .limit(limit);
      
      // Execute the query to get products
      const products = await queryBuilder.getRawMany();
      
      // Get total count for pagination
      const countQueryBuilder = this.connection.createQueryBuilder()
        .select('COUNT(DISTINCT p.id)', 'count')
        .from('product_categories', 'pc')
        .innerJoin('products', 'p', 'p.id = pc.product_id')
        .where('pc.category_id = :categoryId', { categoryId })
        .andWhere('p.deleted_at IS NULL');
      
      // Apply the same search filter to count query
      if (options.query) {
        countQueryBuilder.andWhere('p.name ILIKE :query', { query: `%${options.query}%` });
      }
      
      const { count } = await countQueryBuilder.getRawOne();
      const totalCount = parseInt(count, 10);
      
      // Get product images for all products
      const productIds = products.map(p => p.id);
      
      let productImages = [];
      if (productIds.length > 0) {
        productImages = await this.connection.createQueryBuilder()
          .select('pi.id', 'id')
          .addSelect('pi.product_id', 'productId')
          .addSelect('pi.url', 'url')
          .addSelect('pi.alt_text', 'altText')
          .addSelect('pi.position', 'position')
          .from('product_images', 'pi')
          .where('pi.product_id IN (:...productIds)', { productIds })
          .orderBy('pi.position', 'ASC')
          .getRawMany();
      }
      
      // Create a map of product IDs to their images
      const imagesByProduct = productImages.reduce((acc, img) => {
        if (!acc[img.productId]) {
          acc[img.productId] = [];
        }
        acc[img.productId].push({
          id: img.id,
          url: img.url,
          altText: img.altText,
          position: img.position
        });
        return acc;
      }, {});
      
      // Format the response with mapped images
      const mappedProducts = products.map(product => {
        const productImages = imagesByProduct[product.id] || [];
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          status: product.status,
          metadata: product.metadata,
          images: productImages,
          // Add convenient fields using metadata or defaults
          sku: product.metadata?.sku || product.id.substring(0, 8),
          stock_quantity: product.metadata?.stock_quantity || 0,
          is_published: product.status === 'active',
          image_url: productImages.length > 0 ? productImages[0].url : null
        };
      });
      
      // Return paginated response matching PaginatedResponseDto structure
      return {
        items: mappedProducts,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      this.logger.error(`Error fetching products for category ${categoryId}:`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch products for category: ${error.message}`);
    }
  }

  /**
   * Add products to a category
   * @param categoryId The category ID
   * @param productIds Array of product IDs to add to the category
   */
  async addProductsToCategory(categoryId: string, productIds: string[]): Promise<void> {
    if (!productIds.length) {
      return; // Nothing to do
    }
    
    try {
      // Check if category exists
      const category = await this.getCategoryById(categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      
      // Check if products exist
      const productsCount = await this.connection
        .createQueryBuilder()
        .select('COUNT(id)')
        .from('products', 'p')
        .where('p.id IN (:...productIds)', { productIds })
        .andWhere('p.deleted_at IS NULL')
        .getRawOne();
      
      if (productsCount.count !== productIds.length) {
        throw new BadRequestException('Some product IDs are invalid');
      }
      
      // Get existing relations to avoid duplicates
      const existingRelations = await this.connection
        .createQueryBuilder()
        .select('product_id')
        .from('product_categories', 'pc')
        .where('pc.category_id = :categoryId', { categoryId })
        .andWhere('pc.product_id IN (:...productIds)', { productIds })
        .getRawMany();
      
      const existingProductIds = new Set(existingRelations.map(r => r.product_id));
      const newProductIds = productIds.filter(id => !existingProductIds.has(id));
      
      if (newProductIds.length === 0) {
        return; // All products are already in the category
      }
      
      // Insert new relations
      await this.connection
        .createQueryBuilder()
        .insert()
        .into('product_categories')
        .values(newProductIds.map(productId => ({
          category_id: categoryId,
          product_id: productId
        })))
        .execute();
      
      // Update product counts
      await this.updateCategoryProductCounts();
      
      // Clear cache if used
      const cacheKey = `category:${categoryId}:products`;
      await this.cacheService.del(cacheKey);
      
    } catch (error) {
      this.logger.error(`Error adding products to category ${categoryId}:`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to add products to category: ${error.message}`);
    }
  }
  
  /**
   * Remove products from a category
   * @param categoryId The category ID
   * @param productIds Array of product IDs to remove from the category
   */
  async removeProductsFromCategory(categoryId: string, productIds: string[]): Promise<void> {
    if (!productIds.length) {
      return; // Nothing to do
    }
    
    try {
      // Check if category exists
      const category = await this.getCategoryById(categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      
      // Delete the relations
      await this.connection
        .createQueryBuilder()
        .delete()
        .from('product_categories')
        .where('category_id = :categoryId', { categoryId })
        .andWhere('product_id IN (:...productIds)', { productIds })
        .execute();
      
      // Update product counts
      await this.updateCategoryProductCounts();
      
      // Clear cache if used
      const cacheKey = `category:${categoryId}:products`;
      await this.cacheService.del(cacheKey);
      
    } catch (error) {
      this.logger.error(`Error removing products from category ${categoryId}:`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove products from category: ${error.message}`);
    }
  }
}
