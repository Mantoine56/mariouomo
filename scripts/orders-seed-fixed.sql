
-- Disable triggers to improve performance during bulk inserts
DO $$
BEGIN
  -- Check if triggers exist before attempting to disable them
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    EXECUTE 'ALTER TABLE orders DISABLE TRIGGER audit_orders';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    EXECUTE 'ALTER TABLE orders DISABLE TRIGGER update_orders_updated_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_order_items') THEN
    EXECUTE 'ALTER TABLE order_items DISABLE TRIGGER audit_order_items';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_items_updated_at') THEN
    EXECUTE 'ALTER TABLE order_items DISABLE TRIGGER update_order_items_updated_at';
  END IF;
END
$$;

BEGIN;

-- First, disable the foreign key constraint temporarily
SET session_replication_role = 'replica';
  
-- Order 1/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f01445b4-51be-448c-9945-8ccc324ee476',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1420.96,
  1301.31,
  109.05,
  10.60,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-21T04:04:14.670Z',
  '2024-06-21T04:04:14.670Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8cf73e1a-ffc7-463b-a6fc-7f74fba48447',
  'f01445b4-51be-448c-9945-8ccc324ee476',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-21T04:04:14.670Z',
  '2024-06-21T04:04:14.670Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '29e2bcf0-d391-495c-9126-5e09999018b4',
  'f01445b4-51be-448c-9945-8ccc324ee476',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-21T04:04:14.670Z',
  '2024-06-21T04:04:14.670Z'
);

-- Order 2/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  2995.42,
  2758.68,
  216.56,
  20.18,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f9573f48-f19a-4401-aaa5-7b0506d976a0',
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dbf4e4b0-72b7-4657-86ca-7ccfb49aeeb9',
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '32106780-af6b-4da4-9a8f-9afc20b5c028',
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c4828bee-5e62-4d9f-ab3a-45d6bc5ad8d0',
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd43225b7-5f04-44ef-8d7c-ca4483231472',
  '035dd12d-b24b-46c8-bc1c-b24dfa3a961c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-02T05:42:13.260Z',
  '2024-08-02T05:42:13.260Z'
);

-- Order 3/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '71ec17ee-89a7-4aff-bf93-e272928c92d9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  3232.46,
  3041.29,
  166.36,
  24.81,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-18T18:26:59.144Z',
  '2025-02-18T18:26:59.144Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c9f952fe-0c23-477f-a9cf-7b226c5827ec',
  '71ec17ee-89a7-4aff-bf93-e272928c92d9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-18T18:26:59.144Z',
  '2025-02-18T18:26:59.144Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f106e29a-9ae6-4081-9f12-78ac9732c19e',
  '71ec17ee-89a7-4aff-bf93-e272928c92d9',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-18T18:26:59.144Z',
  '2025-02-18T18:26:59.144Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '22382cc5-f839-499b-831d-2479a08ddce7',
  '71ec17ee-89a7-4aff-bf93-e272928c92d9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-18T18:26:59.144Z',
  '2025-02-18T18:26:59.144Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '07d88491-66a2-4a72-821a-53a3994784d7',
  '71ec17ee-89a7-4aff-bf93-e272928c92d9',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-18T18:26:59.144Z',
  '2025-02-18T18:26:59.144Z'
);

-- Order 4/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e2c3dc19-5c0b-4f1d-ac09-a51d0dc29469',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  950.85,
  859.98,
  67.34,
  23.53,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-13T08:42:12.281Z',
  '2024-03-13T08:42:12.281Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2b6faf7a-150c-4607-83e8-afa1493fc0ec',
  'e2c3dc19-5c0b-4f1d-ac09-a51d0dc29469',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-13T08:42:12.281Z',
  '2024-03-13T08:42:12.281Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f050ba30-b89c-48bb-9d4f-674977e38733',
  'e2c3dc19-5c0b-4f1d-ac09-a51d0dc29469',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-13T08:42:12.281Z',
  '2024-03-13T08:42:12.281Z'
);

-- Order 5/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  2009.38,
  1834.12,
  161.22,
  14.04,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e1229d05-5746-4d13-ac0b-837ad1353dd6',
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd453be1d-3fef-48ae-b29d-86fcde19f797',
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '46f7dea5-6a07-42bc-88b3-402956a29d07',
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c7faa51b-d6e4-48e1-b4ef-8ed4bdcd4204',
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e4cf359e-a703-424e-b8fb-e12a339368b4',
  'f024029f-bc4d-41a6-b91c-85c51639cfd3',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-20T22:36:22.515Z',
  '2024-12-20T22:36:22.515Z'
);

-- Order 6/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '10b7bc1b-9935-4ff4-b245-362b0e2a8d10',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  283.45,
  252.20,
  13.09,
  18.16,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-30T08:53:13.047Z',
  '2024-06-30T08:53:13.047Z'
);

-- Order Item for Order 6
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b8fb5451-0197-4faa-9116-5d7ce864461e',
  '10b7bc1b-9935-4ff4-b245-362b0e2a8d10',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-30T08:53:13.047Z',
  '2024-06-30T08:53:13.047Z'
);

-- Order 7/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '54ae22b4-31b6-44c8-aef0-ce7f33aa901f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  264.81,
  250.00,
  16.60,
  20.81,
  22.60,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-31T01:20:35.795Z',
  '2025-01-31T01:20:35.795Z'
);

-- Order Item for Order 7
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '59524f59-1354-47e8-913c-4d25c27933a1',
  '54ae22b4-31b6-44c8-aef0-ce7f33aa901f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-31T01:20:35.795Z',
  '2025-01-31T01:20:35.795Z'
);

-- Order 8/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3bdbfd25-7f54-4e29-9dba-40edc10c2ed5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  782.46,
  711.10,
  60.23,
  11.13,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-25T14:05:15.170Z',
  '2025-01-25T14:05:15.170Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9eba1094-79af-4e7c-9ac4-90de73b77939',
  '3bdbfd25-7f54-4e29-9dba-40edc10c2ed5',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-25T14:05:15.170Z',
  '2025-01-25T14:05:15.170Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9e9b2644-dcbf-4e07-a124-5fd9734deabc',
  '3bdbfd25-7f54-4e29-9dba-40edc10c2ed5',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-25T14:05:15.170Z',
  '2025-01-25T14:05:15.170Z'
);

-- Order 9/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '810f3f5d-f44a-4746-b127-40b9ac9f4a6f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  285.13,
  249.99,
  23.05,
  12.09,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-29T19:06:29.351Z',
  '2024-04-29T19:06:29.351Z'
);

-- Order Item for Order 9
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '625606b6-2c92-4ee3-b9ee-950f091e37c5',
  '810f3f5d-f44a-4746-b127-40b9ac9f4a6f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-29T19:06:29.351Z',
  '2024-04-29T19:06:29.351Z'
);

-- Order 10/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  4577.49,
  4287.15,
  281.24,
  9.10,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2a658071-3c37-4b56-a25b-3e5437ea28ef',
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7268a403-292d-4cb3-8e19-d84c13750a6d',
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e12b2d60-e0e2-4216-8308-8c4253191750',
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8fd948e0-36c3-481c-a89b-a8c6dba4a46d',
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '347a3d8f-1414-4151-afb8-9c91317d3129',
  '97132464-4dcc-40ac-aec4-1dd42f857697',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-21T03:51:26.786Z',
  '2024-10-21T03:51:26.786Z'
);

-- Order 11/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '03ef1213-c806-48d5-ab50-3692be85198f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1723.99,
  1576.98,
  143.66,
  16.43,
  13.08,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-20T13:54:28.789Z',
  '2025-02-20T13:54:28.789Z'
);

-- Order Item for Order 11
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f7a9fbfe-20df-4a7a-a812-33af9b153e91',
  '03ef1213-c806-48d5-ab50-3692be85198f',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-20T13:54:28.789Z',
  '2025-02-20T13:54:28.789Z'
);

-- Order Item for Order 11
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4af0c9a4-e68a-4651-9f7f-94f64b03cb77',
  '03ef1213-c806-48d5-ab50-3692be85198f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-20T13:54:28.789Z',
  '2025-02-20T13:54:28.789Z'
);

-- Order 12/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2367672e-0b7d-43a5-8467-47337d7ceafb',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  2371.65,
  2162.00,
  191.77,
  17.88,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-08-22T12:30:25.703Z',
  '2024-08-22T12:30:25.703Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8d2a8df2-8f37-47bb-8850-7dd21f9ff588',
  '2367672e-0b7d-43a5-8467-47337d7ceafb',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-22T12:30:25.703Z',
  '2024-08-22T12:30:25.703Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a3faa248-1c3c-4fb5-8cbc-e27a0a27cfac',
  '2367672e-0b7d-43a5-8467-47337d7ceafb',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-22T12:30:25.703Z',
  '2024-08-22T12:30:25.703Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0251dac6-c022-4e9e-ad6b-d83237d6acbb',
  '2367672e-0b7d-43a5-8467-47337d7ceafb',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-22T12:30:25.703Z',
  '2024-08-22T12:30:25.703Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '379300f0-1b75-4022-88fa-03df344b8f23',
  '2367672e-0b7d-43a5-8467-47337d7ceafb',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-22T12:30:25.703Z',
  '2024-08-22T12:30:25.703Z'
);

-- Order 13/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'aa33a19c-e60d-4849-8cf3-19114d9aedd9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  1205.85,
  1111.32,
  84.24,
  10.29,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-23T12:30:17.474Z',
  '2024-12-23T12:30:17.474Z'
);

-- Order Item for Order 13
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '61b59565-b630-489c-b9ed-9c9a769de246',
  'aa33a19c-e60d-4849-8cf3-19114d9aedd9',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-23T12:30:17.474Z',
  '2024-12-23T12:30:17.474Z'
);

-- Order Item for Order 13
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e685dadf-c2d1-41df-a969-44ece01d84ad',
  'aa33a19c-e60d-4849-8cf3-19114d9aedd9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-23T12:30:17.474Z',
  '2024-12-23T12:30:17.474Z'
);

-- Order Item for Order 13
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '17d2b332-804c-4dcd-9ffa-04859fccf720',
  'aa33a19c-e60d-4849-8cf3-19114d9aedd9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-23T12:30:17.474Z',
  '2024-12-23T12:30:17.474Z'
);

