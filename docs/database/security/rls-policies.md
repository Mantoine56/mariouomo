# Row Level Security (RLS) Policies

## Overview

Our database implements comprehensive Row Level Security (RLS) policies to ensure data isolation and security at the database level. These policies are enforced by Supabase and apply to all access methods.

## Global Policies

### Authentication
All tables require authentication by default:
```sql
ALTER TABLE [table_name] FORCE ROW LEVEL SECURITY;
```

### Multi-Store Isolation
Store-specific tables enforce store isolation:
```sql
CREATE POLICY "Store isolation" ON [table_name]
    USING (store_id IN (
        SELECT store_id FROM staff_permissions
        WHERE user_id = auth.uid()
    ));
```

## Table-Specific Policies

### Products Table
```sql
-- Allow read access to published products
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (status = 'published');

-- Allow store staff to manage their products
CREATE POLICY "Staff can manage store products" ON products
    USING (store_id IN (
        SELECT store_id FROM staff_permissions
        WHERE user_id = auth.uid()
        AND can_manage_products = true
    ));
```

### Orders Table
```sql
-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

-- Staff can view store orders
CREATE POLICY "Staff can view store orders" ON orders
    USING (store_id IN (
        SELECT store_id FROM staff_permissions
        WHERE user_id = auth.uid()
        AND can_view_orders = true
    ));
```

[Additional policies from rlspolicies.md...]

## Testing Policies

We maintain a comprehensive test suite for our RLS policies. See [Policy Tests](./policy-tests.md) for details.

## Maintenance

### Adding New Policies
1. Document the policy requirements
2. Create and test the policy locally
3. Apply the policy in all environments
4. Update documentation

### Modifying Policies
1. Document the change reason
2. Test impact on existing data
3. Apply changes in staging first
4. Verify no unintended consequences
5. Apply to production

## Common Issues

### Troubleshooting
- Policy not working as expected
- Permission denied errors
- Performance impact of policies

### Best Practices
- Keep policies simple and focused
- Test thoroughly before deployment
- Document all policies
- Regular policy audits
