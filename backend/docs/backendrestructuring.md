# Backend Restructuring Plan

## Current State Analysis

### Database Structure
1. **Auth System**
   - Using Supabase Auth (`auth.users` table)
   - One existing user in auth system

2. **Profiles Table**
   - Currently in `public.profiles`
   - Contains user metadata (names, phone, role, etc.)
   - Has RLS policies that need review

3. **Orders System**
   - ~100 test orders in the database
   - Related tables: order_items, payments, shipments

## Restructuring Plan

### Phase 1: Authentication & Profile Management

1. **Keep and Enhance Supabase Auth Integration**
   ```sql
   -- Verify foreign key constraint
   ALTER TABLE public.profiles
   ADD CONSTRAINT profiles_id_fkey 
   FOREIGN KEY (id) REFERENCES auth.users(id)
   ON DELETE CASCADE;
   ```

2. **Update Profiles Table Structure**
   ```sql
   -- Add missing columns and normalize structure
   ALTER TABLE public.profiles
   ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
   ALTER COLUMN role SET DEFAULT 'customer',
   ALTER COLUMN status SET DEFAULT 'active';

   -- Add proper indexes
   CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
   CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
   ```

3. **Implement RLS Policies**
   ```sql
   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Users can read their own profile
   CREATE POLICY "Users can read own profile"
   ON public.profiles FOR SELECT
   USING (auth.uid() = id);

   -- Users can update their own profile
   CREATE POLICY "Users can update own profile"
   ON public.profiles FOR UPDATE
   USING (auth.uid() = id);

   -- Admins can read all profiles
   CREATE POLICY "Admins can read all profiles"
   ON public.profiles FOR ALL
   USING (auth.jwt() ->> 'role' = 'admin');
   ```

### Phase 2: Backend Service Restructuring

1. **Authentication Module (`src/modules/auth`)**
   ```typescript
   @Injectable()
   export class AuthService {
     constructor(
       private readonly supabase: SupabaseClient,
       private readonly jwtService: JwtService
     ) {}

     async validateToken(token: string) {
       return this.jwtService.verify(token);
     }

     async getCurrentUser(userId: string) {
       const { data, error } = await this.supabase
         .from('profiles')
         .select('*')
         .eq('id', userId)
         .single();

       if (error) throw new UnauthorizedException();
       return data;
     }
   }
   ```

2. **Profile Module (`src/modules/users`)**
   ```typescript
   @Injectable()
   export class ProfileService {
     constructor(
       private readonly supabase: SupabaseClient
     ) {}

     async updateProfile(userId: string, data: UpdateProfileDto) {
       return this.supabase
         .from('profiles')
         .update(data)
         .eq('id', userId)
         .single();
     }
   }
   ```

3. **Orders Integration**
   ```typescript
   @Injectable()
   export class OrdersService {
     constructor(
       @InjectRepository(Order)
       private readonly orderRepository: Repository<Order>,
       private readonly profileService: ProfileService
     ) {}

     async createOrder(userId: string, orderData: CreateOrderDto) {
       const profile = await this.profileService.getCurrentUser(userId);
       return this.orderRepository.create({
         userId,
         ...orderData,
         customerDetails: {
           name: profile.full_name,
           email: profile.email,
           phone: profile.phone
         }
       });
     }
   }
   ```

### Phase 3: Data Migration

1. **Orders Data**
   ```sql
   -- Create a temporary mapping table for test orders
   CREATE TABLE temp_order_users (
     order_id UUID,
     old_user_id UUID,
     new_user_id UUID
   );

   -- Store the current order-user relationships
   INSERT INTO temp_order_users (order_id, old_user_id)
   SELECT id, user_id FROM orders;

   -- After creating the first admin user in Supabase Auth
   -- Update orders to link to the admin user for testing
   UPDATE orders
   SET user_id = 'ADMIN_SUPABASE_UUID'  -- We'll replace this with actual admin UUID
   WHERE id IN (SELECT order_id FROM temp_order_users);
   ```

2. **Test Data Handling**
   - Preserve existing 100 test orders
   - Link all test orders to the admin user for development
   - Add proper customer profiles as they sign up

### Phase 4: Frontend Integration

1. **Update API Calls**
   - Use Supabase client for auth/profile operations
   - Use REST API for business operations

2. **Authentication Flow**
   ```typescript
   // Frontend auth flow
   const signIn = async () => {
     const { data, error } = await supabase.auth.signIn({
       email,
       password
     });
     if (data?.user) {
       // Token is automatically handled by Supabase
       await initializeUserProfile();
     }
   };
   ```

## Implementation Steps

1. **Preparation (Day 1)**
   - [x] Backup all data
   - [ ] Create test environment
   - [ ] Update database schema

2. **Core Changes (Day 2-3)**
   - [ ] Implement new AuthService
   - [ ] Update ProfileService
   - [ ] Migrate existing profiles

3. **Integration (Day 4-5)**
   - [ ] Update order management
   - [ ] Implement new RLS policies
   - [ ] Test all flows

4. **Testing & Verification (Day 6-7)**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Load testing

## Rollback Plan

1. **Database Rollback**
   ```sql
   -- Restore profiles if needed
   INSERT INTO profiles SELECT * FROM profiles_backup;
   ```

2. **Code Rollback**
   - Maintain old service implementations
   - Version control branches
   - Feature flags for gradual rollout

## Success Metrics

1. **Performance**
   - Auth response time < 200ms
   - Profile operations < 100ms

2. **Reliability**
   - Zero auth failures
   - 100% profile consistency

3. **Security**
   - All routes properly protected
   - RLS policies verified
   - No data leakage 