-- Order Item for Order 13
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '35306d7d-e90a-4e97-874d-23bc35727806',
  'aa33a19c-e60d-4849-8cf3-19114d9aedd9',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-23T12:30:17.474Z',
  '2024-12-23T12:30:17.474Z'
);

-- Order 14/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f08c754e-7f9a-4de9-9e40-fb2e66c226a3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2177.73,
  2057.77,
  112.97,
  23.82,
  16.83,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-03-03T21:14:13.269Z',
  '2025-03-03T21:14:13.269Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4b524d62-f556-45ca-86fd-5daccb196ee8',
  'f08c754e-7f9a-4de9-9e40-fb2e66c226a3',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-03-03T21:14:13.269Z',
  '2025-03-03T21:14:13.269Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bbd19de2-5e86-4f25-aaa5-95862ddeaf01',
  'f08c754e-7f9a-4de9-9e40-fb2e66c226a3',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-03-03T21:14:13.269Z',
  '2025-03-03T21:14:13.269Z'
);

-- Order 15/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '4b658b49-ec37-402d-8c75-d6644f0f89f9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1650.85,
  1538.34,
  104.61,
  7.90,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-03T18:07:03.603Z',
  '2024-11-03T18:07:03.603Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '80294bc6-49f9-4162-a46f-660ed51dbdac',
  '4b658b49-ec37-402d-8c75-d6644f0f89f9',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-03T18:07:03.603Z',
  '2024-11-03T18:07:03.603Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5381bcc-cfb4-4d80-835c-8fb6c25dffbd',
  '4b658b49-ec37-402d-8c75-d6644f0f89f9',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-03T18:07:03.603Z',
  '2024-11-03T18:07:03.603Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e4149100-0ace-4017-9e34-6ae9cccc8bd4',
  '4b658b49-ec37-402d-8c75-d6644f0f89f9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-03T18:07:03.603Z',
  '2024-11-03T18:07:03.603Z'
);

-- Order 16/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c95138aa-0103-482d-9b4a-c2eb5a756870',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  683.25,
  626.10,
  50.40,
  6.75,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-12-23T06:32:52.350Z',
  '2024-12-23T06:32:52.350Z'
);

-- Order Item for Order 16
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '074a2ec3-2045-4370-9d76-ac11464b1b98',
  'c95138aa-0103-482d-9b4a-c2eb5a756870',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-23T06:32:52.350Z',
  '2024-12-23T06:32:52.350Z'
);

-- Order Item for Order 16
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ab823aad-f276-4b2e-9ddc-a3fbbfaee66d',
  'c95138aa-0103-482d-9b4a-c2eb5a756870',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-23T06:32:52.350Z',
  '2024-12-23T06:32:52.350Z'
);

-- Order 17/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  4542.20,
  4163.26,
  392.18,
  9.08,
  22.32,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2daadc53-63a4-4573-9484-61289ec19ddc',
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '95fb7185-c13a-4559-87ba-5090d7a9b1a8',
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '77870a08-4b5e-477f-9d13-16505212b713',
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3212c781-c6ee-4bba-8464-640fa5f25f16',
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b7fd3a64-2c65-43fe-acca-58ee6e590762',
  'bec06440-2b20-4837-acb2-c4e72a270c8d',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-17T02:29:43.766Z',
  '2025-01-17T02:29:43.766Z'
);

-- Order 18/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2315.68,
  2134.94,
  164.82,
  15.92,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '83dca495-4102-4c81-a144-df89640dfe68',
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '532b28f9-869a-4775-8ae3-ab1ad783747d',
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd4096e91-8842-45eb-a955-37cc29c11729',
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b8847386-4a05-4f22-8cd1-a1bad1ab3ec0',
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b9195a4f-270c-4c29-ac56-9a9f70e257f7',
  'd3c106b8-12dc-4c3e-998f-8656280bdce9',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-26T04:47:29.502Z',
  '2024-12-26T04:47:29.502Z'
);

-- Order 19/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  3170.71,
  2896.95,
  277.53,
  21.38,
  25.15,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e34affdd-30fa-45c4-adf3-27d9ff187f05',
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '23cd0a63-bddd-4469-81e5-d2acf0227fd7',
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1a1afb7-7380-46d3-8eab-b0134afeb314',
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a51af133-59e3-4ac1-8c8e-7c5de0cee783',
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c6fdef71-3f87-424c-952d-89d37ea3a16a',
  'a835ca15-4a9b-4ab6-a037-58b42415ff7c',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-12T10:48:11.314Z',
  '2024-03-12T10:48:11.314Z'
);

-- Order 20/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1790.69,
  1614.03,
  155.11,
  21.55,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9584dc10-9907-4d53-a3ac-82d6a2e02f98',
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73714b9f-1bc8-4e44-ad93-8a281832413d',
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd96c3f08-87ff-41c9-ba0f-f6ad6069d25a',
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '142abeba-ac7f-4995-8515-7aaa5b06cdf2',
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73dfbe83-b9b7-4145-b736-b271b3a49dbd',
  '8fffee87-8673-44ed-844d-fa7fcb817320',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-17T00:00:21.605Z',
  '2024-07-17T00:00:21.605Z'
);

-- Order 21/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '24bb1a1a-d6e7-47cf-8a98-8e40b633d5eb',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  668.64,
  620.00,
  40.05,
  8.59,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-21T01:22:36.906Z',
  '2024-10-21T01:22:36.906Z'
);

-- Order Item for Order 21
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8222b9e4-d6a4-45b6-a992-00de25517e9e',
  '24bb1a1a-d6e7-47cf-8a98-8e40b633d5eb',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-21T01:22:36.906Z',
  '2024-10-21T01:22:36.906Z'
);

-- Order Item for Order 21
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3a646566-98dd-4b57-a74a-32d67c615c95',
  '24bb1a1a-d6e7-47cf-8a98-8e40b633d5eb',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-21T01:22:36.906Z',
  '2024-10-21T01:22:36.906Z'
);

-- Order 22/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8dfda69c-01b9-4955-a59a-7a706620ce2f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  1965.11,
  1799.98,
  159.66,
  5.47,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-10-21T19:19:43.923Z',
  '2024-10-21T19:19:43.923Z'
);

-- Order Item for Order 22
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '881a837b-d92f-4b95-bb5d-d753bc8aac41',
  '8dfda69c-01b9-4955-a59a-7a706620ce2f',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-21T19:19:43.923Z',
  '2024-10-21T19:19:43.923Z'
);

-- Order 23/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f80902af-611d-4551-89a4-1737262387ba',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  943.72,
  878.30,
  54.28,
  11.14,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-18T03:49:33.961Z',
  '2024-11-18T03:49:33.961Z'
);

-- Order Item for Order 23
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f2fe23f2-f380-42de-a5cb-f56fae07d448',
  'f80902af-611d-4551-89a4-1737262387ba',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-18T03:49:33.961Z',
  '2024-11-18T03:49:33.961Z'
);

-- Order Item for Order 23
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8a47f2df-d0dd-489a-94f7-3f85db2f1d5f',
  'f80902af-611d-4551-89a4-1737262387ba',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-18T03:49:33.961Z',
  '2024-11-18T03:49:33.961Z'
);

-- Order 24/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  4025.09,
  3777.15,
  245.51,
  18.74,
  16.31,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bea10518-c945-4ce3-9229-538a25e990b8',
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6cd0dbad-88fc-4097-950e-5d81acde16bd',
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '53fe759b-c80d-4d05-8eb7-b27628af2f6d',
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fae95c3a-d6a4-4547-85b5-d4da92d0f5b8',
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '56393d23-1c93-485d-b2d3-c6be22313d5a',
  '270f652c-9510-4342-8a72-116d7bcf3ba8',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-16T04:07:34.667Z',
  '2024-07-16T04:07:34.667Z'
);

-- Order 25/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '878a124f-1c71-4768-a041-397b0bae3d68',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  937.97,
  878.28,
  44.27,
  15.42,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-15T03:22:01.820Z',
  '2024-07-15T03:22:01.820Z'
);

-- Order Item for Order 25
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4e1c2bd3-f3cd-49f3-9ac6-208e0355b1c1',
  '878a124f-1c71-4768-a041-397b0bae3d68',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-15T03:22:01.820Z',
  '2024-07-15T03:22:01.820Z'
);

-- Order Item for Order 25
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6e704629-b92b-4aab-b8d1-582e082f7ede',
  '878a124f-1c71-4768-a041-397b0bae3d68',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-15T03:22:01.820Z',
  '2024-07-15T03:22:01.820Z'
);

-- Order 26/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c72cf22b-8773-4482-85c4-ebd8763779c8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  559.01,
  515.58,
  30.68,
  12.75,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-25T14:44:28.614Z',
  '2024-08-25T14:44:28.614Z'
);

-- Order Item for Order 26
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1018ccd2-ebc9-4e72-b2a1-508e82ac7313',
  'c72cf22b-8773-4482-85c4-ebd8763779c8',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-25T14:44:28.614Z',
  '2024-08-25T14:44:28.614Z'
);

-- Order 27/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2574.66,
  2325.63,
  230.24,
  18.79,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a61d6b5a-bb77-4d68-b1de-183d1c3fdf2e',
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f5a3f2fd-cc7a-4134-b039-8812df500d0d',
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eed42cfd-82e5-4c11-b271-3c75d59ec348',
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fb72b234-a05a-48b3-817f-2e8aadf1a0a3',
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b76a0f30-b00d-4a35-a2d7-8521738fdd52',
  'f380a6a5-23c4-422a-8742-b78d9a6559c1',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-08T11:12:04.864Z',
  '2024-06-08T11:12:04.864Z'
);

-- Order 28/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ac1e694a-f534-4bc2-80d9-517effa0702e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2258.90,
  2051.66,
  203.52,
  20.29,
  16.57,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-01-25T19:26:43.703Z',
  '2025-01-25T19:26:43.703Z'
);

-- Order Item for Order 28
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4878c481-954c-4ba5-890a-69afce4d5f60',
  'ac1e694a-f534-4bc2-80d9-517effa0702e',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-25T19:26:43.703Z',
  '2025-01-25T19:26:43.703Z'
);

-- Order Item for Order 28
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd49552db-9e88-40a8-b710-dbc1ecd8f454',
  'ac1e694a-f534-4bc2-80d9-517effa0702e',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-25T19:26:43.703Z',
  '2025-01-25T19:26:43.703Z'
);

-- Order Item for Order 28
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5b7f26f2-6c20-414a-b826-b7257f14a5c9',
  'ac1e694a-f534-4bc2-80d9-517effa0702e',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-25T19:26:43.703Z',
  '2025-01-25T19:26:43.703Z'
);

-- Order 29/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ea87b37f-6f4c-487c-a0c2-672873f3a042',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  400.75,
  378.30,
  29.81,
  22.42,
  29.78,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-23T21:54:11.132Z',
  '2024-09-23T21:54:11.132Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0972a407-6b7a-42d9-ab2e-7368dac9bd52',
  'ea87b37f-6f4c-487c-a0c2-672873f3a042',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-23T21:54:11.132Z',
  '2024-09-23T21:54:11.132Z'
);

-- Order 30/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f48adab2-582a-47aa-9bee-7ba946775e4d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1218.85,
  1125.58,
  80.93,
  17.98,
  5.64,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-12T07:05:29.993Z',
  '2024-05-12T07:05:29.993Z'
);

-- Order Item for Order 30
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3ef46bdb-d591-4f22-8c7a-83a8d0ba8050',
  'f48adab2-582a-47aa-9bee-7ba946775e4d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-12T07:05:29.993Z',
  '2024-05-12T07:05:29.993Z'
);

-- Order Item for Order 30
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f076fb3b-06da-44ba-be9b-541cf4d2f774',
  'f48adab2-582a-47aa-9bee-7ba946775e4d',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-12T07:05:29.993Z',
  '2024-05-12T07:05:29.993Z'
);

-- Order Item for Order 30
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1f0b6c79-6b1b-4909-bd3f-0e49f7c48ba8',
  'f48adab2-582a-47aa-9bee-7ba946775e4d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-12T07:05:29.993Z',
  '2024-05-12T07:05:29.993Z'
);

-- Order 31/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c7dbc9d0-1383-448c-8b51-8f2914bd3f67',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1811.90,
  1670.55,
  119.78,
  21.57,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-01-13T13:02:10.509Z',
  '2025-01-13T13:02:10.509Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5a4bff0c-5470-4eae-97b0-d9584a45de86',
  'c7dbc9d0-1383-448c-8b51-8f2914bd3f67',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-13T13:02:10.509Z',
  '2025-01-13T13:02:10.509Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '47e09e60-9a6e-460c-9091-ad7e503e25c0',
  'c7dbc9d0-1383-448c-8b51-8f2914bd3f67',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-13T13:02:10.509Z',
  '2025-01-13T13:02:10.509Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '10ed22e6-0647-4adf-86fe-3a4b595ee37f',
  'c7dbc9d0-1383-448c-8b51-8f2914bd3f67',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-13T13:02:10.509Z',
  '2025-01-13T13:02:10.509Z'
);

-- Order 32/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '79e241f4-5e50-48c2-b080-0a3a5ae890d6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  339.57,
  316.09,
  16.06,
  7.42,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-13T03:59:44.157Z',
  '2024-09-13T03:59:44.157Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e3f64dd2-981e-43c8-ba55-908e2c715034',
  '79e241f4-5e50-48c2-b080-0a3a5ae890d6',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-13T03:59:44.157Z',
  '2024-09-13T03:59:44.157Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7d842668-7523-4292-91c0-eb2d91624c3f',
  '79e241f4-5e50-48c2-b080-0a3a5ae890d6',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-13T03:59:44.157Z',
  '2024-09-13T03:59:44.157Z'
);

-- Order 33/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '42232cff-3c9f-4885-977d-02bfbe60e2ae',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  3234.43,
  3059.97,
  158.81,
  15.65,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-18T11:35:28.425Z',
  '2025-02-18T11:35:28.425Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4bc4cc9b-8c1a-4c80-8f16-ab5246ccb94a',
  '42232cff-3c9f-4885-977d-02bfbe60e2ae',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-18T11:35:28.425Z',
  '2025-02-18T11:35:28.425Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9ac6eafe-88b0-43da-8002-f486b356a181',
  '42232cff-3c9f-4885-977d-02bfbe60e2ae',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-18T11:35:28.425Z',
  '2025-02-18T11:35:28.425Z'
);

-- Order 34/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  4500.74,
  4196.95,
  283.71,
  20.08,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c5c91b2f-89ec-4366-806b-65c6c504f5c6',
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cc8b5c21-a452-4f57-a767-de663906f361',
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2e04a9d0-76a0-47a0-805d-1981c4cc5266',
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c3a287f7-4939-4beb-8a60-7cb21363f748',
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd2b13493-bbd5-4bc6-b2ea-09e1d0f67506',
  'b3623f81-cfa0-4de8-b730-a690b87f71a3',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-23T06:48:22.975Z',
  '2025-02-23T06:48:22.975Z'
);

-- Order 35/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c6675ad0-6684-4df3-9ce1-995824bceb79',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  224.45,
  189.99,
  15.83,
  18.63,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-05-07T20:23:08.547Z',
  '2024-05-07T20:23:08.547Z'
);

-- Order Item for Order 35
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1019ff8e-6d3c-4f85-8af3-e7963e219cfe',
  'c6675ad0-6684-4df3-9ce1-995824bceb79',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-07T20:23:08.547Z',
  '2024-05-07T20:23:08.547Z'
);

-- Order 36/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e6d277c7-010c-47cf-9753-80bfbe4b7922',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  1195.48,
  1090.56,
  82.99,
  21.93,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-12T19:46:54.722Z',
  '2024-06-12T19:46:54.722Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f2a58025-3e42-4051-aaab-f63c3ae49655',
  'e6d277c7-010c-47cf-9753-80bfbe4b7922',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-06-12T19:46:54.722Z',
  '2024-06-12T19:46:54.722Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '91ba6b3c-cd30-431a-b1b1-98907775e5b7',
  'e6d277c7-010c-47cf-9753-80bfbe4b7922',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-12T19:46:54.722Z',
  '2024-06-12T19:46:54.722Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7ccb294f-fe35-4e81-bfb8-1e3f2e5a74a4',
  'e6d277c7-010c-47cf-9753-80bfbe4b7922',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-12T19:46:54.722Z',
  '2024-06-12T19:46:54.722Z'
);

-- Order 37/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '047676ea-f1fb-443c-9116-6ca557ed4de1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  4228.41,
  3967.75,
  266.24,
  17.97,
  23.55,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-16T07:45:37.675Z',
  '2024-12-16T07:45:37.675Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2a097065-af94-4ea2-bdcd-b2b16d05937f',
  '047676ea-f1fb-443c-9116-6ca557ed4de1',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-16T07:45:37.675Z',
  '2024-12-16T07:45:37.675Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3bbb541d-7600-416d-be36-4f0238004bf3',
  '047676ea-f1fb-443c-9116-6ca557ed4de1',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-16T07:45:37.675Z',
  '2024-12-16T07:45:37.675Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a3659b96-851c-4b48-bbef-2c3afdf68d81',
  '047676ea-f1fb-443c-9116-6ca557ed4de1',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-16T07:45:37.675Z',
  '2024-12-16T07:45:37.675Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aa6f03c7-8ebc-45bc-8d56-a4a34ce88e0a',
  '047676ea-f1fb-443c-9116-6ca557ed4de1',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-16T07:45:37.675Z',
  '2024-12-16T07:45:37.675Z'
);

-- Order 38/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '71d5d319-0fa0-43de-9de9-dbba0ca38c5a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1940.50,
  1799.98,
  133.38,
  23.05,
  15.91,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-05-13T21:54:14.046Z',
  '2024-05-13T21:54:14.046Z'
);

-- Order Item for Order 38
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bf847f7e-4292-4820-b422-d46eb20a2dbe',
  '71d5d319-0fa0-43de-9de9-dbba0ca38c5a',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-05-13T21:54:14.046Z',
  '2024-05-13T21:54:14.046Z'
);

-- Order 39/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'dd5b36e9-b853-4c93-a009-76053366a5d3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1651.77,
  1491.23,
  145.99,
  14.55,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-17T02:11:36.535Z',
  '2024-04-17T02:11:36.535Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c062cd37-ae3c-4948-a28d-71b5826f5eb8',
  'dd5b36e9-b853-4c93-a009-76053366a5d3',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-17T02:11:36.535Z',
  '2024-04-17T02:11:36.535Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2136c2f2-f94f-4dbc-8e34-e184a66de369',
  'dd5b36e9-b853-4c93-a009-76053366a5d3',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-17T02:11:36.535Z',
  '2024-04-17T02:11:36.535Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd29b646e-4b48-4cdb-951a-295d95213fed',
  'dd5b36e9-b853-4c93-a009-76053366a5d3',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-17T02:11:36.535Z',
  '2024-04-17T02:11:36.535Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '627ea453-56cc-4b9c-ae01-90b2e7be7b35',
  'dd5b36e9-b853-4c93-a009-76053366a5d3',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-17T02:11:36.535Z',
  '2024-04-17T02:11:36.535Z'
);

-- Order 40/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '64aa0249-3ab3-4c4e-bb81-1e58681d6c59',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1602.83,
  1449.95,
  138.18,
  14.70,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-16T18:25:40.741Z',
  '2024-04-16T18:25:40.741Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '64b54cb7-5c86-4137-a89f-8acf64e135ce',
  '64aa0249-3ab3-4c4e-bb81-1e58681d6c59',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-16T18:25:40.741Z',
  '2024-04-16T18:25:40.741Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b051b6cb-c86e-4ab2-b3d5-fc46d9c5febd',
  '64aa0249-3ab3-4c4e-bb81-1e58681d6c59',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-16T18:25:40.741Z',
  '2024-04-16T18:25:40.741Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '091c6606-7752-49be-9b25-57bf7e825b73',
  '64aa0249-3ab3-4c4e-bb81-1e58681d6c59',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-16T18:25:40.741Z',
  '2024-04-16T18:25:40.741Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bf2e27e2-f512-4bc3-a0ee-09366b4c1b4c',
  '64aa0249-3ab3-4c4e-bb81-1e58681d6c59',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-16T18:25:40.741Z',
  '2024-04-16T18:25:40.741Z'
);

-- Order 41/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  2469.94,
  2333.28,
  119.46,
  17.20,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'caca5f73-8b76-47f5-91bd-aac0a230830c',
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1e89de33-dd00-45e1-a7b0-1ba85f1e8a76',
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '863ff0ff-214c-459e-abc4-32be6619f0ee',
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a241d816-580f-474e-b912-45c609572d71',
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9619daec-700e-49d0-a1ab-dedf03ea0e21',
  'ed7a7b4d-1a6e-4779-82cb-ff0a771473fc',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-14T14:37:01.788Z',
  '2024-07-14T14:37:01.788Z'
);

-- Order 42/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a8084a8b-6ea0-4a18-99a1-80c32686162d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  2784.39,
  2539.96,
  239.01,
  5.42,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-03-06T23:06:12.487Z',
  '2024-03-06T23:06:12.487Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8adadea0-9db0-476d-8948-b2a6291ac55e',
  'a8084a8b-6ea0-4a18-99a1-80c32686162d',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-06T23:06:12.487Z',
  '2024-03-06T23:06:12.487Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5188a438-a3cd-4a72-bd9b-f74e2e7c8a99',
  'a8084a8b-6ea0-4a18-99a1-80c32686162d',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-03-06T23:06:12.487Z',
  '2024-03-06T23:06:12.487Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '68670002-185b-4f1b-ae91-87d6c4ef2946',
  'a8084a8b-6ea0-4a18-99a1-80c32686162d',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-06T23:06:12.487Z',
  '2024-03-06T23:06:12.487Z'
);

-- Order 43/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '1236afd0-cbca-4270-9e04-4452ba8f7630',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  421.44,
  378.30,
  25.91,
  17.23,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-04T11:28:31.629Z',
  '2024-11-04T11:28:31.629Z'
);

-- Order Item for Order 43
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8c9fc5a2-76c6-44d0-9a09-d6452592272d',
  '1236afd0-cbca-4270-9e04-4452ba8f7630',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-04T11:28:31.629Z',
  '2024-11-04T11:28:31.629Z'
);

-- Order 44/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  3052.53,
  2820.53,
  213.51,
  18.49,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5a99b709-1280-4d8c-afc2-0facb665cc93',
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76cd933b-c17d-46b1-bcd2-7c4086e05dc8',
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b24fee13-83ca-42e2-9d31-c7526405af9e',
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c1086c53-bd35-4ad1-a63b-4620a0d9ee0a',
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ac901453-c6b4-4998-8746-2b37718eb99d',
  '46122492-df2a-4e8a-a9c6-b2d33e47145d',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-02T23:50:42.954Z',
  '2025-01-02T23:50:42.954Z'
);

-- Order 45/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '513649ea-97e3-4a3b-8103-418d15279610',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2579.73,
  2399.15,
  170.34,
  10.24,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-21T00:18:55.962Z',
  '2025-02-21T00:18:55.962Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e1903f0a-5b9d-4c42-9cd0-ade12bed851c',
  '513649ea-97e3-4a3b-8103-418d15279610',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-21T00:18:55.962Z',
  '2025-02-21T00:18:55.962Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4acb6797-ba52-4c6c-a5d0-73b71b6a2a45',
  '513649ea-97e3-4a3b-8103-418d15279610',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-21T00:18:55.962Z',
  '2025-02-21T00:18:55.962Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5d3af1d3-c13c-43f6-a3b2-a56a73898b5d',
  '513649ea-97e3-4a3b-8103-418d15279610',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-21T00:18:55.962Z',
  '2025-02-21T00:18:55.962Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9c057484-872c-407f-a69b-079c24914a2e',
  '513649ea-97e3-4a3b-8103-418d15279610',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-21T00:18:55.962Z',
  '2025-02-21T00:18:55.962Z'
);

-- Order 46/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  2187.38,
  2034.21,
  134.26,
  18.91,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5b860b4d-31f6-481b-b9f7-54356a01abb4',
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aa934e5b-5033-4e68-9b6c-7ec3a98cde0f',
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f30d1447-68c8-4bb1-b87c-15607fcf7a1f',
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '93eeb4e3-bc88-435c-9ae6-641dfad41422',
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7bee40e3-425a-4236-addf-9bce9696d5a5',
  'd9b3da8d-6a95-4c62-aef7-e00dc7bda11f',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-06T22:01:32.138Z',
  '2024-03-06T22:01:32.138Z'
);

-- Order 47/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '58653e7d-5c5f-4708-8068-6e7e3222e3f6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  3350.12,
  3108.25,
  239.96,
  14.50,
  12.59,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-23T03:31:47.745Z',
  '2024-09-23T03:31:47.745Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'db96f246-2a84-47af-9582-87e3a3d24ef4',
  '58653e7d-5c5f-4708-8068-6e7e3222e3f6',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-23T03:31:47.745Z',
  '2024-09-23T03:31:47.745Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6f9326f1-c926-4f0a-82ef-c3a371116c64',
  '58653e7d-5c5f-4708-8068-6e7e3222e3f6',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-23T03:31:47.745Z',
  '2024-09-23T03:31:47.745Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c843aec3-5330-4a5e-8378-4612b60afeb3',
  '58653e7d-5c5f-4708-8068-6e7e3222e3f6',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-23T03:31:47.745Z',
  '2024-09-23T03:31:47.745Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a4d52030-3228-4408-887d-afd970a7efa0',
  '58653e7d-5c5f-4708-8068-6e7e3222e3f6',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-23T03:31:47.745Z',
  '2024-09-23T03:31:47.745Z'
);

-- Order 48/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6b714d1f-ec13-446c-8bdd-f2c271909929',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1242.05,
  1142.20,
  86.12,
  13.73,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-22T17:20:42.354Z',
  '2024-11-22T17:20:42.354Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '25a23479-4719-4d09-ba3c-5631a7c61995',
  '6b714d1f-ec13-446c-8bdd-f2c271909929',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-22T17:20:42.354Z',
  '2024-11-22T17:20:42.354Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a9a2426a-bbd4-42ab-8e19-8c8467bd42a4',
  '6b714d1f-ec13-446c-8bdd-f2c271909929',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-22T17:20:42.354Z',
  '2024-11-22T17:20:42.354Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9472b2d3-5322-43ff-9901-c8d48a0a3782',
  '6b714d1f-ec13-446c-8bdd-f2c271909929',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-22T17:20:42.354Z',
  '2024-11-22T17:20:42.354Z'
);

-- Order 49/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2d6cdb2d-0afe-4777-973a-7132b151557d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  1833.43,
  1709.95,
  116.28,
  7.20,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-07T23:37:26.596Z',
  '2024-09-07T23:37:26.596Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e2c92e4e-bbe2-4cc9-a422-fef09a47dc07',
  '2d6cdb2d-0afe-4777-973a-7132b151557d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-07T23:37:26.596Z',
  '2024-09-07T23:37:26.596Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a4a7a148-add3-40d8-8e3a-624ffccffeed',
  '2d6cdb2d-0afe-4777-973a-7132b151557d',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-07T23:37:26.596Z',
  '2024-09-07T23:37:26.596Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '17a22bf8-a48f-4ddb-b9f3-12dd5f4a4392',
  '2d6cdb2d-0afe-4777-973a-7132b151557d',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-09-07T23:37:26.596Z',
  '2024-09-07T23:37:26.596Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'be86d2c3-b6b3-4427-ad36-b8a920445cd2',
  '2d6cdb2d-0afe-4777-973a-7132b151557d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-09-07T23:37:26.596Z',
  '2024-09-07T23:37:26.596Z'
);

-- Order 50/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'af7de4ed-5b2c-4a6a-8f54-38f30b6797d8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  254.46,
  240.00,
  21.36,
  17.13,
  24.03,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-25T15:02:11.841Z',
  '2025-02-25T15:02:11.841Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3b027b52-d024-4947-9bc4-ad8c6b4b3c9f',
  'af7de4ed-5b2c-4a6a-8f54-38f30b6797d8',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-25T15:02:11.841Z',
  '2025-02-25T15:02:11.841Z'
);

-- Order 51/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '7472ee7d-7441-49d3-ae78-c27c99b40679',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  2055.11,
  1915.55,
  117.81,
  21.75,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-25T18:00:50.381Z',
  '2025-02-25T18:00:50.381Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'db3853aa-3bc6-42f4-937f-0ab46cd98127',
  '7472ee7d-7441-49d3-ae78-c27c99b40679',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-25T18:00:50.381Z',
  '2025-02-25T18:00:50.381Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8b09621d-fe5e-489c-973b-b422eee5f5f4',
  '7472ee7d-7441-49d3-ae78-c27c99b40679',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-25T18:00:50.381Z',
  '2025-02-25T18:00:50.381Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '93c16acb-13e5-4485-bfa1-53528ab93c66',
  '7472ee7d-7441-49d3-ae78-c27c99b40679',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-25T18:00:50.381Z',
  '2025-02-25T18:00:50.381Z'
);

-- Order 52/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b90fcde1-0ea7-4582-be4f-6921697525fa',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1080.14,
  1007.76,
  64.50,
  24.10,
  16.22,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-20T20:41:47.267Z',
  '2024-11-20T20:41:47.267Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2d18f338-9149-4421-a887-b2248eea2543',
  'b90fcde1-0ea7-4582-be4f-6921697525fa',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-20T20:41:47.267Z',
  '2024-11-20T20:41:47.267Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0ca993a4-9fcd-409b-bdcc-a52ecb95738a',
  'b90fcde1-0ea7-4582-be4f-6921697525fa',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-20T20:41:47.267Z',
  '2024-11-20T20:41:47.267Z'
);

-- Order 53/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '57cfe94d-17aa-404f-913d-e109a9956dfa',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1956.20,
  1807.32,
  146.21,
  15.69,
  13.02,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-02T16:30:37.967Z',
  '2024-09-02T16:30:37.967Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c78f3bbd-e15c-49ba-b64d-70594d0f278c',
  '57cfe94d-17aa-404f-913d-e109a9956dfa',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-02T16:30:37.967Z',
  '2024-09-02T16:30:37.967Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e534e1f4-a9c7-42a1-8743-d5c9bb52c467',
  '57cfe94d-17aa-404f-913d-e109a9956dfa',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-02T16:30:37.967Z',
  '2024-09-02T16:30:37.967Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a9ad3a73-9c66-43a3-adcd-262d5d677483',
  '57cfe94d-17aa-404f-913d-e109a9956dfa',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-02T16:30:37.967Z',
  '2024-09-02T16:30:37.967Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1b798508-bce6-435e-b69c-5fdb389fe308',
  '57cfe94d-17aa-404f-913d-e109a9956dfa',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-02T16:30:37.967Z',
  '2024-09-02T16:30:37.967Z'
);

-- Order 54/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '12d246c1-784b-4ac7-8e0a-aeb59d7919d3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  1681.01,
  1517.75,
  140.85,
  22.41,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-01-23T05:10:35.314Z',
  '2025-01-23T05:10:35.314Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2296e4e0-1c7b-4644-a362-759917bdec5a',
  '12d246c1-784b-4ac7-8e0a-aeb59d7919d3',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-23T05:10:35.314Z',
  '2025-01-23T05:10:35.314Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '69316e33-63f3-427c-817e-f3805e9c15d2',
  '12d246c1-784b-4ac7-8e0a-aeb59d7919d3',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-23T05:10:35.314Z',
  '2025-01-23T05:10:35.314Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6d14ae55-4510-40a6-a915-672901eb2731',
  '12d246c1-784b-4ac7-8e0a-aeb59d7919d3',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-23T05:10:35.314Z',
  '2025-01-23T05:10:35.314Z'
);

-- Order 55/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a98f6e9e-00b8-4594-bfbd-00438c3208ae',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1807.97,
  1658.68,
  137.50,
  21.09,
  9.30,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-20T15:19:42.949Z',
  '2024-12-20T15:19:42.949Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5d86e4c5-2480-4a07-9ad1-01b237d4155b',
  'a98f6e9e-00b8-4594-bfbd-00438c3208ae',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-20T15:19:42.949Z',
  '2024-12-20T15:19:42.949Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2cc3d19e-9d20-4cc5-93fe-6d7c901ed409',
  'a98f6e9e-00b8-4594-bfbd-00438c3208ae',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-20T15:19:42.949Z',
  '2024-12-20T15:19:42.949Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a0f636ff-3093-4364-bf97-1aec3d93e930',
  'a98f6e9e-00b8-4594-bfbd-00438c3208ae',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-20T15:19:42.949Z',
  '2024-12-20T15:19:42.949Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ecfe18b1-51e8-4193-bd07-6c8c50ef5ce0',
  'a98f6e9e-00b8-4594-bfbd-00438c3208ae',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-20T15:19:42.949Z',
  '2024-12-20T15:19:42.949Z'
);

-- Order 56/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9725ac70-7d8b-4607-adc9-fd816fc28d95',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  3268.30,
  3074.19,
  196.44,
  18.72,
  21.05,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-30T07:40:56.329Z',
  '2025-01-30T07:40:56.329Z'
);

-- Order Item for Order 56
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b2887f56-c0a4-4715-b611-dd8ca7cec437',
  '9725ac70-7d8b-4607-adc9-fd816fc28d95',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-30T07:40:56.329Z',
  '2025-01-30T07:40:56.329Z'
);

-- Order Item for Order 56
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2195bdac-1717-4bff-84a1-eddf8748658e',
  '9725ac70-7d8b-4607-adc9-fd816fc28d95',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-30T07:40:56.329Z',
  '2025-01-30T07:40:56.329Z'
);

-- Order Item for Order 56
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5d67559a-c946-4252-ade4-47d51751a366',
  '9725ac70-7d8b-4607-adc9-fd816fc28d95',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-30T07:40:56.329Z',
  '2025-01-30T07:40:56.329Z'
);

-- Order Item for Order 56
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '39e65f0f-fe33-41b5-904a-4ff392282e34',
  '9725ac70-7d8b-4607-adc9-fd816fc28d95',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-30T07:40:56.329Z',
  '2025-01-30T07:40:56.329Z'
);

-- Order 57/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd0f39e41-b734-4c04-b247-4461d31b4d45',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  1946.18,
  1824.99,
  131.22,
  15.69,
  25.72,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-11-02T05:39:57.268Z',
  '2024-11-02T05:39:57.268Z'
);

-- Order Item for Order 57
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2e56acd2-9060-4750-9f80-1563220a91ab',
  'd0f39e41-b734-4c04-b247-4461d31b4d45',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-02T05:39:57.268Z',
  '2024-11-02T05:39:57.268Z'
);

-- Order Item for Order 57
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ea20b848-ad04-4923-a31f-22d2c6191749',
  'd0f39e41-b734-4c04-b247-4461d31b4d45',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-02T05:39:57.268Z',
  '2024-11-02T05:39:57.268Z'
);

-- Order Item for Order 57
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a97a6a65-172d-4402-9f08-5699a98a6579',
  'd0f39e41-b734-4c04-b247-4461d31b4d45',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-02T05:39:57.268Z',
  '2024-11-02T05:39:57.268Z'
);

-- Order Item for Order 57
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '17dd6824-654f-4ade-bcbf-a6909300677f',
  'd0f39e41-b734-4c04-b247-4461d31b4d45',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-02T05:39:57.268Z',
  '2024-11-02T05:39:57.268Z'
);

-- Order 58/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '381d3199-808b-4fc8-b89e-86a678ea18d0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1262.16,
  1182.17,
  70.58,
  9.41,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-11-07T20:58:32.858Z',
  '2024-11-07T20:58:32.858Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '270f1bd1-5aee-44f9-9dd9-0f9420d9ebfa',
  '381d3199-808b-4fc8-b89e-86a678ea18d0',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-07T20:58:32.858Z',
  '2024-11-07T20:58:32.858Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'addd8a49-9cf0-4135-98c4-c9a5a1f4f706',
  '381d3199-808b-4fc8-b89e-86a678ea18d0',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-07T20:58:32.858Z',
  '2024-11-07T20:58:32.858Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aec0c87f-4636-4d5b-b46d-5219126702bc',
  '381d3199-808b-4fc8-b89e-86a678ea18d0',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-07T20:58:32.858Z',
  '2024-11-07T20:58:32.858Z'
);

-- Order 59/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '19b1ead8-3c75-4c42-b270-0c18d1de01c7',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1386.53,
  1274.79,
  94.59,
  17.15,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-13T01:29:09.030Z',
  '2025-02-13T01:29:09.030Z'
);

-- Order Item for Order 59
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '67be36bb-a803-421f-a608-5b315787146c',
  '19b1ead8-3c75-4c42-b270-0c18d1de01c7',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-13T01:29:09.030Z',
  '2025-02-13T01:29:09.030Z'
);

-- Order Item for Order 59
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e4192008-69d8-4ef7-82cc-6690c7bdc748',
  '19b1ead8-3c75-4c42-b270-0c18d1de01c7',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-13T01:29:09.030Z',
  '2025-02-13T01:29:09.030Z'
);

-- Order Item for Order 59
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6bc67044-6e43-44a9-8648-22590bc40db6',
  '19b1ead8-3c75-4c42-b270-0c18d1de01c7',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-13T01:29:09.030Z',
  '2025-02-13T01:29:09.030Z'
);

-- Order 60/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2424a796-7abf-47c1-bb9e-0e583c1dd573',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  877.79,
  827.01,
  53.59,
  20.42,
  23.23,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-01T01:00:08.338Z',
  '2025-02-01T01:00:08.338Z'
);

-- Order Item for Order 60
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '350edcb6-2f4a-46bf-9038-5e37932eeac5',
  '2424a796-7abf-47c1-bb9e-0e583c1dd573',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-01T01:00:08.338Z',
  '2025-02-01T01:00:08.338Z'
);

-- Order 61/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '4bfa5a64-a982-4ffe-9d01-17af9362dba0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1494.22,
  1388.30,
  82.05,
  23.87,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-10-31T04:04:24.698Z',
  '2024-10-31T04:04:24.698Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '45ab04ff-d834-4c0a-a281-2f24fe910e89',
  '4bfa5a64-a982-4ffe-9d01-17af9362dba0',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-31T04:04:24.698Z',
  '2024-10-31T04:04:24.698Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6e7b1cbd-b395-40fc-be04-5ebc2cf35629',
  '4bfa5a64-a982-4ffe-9d01-17af9362dba0',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-31T04:04:24.698Z',
  '2024-10-31T04:04:24.698Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '428bc0cd-df70-4c59-a6b6-4a2a72514d3c',
  '4bfa5a64-a982-4ffe-9d01-17af9362dba0',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-31T04:04:24.698Z',
  '2024-10-31T04:04:24.698Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c4cfb4d4-5b70-486f-9097-af54632d1f7e',
  '4bfa5a64-a982-4ffe-9d01-17af9362dba0',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-31T04:04:24.698Z',
  '2024-10-31T04:04:24.698Z'
);

-- Order 62/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a414aaf4-f815-41be-af84-43133a9bccdb',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  4331.41,
  3938.94,
  376.56,
  15.91,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-06T21:03:36.823Z',
  '2024-10-06T21:03:36.823Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e7c06dbc-6dd4-4840-88d4-17af67a4f6e0',
  'a414aaf4-f815-41be-af84-43133a9bccdb',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-06T21:03:36.823Z',
  '2024-10-06T21:03:36.823Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f24cec38-d68a-45d3-ab6c-ba1355725523',
  'a414aaf4-f815-41be-af84-43133a9bccdb',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-06T21:03:36.823Z',
  '2024-10-06T21:03:36.823Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fcd91d61-62ab-4f2a-a647-3049c26cc18b',
  'a414aaf4-f815-41be-af84-43133a9bccdb',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-06T21:03:36.823Z',
  '2024-10-06T21:03:36.823Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ad8bdc76-7944-40f8-a7e2-20a4f071c0f3',
  'a414aaf4-f815-41be-af84-43133a9bccdb',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-06T21:03:36.823Z',
  '2024-10-06T21:03:36.823Z'
);

-- Order 63/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  2128.09,
  1937.86,
  165.69,
  24.54,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd27c962b-58a2-48a2-9118-c4bdaa952ecc',
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f246f6e9-e7c6-4114-9d80-e0f9676d75cd',
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1636d959-d6b0-41bf-b7db-0bd9b15434c7',
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9ee247ac-cbe4-4a5f-8358-90873e234203',
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd0aab44d-8b40-42dc-b6c7-0979e1a08041',
  '7b8690c3-2efa-422d-af6f-3e67a70c3d89',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-10T09:22:30.536Z',
  '2025-02-10T09:22:30.536Z'
);

-- Order 64/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '13b583dd-761f-4d3d-8b98-811b5713b878',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  537.51,
  499.98,
  29.25,
  8.28,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-12-12T15:03:54.771Z',
  '2024-12-12T15:03:54.771Z'
);

-- Order Item for Order 64
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a9915cb3-99e0-4458-8092-e662d931cf83',
  '13b583dd-761f-4d3d-8b98-811b5713b878',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-12T15:03:54.771Z',
  '2024-12-12T15:03:54.771Z'
);

-- Order 65/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c2d8a070-5c4e-478a-a760-b6ca16ba24a4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  424.98,
  378.30,
  27.16,
  19.52,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-06-08T00:22:24.430Z',
  '2024-06-08T00:22:24.430Z'
);

-- Order Item for Order 65
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b36adf34-85be-4468-9c8c-b366d7359ea0',
  'c2d8a070-5c4e-478a-a760-b6ca16ba24a4',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-08T00:22:24.430Z',
  '2024-06-08T00:22:24.430Z'
);

-- Order 66/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '25fd9224-0482-4690-9654-360848820b6a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1678.02,
  1565.31,
  114.11,
  6.19,
  7.59,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-03-31T21:58:23.347Z',
  '2024-03-31T21:58:23.347Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '42775ead-1600-4e3d-a670-969af814199e',
  '25fd9224-0482-4690-9654-360848820b6a',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-31T21:58:23.347Z',
  '2024-03-31T21:58:23.347Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ca0a6767-e7d2-4abb-a7f0-672dfe1119c3',
  '25fd9224-0482-4690-9654-360848820b6a',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-31T21:58:23.347Z',
  '2024-03-31T21:58:23.347Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7f19fae6-746f-4740-ac44-4537488ab211',
  '25fd9224-0482-4690-9654-360848820b6a',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-31T21:58:23.347Z',
  '2024-03-31T21:58:23.347Z'
);

-- Order 67/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd4b7c0f1-cf6d-48ea-8176-c10140f1e38e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1247.12,
  1139.97,
  84.70,
  22.45,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-03T23:02:08.207Z',
  '2024-08-03T23:02:08.207Z'
);

-- Order Item for Order 67
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a59c4f75-9ae0-41e5-b9de-9b392a2d092f',
  'd4b7c0f1-cf6d-48ea-8176-c10140f1e38e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-03T23:02:08.207Z',
  '2024-08-03T23:02:08.207Z'
);

-- Order Item for Order 67
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '23ec0bbf-e060-44b9-aaa3-9fe648a79623',
  'd4b7c0f1-cf6d-48ea-8176-c10140f1e38e',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-03T23:02:08.207Z',
  '2024-08-03T23:02:08.207Z'
);

-- Order 68/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3c1ba886-4024-41eb-ac82-d07fe92d8666',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  207.45,
  195.00,
  9.85,
  16.19,
  13.59,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-18T13:51:06.958Z',
  '2024-07-18T13:51:06.958Z'
);

-- Order Item for Order 68
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a4bf7cfd-d382-479f-8eee-5901a59f97d4',
  '3c1ba886-4024-41eb-ac82-d07fe92d8666',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-18T13:51:06.958Z',
  '2024-07-18T13:51:06.958Z'
);

-- Order 69/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  3131.43,
  2869.20,
  248.19,
  14.04,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f4f63c3e-9b42-4455-aee5-cd58ff814e9d',
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9a5fed8f-cb6a-486f-bbaf-1de528de762f',
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '01b6cab8-bfc0-4770-870e-ec1b4d1098d9',
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1563bb20-18e1-4ad1-9da5-2f436c92e77e',
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '996698d9-d919-4480-81fe-5f878f117619',
  '2dd3441e-1185-4f25-96d9-f6641ef0cf3c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-09T21:51:42.591Z',
  '2024-06-09T21:51:42.591Z'
);

-- Order 70/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '04f9bca2-f459-4d39-8379-2e8b4fd7cae2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1917.54,
  1751.68,
  157.83,
  8.03,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-01-22T13:26:59.897Z',
  '2025-01-22T13:26:59.897Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd29ed1fe-5a2c-4fde-a7fc-499ca35f42c6',
  '04f9bca2-f459-4d39-8379-2e8b4fd7cae2',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-22T13:26:59.897Z',
  '2025-01-22T13:26:59.897Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '54a77a70-5c60-443c-aab0-af2c4e3edd2c',
  '04f9bca2-f459-4d39-8379-2e8b4fd7cae2',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-22T13:26:59.897Z',
  '2025-01-22T13:26:59.897Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '47b90079-bbb5-4710-a42a-6365b216871a',
  '04f9bca2-f459-4d39-8379-2e8b4fd7cae2',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-22T13:26:59.897Z',
  '2025-01-22T13:26:59.897Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5b849cfd-e896-4fbd-91ae-8d8d5dceee69',
  '04f9bca2-f459-4d39-8379-2e8b4fd7cae2',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-22T13:26:59.897Z',
  '2025-01-22T13:26:59.897Z'
);

-- Order 71/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '12c9b411-be4f-48d3-92aa-8a972a913032',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  3744.13,
  3526.98,
  198.92,
  18.23,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-02-11T09:52:38.056Z',
  '2025-02-11T09:52:38.056Z'
);

-- Order Item for Order 71
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2c08c94a-440c-4e7e-9f36-0267877cc808',
  '12c9b411-be4f-48d3-92aa-8a972a913032',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-11T09:52:38.056Z',
  '2025-02-11T09:52:38.056Z'
);

-- Order Item for Order 71
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2371ed4d-2014-46cb-af32-531a00383cbd',
  '12c9b411-be4f-48d3-92aa-8a972a913032',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-11T09:52:38.056Z',
  '2025-02-11T09:52:38.056Z'
);

-- Order 72/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9565fdd3-c7ef-435a-9657-30be231d440f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  748.70,
  696.07,
  40.65,
  11.98,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-21T07:43:52.865Z',
  '2024-11-21T07:43:52.865Z'
);

-- Order Item for Order 72
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'da076090-2581-4548-be55-16af66e37baa',
  '9565fdd3-c7ef-435a-9657-30be231d440f',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-21T07:43:52.865Z',
  '2024-11-21T07:43:52.865Z'
);

-- Order Item for Order 72
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c7b11404-15c5-4401-820c-d98d666aa906',
  '9565fdd3-c7ef-435a-9657-30be231d440f',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-21T07:43:52.865Z',
  '2024-11-21T07:43:52.865Z'
);

-- Order 73/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '0db32f3f-4801-4284-8bca-bcfec89c7a2e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  987.32,
  899.99,
  75.96,
  11.37,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-22T09:39:11.557Z',
  '2024-04-22T09:39:11.557Z'
);

-- Order Item for Order 73
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8f8cbd62-9e68-46f2-b932-39cca2a43059',
  '0db32f3f-4801-4284-8bca-bcfec89c7a2e',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-22T09:39:11.557Z',
  '2024-04-22T09:39:11.557Z'
);

-- Order 74/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'db7cde6a-1980-4db2-9679-1d1f14e32f78',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  691.77,
  629.98,
  52.04,
  9.75,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-05-04T04:19:44.651Z',
  '2024-05-04T04:19:44.651Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2d8e6232-1209-4b37-a8de-053b3751620f',
  'db7cde6a-1980-4db2-9679-1d1f14e32f78',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-04T04:19:44.651Z',
  '2024-05-04T04:19:44.651Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9df121e8-6e8c-4527-a82a-05ba5f2b9905',
  'db7cde6a-1980-4db2-9679-1d1f14e32f78',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-04T04:19:44.651Z',
  '2024-05-04T04:19:44.651Z'
);

-- Order 75/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '224f6ada-fc97-4875-821e-80d7ed0e8fd4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  398.00,
  360.00,
  31.97,
  6.03,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-21T11:00:41.704Z',
  '2025-02-21T11:00:41.704Z'
);

-- Order Item for Order 75
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e0602ea1-f9a1-4dd3-9d7d-655ef105376e',
  '224f6ada-fc97-4875-821e-80d7ed0e8fd4',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-21T11:00:41.704Z',
  '2025-02-21T11:00:41.704Z'
);

-- Order 76/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '04b1e82f-042a-4e66-b896-8594be5dc3dd',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  263.56,
  240.00,
  12.48,
  11.08,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-16T10:07:56.038Z',
  '2024-11-16T10:07:56.038Z'
);

-- Order Item for Order 76
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '994553d6-5c2b-44d1-841e-8f6048226628',
  '04b1e82f-042a-4e66-b896-8594be5dc3dd',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-16T10:07:56.038Z',
  '2024-11-16T10:07:56.038Z'
);

-- Order 77/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5b9ab834-49ff-4dde-9fe3-b146756386b4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  563.50,
  509.99,
  28.97,
  24.54,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-08T21:11:35.477Z',
  '2024-10-08T21:11:35.477Z'
);

-- Order Item for Order 77
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0939d752-b04e-451c-93fe-9cfdf12e313e',
  '5b9ab834-49ff-4dde-9fe3-b146756386b4',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-08T21:11:35.477Z',
  '2024-10-08T21:11:35.477Z'
);

-- Order Item for Order 77
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '96794c52-ec35-4f41-b3e3-a8d28516c5a3',
  '5b9ab834-49ff-4dde-9fe3-b146756386b4',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-08T21:11:35.477Z',
  '2024-10-08T21:11:35.477Z'
);

-- Order 78/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '469217e4-f2ad-4ca5-b10f-3bcb37e9cbfe',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2056.07,
  1925.66,
  129.60,
  12.26,
  11.45,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-02T09:16:25.502Z',
  '2024-12-02T09:16:25.502Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd20751ae-0926-4626-8cce-64c80a8edd7f',
  '469217e4-f2ad-4ca5-b10f-3bcb37e9cbfe',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-02T09:16:25.502Z',
  '2024-12-02T09:16:25.502Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dab8dff6-2a4b-46a6-bea2-100b0ab95df9',
  '469217e4-f2ad-4ca5-b10f-3bcb37e9cbfe',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-02T09:16:25.502Z',
  '2024-12-02T09:16:25.502Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '30e23959-ca37-4c9b-aaa6-8ebc4e831dfb',
  '469217e4-f2ad-4ca5-b10f-3bcb37e9cbfe',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-02T09:16:25.502Z',
  '2024-12-02T09:16:25.502Z'
);

-- Order 79/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bf18e7bc-4680-44af-8aa8-e936f2717353',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  3923.44,
  3575.52,
  329.66,
  18.26,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-19T03:12:43.642Z',
  '2024-09-19T03:12:43.642Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b7ba15d3-6cc7-43a6-89f6-337db4e351d9',
  'bf18e7bc-4680-44af-8aa8-e936f2717353',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-09-19T03:12:43.642Z',
  '2024-09-19T03:12:43.642Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aed5cdec-9199-4256-85f5-66bb3c56a14f',
  'bf18e7bc-4680-44af-8aa8-e936f2717353',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-19T03:12:43.642Z',
  '2024-09-19T03:12:43.642Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ec7855ff-f651-44ba-a51f-67fd03f44312',
  'bf18e7bc-4680-44af-8aa8-e936f2717353',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-19T03:12:43.642Z',
  '2024-09-19T03:12:43.642Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6f55edf7-570e-4c61-b6e2-7e7064d648d2',
  'bf18e7bc-4680-44af-8aa8-e936f2717353',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-19T03:12:43.642Z',
  '2024-09-19T03:12:43.642Z'
);

-- Order 80/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ad610cb2-34f7-46f7-8cc2-be5183e277a2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  3010.43,
  2815.65,
  174.85,
  19.93,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-01-05T23:36:32.568Z',
  '2025-01-05T23:36:32.568Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6b9454cd-8ddb-426b-9ae5-9a0683df2d13',
  'ad610cb2-34f7-46f7-8cc2-be5183e277a2',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-05T23:36:32.568Z',
  '2025-01-05T23:36:32.568Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'de32ee69-80d0-4f6b-9f8a-1c85a96bad2e',
  'ad610cb2-34f7-46f7-8cc2-be5183e277a2',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-05T23:36:32.568Z',
  '2025-01-05T23:36:32.568Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e30bd0a3-1a8a-43ef-931c-d28760a20819',
  'ad610cb2-34f7-46f7-8cc2-be5183e277a2',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-05T23:36:32.568Z',
  '2025-01-05T23:36:32.568Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '96071c1c-3d46-4ee3-a346-9a471ac739d1',
  'ad610cb2-34f7-46f7-8cc2-be5183e277a2',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-05T23:36:32.568Z',
  '2025-01-05T23:36:32.568Z'
);

-- Order 81/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '66fa0547-f353-4daa-abda-fcb8c34388c0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  1002.69,
  936.33,
  52.53,
  13.83,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-21T08:08:24.932Z',
  '2024-09-21T08:08:24.932Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7c218f4d-93df-4d3b-b010-294b9fa7aaab',
  '66fa0547-f353-4daa-abda-fcb8c34388c0',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-21T08:08:24.932Z',
  '2024-09-21T08:08:24.932Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e00d62ab-2239-4113-8556-b60a6361691e',
  '66fa0547-f353-4daa-abda-fcb8c34388c0',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-21T08:08:24.932Z',
  '2024-09-21T08:08:24.932Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '67343edc-9a4b-4f0c-9760-a99decfe1a4e',
  '66fa0547-f353-4daa-abda-fcb8c34388c0',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-21T08:08:24.932Z',
  '2024-09-21T08:08:24.932Z'
);

-- Order 82/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e13c6f8d-4cce-45c7-b59d-09e928c95441',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  1910.16,
  1795.55,
  92.11,
  22.50,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-17T15:01:41.430Z',
  '2024-04-17T15:01:41.430Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76cb2f8e-c47f-4493-8165-a5f33a942db3',
  'e13c6f8d-4cce-45c7-b59d-09e928c95441',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-17T15:01:41.430Z',
  '2024-04-17T15:01:41.430Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '03b9c85a-fd31-445b-a435-4a0023995079',
  'e13c6f8d-4cce-45c7-b59d-09e928c95441',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-17T15:01:41.430Z',
  '2024-04-17T15:01:41.430Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cf00cab7-3f10-4f83-8555-38146031d822',
  'e13c6f8d-4cce-45c7-b59d-09e928c95441',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-17T15:01:41.430Z',
  '2024-04-17T15:01:41.430Z'
);

-- Order 83/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'dfca57ce-d090-4963-a78e-8eed36187906',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  1321.93,
  1246.09,
  64.05,
  11.79,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-23T02:41:47.243Z',
  '2025-01-23T02:41:47.243Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a2447ff7-104a-40c0-85bb-72be060a18f6',
  'dfca57ce-d090-4963-a78e-8eed36187906',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-23T02:41:47.243Z',
  '2025-01-23T02:41:47.243Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4a3db6bd-a8c5-4cda-ad24-5a26972318e2',
  'dfca57ce-d090-4963-a78e-8eed36187906',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-23T02:41:47.243Z',
  '2025-01-23T02:41:47.243Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '62d40a1b-5db7-4660-82e4-6a910c0dde16',
  'dfca57ce-d090-4963-a78e-8eed36187906',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-23T02:41:47.243Z',
  '2025-01-23T02:41:47.243Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd088ab2f-955f-410c-931e-151eb254bdd6',
  'dfca57ce-d090-4963-a78e-8eed36187906',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-23T02:41:47.243Z',
  '2025-01-23T02:41:47.243Z'
);

-- Order 84/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3c0123e9-530b-4e30-809d-57b45a0949d0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  2771.18,
  2549.98,
  212.92,
  8.28,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-05T16:48:14.463Z',
  '2024-12-05T16:48:14.463Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cc28f881-943d-48aa-af27-031da65207d4',
  '3c0123e9-530b-4e30-809d-57b45a0949d0',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-05T16:48:14.463Z',
  '2024-12-05T16:48:14.463Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f4aa4c1e-0a9f-48a8-85b3-c1c136b5f151',
  '3c0123e9-530b-4e30-809d-57b45a0949d0',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-05T16:48:14.463Z',
  '2024-12-05T16:48:14.463Z'
);

-- Order 85/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '091878ef-11b9-4e7b-9993-bbe77a761cb5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  427.07,
  384.99,
  22.48,
  19.60,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-05-30T22:17:31.981Z',
  '2024-05-30T22:17:31.981Z'
);

-- Order Item for Order 85
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd841b920-125a-479a-bbdb-49a6c3db2820',
  '091878ef-11b9-4e7b-9993-bbe77a761cb5',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-30T22:17:31.981Z',
  '2024-05-30T22:17:31.981Z'
);

-- Order Item for Order 85
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '919ec410-8bc0-47f0-8977-50ba706a4938',
  '091878ef-11b9-4e7b-9993-bbe77a761cb5',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-30T22:17:31.981Z',
  '2024-05-30T22:17:31.981Z'
);

-- Order 86/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '0564b1c1-0c3e-4ecd-8af8-0cdd3d4de19b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  3393.12,
  3078.27,
  293.36,
  21.49,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-03-22T23:09:20.016Z',
  '2024-03-22T23:09:20.016Z'
);

-- Order Item for Order 86
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7a42ab6f-8636-4234-a01d-1cadec78f093',
  '0564b1c1-0c3e-4ecd-8af8-0cdd3d4de19b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-22T23:09:20.016Z',
  '2024-03-22T23:09:20.016Z'
);

-- Order Item for Order 86
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '52fc38e0-27c3-4996-9388-3c060c199ab5',
  '0564b1c1-0c3e-4ecd-8af8-0cdd3d4de19b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-03-22T23:09:20.016Z',
  '2024-03-22T23:09:20.016Z'
);

-- Order 87/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '13719157-cbab-4406-91aa-326cade80062',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  2556.32,
  2362.85,
  185.48,
  20.70,
  12.71,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4fc8c196-d2c5-4003-bc31-4dee698e690b',
  '13719157-cbab-4406-91aa-326cade80062',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '16e43c09-f9b5-4ad8-8650-9a25ac829bda',
  '13719157-cbab-4406-91aa-326cade80062',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '218fce84-d74f-424e-a84c-58c292c55583',
  '13719157-cbab-4406-91aa-326cade80062',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cea4eb86-f5b9-448c-bb4b-38f651b7b227',
  '13719157-cbab-4406-91aa-326cade80062',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8513af9a-1fbf-45f0-8c57-586e15ead63f',
  '13719157-cbab-4406-91aa-326cade80062',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-16T14:03:06.403Z',
  '2024-08-16T14:03:06.403Z'
);

-- Order 88/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ce0329e5-9d57-466b-9635-622efb3b4ebf',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  2197.84,
  2057.77,
  116.06,
  24.01,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-07T17:49:07.891Z',
  '2024-11-07T17:49:07.891Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c86cbad1-fed9-415d-bf19-b518368b3f85',
  'ce0329e5-9d57-466b-9635-622efb3b4ebf',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-07T17:49:07.891Z',
  '2024-11-07T17:49:07.891Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'db8d46fa-ac1e-42f2-b398-b6f3c1f0674e',
  'ce0329e5-9d57-466b-9635-622efb3b4ebf',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-07T17:49:07.891Z',
  '2024-11-07T17:49:07.891Z'
);

-- Order 89/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  1740.07,
  1603.52,
  120.10,
  16.45,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'baaacdb6-183b-491b-9da9-13cfc0c07254',
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '488f33cb-fa34-4b49-bf44-342a6abc9e48',
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a2785e0d-a0b2-4dcd-8216-2390889776b8',
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dfb801b6-2167-4651-88de-a838e04f56d9',
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eb3d948f-e5ed-41ab-ada8-efc2fdcab9b0',
  '5974cffb-3af8-4cf0-91c4-cde5634d6909',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-28T01:14:59.846Z',
  '2024-06-28T01:14:59.846Z'
);

-- Order 90/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3261604f-28f3-4f45-a812-c393ca1a0339',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2024.64,
  1884.03,
  148.84,
  18.42,
  26.65,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-23T13:12:10.415Z',
  '2024-10-23T13:12:10.415Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3d3f5333-f934-4acc-b036-12fce404b72e',
  '3261604f-28f3-4f45-a812-c393ca1a0339',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-23T13:12:10.415Z',
  '2024-10-23T13:12:10.415Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '095430f1-bf70-40ea-8548-35c3cae09034',
  '3261604f-28f3-4f45-a812-c393ca1a0339',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-23T13:12:10.415Z',
  '2024-10-23T13:12:10.415Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '544f23f2-e2ff-4522-a2b6-813a9a0c8f5b',
  '3261604f-28f3-4f45-a812-c393ca1a0339',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-23T13:12:10.415Z',
  '2024-10-23T13:12:10.415Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '182b48ba-2088-4426-bd8f-5028098fcf30',
  '3261604f-28f3-4f45-a812-c393ca1a0339',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-23T13:12:10.415Z',
  '2024-10-23T13:12:10.415Z'
);

-- Order 91/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'fe4ec1ce-d166-4836-87fb-45e19ce11c87',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  2227.26,
  2039.98,
  167.69,
  19.59,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-27T21:16:47.264Z',
  '2024-12-27T21:16:47.264Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '31e64bf2-7213-40e4-a7dc-1905d35807ae',
  'fe4ec1ce-d166-4836-87fb-45e19ce11c87',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-27T21:16:47.264Z',
  '2024-12-27T21:16:47.264Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ddd90b40-757b-42b0-b983-fd032bac7fa6',
  'fe4ec1ce-d166-4836-87fb-45e19ce11c87',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-27T21:16:47.264Z',
  '2024-12-27T21:16:47.264Z'
);

-- Order 92/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e41118bd-c233-4046-a912-7d061eb9ee4e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2514.35,
  2312.00,
  203.69,
  6.28,
  7.62,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-07-20T05:46:23.962Z',
  '2024-07-20T05:46:23.962Z'
);

-- Order Item for Order 92
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c4d99089-16cd-4d50-87b7-86c750fd3003',
  'e41118bd-c233-4046-a912-7d061eb9ee4e',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-20T05:46:23.962Z',
  '2024-07-20T05:46:23.962Z'
);

-- Order Item for Order 92
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '88e05c70-b813-4805-892a-d53cc5ef25f8',
  'e41118bd-c233-4046-a912-7d061eb9ee4e',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-20T05:46:23.962Z',
  '2024-07-20T05:46:23.962Z'
);

-- Order Item for Order 92
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd3684e7d-f76f-4f16-8378-a9e3fd2b2a4f',
  'e41118bd-c233-4046-a912-7d061eb9ee4e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-20T05:46:23.962Z',
  '2024-07-20T05:46:23.962Z'
);

-- Order 93/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e0f8902a-6798-436f-97de-6d05a7019812',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  5003.20,
  4541.61,
  442.35,
  19.24,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dd8656e4-26d9-4375-a40e-b1b18d4bf970',
  'e0f8902a-6798-436f-97de-6d05a7019812',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5e22258d-cf5f-4b94-8ea0-5553a16b1c8a',
  'e0f8902a-6798-436f-97de-6d05a7019812',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b58260c3-d8a6-4908-88b6-609dde0c4068',
  'e0f8902a-6798-436f-97de-6d05a7019812',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '98bb92bc-a5f6-4550-bad2-2ef557f7b9e4',
  'e0f8902a-6798-436f-97de-6d05a7019812',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed37fa07-6fd5-4c72-b4ec-44c035054aa3',
  'e0f8902a-6798-436f-97de-6d05a7019812',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-13T08:20:36.912Z',
  '2024-04-13T08:20:36.912Z'
);

-- Order 94/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '0bb6a13f-5060-48af-8e80-97143946ac86',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1966.72,
  1845.54,
  107.23,
  13.95,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-28T10:03:55.057Z',
  '2024-05-28T10:03:55.057Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9b3c89e7-fb89-4f17-bbb6-b74d839e94ed',
  '0bb6a13f-5060-48af-8e80-97143946ac86',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-05-28T10:03:55.057Z',
  '2024-05-28T10:03:55.057Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0c4fad43-ad03-4413-a743-24349df3d028',
  '0bb6a13f-5060-48af-8e80-97143946ac86',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-28T10:03:55.057Z',
  '2024-05-28T10:03:55.057Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '804dddf1-a675-4010-8613-243999bba5c6',
  '0bb6a13f-5060-48af-8e80-97143946ac86',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-28T10:03:55.057Z',
  '2024-05-28T10:03:55.057Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5e098074-af52-414b-bde1-b6b5a212ff25',
  '0bb6a13f-5060-48af-8e80-97143946ac86',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-28T10:03:55.057Z',
  '2024-05-28T10:03:55.057Z'
);

-- Order 95/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'fea2b1b6-b334-4e01-ba8a-0fb3add925ef',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  836.94,
  750.00,
  64.50,
  22.44,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-08-22T07:53:46.436Z',
  '2024-08-22T07:53:46.436Z'
);

-- Order Item for Order 95
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '06a4b610-cd03-408e-9769-d7b16bdc781f',
  'fea2b1b6-b334-4e01-ba8a-0fb3add925ef',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-22T07:53:46.436Z',
  '2024-08-22T07:53:46.436Z'
);

-- Order 96/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '27c81ac2-0ce7-49b1-b9ae-9c8c79a3cadf',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'pending',
  3658.11,
  3322.16,
  314.94,
  21.01,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-03T12:20:15.116Z',
  '2024-12-03T12:20:15.116Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '66bd97d2-b004-4b6f-990c-b5f1a9aa530b',
  '27c81ac2-0ce7-49b1-b9ae-9c8c79a3cadf',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-03T12:20:15.116Z',
  '2024-12-03T12:20:15.116Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76f5b0f6-2f5c-4f29-b045-f6cfa87216d6',
  '27c81ac2-0ce7-49b1-b9ae-9c8c79a3cadf',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-03T12:20:15.116Z',
  '2024-12-03T12:20:15.116Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9e2f255c-5ee5-4bc7-8d69-2cff03e66b00',
  '27c81ac2-0ce7-49b1-b9ae-9c8c79a3cadf',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-03T12:20:15.116Z',
  '2024-12-03T12:20:15.116Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '98734958-7b58-4cfb-8ffb-ab15ba213984',
  '27c81ac2-0ce7-49b1-b9ae-9c8c79a3cadf',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-03T12:20:15.116Z',
  '2024-12-03T12:20:15.116Z'
);

-- Order 97/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'cancelled',
  3471.31,
  3254.96,
  209.94,
  6.41,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c4cdc50c-807e-4780-b5ff-b2982ae2a614',
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fe1b037d-c671-4f6d-ace8-5a78ef19551d',
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6fe47cab-7470-4653-8c9d-6daa06751c55',
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '792dbaf7-dc26-43f0-a201-0bfdfa1376e3',
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a06abdd0-a724-4954-8fe7-596aff8a0243',
  'f038c9ee-6ec2-4bcb-aaac-94928f6c818e',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-17T04:04:21.513Z',
  '2024-10-17T04:04:21.513Z'
);

-- Order 98/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'dedd18f1-2e01-44dc-8e0c-5d316f94bcf2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'processing',
  1553.98,
  1444.95,
  95.08,
  13.95,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-03-04T04:23:48.579Z',
  '2025-03-04T04:23:48.579Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1bfb2e82-8d29-423a-9a8c-92dcd63105bc',
  'dedd18f1-2e01-44dc-8e0c-5d316f94bcf2',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-03-04T04:23:48.579Z',
  '2025-03-04T04:23:48.579Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b1394e82-1a6c-4275-bcc8-97193fc6b33d',
  'dedd18f1-2e01-44dc-8e0c-5d316f94bcf2',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-03-04T04:23:48.579Z',
  '2025-03-04T04:23:48.579Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '42cbb402-9c50-4896-ade9-9c862f61e907',
  'dedd18f1-2e01-44dc-8e0c-5d316f94bcf2',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-03-04T04:23:48.579Z',
  '2025-03-04T04:23:48.579Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '70a94773-4a8c-4cdd-8979-cdbbdbee2a42',
  'dedd18f1-2e01-44dc-8e0c-5d316f94bcf2',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-03-04T04:23:48.579Z',
  '2025-03-04T04:23:48.579Z'
);

-- Order 99/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e455e104-74c6-4576-b2ca-99c141899e94',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'refunded',
  2546.96,
  2310.56,
  224.59,
  11.81,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f782d9c4-ad8f-4d82-9a7f-a39061997b4e',
  'e455e104-74c6-4576-b2ca-99c141899e94',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '89b8845a-0f7e-475c-8f5e-62cbeeaa0f65',
  'e455e104-74c6-4576-b2ca-99c141899e94',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eba05027-6c3c-4874-9f8e-8370bd51d283',
  'e455e104-74c6-4576-b2ca-99c141899e94',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '157a02ae-44f7-42fb-9de6-d5a075ec4f8f',
  'e455e104-74c6-4576-b2ca-99c141899e94',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ad63ce55-0206-4df1-958f-4f13d988f5a5',
  'e455e104-74c6-4576-b2ca-99c141899e94',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-10T02:44:54.677Z',
  '2024-12-10T02:44:54.677Z'
);

-- Order 100/100
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b538926e-f021-45a4-a435-22e4e38a911b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '4b6bb7e8-fcd8-4ff6-a216-3571f297a468',
  'completed',
  672.71,
  628.30,
  35.50,
  8.91,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-17T08:13:54.175Z',
  '2024-04-17T08:13:54.175Z'
);

-- Order Item for Order 100
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fbda16db-81f9-453e-9812-947a5af624c3',
  'b538926e-f021-45a4-a435-22e4e38a911b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-17T08:13:54.175Z',
  '2024-04-17T08:13:54.175Z'
);

-- Order Item for Order 100
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '02fbb3e9-d7d9-4284-a72c-7cd4c4070c48',
  'b538926e-f021-45a4-a435-22e4e38a911b',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-17T08:13:54.175Z',
  '2024-04-17T08:13:54.175Z'
);

-- Re-enable foreign key constraint
SET session_replication_role = 'origin';

-- Re-enable triggers
DO $$
BEGIN
  -- Check if triggers exist before attempting to enable them
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    EXECUTE 'ALTER TABLE orders ENABLE TRIGGER audit_orders';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    EXECUTE 'ALTER TABLE orders ENABLE TRIGGER update_orders_updated_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_order_items') THEN
    EXECUTE 'ALTER TABLE order_items ENABLE TRIGGER audit_order_items';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_order_items_updated_at') THEN
    EXECUTE 'ALTER TABLE order_items ENABLE TRIGGER update_order_items_updated_at';
  END IF;
END
$$;

COMMIT;
  