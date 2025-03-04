
-- Disable triggers to improve performance during bulk inserts
ALTER TABLE orders DISABLE TRIGGER audit_orders;
ALTER TABLE orders DISABLE TRIGGER update_orders_updated_at;
ALTER TABLE order_items DISABLE TRIGGER audit_order_items;
ALTER TABLE order_items DISABLE TRIGGER update_order_items_updated_at;

BEGIN;
  
-- Order 1/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'da7af33f-38e3-45b9-9a3b-06295b0fc219',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1769.70,
  1594.99,
  157.11,
  17.60,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-09-24T17:33:14.732Z',
  '2024-09-24T17:33:14.732Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eafea2d9-3689-4994-bab0-d1a8a4bab32a',
  'da7af33f-38e3-45b9-9a3b-06295b0fc219',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-09-24T17:33:14.732Z',
  '2024-09-24T17:33:14.732Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7699ee21-9c39-4516-916e-6048bb48bd69',
  'da7af33f-38e3-45b9-9a3b-06295b0fc219',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-24T17:33:14.732Z',
  '2024-09-24T17:33:14.732Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '84c7f79b-bd31-41e1-b1c7-f7729df342e8',
  'da7af33f-38e3-45b9-9a3b-06295b0fc219',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-24T17:33:14.732Z',
  '2024-09-24T17:33:14.732Z'
);

-- Order Item for Order 1
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd9365cb1-aba7-475b-a2d5-c014794c5553',
  'da7af33f-38e3-45b9-9a3b-06295b0fc219',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-24T17:33:14.732Z',
  '2024-09-24T17:33:14.732Z'
);

-- Order 2/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '612a8a4a-638b-47e2-b7a0-9eb0a8b7f44a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1236.86,
  1136.34,
  81.59,
  18.93,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":true,"tags":[]}',
  '2025-01-14T21:10:59.816Z',
  '2025-01-14T21:10:59.816Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ffcd24c3-1071-49b6-84b1-290465c98b34',
  '612a8a4a-638b-47e2-b7a0-9eb0a8b7f44a',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-14T21:10:59.816Z',
  '2025-01-14T21:10:59.816Z'
);

-- Order Item for Order 2
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c7c9cd6c-9c5f-44db-9dfa-46d19c715fc2',
  '612a8a4a-638b-47e2-b7a0-9eb0a8b7f44a',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-14T21:10:59.816Z',
  '2025-01-14T21:10:59.816Z'
);

-- Order 3/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c5467a44-4ed6-4124-bba2-56d1e1915807',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1332.77,
  1254.99,
  71.03,
  6.75,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-19T02:24:21.375Z',
  '2024-03-19T02:24:21.375Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7b289fd7-156a-4ba9-9036-16d6f9a07667',
  'c5467a44-4ed6-4124-bba2-56d1e1915807',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-19T02:24:21.375Z',
  '2024-03-19T02:24:21.375Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b5730ecc-0538-4645-b2f6-1287838f41b9',
  'c5467a44-4ed6-4124-bba2-56d1e1915807',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-19T02:24:21.375Z',
  '2024-03-19T02:24:21.375Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '48d48305-2b97-4693-847e-db05d066e1af',
  'c5467a44-4ed6-4124-bba2-56d1e1915807',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-19T02:24:21.375Z',
  '2024-03-19T02:24:21.375Z'
);

-- Order Item for Order 3
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '29faab99-70d1-4591-80f2-2777b330000c',
  'c5467a44-4ed6-4124-bba2-56d1e1915807',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-19T02:24:21.375Z',
  '2024-03-19T02:24:21.375Z'
);

-- Order 4/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '495b2ba5-7df1-4f68-94cf-b73b27a43c5c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1603.30,
  1437.78,
  142.20,
  23.32,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-01-15T07:16:38.706Z',
  '2025-01-15T07:16:38.706Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e1343dd7-740d-4798-bebc-35ceef241a5d',
  '495b2ba5-7df1-4f68-94cf-b73b27a43c5c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-15T07:16:38.706Z',
  '2025-01-15T07:16:38.706Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '07e1e18c-1b4a-4ace-9a49-7d408b2e6403',
  '495b2ba5-7df1-4f68-94cf-b73b27a43c5c',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-15T07:16:38.706Z',
  '2025-01-15T07:16:38.706Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '12ebf559-f8eb-432d-887c-63b285229e72',
  '495b2ba5-7df1-4f68-94cf-b73b27a43c5c',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-15T07:16:38.706Z',
  '2025-01-15T07:16:38.706Z'
);

-- Order Item for Order 4
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e9b3b906-920d-44e2-a0a4-363dce59696f',
  '495b2ba5-7df1-4f68-94cf-b73b27a43c5c',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-15T07:16:38.706Z',
  '2025-01-15T07:16:38.706Z'
);

-- Order 5/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '540f570e-cf72-402c-9757-6d110c5b106f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2074.50,
  1926.08,
  136.37,
  19.60,
  7.55,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-02-19T18:59:47.771Z',
  '2025-02-19T18:59:47.771Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b0470d42-5b1f-47bd-8721-3d6d7ac13a2e',
  '540f570e-cf72-402c-9757-6d110c5b106f',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-19T18:59:47.771Z',
  '2025-02-19T18:59:47.771Z'
);

-- Order Item for Order 5
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e3e5f121-009d-469b-a0af-a8f035509a44',
  '540f570e-cf72-402c-9757-6d110c5b106f',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-19T18:59:47.771Z',
  '2025-02-19T18:59:47.771Z'
);

-- Order 6/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '7d9a8308-dc05-4dad-bfd3-1624c77e27a9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2886.61,
  2728.27,
  152.78,
  17.81,
  12.25,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-26T21:38:01.240Z',
  '2024-06-26T21:38:01.240Z'
);

-- Order Item for Order 6
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9e4eaa6d-f785-4976-84f2-9d9a227aa78b',
  '7d9a8308-dc05-4dad-bfd3-1624c77e27a9',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-26T21:38:01.240Z',
  '2024-06-26T21:38:01.240Z'
);

-- Order Item for Order 6
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a534f97a-23d5-4030-8fa7-bc4dfbbd4ca0',
  '7d9a8308-dc05-4dad-bfd3-1624c77e27a9',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-26T21:38:01.240Z',
  '2024-06-26T21:38:01.240Z'
);

-- Order Item for Order 6
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76bdfab4-ffee-4741-ab32-bacc30bd1314',
  '7d9a8308-dc05-4dad-bfd3-1624c77e27a9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-26T21:38:01.240Z',
  '2024-06-26T21:38:01.240Z'
);

-- Order Item for Order 6
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9a630c3f-3852-4d5b-a31b-eb364db0e3b9',
  '7d9a8308-dc05-4dad-bfd3-1624c77e27a9',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-26T21:38:01.240Z',
  '2024-06-26T21:38:01.240Z'
);

-- Order 7/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c0b65b51-3154-44ef-b022-c0e7b29dda7b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1725.97,
  1604.99,
  129.20,
  5.06,
  13.28,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-31T11:52:34.427Z',
  '2025-01-31T11:52:34.427Z'
);

-- Order Item for Order 7
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f414c4ad-022f-4d38-89f3-623e40e5ce72',
  'c0b65b51-3154-44ef-b022-c0e7b29dda7b',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-31T11:52:34.427Z',
  '2025-01-31T11:52:34.427Z'
);

-- Order Item for Order 7
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '34c56b05-942b-4f33-87c5-3cd30399cb99',
  'c0b65b51-3154-44ef-b022-c0e7b29dda7b',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-31T11:52:34.427Z',
  '2025-01-31T11:52:34.427Z'
);

-- Order Item for Order 7
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '60cb2169-a75b-4f85-b73c-2f9fbae72c3e',
  'c0b65b51-3154-44ef-b022-c0e7b29dda7b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-31T11:52:34.427Z',
  '2025-01-31T11:52:34.427Z'
);

-- Order 8/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9902094b-c926-4b23-be6b-9f7235f584c7',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  3945.56,
  3590.29,
  340.36,
  14.91,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-15T23:02:38.431Z',
  '2024-11-15T23:02:38.431Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed4fcb7f-2948-4f44-a996-e5e09b2c4157',
  '9902094b-c926-4b23-be6b-9f7235f584c7',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-15T23:02:38.431Z',
  '2024-11-15T23:02:38.431Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9bb16f50-ac39-4a92-8437-f95381d8178e',
  '9902094b-c926-4b23-be6b-9f7235f584c7',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-15T23:02:38.431Z',
  '2024-11-15T23:02:38.431Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd963c920-8c32-40f2-87d4-060e3671a606',
  '9902094b-c926-4b23-be6b-9f7235f584c7',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-15T23:02:38.431Z',
  '2024-11-15T23:02:38.431Z'
);

-- Order Item for Order 8
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '92cfa7ad-5fbd-46d2-a2c5-67a785bcf234',
  '9902094b-c926-4b23-be6b-9f7235f584c7',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-15T23:02:38.431Z',
  '2024-11-15T23:02:38.431Z'
);

-- Order 9/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '05817d78-ab91-4f23-bb07-da7714f19eaf',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1768.07,
  1636.89,
  114.09,
  17.09,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-25T23:06:20.324Z',
  '2025-02-25T23:06:20.324Z'
);

-- Order Item for Order 9
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2290d8ad-01e2-44e4-89ae-9aa9a3a3572c',
  '05817d78-ab91-4f23-bb07-da7714f19eaf',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-25T23:06:20.324Z',
  '2025-02-25T23:06:20.324Z'
);

-- Order Item for Order 9
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '43a7e0c3-19a3-4d84-956f-81e4108b7d68',
  '05817d78-ab91-4f23-bb07-da7714f19eaf',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-25T23:06:20.324Z',
  '2025-02-25T23:06:20.324Z'
);

-- Order Item for Order 9
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a111b055-f7b0-4271-9f86-2002ad419651',
  '05817d78-ab91-4f23-bb07-da7714f19eaf',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-25T23:06:20.324Z',
  '2025-02-25T23:06:20.324Z'
);

-- Order 10/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3681f600-4347-496b-b9dd-ab157f25ef05',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1793.53,
  1649.46,
  133.28,
  10.79,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-17T12:35:58.910Z',
  '2024-08-17T12:35:58.910Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6d64089b-3f59-45e4-825b-7a9c0de8e554',
  '3681f600-4347-496b-b9dd-ab157f25ef05',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-17T12:35:58.910Z',
  '2024-08-17T12:35:58.910Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2fa5dc4d-2297-499f-865f-ff7e0e003b5f',
  '3681f600-4347-496b-b9dd-ab157f25ef05',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-17T12:35:58.910Z',
  '2024-08-17T12:35:58.910Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c80137bd-f2a2-4cd1-876b-5033cbd4bdfe',
  '3681f600-4347-496b-b9dd-ab157f25ef05',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-17T12:35:58.910Z',
  '2024-08-17T12:35:58.910Z'
);

-- Order Item for Order 10
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ba2eca91-af00-4508-88ae-ebcc6b1f0369',
  '3681f600-4347-496b-b9dd-ab157f25ef05',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-17T12:35:58.910Z',
  '2024-08-17T12:35:58.910Z'
);

-- Order 11/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f439c846-dee8-4a2d-af1e-0dae6bbb23ee',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1095.22,
  1015.58,
  67.84,
  11.80,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-10T12:41:04.439Z',
  '2024-07-10T12:41:04.439Z'
);

-- Order Item for Order 11
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fd5730f4-4054-476e-8dfb-bd4ca88a1d90',
  'f439c846-dee8-4a2d-af1e-0dae6bbb23ee',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-10T12:41:04.439Z',
  '2024-07-10T12:41:04.439Z'
);

-- Order Item for Order 11
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9e647a64-de2d-4dce-9af5-28a685093ee5',
  'f439c846-dee8-4a2d-af1e-0dae6bbb23ee',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-07-10T12:41:04.439Z',
  '2024-07-10T12:41:04.439Z'
);

-- Order 12/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2075.72,
  1917.84,
  149.21,
  8.67,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '95bb80eb-b72c-414b-97fe-af072445e88b',
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bdfc623f-4d0a-4659-89af-6e8d23f1ce1d',
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c56b38dc-c741-45bf-97ad-c0c0e7b97ec2',
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '01b03b4a-5672-4237-b721-38b961838836',
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order Item for Order 12
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '70927f3d-a84d-4b45-b93f-a00667aac877',
  '3d905750-f8b6-4cd6-a23c-4460e3700edc',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-30T17:34:04.362Z',
  '2024-08-30T17:34:04.362Z'
);

-- Order 13/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd546cb72-975c-4352-8d93-9840c650c2f1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  954.42,
  899.99,
  62.64,
  19.27,
  27.48,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-03T08:41:24.642Z',
  '2025-01-03T08:41:24.642Z'
);

-- Order Item for Order 13
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f2c279d2-7c20-46e1-b004-56f05f331dbb',
  'd546cb72-975c-4352-8d93-9840c650c2f1',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-03T08:41:24.642Z',
  '2025-01-03T08:41:24.642Z'
);

-- Order 14/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2745.94,
  2568.99,
  173.66,
  19.36,
  16.07,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4e1fe0d1-d536-4f58-ad8b-43ce2aa1fdbf',
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '028eea77-7eb5-4f19-a69d-ce5f30728f7b',
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9259135b-81f2-4288-bbc7-ed1f99e7c2e8',
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '037d29fa-21bd-41dd-8466-1facd852a38c',
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order Item for Order 14
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '785c2a12-77cd-4de0-b8a8-ef256cb92826',
  '97dc42a2-8531-4236-aca0-d4e09072881a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-29T04:42:53.031Z',
  '2024-03-29T04:42:53.031Z'
);

-- Order 15/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '39323b57-6394-4855-8332-f3f03a7b5aba',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1006.62,
  915.66,
  82.04,
  8.92,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":true,"tags":[]}',
  '2025-01-25T20:52:33.893Z',
  '2025-01-25T20:52:33.893Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '767f0611-6774-46ab-a43f-e43ac0f0ea16',
  '39323b57-6394-4855-8332-f3f03a7b5aba',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-25T20:52:33.893Z',
  '2025-01-25T20:52:33.893Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fc6969e1-1eba-4818-95b1-8b83985b43b6',
  '39323b57-6394-4855-8332-f3f03a7b5aba',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-25T20:52:33.893Z',
  '2025-01-25T20:52:33.893Z'
);

-- Order Item for Order 15
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5b42da7b-ca38-4a87-9927-c118dd6f9be6',
  '39323b57-6394-4855-8332-f3f03a7b5aba',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-25T20:52:33.893Z',
  '2025-01-25T20:52:33.893Z'
);

-- Order 16/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bd2a60be-18f1-452c-b789-753abaa6d335',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1332.57,
  1259.99,
  67.54,
  5.04,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-29T10:17:42.888Z',
  '2025-01-29T10:17:42.888Z'
);

-- Order Item for Order 16
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0260629f-5e05-4488-8820-51f745e8d392',
  'bd2a60be-18f1-452c-b789-753abaa6d335',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-29T10:17:42.888Z',
  '2025-01-29T10:17:42.888Z'
);

-- Order Item for Order 16
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eb4c530b-5932-4873-be08-13bd2d5ac436',
  'bd2a60be-18f1-452c-b789-753abaa6d335',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-29T10:17:42.888Z',
  '2025-01-29T10:17:42.888Z'
);

-- Order 17/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '96971370-61b1-46bb-bc06-4f34a52e1332',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1221.94,
  1125.22,
  107.12,
  13.38,
  23.78,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-19T22:09:59.139Z',
  '2024-04-19T22:09:59.139Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c8209ebd-b3f4-49d5-8405-480905a9881f',
  '96971370-61b1-46bb-bc06-4f34a52e1332',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-19T22:09:59.139Z',
  '2024-04-19T22:09:59.139Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9c09add5-9113-44d9-b544-1d421fcdc7c6',
  '96971370-61b1-46bb-bc06-4f34a52e1332',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-19T22:09:59.139Z',
  '2024-04-19T22:09:59.139Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '17dbce2c-0b50-4606-87d5-189cbcef65de',
  '96971370-61b1-46bb-bc06-4f34a52e1332',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-19T22:09:59.139Z',
  '2024-04-19T22:09:59.139Z'
);

-- Order Item for Order 17
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1d4351fd-d00b-4a44-877c-f68d90d74712',
  '96971370-61b1-46bb-bc06-4f34a52e1332',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-19T22:09:59.139Z',
  '2024-04-19T22:09:59.139Z'
);

-- Order 18/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  2642.45,
  2401.06,
  224.50,
  16.89,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '132f27e4-3d34-4acd-895d-87c251e1e90b',
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ca0fe1d5-acfd-4b7f-96ad-b008955c53d8',
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c12fa84b-5de1-41d8-bce9-1e9dd984eb03',
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9f41f3e1-ec65-4c01-95d5-4aa4ea5dc5a7',
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order Item for Order 18
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dde92a1e-d03e-4213-aa58-7b565f21d760',
  '3f9902fe-1e41-4097-a0d6-8a652e4a7f8a',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-14T17:42:56.963Z',
  '2024-10-14T17:42:56.963Z'
);

-- Order 19/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e5218b35-9cc4-45b1-ad09-81a872023f63',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1033.36,
  953.11,
  61.28,
  18.97,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-23T07:25:13.808Z',
  '2025-02-23T07:25:13.808Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c6ab0392-22ef-43d4-abdb-10d8ef2b2750',
  'e5218b35-9cc4-45b1-ad09-81a872023f63',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-23T07:25:13.808Z',
  '2025-02-23T07:25:13.808Z'
);

-- Order Item for Order 19
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c15e53b4-4e37-461f-81a5-8be949dcf552',
  'e5218b35-9cc4-45b1-ad09-81a872023f63',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-23T07:25:13.808Z',
  '2025-02-23T07:25:13.808Z'
);

-- Order 20/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '15224506-aa9a-4c18-9553-e0cde4ff0c7b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  4023.28,
  3699.94,
  315.23,
  23.31,
  15.20,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-19T14:52:42.405Z',
  '2024-04-19T14:52:42.405Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fcc38ab2-dbdf-474c-b2eb-300cc07eef93',
  '15224506-aa9a-4c18-9553-e0cde4ff0c7b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-19T14:52:42.405Z',
  '2024-04-19T14:52:42.405Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c37f6d4c-8c57-4b53-9b59-b23b7ad86422',
  '15224506-aa9a-4c18-9553-e0cde4ff0c7b',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-19T14:52:42.405Z',
  '2024-04-19T14:52:42.405Z'
);

-- Order Item for Order 20
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e2334764-10a6-42b9-93b8-1d3c6729d198',
  '15224506-aa9a-4c18-9553-e0cde4ff0c7b',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-19T14:52:42.405Z',
  '2024-04-19T14:52:42.405Z'
);

-- Order 21/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '34a085c2-3b85-4b25-8f8c-7c28ec896f09',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1515.12,
  1405.55,
  124.81,
  6.47,
  21.71,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-21T07:26:51.332Z',
  '2025-01-21T07:26:51.332Z'
);

-- Order Item for Order 21
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7ec2a4ae-3525-4f2f-a5ae-e7e43fea1196',
  '34a085c2-3b85-4b25-8f8c-7c28ec896f09',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-21T07:26:51.332Z',
  '2025-01-21T07:26:51.332Z'
);

-- Order Item for Order 21
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2557c32f-e4cf-4f68-9740-823285d9143c',
  '34a085c2-3b85-4b25-8f8c-7c28ec896f09',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-21T07:26:51.332Z',
  '2025-01-21T07:26:51.332Z'
);

-- Order Item for Order 21
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ab29ed5f-8248-498a-a32a-8a05b0a7f767',
  '34a085c2-3b85-4b25-8f8c-7c28ec896f09',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-21T07:26:51.332Z',
  '2025-01-21T07:26:51.332Z'
);

-- Order 22/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f6092d9d-de3d-40ff-aacf-38bea6257293',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  806.50,
  750.00,
  71.70,
  7.96,
  23.16,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-08T03:47:42.642Z',
  '2024-11-08T03:47:42.642Z'
);

-- Order Item for Order 22
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ff77c9b4-39b8-44ff-b963-11cec6fc4c8d',
  'f6092d9d-de3d-40ff-aacf-38bea6257293',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-08T03:47:42.642Z',
  '2024-11-08T03:47:42.642Z'
);

-- Order 23/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '684f2eb8-d3be-4b9f-9a7f-e604612bc605',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1443.08,
  1327.01,
  110.94,
  5.13,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-09T00:54:39.348Z',
  '2024-11-09T00:54:39.348Z'
);

-- Order Item for Order 23
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '53c83585-99a7-42f4-a7e0-2a250c2fe24d',
  '684f2eb8-d3be-4b9f-9a7f-e604612bc605',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-09T00:54:39.348Z',
  '2024-11-09T00:54:39.348Z'
);

-- Order Item for Order 23
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed852b83-bb29-4832-83f1-28d277d2f8b7',
  '684f2eb8-d3be-4b9f-9a7f-e604612bc605',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-09T00:54:39.348Z',
  '2024-11-09T00:54:39.348Z'
);

-- Order 24/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b4f3aeb6-537d-4c57-b041-564bb3dbabd6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1594.31,
  1478.37,
  104.67,
  11.27,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-03T16:20:49.425Z',
  '2024-08-03T16:20:49.425Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5f57141a-d897-40f3-add8-8f10fa32a7c3',
  'b4f3aeb6-537d-4c57-b041-564bb3dbabd6',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-03T16:20:49.425Z',
  '2024-08-03T16:20:49.425Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '87dc8dc9-f83b-463e-a516-840d6e947691',
  'b4f3aeb6-537d-4c57-b041-564bb3dbabd6',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-03T16:20:49.425Z',
  '2024-08-03T16:20:49.425Z'
);

-- Order Item for Order 24
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4f57d2fc-4264-4924-8134-2d77404bbc76',
  'b4f3aeb6-537d-4c57-b041-564bb3dbabd6',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-03T16:20:49.425Z',
  '2024-08-03T16:20:49.425Z'
);

-- Order 25/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '4b8f495a-cdeb-441d-b000-04b27eac7ed8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  300.24,
  252.20,
  25.14,
  22.90,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-26T20:16:22.477Z',
  '2024-09-26T20:16:22.477Z'
);

-- Order Item for Order 25
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3fd710aa-98dd-4853-8049-2d127f6f1414',
  '4b8f495a-cdeb-441d-b000-04b27eac7ed8',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-26T20:16:22.477Z',
  '2024-09-26T20:16:22.477Z'
);

-- Order 26/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9338f1bc-7578-459c-945b-3ba2088dd444',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1235.73,
  1149.98,
  65.09,
  20.66,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-19T22:20:31.670Z',
  '2024-12-19T22:20:31.670Z'
);

-- Order Item for Order 26
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7405eda3-4823-4a3f-a482-6353c32091ae',
  '9338f1bc-7578-459c-945b-3ba2088dd444',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-19T22:20:31.670Z',
  '2024-12-19T22:20:31.670Z'
);

-- Order Item for Order 26
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '14f35936-72e5-4fe2-a092-f7e9fb1e0448',
  '9338f1bc-7578-459c-945b-3ba2088dd444',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-19T22:20:31.670Z',
  '2024-12-19T22:20:31.670Z'
);

-- Order 27/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8dc68c30-0c28-4618-8d13-e27b7c9051b0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  678.75,
  630.00,
  38.30,
  10.45,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-25T13:02:47.033Z',
  '2024-07-25T13:02:47.033Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '93e45e5e-2604-444a-9f7f-5b034d56dbf2',
  '8dc68c30-0c28-4618-8d13-e27b7c9051b0',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-07-25T13:02:47.033Z',
  '2024-07-25T13:02:47.033Z'
);

-- Order Item for Order 27
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '018d07f8-c252-4947-8336-385ad97d5b44',
  '8dc68c30-0c28-4618-8d13-e27b7c9051b0',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-25T13:02:47.033Z',
  '2024-07-25T13:02:47.033Z'
);

-- Order 28/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c1987d20-5419-4a20-bbd1-132ce0d662d7',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  338.28,
  321.10,
  19.62,
  7.95,
  10.39,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-13T11:52:22.422Z',
  '2024-06-13T11:52:22.422Z'
);

-- Order Item for Order 28
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '21a6f3a1-5e72-4696-b6f8-7af77e13106f',
  'c1987d20-5419-4a20-bbd1-132ce0d662d7',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-13T11:52:22.422Z',
  '2024-06-13T11:52:22.422Z'
);

-- Order Item for Order 28
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c13d45f9-d85f-427f-b295-cc01a43ffec3',
  'c1987d20-5419-4a20-bbd1-132ce0d662d7',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-13T11:52:22.422Z',
  '2024-06-13T11:52:22.422Z'
);

-- Order 29/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2519.23,
  2358.36,
  147.16,
  13.71,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '854ee877-dc95-40de-9041-db10b3f30ba6',
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'baa4ec7f-b082-460b-9593-70be8d8eff65',
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a091f904-857b-418a-b1b9-69764313e0e7',
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8c9b4fa1-5c9c-48a8-a276-d833acb38c01',
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order Item for Order 29
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '46dc3a0a-f7e4-40d0-98a7-d4a23e820b1b',
  'a01fd650-ab27-4ccb-b2b3-cd8057a36506',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-01T01:03:03.018Z',
  '2024-04-01T01:03:03.018Z'
);

-- Order 30/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9ae4a73c-f846-4e09-aa51-e1d062507313',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  552.34,
  499.98,
  38.40,
  13.96,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-03-06T12:54:41.076Z',
  '2024-03-06T12:54:41.076Z'
);

-- Order Item for Order 30
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '59582c5b-234b-49e3-b735-b06582b95d29',
  '9ae4a73c-f846-4e09-aa51-e1d062507313',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-06T12:54:41.076Z',
  '2024-03-06T12:54:41.076Z'
);

-- Order 31/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e9c595c3-ffc7-47aa-9ff2-031ee5c2ce0f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1891.72,
  1746.33,
  154.72,
  12.12,
  21.45,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-15T20:44:00.833Z',
  '2024-11-15T20:44:00.833Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '24b2ed99-5338-4f05-b59c-b9b8606a4986',
  'e9c595c3-ffc7-47aa-9ff2-031ee5c2ce0f',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-15T20:44:00.833Z',
  '2024-11-15T20:44:00.833Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '373215a7-765c-4794-9f4e-52311c791818',
  'e9c595c3-ffc7-47aa-9ff2-031ee5c2ce0f',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-15T20:44:00.833Z',
  '2024-11-15T20:44:00.833Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3b802efa-3f6a-41de-af5e-deebd31d2d53',
  'e9c595c3-ffc7-47aa-9ff2-031ee5c2ce0f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-15T20:44:00.833Z',
  '2024-11-15T20:44:00.833Z'
);

-- Order Item for Order 31
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a2037a26-f8cf-4463-8998-b68ca9372fba',
  'e9c595c3-ffc7-47aa-9ff2-031ee5c2ce0f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-15T20:44:00.833Z',
  '2024-11-15T20:44:00.833Z'
);

-- Order 32/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2160.05,
  2009.71,
  126.81,
  23.53,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd69d84c5-9ab3-4607-93e7-037424b290a3',
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2dd30f99-6905-4b0a-b651-d286e4c5f79a',
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6b84007c-4400-4075-9ab9-fcf12a1ee313',
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4f9eb4a5-01cf-45d3-b1d8-856048f60a38',
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order Item for Order 32
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1926929c-3b6f-440e-8176-bee7276ee1e3',
  'f2b5bb14-f2e8-4544-97fa-d6ebfbd66ed6',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-12T20:13:14.324Z',
  '2024-03-12T20:13:14.324Z'
);

-- Order 33/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1356.53,
  1267.86,
  71.63,
  17.04,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '38334cab-f603-4d09-bd07-662c20e94409',
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5a6bf333-e3bd-4f05-9151-968e577a531c',
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1d833e78-cdea-48ef-8f5d-0448ac3a209c',
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e8c6f630-838b-41e8-bf42-9e11fb108553',
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order Item for Order 33
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '33a6c825-7ae5-4716-b357-a1e0e6321daf',
  'b39ad984-a298-46c0-8f81-3fac2d51fbfd',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-03T06:21:51.876Z',
  '2024-06-03T06:21:51.876Z'
);

-- Order 34/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'aa74252a-6e10-4778-b63c-9b0973b38e1e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1489.32,
  1400.31,
  104.32,
  8.48,
  23.79,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-09-11T17:34:08.204Z',
  '2024-09-11T17:34:08.204Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4b29b852-4555-4ce1-826b-e2dc0371323a',
  'aa74252a-6e10-4778-b63c-9b0973b38e1e',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-11T17:34:08.204Z',
  '2024-09-11T17:34:08.204Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2bc74f1e-fc8c-44cf-81fb-6c5386b4f50b',
  'aa74252a-6e10-4778-b63c-9b0973b38e1e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-11T17:34:08.204Z',
  '2024-09-11T17:34:08.204Z'
);

-- Order Item for Order 34
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e0ee8c04-b898-4947-b4dd-c8e55f532418',
  'aa74252a-6e10-4778-b63c-9b0973b38e1e',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-11T17:34:08.204Z',
  '2024-09-11T17:34:08.204Z'
);

-- Order 35/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ec39c39f-724a-4936-8dbf-3063d2497534',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  259.95,
  250.00,
  13.90,
  19.93,
  23.88,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-07-18T04:25:55.990Z',
  '2024-07-18T04:25:55.990Z'
);

-- Order Item for Order 35
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ef5e9a57-a582-4eb9-8271-e7cf3a327a07',
  'ec39c39f-724a-4936-8dbf-3063d2497534',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-18T04:25:55.990Z',
  '2024-07-18T04:25:55.990Z'
);

-- Order 36/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8e161506-1e08-4979-87ba-d2c10791cd46',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  998.67,
  905.67,
  76.53,
  16.47,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-30T01:32:36.915Z',
  '2024-04-30T01:32:36.915Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c752b0fd-7fcd-4f78-b818-b43e4a865bfb',
  '8e161506-1e08-4979-87ba-d2c10791cd46',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-30T01:32:36.915Z',
  '2024-04-30T01:32:36.915Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '37ddaac3-2354-40c1-9ddc-37ddde2c8b73',
  '8e161506-1e08-4979-87ba-d2c10791cd46',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-30T01:32:36.915Z',
  '2024-04-30T01:32:36.915Z'
);

-- Order Item for Order 36
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5a111a06-4e24-4324-8cfc-4e7cc5f27d58',
  '8e161506-1e08-4979-87ba-d2c10791cd46',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-30T01:32:36.915Z',
  '2024-04-30T01:32:36.915Z'
);

-- Order 37/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '24bb839a-c7e5-4d3c-986d-ea80ec1bab5b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2152.12,
  1989.97,
  166.76,
  7.71,
  12.32,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-02-25T02:33:19.701Z',
  '2025-02-25T02:33:19.701Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2d150ddd-b68e-4f87-9b8f-ea8145348723',
  '24bb839a-c7e5-4d3c-986d-ea80ec1bab5b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-25T02:33:19.701Z',
  '2025-02-25T02:33:19.701Z'
);

-- Order Item for Order 37
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '05ece9f2-3aca-4f33-9b77-18a50b5ecb31',
  '24bb839a-c7e5-4d3c-986d-ea80ec1bab5b',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-25T02:33:19.701Z',
  '2025-02-25T02:33:19.701Z'
);

-- Order 38/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c8117c2d-a5b4-4be6-9677-21d584d7afc0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2241.77,
  2069.21,
  162.43,
  10.13,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-12-27T19:38:48.384Z',
  '2024-12-27T19:38:48.384Z'
);

-- Order Item for Order 38
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2ecdbed5-6b32-4608-b33d-e4db39bc8b01',
  'c8117c2d-a5b4-4be6-9677-21d584d7afc0',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-27T19:38:48.384Z',
  '2024-12-27T19:38:48.384Z'
);

-- Order Item for Order 38
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f1386a9b-c196-4222-9b84-2970f2e77e23',
  'c8117c2d-a5b4-4be6-9677-21d584d7afc0',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-27T19:38:48.384Z',
  '2024-12-27T19:38:48.384Z'
);

-- Order Item for Order 38
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1c903c5a-4778-46c1-9232-934e68b482ad',
  'c8117c2d-a5b4-4be6-9677-21d584d7afc0',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-27T19:38:48.384Z',
  '2024-12-27T19:38:48.384Z'
);

-- Order Item for Order 38
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5b86c15-9ce5-4040-a0e7-3274a36a9a20',
  'c8117c2d-a5b4-4be6-9677-21d584d7afc0',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-27T19:38:48.384Z',
  '2024-12-27T19:38:48.384Z'
);

-- Order 39/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2624e6a8-0a0f-49d5-9ee1-f48cfe9b1f1b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1970.69,
  1831.31,
  120.87,
  18.51,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-27T18:27:21.263Z',
  '2024-07-27T18:27:21.263Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8a6eaf08-aab8-491d-b148-ba7f65565226',
  '2624e6a8-0a0f-49d5-9ee1-f48cfe9b1f1b',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-07-27T18:27:21.263Z',
  '2024-07-27T18:27:21.263Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9e6f6853-f05e-4c65-8847-260427deb0ae',
  '2624e6a8-0a0f-49d5-9ee1-f48cfe9b1f1b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-27T18:27:21.263Z',
  '2024-07-27T18:27:21.263Z'
);

-- Order Item for Order 39
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e6da7eb8-f11c-4035-aa66-33ae5ac10201',
  '2624e6a8-0a0f-49d5-9ee1-f48cfe9b1f1b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-27T18:27:21.263Z',
  '2024-07-27T18:27:21.263Z'
);

-- Order 40/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1580.17,
  1456.75,
  138.39,
  10.74,
  25.71,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '978f79f5-6479-422f-b5e0-ff1ed7e6d35a',
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3cfb8e79-dfe6-4fef-beb2-ed83efca0b63',
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '90199626-ded4-4dd6-9458-d3785bc9b61b',
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0f9754ec-530f-497c-94bd-57a89b3a3ff7',
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order Item for Order 40
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1c77997c-2e7d-406b-9fb5-cc194788dd0c',
  '6b8a13a2-a27f-4a9a-9e04-636fc3687e46',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-13T15:42:48.429Z',
  '2024-09-13T15:42:48.429Z'
);

-- Order 41/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '25caf691-ce2f-4704-a63e-cba702af9f05',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  710.08,
  637.77,
  54.72,
  17.59,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-16T14:29:16.707Z',
  '2024-10-16T14:29:16.707Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f11b1f70-7056-4b59-83d4-b887a4188769',
  '25caf691-ce2f-4704-a63e-cba702af9f05',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-16T14:29:16.707Z',
  '2024-10-16T14:29:16.707Z'
);

-- Order Item for Order 41
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dfe214f6-e9de-4a7d-bc3f-c5f4c31c500e',
  '25caf691-ce2f-4704-a63e-cba702af9f05',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-16T14:29:16.707Z',
  '2024-10-16T14:29:16.707Z'
);

-- Order 42/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '52a651e9-b086-43aa-9055-7f89d22f66d4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1552.86,
  1449.98,
  87.87,
  15.01,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-03-11T00:35:32.896Z',
  '2024-03-11T00:35:32.896Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dfd3d501-d90c-452b-89bd-7d94947b298f',
  '52a651e9-b086-43aa-9055-7f89d22f66d4',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-11T00:35:32.896Z',
  '2024-03-11T00:35:32.896Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ab6e9e77-9406-4d0b-8847-76f2ba4ae244',
  '52a651e9-b086-43aa-9055-7f89d22f66d4',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-11T00:35:32.896Z',
  '2024-03-11T00:35:32.896Z'
);

-- Order Item for Order 42
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd194aac4-2d51-438a-93fb-4b2a6c20418e',
  '52a651e9-b086-43aa-9055-7f89d22f66d4',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-03-11T00:35:32.896Z',
  '2024-03-11T00:35:32.896Z'
);

-- Order 43/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '82f813cc-f2d6-45c9-b33e-f4de0dc4738f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  3359.98,
  3078.27,
  273.97,
  7.74,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-12-25T20:15:40.738Z',
  '2024-12-25T20:15:40.738Z'
);

-- Order Item for Order 43
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '787e0c28-a196-411f-b3d1-c0b7f6bd3ebd',
  '82f813cc-f2d6-45c9-b33e-f4de0dc4738f',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-25T20:15:40.738Z',
  '2024-12-25T20:15:40.738Z'
);

-- Order Item for Order 43
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0cced992-db19-462f-b167-5aacc3b3d97b',
  '82f813cc-f2d6-45c9-b33e-f4de0dc4738f',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-25T20:15:40.738Z',
  '2024-12-25T20:15:40.738Z'
);

-- Order 44/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3ab4ded9-a148-41a7-b1d0-58f61ee15808',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  653.70,
  585.66,
  46.85,
  21.19,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-20T19:18:21.608Z',
  '2024-12-20T19:18:21.608Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '79bec788-9704-45b7-a6f9-5d479ccb0e63',
  '3ab4ded9-a148-41a7-b1d0-58f61ee15808',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-20T19:18:21.608Z',
  '2024-12-20T19:18:21.608Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd59ca2e0-c2cf-427a-a9d0-f5b67ffadb29',
  '3ab4ded9-a148-41a7-b1d0-58f61ee15808',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-20T19:18:21.608Z',
  '2024-12-20T19:18:21.608Z'
);

-- Order Item for Order 44
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '13b746ef-4a3b-416c-8555-11576d47a287',
  '3ab4ded9-a148-41a7-b1d0-58f61ee15808',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-20T19:18:21.608Z',
  '2024-12-20T19:18:21.608Z'
);

-- Order 45/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6797a797-042f-475f-81a4-b172ceb8fbd3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1095.79,
  1031.74,
  57.06,
  23.71,
  16.72,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-12-05T14:20:26.019Z',
  '2024-12-05T14:20:26.019Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3a1e8b5c-efae-4513-82b7-d0d8330f9541',
  '6797a797-042f-475f-81a4-b172ceb8fbd3',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-05T14:20:26.019Z',
  '2024-12-05T14:20:26.019Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0e4e7d67-41a8-4460-b8c0-f85d2615a58e',
  '6797a797-042f-475f-81a4-b172ceb8fbd3',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-05T14:20:26.019Z',
  '2024-12-05T14:20:26.019Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '299100a3-f12a-42b2-bf55-4a5aaf0772ce',
  '6797a797-042f-475f-81a4-b172ceb8fbd3',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-05T14:20:26.019Z',
  '2024-12-05T14:20:26.019Z'
);

-- Order Item for Order 45
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3b74d059-9622-4fb5-976b-9fc0334723d6',
  '6797a797-042f-475f-81a4-b172ceb8fbd3',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-05T14:20:26.019Z',
  '2024-12-05T14:20:26.019Z'
);

-- Order 46/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '451bae02-792c-4748-a00a-767228c5ca43',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1558.74,
  1432.17,
  121.45,
  5.12,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-30T00:27:08.570Z',
  '2024-11-30T00:27:08.570Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '15590efb-b7a8-4280-8d33-037a86262401',
  '451bae02-792c-4748-a00a-767228c5ca43',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-30T00:27:08.570Z',
  '2024-11-30T00:27:08.570Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e8c53ccb-6cc0-460a-929d-10949dab3395',
  '451bae02-792c-4748-a00a-767228c5ca43',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-30T00:27:08.570Z',
  '2024-11-30T00:27:08.570Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e30308dd-c86e-40bf-a992-a8c693c255bf',
  '451bae02-792c-4748-a00a-767228c5ca43',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-30T00:27:08.570Z',
  '2024-11-30T00:27:08.570Z'
);

-- Order Item for Order 46
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '64bf4263-1f9e-4b78-9376-395d35bc3171',
  '451bae02-792c-4748-a00a-767228c5ca43',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-30T00:27:08.570Z',
  '2024-11-30T00:27:08.570Z'
);

-- Order 47/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2668.41,
  2423.85,
  220.33,
  24.23,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ca57383f-67cd-44a5-8583-b545a83cfc25',
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '763daa5b-0668-4d78-a2b6-4b612e1f11b7',
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'de1a5122-b3f6-411b-b4bb-a959edeb5bba',
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f9fce7eb-b4f7-41c0-9a1b-2a7619d41968',
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order Item for Order 47
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4bc9d915-e811-42cb-b13f-d060c93bf29e',
  '8d59b238-be3f-41a0-be14-0301b57e9d5d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-04T18:58:37.803Z',
  '2024-04-04T18:58:37.803Z'
);

-- Order 48/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'feccbc61-89c1-41d9-aa0e-4a926df523d3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1072.72,
  989.99,
  75.83,
  18.60,
  11.70,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-28T06:09:19.963Z',
  '2024-05-28T06:09:19.963Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '87878087-23bd-4914-a5ef-4951fa4da6c5',
  'feccbc61-89c1-41d9-aa0e-4a926df523d3',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-28T06:09:19.963Z',
  '2024-05-28T06:09:19.963Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9d8e40f0-3c4f-484a-81d2-e0493ef5b9c2',
  'feccbc61-89c1-41d9-aa0e-4a926df523d3',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-28T06:09:19.963Z',
  '2024-05-28T06:09:19.963Z'
);

-- Order Item for Order 48
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ea079c76-de15-44aa-8067-c9c967e32710',
  'feccbc61-89c1-41d9-aa0e-4a926df523d3',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-28T06:09:19.963Z',
  '2024-05-28T06:09:19.963Z'
);

-- Order 49/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '62f35d07-4b86-46da-8012-6ecd1582a06a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1264.04,
  1204.98,
  69.41,
  15.49,
  25.84,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-01-05T07:18:06.094Z',
  '2025-01-05T07:18:06.094Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bb950580-1d66-46d8-ab65-ff2c6cfca26b',
  '62f35d07-4b86-46da-8012-6ecd1582a06a',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-05T07:18:06.094Z',
  '2025-01-05T07:18:06.094Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c3dc5b9c-63f2-4ae8-a5c0-508bb9b8ca76',
  '62f35d07-4b86-46da-8012-6ecd1582a06a',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-05T07:18:06.094Z',
  '2025-01-05T07:18:06.094Z'
);

-- Order Item for Order 49
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd9174d51-6e1a-4f06-9058-b9549cd4f59d',
  '62f35d07-4b86-46da-8012-6ecd1582a06a',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-05T07:18:06.094Z',
  '2025-01-05T07:18:06.094Z'
);

-- Order 50/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  5191.00,
  4795.49,
  383.16,
  12.35,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cee0260b-6b88-46da-8387-539dc16b564c',
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '95b7652f-5ae1-490e-9e7c-c2a4701f6ae4',
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e9ff5155-dd41-4b98-865c-ac1fa07e93d9',
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6f6541b2-cd66-4745-ac30-49b84c2daba7',
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order Item for Order 50
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd8070f49-5f79-49c7-a5fa-9abd7cdd8180',
  '572d45f1-3b52-43dc-9391-6f8ab91dedaa',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-21T23:07:10.172Z',
  '2024-08-21T23:07:10.172Z'
);

-- Order 51/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2731.21,
  2522.16,
  201.02,
  8.03,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '604ff381-c33b-4b75-8e91-e8addeaf8517',
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c20731eb-c193-458f-9856-551aa3c9f7e2',
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '916d3553-7d66-4a81-aad2-1a9cb7083274',
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b2e5c685-a020-43fb-a5c6-35bfbb8184cd',
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order Item for Order 51
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7c9d5692-d5f4-4d66-9eb3-a7cd939769f2',
  'dffd9a7b-1919-4694-8aa4-2009509c3def',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-28T12:36:16.922Z',
  '2024-03-28T12:36:16.922Z'
);

-- Order 52/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '89a9d872-f7ff-4156-b806-13320281cb12',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1394.46,
  1283.95,
  119.66,
  18.84,
  27.99,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-10T12:07:15.540Z',
  '2025-02-10T12:07:15.540Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '326f3752-931f-496a-9d7a-cfb82af1acbd',
  '89a9d872-f7ff-4156-b806-13320281cb12',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-10T12:07:15.540Z',
  '2025-02-10T12:07:15.540Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd411f597-1bac-430d-925e-59ca112ce015',
  '89a9d872-f7ff-4156-b806-13320281cb12',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-10T12:07:15.540Z',
  '2025-02-10T12:07:15.540Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5794e80-18d4-41c7-9541-01e72e77fee8',
  '89a9d872-f7ff-4156-b806-13320281cb12',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-10T12:07:15.540Z',
  '2025-02-10T12:07:15.540Z'
);

-- Order Item for Order 52
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c5ec7ead-3362-4c6c-aa8e-e53ca45cda78',
  '89a9d872-f7ff-4156-b806-13320281cb12',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-10T12:07:15.540Z',
  '2025-02-10T12:07:15.540Z'
);

-- Order 53/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'de481bed-a227-42d6-8b64-012787287cbc',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  608.29,
  555.00,
  38.02,
  15.27,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-11T07:06:45.880Z',
  '2024-09-11T07:06:45.880Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dc1656f8-3572-40ad-bd00-88e9ed7cec04',
  'de481bed-a227-42d6-8b64-012787287cbc',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-11T07:06:45.880Z',
  '2024-09-11T07:06:45.880Z'
);

-- Order Item for Order 53
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b0fddf88-bcbf-4d37-837f-8376c4eca078',
  'de481bed-a227-42d6-8b64-012787287cbc',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-11T07:06:45.880Z',
  '2024-09-11T07:06:45.880Z'
);

-- Order 54/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '32b984a1-b3fb-41e1-bb81-9b67c7aa035b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  3210.66,
  2953.33,
  236.56,
  20.77,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-17T10:36:38.796Z',
  '2024-11-17T10:36:38.796Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd5cfe568-a895-42f6-a11a-a37e17be224c',
  '32b984a1-b3fb-41e1-bb81-9b67c7aa035b',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-17T10:36:38.796Z',
  '2024-11-17T10:36:38.796Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fe6504ae-1d99-4217-9df8-cd852e89cc29',
  '32b984a1-b3fb-41e1-bb81-9b67c7aa035b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-17T10:36:38.796Z',
  '2024-11-17T10:36:38.796Z'
);

-- Order Item for Order 54
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7193b079-4d90-49e8-b65c-163131666847',
  '32b984a1-b3fb-41e1-bb81-9b67c7aa035b',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-17T10:36:38.796Z',
  '2024-11-17T10:36:38.796Z'
);

-- Order 55/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '0d4995d7-3310-49be-bf6b-ab85ab2d224a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  3804.61,
  3516.04,
  302.03,
  7.14,
  20.60,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-08T23:46:00.758Z',
  '2024-06-08T23:46:00.758Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '97a6eeff-0647-45c7-95c5-4428c9ea21c7',
  '0d4995d7-3310-49be-bf6b-ab85ab2d224a',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-08T23:46:00.758Z',
  '2024-06-08T23:46:00.758Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e7b83ba9-1488-4e24-90b2-9db271e2b91c',
  '0d4995d7-3310-49be-bf6b-ab85ab2d224a',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-08T23:46:00.758Z',
  '2024-06-08T23:46:00.758Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd115b065-a3f8-4239-bd5e-bfc722156832',
  '0d4995d7-3310-49be-bf6b-ab85ab2d224a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-08T23:46:00.758Z',
  '2024-06-08T23:46:00.758Z'
);

-- Order Item for Order 55
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '39c68745-d850-4958-8499-2e55821a1d6f',
  '0d4995d7-3310-49be-bf6b-ab85ab2d224a',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-08T23:46:00.758Z',
  '2024-06-08T23:46:00.758Z'
);

-- Order 56/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '95510bf4-7e74-4d79-a0bd-261eaadbb29a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  244.41,
  250.00,
  15.35,
  5.35,
  26.29,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-24T10:38:28.487Z',
  '2024-03-24T10:38:28.487Z'
);

-- Order Item for Order 56
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd4775085-f9a3-4e0e-950f-049b5f4b34f5',
  '95510bf4-7e74-4d79-a0bd-261eaadbb29a',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-24T10:38:28.487Z',
  '2024-03-24T10:38:28.487Z'
);

-- Order 57/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '71ea3d83-8f27-4fad-8908-2b63944be21b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  197.47,
  189.99,
  14.08,
  10.94,
  17.54,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-03-18T05:03:04.030Z',
  '2024-03-18T05:03:04.030Z'
);

-- Order Item for Order 57
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '173aab0f-7e0a-41c5-831f-2c934984c43e',
  '71ea3d83-8f27-4fad-8908-2b63944be21b',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-18T05:03:04.030Z',
  '2024-03-18T05:03:04.030Z'
);

-- Order 58/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8d6d878d-256b-4bb8-acac-85a7e1bca4a5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  4294.68,
  4035.52,
  237.69,
  21.47,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-10T20:19:34.548Z',
  '2024-07-10T20:19:34.548Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '03cb59eb-8e09-4e7f-958f-3d841c760146',
  '8d6d878d-256b-4bb8-acac-85a7e1bca4a5',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-10T20:19:34.548Z',
  '2024-07-10T20:19:34.548Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '031536a0-6dd1-4f92-a256-2f9d3ae5df88',
  '8d6d878d-256b-4bb8-acac-85a7e1bca4a5',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-07-10T20:19:34.548Z',
  '2024-07-10T20:19:34.548Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4bfe8928-2ccd-443c-8b98-39d8938749e7',
  '8d6d878d-256b-4bb8-acac-85a7e1bca4a5',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-10T20:19:34.548Z',
  '2024-07-10T20:19:34.548Z'
);

-- Order Item for Order 58
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0b2c3086-6d67-478d-88be-3c66c87e8270',
  '8d6d878d-256b-4bb8-acac-85a7e1bca4a5',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-07-10T20:19:34.548Z',
  '2024-07-10T20:19:34.548Z'
);

-- Order 59/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bcaca6ca-1806-45fd-94d3-dfaf60899c4e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  805.39,
  750.00,
  50.18,
  23.14,
  17.92,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-02-12T04:46:26.133Z',
  '2025-02-12T04:46:26.133Z'
);

-- Order Item for Order 59
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c8742c70-21a2-44ce-b16a-aaebb787c0dd',
  'bcaca6ca-1806-45fd-94d3-dfaf60899c4e',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-12T04:46:26.133Z',
  '2025-02-12T04:46:26.133Z'
);

-- Order 60/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8b9208b4-512d-45a7-9014-f644ad8b5805',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  825.16,
  773.37,
  39.36,
  12.43,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-11T20:09:57.747Z',
  '2024-05-11T20:09:57.747Z'
);

-- Order Item for Order 60
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a7a47bfb-fd99-48ca-8d30-861102b57e38',
  '8b9208b4-512d-45a7-9014-f644ad8b5805',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-11T20:09:57.747Z',
  '2024-05-11T20:09:57.747Z'
);

-- Order 61/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd1a1f292-a2ef-4312-a6b3-520b527cc0ba',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1883.25,
  1733.34,
  135.37,
  23.16,
  8.62,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-12T11:05:16.377Z',
  '2024-08-12T11:05:16.377Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '18eae0eb-767f-4de9-9d3a-4709afc0e996',
  'd1a1f292-a2ef-4312-a6b3-520b527cc0ba',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-12T11:05:16.377Z',
  '2024-08-12T11:05:16.377Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6a6511d8-4578-4764-ab95-658b052dad0a',
  'd1a1f292-a2ef-4312-a6b3-520b527cc0ba',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-12T11:05:16.377Z',
  '2024-08-12T11:05:16.377Z'
);

-- Order Item for Order 61
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8a69a4f3-8cd2-4e69-a8fa-37fe7881c7f9',
  'd1a1f292-a2ef-4312-a6b3-520b527cc0ba',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-12T11:05:16.377Z',
  '2024-08-12T11:05:16.377Z'
);

-- Order 62/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '07a67498-8006-41f0-b15e-e5a7f333a7de',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1342.03,
  1239.98,
  80.85,
  21.20,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":true,"tags":[]}',
  '2024-10-10T05:07:58.860Z',
  '2024-10-10T05:07:58.860Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0f18ec29-620f-4949-91d2-7ff9c70d2634',
  '07a67498-8006-41f0-b15e-e5a7f333a7de',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-10T05:07:58.860Z',
  '2024-10-10T05:07:58.860Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f39c9236-1642-4937-8d2e-f0136fbe2212',
  '07a67498-8006-41f0-b15e-e5a7f333a7de',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-10T05:07:58.860Z',
  '2024-10-10T05:07:58.860Z'
);

-- Order Item for Order 62
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '88860d59-948c-4b6d-bd10-83c9f1093584',
  '07a67498-8006-41f0-b15e-e5a7f333a7de',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-10T05:07:58.860Z',
  '2024-10-10T05:07:58.860Z'
);

-- Order 63/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '26ad64ba-60d1-4f6d-b3e9-f35d8a516a78',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  426.70,
  378.30,
  35.98,
  12.42,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-05-15T22:26:26.481Z',
  '2024-05-15T22:26:26.481Z'
);

-- Order Item for Order 63
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '68adc6c6-959b-4e3a-83dd-d409b6da2422',
  '26ad64ba-60d1-4f6d-b3e9-f35d8a516a78',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-05-15T22:26:26.481Z',
  '2024-05-15T22:26:26.481Z'
);

-- Order 64/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '588d0939-9511-4e0c-a535-bc93e13004ff',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1448.62,
  1342.18,
  111.80,
  9.29,
  14.65,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-10T18:41:56.888Z',
  '2025-01-10T18:41:56.888Z'
);

-- Order Item for Order 64
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4c374e97-4617-4f84-87fc-b13bf78bd859',
  '588d0939-9511-4e0c-a535-bc93e13004ff',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-10T18:41:56.888Z',
  '2025-01-10T18:41:56.888Z'
);

-- Order Item for Order 64
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a481ca04-d066-443c-8f0a-9949eb67ce59',
  '588d0939-9511-4e0c-a535-bc93e13004ff',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-10T18:41:56.888Z',
  '2025-01-10T18:41:56.888Z'
);

-- Order Item for Order 64
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2fc37aeb-91ea-487c-aa82-9ccb2da815d3',
  '588d0939-9511-4e0c-a535-bc93e13004ff',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-10T18:41:56.888Z',
  '2025-01-10T18:41:56.888Z'
);

-- Order 65/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f96faf9e-43bd-4c83-939f-b53ba7034a1a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  3695.84,
  3396.04,
  285.61,
  14.19,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-04T15:38:56.276Z',
  '2024-11-04T15:38:56.276Z'
);

-- Order Item for Order 65
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fd2bee5b-9d77-405e-b949-ad32a25d7929',
  'f96faf9e-43bd-4c83-939f-b53ba7034a1a',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-04T15:38:56.276Z',
  '2024-11-04T15:38:56.276Z'
);

-- Order Item for Order 65
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0a10d248-bf11-4f87-b9fb-27b0cdadd0ef',
  'f96faf9e-43bd-4c83-939f-b53ba7034a1a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-04T15:38:56.276Z',
  '2024-11-04T15:38:56.276Z'
);

-- Order Item for Order 65
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3717b53-604a-4228-b2a9-946fee4d2b95',
  'f96faf9e-43bd-4c83-939f-b53ba7034a1a',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-04T15:38:56.276Z',
  '2024-11-04T15:38:56.276Z'
);

-- Order 66/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ddd600aa-bb0e-49ce-93bf-97f6604e9727',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1433.30,
  1319.13,
  117.67,
  6.19,
  9.69,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-06T03:08:40.027Z',
  '2024-09-06T03:08:40.027Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ddad50c1-09f8-4423-b4d4-ad19ed8f6879',
  'ddd600aa-bb0e-49ce-93bf-97f6604e9727',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-06T03:08:40.027Z',
  '2024-09-06T03:08:40.027Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '790ed159-ab6a-4d47-b0d1-90b673ac9ae5',
  'ddd600aa-bb0e-49ce-93bf-97f6604e9727',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-06T03:08:40.027Z',
  '2024-09-06T03:08:40.027Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4e555262-8bb2-4ace-986a-f739708e801a',
  'ddd600aa-bb0e-49ce-93bf-97f6604e9727',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-06T03:08:40.027Z',
  '2024-09-06T03:08:40.027Z'
);

-- Order Item for Order 66
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f19afa5c-efa0-4aa8-97a1-7fa87d29efa2',
  'ddd600aa-bb0e-49ce-93bf-97f6604e9727',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-06T03:08:40.027Z',
  '2024-09-06T03:08:40.027Z'
);

-- Order 67/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '19046a55-3eed-4a36-b382-02f24ea80c00',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  996.81,
  905.58,
  79.51,
  11.72,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-09T15:10:57.317Z',
  '2024-03-09T15:10:57.317Z'
);

-- Order Item for Order 67
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '13ad6183-1283-4ff8-9744-f30edb0a0246',
  '19046a55-3eed-4a36-b382-02f24ea80c00',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-09T15:10:57.317Z',
  '2024-03-09T15:10:57.317Z'
);

-- Order Item for Order 67
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7efddab9-2647-4449-8007-4a60e77a9c3f',
  '19046a55-3eed-4a36-b382-02f24ea80c00',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-09T15:10:57.317Z',
  '2024-03-09T15:10:57.317Z'
);

-- Order 68/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '25544247-7329-4b26-9aa4-0221a10fbd32',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1045.07,
  968.37,
  64.01,
  20.83,
  8.14,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-21T09:29:29.165Z',
  '2024-05-21T09:29:29.165Z'
);

-- Order Item for Order 68
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd496494a-2b2a-42fb-9975-0a95374e6cf1',
  '25544247-7329-4b26-9aa4-0221a10fbd32',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-21T09:29:29.165Z',
  '2024-05-21T09:29:29.165Z'
);

-- Order Item for Order 68
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6426d535-f33b-49b2-91f9-c3d5be86c504',
  '25544247-7329-4b26-9aa4-0221a10fbd32',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-21T09:29:29.165Z',
  '2024-05-21T09:29:29.165Z'
);

-- Order 69/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'aafd35e2-8953-4b5a-9b85-6a02fcca4ae8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1813.10,
  1673.36,
  151.27,
  15.43,
  26.96,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-19T13:29:19.490Z',
  '2024-11-19T13:29:19.490Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dc25c245-8636-49cc-b3a8-47579400f4bf',
  'aafd35e2-8953-4b5a-9b85-6a02fcca4ae8',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-19T13:29:19.490Z',
  '2024-11-19T13:29:19.490Z'
);

-- Order Item for Order 69
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8aad09e5-cd6c-42fd-a8ce-dd9496847b09',
  'aafd35e2-8953-4b5a-9b85-6a02fcca4ae8',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-19T13:29:19.490Z',
  '2024-11-19T13:29:19.490Z'
);

-- Order 70/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd0ac6832-3f4a-4204-ab63-6e0c857394c1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1985.09,
  1847.75,
  116.22,
  21.12,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-07T20:54:27.555Z',
  '2024-08-07T20:54:27.555Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6b581d92-bcca-436a-b9a7-1efba85ea940',
  'd0ac6832-3f4a-4204-ab63-6e0c857394c1',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-07T20:54:27.555Z',
  '2024-08-07T20:54:27.555Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e2ca6ebf-7ebf-41ac-adb0-f2c43de2f025',
  'd0ac6832-3f4a-4204-ab63-6e0c857394c1',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-07T20:54:27.555Z',
  '2024-08-07T20:54:27.555Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '07b71020-0d18-4cbc-ba94-3e5108a5b5b9',
  'd0ac6832-3f4a-4204-ab63-6e0c857394c1',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-07T20:54:27.555Z',
  '2024-08-07T20:54:27.555Z'
);

-- Order Item for Order 70
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c1b2afaa-8766-43fd-ba22-8cf7e34fd261',
  'd0ac6832-3f4a-4204-ab63-6e0c857394c1',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-07T20:54:27.555Z',
  '2024-08-07T20:54:27.555Z'
);

-- Order 71/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd89857ae-593b-4dd1-a2bc-575a33791346',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1381.54,
  1259.99,
  123.98,
  13.19,
  15.62,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-31T11:53:27.767Z',
  '2025-01-31T11:53:27.767Z'
);

-- Order Item for Order 71
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '637937d7-1880-4f8c-8103-454714c47128',
  'd89857ae-593b-4dd1-a2bc-575a33791346',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-31T11:53:27.767Z',
  '2025-01-31T11:53:27.767Z'
);

-- Order Item for Order 71
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0c984dca-fcf8-41c4-bf4e-a0bbf1762bc6',
  'd89857ae-593b-4dd1-a2bc-575a33791346',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-31T11:53:27.767Z',
  '2025-01-31T11:53:27.767Z'
);

-- Order 72/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b168fb5d-9c91-41d2-b4cb-e9ace0adb778',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  581.43,
  525.67,
  35.06,
  20.70,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-14T05:44:56.771Z',
  '2024-11-14T05:44:56.771Z'
);

-- Order Item for Order 72
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '835ae22a-1e02-482d-8130-cabc4cff730b',
  'b168fb5d-9c91-41d2-b4cb-e9ace0adb778',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-14T05:44:56.771Z',
  '2024-11-14T05:44:56.771Z'
);

-- Order Item for Order 72
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd98482bc-70dc-45bf-b7a7-a252e21338f8',
  'b168fb5d-9c91-41d2-b4cb-e9ace0adb778',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-14T05:44:56.771Z',
  '2024-11-14T05:44:56.771Z'
);

-- Order 73/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5959013b-06e4-4459-98fa-6e22cf065a38',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1088.18,
  970.67,
  93.96,
  23.55,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-31T04:38:34.298Z',
  '2024-03-31T04:38:34.298Z'
);

-- Order Item for Order 73
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e255b200-bf97-4564-8c67-09d1c5c8b466',
  '5959013b-06e4-4459-98fa-6e22cf065a38',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-31T04:38:34.298Z',
  '2024-03-31T04:38:34.298Z'
);

-- Order Item for Order 73
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0d20cc49-00e9-4a6a-8bbb-8f1fde8ac7d7',
  '5959013b-06e4-4459-98fa-6e22cf065a38',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-03-31T04:38:34.298Z',
  '2024-03-31T04:38:34.298Z'
);

-- Order Item for Order 73
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c2fd7a17-91f8-47b8-a7af-8da9b82f556c',
  '5959013b-06e4-4459-98fa-6e22cf065a38',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-31T04:38:34.298Z',
  '2024-03-31T04:38:34.298Z'
);

-- Order 74/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2293.65,
  2105.64,
  176.24,
  11.77,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a0770c06-bbc2-488e-aab8-604382e6db24',
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ec44ca25-b87c-4c7b-9154-87a6e26551e1',
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7669f324-b5d9-402e-b3da-6a81d6166b1a',
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd6afb0a1-ae21-41f6-96bb-66dcc6b4ed18',
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order Item for Order 74
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '77675bce-e28c-4c69-b445-8e5161177190',
  '63c2528b-8cdf-48c6-94de-c0eaf88076fb',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-15T14:34:38.220Z',
  '2024-12-15T14:34:38.220Z'
);

-- Order 75/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '94a352e5-6768-4400-8158-a8bcba899f81',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  565.28,
  515.58,
  37.12,
  12.58,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-31T06:05:04.100Z',
  '2024-08-31T06:05:04.100Z'
);

-- Order Item for Order 75
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ce8e984e-e4a5-4114-a025-eb126f0c95a2',
  '94a352e5-6768-4400-8158-a8bcba899f81',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-31T06:05:04.100Z',
  '2024-08-31T06:05:04.100Z'
);

-- Order 76/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '1f2c02be-7f27-46ef-a6d4-18da36728f18',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  810.91,
  749.97,
  72.60,
  12.71,
  24.37,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-27T01:16:20.113Z',
  '2024-09-27T01:16:20.113Z'
);

-- Order Item for Order 76
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '154b02cc-29e5-4d1d-a138-5f735b179979',
  '1f2c02be-7f27-46ef-a6d4-18da36728f18',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-09-27T01:16:20.113Z',
  '2024-09-27T01:16:20.113Z'
);

-- Order 77/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8bc409fd-6ea3-4677-8593-70e0a8beabc8',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1211.71,
  1101.33,
  85.68,
  24.70,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-31T03:16:10.913Z',
  '2025-01-31T03:16:10.913Z'
);

-- Order Item for Order 77
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3d9dd8f-bb45-400a-86d8-9bc60f77dee1',
  '8bc409fd-6ea3-4677-8593-70e0a8beabc8',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-01-31T03:16:10.913Z',
  '2025-01-31T03:16:10.913Z'
);

-- Order Item for Order 77
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6dce1b1d-e7af-42f2-811d-b888e8597a66',
  '8bc409fd-6ea3-4677-8593-70e0a8beabc8',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-31T03:16:10.913Z',
  '2025-01-31T03:16:10.913Z'
);

-- Order Item for Order 77
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ee0b3feb-ef17-479b-8b98-937233848ab9',
  '8bc409fd-6ea3-4677-8593-70e0a8beabc8',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-31T03:16:10.913Z',
  '2025-01-31T03:16:10.913Z'
);

-- Order 78/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2137.40,
  2011.06,
  121.07,
  5.27,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5cdfc42-d040-4ac9-8e63-5feab414723f',
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9faf266d-b207-4947-8506-45d95335ce8d',
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4c0790ee-5428-4fa9-aa6c-e320028efd00',
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1fe9057-c13b-47a9-8522-2caf410409a1',
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order Item for Order 78
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a866e562-88ae-4ce0-9a02-5b1a2bc83e1e',
  '767f0aaa-b170-4e4e-8734-204fc01a63df',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-25T20:34:25.499Z',
  '2024-06-25T20:34:25.499Z'
);

-- Order 79/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6813d6db-da5a-4fa6-bbde-faa3f6b4c5ee',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  802.40,
  749.99,
  39.22,
  13.19,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-05T19:16:20.515Z',
  '2024-04-05T19:16:20.515Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '23530865-d9ca-4c29-86a0-3ab48b01d135',
  '6813d6db-da5a-4fa6-bbde-faa3f6b4c5ee',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-05T19:16:20.515Z',
  '2024-04-05T19:16:20.515Z'
);

-- Order Item for Order 79
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5c2bda5a-a6c4-434b-8332-5be38bcbf453',
  '6813d6db-da5a-4fa6-bbde-faa3f6b4c5ee',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-05T19:16:20.515Z',
  '2024-04-05T19:16:20.515Z'
);

-- Order 80/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9c7939ce-117b-4b8c-8766-5d9bf99e94af',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  4067.02,
  3829.92,
  222.14,
  14.96,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-27T04:25:47.004Z',
  '2024-07-27T04:25:47.004Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b5f30585-5e02-4131-b172-100c8c6c796f',
  '9c7939ce-117b-4b8c-8766-5d9bf99e94af',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-07-27T04:25:47.004Z',
  '2024-07-27T04:25:47.004Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0a701d27-24fc-4582-81d7-7f7fe2ac6dd1',
  '9c7939ce-117b-4b8c-8766-5d9bf99e94af',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-27T04:25:47.004Z',
  '2024-07-27T04:25:47.004Z'
);

-- Order Item for Order 80
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1ff4ca9-efa8-4789-8cff-c14e1ba1c2e0',
  '9c7939ce-117b-4b8c-8766-5d9bf99e94af',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-27T04:25:47.004Z',
  '2024-07-27T04:25:47.004Z'
);

-- Order 81/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a75bf30c-98b3-4232-9127-920a28ea7f16',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2274.81,
  2149.71,
  112.43,
  12.67,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-02T16:38:51.828Z',
  '2024-12-02T16:38:51.828Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b15ebae1-04fd-4e79-9125-0a502a82e8c5',
  'a75bf30c-98b3-4232-9127-920a28ea7f16',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-12-02T16:38:51.828Z',
  '2024-12-02T16:38:51.828Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '519a7170-cf6e-41a7-bf44-1871bb0ab428',
  'a75bf30c-98b3-4232-9127-920a28ea7f16',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-02T16:38:51.828Z',
  '2024-12-02T16:38:51.828Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c5432f38-bae7-4f88-94a8-a78247f2f12c',
  'a75bf30c-98b3-4232-9127-920a28ea7f16',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-02T16:38:51.828Z',
  '2024-12-02T16:38:51.828Z'
);

-- Order Item for Order 81
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b91a830e-5168-47bf-9f74-95b3d8c33b35',
  'a75bf30c-98b3-4232-9127-920a28ea7f16',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-02T16:38:51.828Z',
  '2024-12-02T16:38:51.828Z'
);

-- Order 82/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3359.04,
  3105.29,
  256.50,
  22.15,
  24.90,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '77145cad-4a95-4bdc-9aba-9a3dd60d61d1',
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '64b06762-ba35-4339-88c7-ffe88567990f',
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1dc2f4e3-63f5-4573-9b9e-21e826208d2d',
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '17fa1967-8afa-4159-a47d-967ec75ffdd8',
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order Item for Order 82
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4b8ae1f6-6469-4553-b60e-f2d6e3dabf88',
  '8d6b84cd-745c-4f60-8411-641c6895ca54',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-19T19:44:06.706Z',
  '2025-01-19T19:44:06.706Z'
);

-- Order 83/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6a06051e-aa7e-4491-a4cb-1e0e2034475d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1669.56,
  1531.65,
  119.32,
  18.59,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-29T21:36:26.362Z',
  '2024-05-29T21:36:26.362Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '96ab35bf-a9a8-4f7a-8462-4206953f3493',
  '6a06051e-aa7e-4491-a4cb-1e0e2034475d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-29T21:36:26.362Z',
  '2024-05-29T21:36:26.362Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dc4d17fa-0d9f-4a0b-9e34-98acfcd6282e',
  '6a06051e-aa7e-4491-a4cb-1e0e2034475d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-05-29T21:36:26.362Z',
  '2024-05-29T21:36:26.362Z'
);

-- Order Item for Order 83
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '63d7f2e5-02a1-44e4-b172-72ed4777ee90',
  '6a06051e-aa7e-4491-a4cb-1e0e2034475d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-29T21:36:26.362Z',
  '2024-05-29T21:36:26.362Z'
);

-- Order 84/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2600.61,
  2438.43,
  140.70,
  21.48,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c3ab227d-6563-4103-bd27-5f9680b7c646',
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7020c05e-7d10-40fe-86f6-548ba22fb567',
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b8f9de92-e866-4fa7-9cd5-442d8fbe6f78',
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b7c5130c-56d6-4c21-b993-3ecbd0efa0e4',
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order Item for Order 84
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '63337129-1b8e-4a1b-b9de-cb3ca8e51f3a',
  '2b24e4a0-79cd-440c-97ec-f66b7abd6244',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-19T02:55:26.207Z',
  '2024-05-19T02:55:26.207Z'
);

-- Order 85/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b5f1b1e8-9186-4757-81d8-0d9f164aff1f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  613.62,
  551.34,
  54.64,
  7.64,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-29T03:53:55.446Z',
  '2025-01-29T03:53:55.446Z'
);

-- Order Item for Order 85
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dc2b51fa-2952-4dbc-b32d-4210b103076e',
  'b5f1b1e8-9186-4757-81d8-0d9f164aff1f',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-29T03:53:55.446Z',
  '2025-01-29T03:53:55.446Z'
);

-- Order 86/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd9f67eb1-83e9-4e6c-a650-4d574ab4d59e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  825.36,
  769.98,
  39.81,
  15.57,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-26T18:47:56.416Z',
  '2024-09-26T18:47:56.416Z'
);

-- Order Item for Order 86
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '91fbce92-f79a-4063-b950-578acc89f00c',
  'd9f67eb1-83e9-4e6c-a650-4d574ab4d59e',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-26T18:47:56.416Z',
  '2024-09-26T18:47:56.416Z'
);

-- Order Item for Order 86
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dc395818-fc62-48a6-9092-1be1cbff3796',
  'd9f67eb1-83e9-4e6c-a650-4d574ab4d59e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-26T18:47:56.416Z',
  '2024-09-26T18:47:56.416Z'
);

-- Order 87/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '1af90f88-2efe-4f10-acd5-cd776a87707e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1450.95,
  1319.21,
  126.25,
  5.49,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-18T06:52:47.082Z',
  '2024-09-18T06:52:47.082Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c8340367-47d3-49bf-93e8-09bbe6340941',
  '1af90f88-2efe-4f10-acd5-cd776a87707e',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-18T06:52:47.082Z',
  '2024-09-18T06:52:47.082Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b575c250-e606-42c4-ab11-e3ea280efd40',
  '1af90f88-2efe-4f10-acd5-cd776a87707e',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-18T06:52:47.082Z',
  '2024-09-18T06:52:47.082Z'
);

-- Order Item for Order 87
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f977b2a2-46ac-48f4-a9c9-fcf62f637ba3',
  '1af90f88-2efe-4f10-acd5-cd776a87707e',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-18T06:52:47.082Z',
  '2024-09-18T06:52:47.082Z'
);

-- Order 88/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd7197717-fd6f-44ed-be46-b54a2bec0f42',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1871.70,
  1702.77,
  161.93,
  7.00,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-23T13:22:37.816Z',
  '2025-02-23T13:22:37.816Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3a673813-df38-4421-ae83-0742f55596e5',
  'd7197717-fd6f-44ed-be46-b54a2bec0f42',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-23T13:22:37.816Z',
  '2025-02-23T13:22:37.816Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7164c545-ae53-4ebe-8e64-53a16ba22ce1',
  'd7197717-fd6f-44ed-be46-b54a2bec0f42',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-23T13:22:37.816Z',
  '2025-02-23T13:22:37.816Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3f7a18c-3d6c-4aa0-9d6d-d277ec00d7f5',
  'd7197717-fd6f-44ed-be46-b54a2bec0f42',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-23T13:22:37.816Z',
  '2025-02-23T13:22:37.816Z'
);

-- Order Item for Order 88
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5b700682-85cf-4254-9f02-12268f6422aa',
  'd7197717-fd6f-44ed-be46-b54a2bec0f42',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-23T13:22:37.816Z',
  '2025-02-23T13:22:37.816Z'
);

-- Order 89/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f146e50b-8689-4439-870e-993009370af6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1373.30,
  1274.21,
  77.85,
  21.24,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-07T21:37:41.834Z',
  '2024-11-07T21:37:41.834Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '42d7cc06-801c-4e96-8410-d52b7f310c2b',
  'f146e50b-8689-4439-870e-993009370af6',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-07T21:37:41.834Z',
  '2024-11-07T21:37:41.834Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '207081dd-b155-452b-aa07-5acb12e7d63b',
  'f146e50b-8689-4439-870e-993009370af6',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-07T21:37:41.834Z',
  '2024-11-07T21:37:41.834Z'
);

-- Order Item for Order 89
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73695261-632f-4fb0-a32c-24d1098963af',
  'f146e50b-8689-4439-870e-993009370af6',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-07T21:37:41.834Z',
  '2024-11-07T21:37:41.834Z'
);

-- Order 90/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'cd5102e5-14ef-4cf8-a6b4-3d64061ac1ce',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  4445.64,
  4076.04,
  350.95,
  18.65,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-30T17:42:29.071Z',
  '2024-06-30T17:42:29.071Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fd7b0b13-566b-4ba7-a06e-87841d9c98a4',
  'cd5102e5-14ef-4cf8-a6b4-3d64061ac1ce',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-30T17:42:29.071Z',
  '2024-06-30T17:42:29.071Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9d190ed3-41d4-4135-bdf6-2c5ca92111c1',
  'cd5102e5-14ef-4cf8-a6b4-3d64061ac1ce',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-30T17:42:29.071Z',
  '2024-06-30T17:42:29.071Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7f99a6f9-300e-4be9-a41f-2d4846838e12',
  'cd5102e5-14ef-4cf8-a6b4-3d64061ac1ce',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-30T17:42:29.071Z',
  '2024-06-30T17:42:29.071Z'
);

-- Order Item for Order 90
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '15ad6c4d-4367-436c-826d-3500859ccd9d',
  'cd5102e5-14ef-4cf8-a6b4-3d64061ac1ce',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-30T17:42:29.071Z',
  '2024-06-30T17:42:29.071Z'
);

-- Order 91/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ff735d98-edc5-42e0-9f51-c997bbd9b18e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2346.56,
  2163.34,
  181.94,
  20.61,
  19.33,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-16T04:00:22.617Z',
  '2024-10-16T04:00:22.617Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '61700d62-c6a4-4125-b209-31287047f0a9',
  'ff735d98-edc5-42e0-9f51-c997bbd9b18e',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-16T04:00:22.617Z',
  '2024-10-16T04:00:22.617Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '95b40f5c-035c-4f23-b3e3-2d3f60ae3a38',
  'ff735d98-edc5-42e0-9f51-c997bbd9b18e',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-16T04:00:22.617Z',
  '2024-10-16T04:00:22.617Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ca3e884b-0c7a-4c82-9b8a-ec3eee9a8bc6',
  'ff735d98-edc5-42e0-9f51-c997bbd9b18e',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-16T04:00:22.617Z',
  '2024-10-16T04:00:22.617Z'
);

-- Order Item for Order 91
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5cdf3872-27d1-4b7d-b318-d97168f29591',
  'ff735d98-edc5-42e0-9f51-c997bbd9b18e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-16T04:00:22.617Z',
  '2024-10-16T04:00:22.617Z'
);

-- Order 92/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5bd690b1-2255-45bd-8e95-5c59b1dce07e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  642.38,
  585.00,
  38.02,
  19.35,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-03-03T19:03:41.628Z',
  '2025-03-03T19:03:41.628Z'
);

-- Order Item for Order 92
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '47e1b545-6b80-4d88-8a64-2ec41acc4663',
  '5bd690b1-2255-45bd-8e95-5c59b1dce07e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-03-03T19:03:41.628Z',
  '2025-03-03T19:03:41.628Z'
);

-- Order 93/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ead33e62-d0ef-4830-8ed4-ca1232ad3d48',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1313.40,
  1220.67,
  108.76,
  11.28,
  27.31,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-25T04:11:08.198Z',
  '2025-02-25T04:11:08.198Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '42e72852-dd60-4077-9d7d-2c8ca08e8d47',
  'ead33e62-d0ef-4830-8ed4-ca1232ad3d48',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-25T04:11:08.198Z',
  '2025-02-25T04:11:08.198Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '808c42ba-4270-4f87-9d17-8f64b2bba42a',
  'ead33e62-d0ef-4830-8ed4-ca1232ad3d48',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-25T04:11:08.198Z',
  '2025-02-25T04:11:08.198Z'
);

-- Order Item for Order 93
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4e96acf0-1d1d-450d-9d97-2fe9df5e9649',
  'ead33e62-d0ef-4830-8ed4-ca1232ad3d48',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-25T04:11:08.198Z',
  '2025-02-25T04:11:08.198Z'
);

-- Order 94/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c91100ac-c660-4bb0-8d3a-6db885c50d4b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1794.82,
  1648.28,
  150.98,
  15.07,
  19.51,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-30T23:50:22.133Z',
  '2024-06-30T23:50:22.133Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c294380d-0fb1-4c74-ab95-7682b99a0bf0',
  'c91100ac-c660-4bb0-8d3a-6db885c50d4b',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-30T23:50:22.133Z',
  '2024-06-30T23:50:22.133Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1a67822e-5949-422c-b6d8-9e928f2c68af',
  'c91100ac-c660-4bb0-8d3a-6db885c50d4b',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-30T23:50:22.133Z',
  '2024-06-30T23:50:22.133Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '05d9a653-231d-4481-8afa-5aefc4728acb',
  'c91100ac-c660-4bb0-8d3a-6db885c50d4b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-30T23:50:22.133Z',
  '2024-06-30T23:50:22.133Z'
);

-- Order Item for Order 94
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c654ba80-c74c-4244-8963-98d0443f3f1a',
  'c91100ac-c660-4bb0-8d3a-6db885c50d4b',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-30T23:50:22.133Z',
  '2024-06-30T23:50:22.133Z'
);

-- Order 95/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '75613089-e26d-42e1-a957-28a943ddbaea',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  803.99,
  739.98,
  55.50,
  8.51,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-15T08:41:21.838Z',
  '2024-10-15T08:41:21.838Z'
);

-- Order Item for Order 95
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7aabc37d-6abc-410c-abb0-49e6bc492950',
  '75613089-e26d-42e1-a957-28a943ddbaea',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-15T08:41:21.838Z',
  '2024-10-15T08:41:21.838Z'
);

-- Order Item for Order 95
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '178b50e6-1b2d-47fb-a0b8-22b55dbb4c40',
  '75613089-e26d-42e1-a957-28a943ddbaea',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-15T08:41:21.838Z',
  '2024-10-15T08:41:21.838Z'
);

-- Order 96/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1739.78,
  1564.97,
  153.05,
  21.76,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd55e6c6d-e06c-498b-8076-e3571f31ead0',
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '71070d99-c37a-467b-b995-28339d81433f',
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '75c39a4e-a8ce-4fe5-ab91-d1f6175203b8',
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3eb787e-a329-4f64-9163-6f55ce65c38b',
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order Item for Order 96
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2404ffb9-0d87-4cf9-b21a-153d0a92e431',
  'e616ff62-33a9-4f6c-84e4-cb5cd26fb815',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-24T20:05:06.182Z',
  '2024-11-24T20:05:06.182Z'
);

-- Order 97/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6ce4c403-6def-4787-a865-cc893fb7eebe',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1722.50,
  1567.01,
  140.40,
  15.09,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-01T18:37:19.335Z',
  '2024-11-01T18:37:19.335Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3c284df4-0398-4ba1-882d-d505971cf18a',
  '6ce4c403-6def-4787-a865-cc893fb7eebe',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-01T18:37:19.335Z',
  '2024-11-01T18:37:19.335Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f4fb3562-879b-4e7c-ad60-16e28a5437dc',
  '6ce4c403-6def-4787-a865-cc893fb7eebe',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-01T18:37:19.335Z',
  '2024-11-01T18:37:19.335Z'
);

-- Order Item for Order 97
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7eee69c3-fa9c-47ba-8b13-ebb4b3068521',
  '6ce4c403-6def-4787-a865-cc893fb7eebe',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-01T18:37:19.335Z',
  '2024-11-01T18:37:19.335Z'
);

-- Order 98/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a59c7c51-e975-41ec-be26-3b376a675db9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1628.12,
  1472.76,
  143.30,
  12.06,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-16T03:16:51.557Z',
  '2025-02-16T03:16:51.557Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ea159be8-3705-4f58-8ae4-194e038c5aeb',
  'a59c7c51-e975-41ec-be26-3b376a675db9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-16T03:16:51.557Z',
  '2025-02-16T03:16:51.557Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed23beb4-eb78-42f9-8b6a-2d37748036f8',
  'a59c7c51-e975-41ec-be26-3b376a675db9',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-16T03:16:51.557Z',
  '2025-02-16T03:16:51.557Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3618abff-2b5a-4adf-b45f-ce061b97efc0',
  'a59c7c51-e975-41ec-be26-3b376a675db9',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-16T03:16:51.557Z',
  '2025-02-16T03:16:51.557Z'
);

-- Order Item for Order 98
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6517bc45-986a-4ed1-a891-3267b5b53a20',
  'a59c7c51-e975-41ec-be26-3b376a675db9',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-16T03:16:51.557Z',
  '2025-02-16T03:16:51.557Z'
);

-- Order 99/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1166.40,
  1098.45,
  59.32,
  8.63,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '628e3b71-9e26-4d93-a731-247b0df36d6b',
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a759c947-1cb1-4d17-8c3d-8e3aebfc4635',
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1441089d-e513-4be0-adec-a1d745a46be0',
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fef69e63-687f-4090-95d9-2b10c1c1cdca',
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order Item for Order 99
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '218d981a-9139-42e2-8331-0a3e2498c08d',
  '8f122dc2-839e-49fe-920d-6bb8258e60e2',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-07T17:15:57.462Z',
  '2025-02-07T17:15:57.462Z'
);

-- Order 100/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6de54383-ff0e-42b2-922a-bb98f3f7f89c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2821.60,
  2575.65,
  237.47,
  24.74,
  16.26,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2025-02-07T01:56:50.013Z',
  '2025-02-07T01:56:50.013Z'
);

-- Order Item for Order 100
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c597d68b-a1b3-4b84-adb2-82eb6b509d0d',
  '6de54383-ff0e-42b2-922a-bb98f3f7f89c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-07T01:56:50.013Z',
  '2025-02-07T01:56:50.013Z'
);

-- Order Item for Order 100
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dcdbc8a4-215e-491a-8834-c3cde52495ee',
  '6de54383-ff0e-42b2-922a-bb98f3f7f89c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-07T01:56:50.013Z',
  '2025-02-07T01:56:50.013Z'
);

-- Order Item for Order 100
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '761069d9-006e-4c4c-a6d6-d05055d4ec19',
  '6de54383-ff0e-42b2-922a-bb98f3f7f89c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-07T01:56:50.013Z',
  '2025-02-07T01:56:50.013Z'
);

-- Order 101/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  3835.33,
  3549.10,
  262.63,
  23.60,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order Item for Order 101
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cd629476-e57f-4e6c-b831-97e28cfdd220',
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order Item for Order 101
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b8cab9f0-371c-4c47-bf1b-9561641e389d',
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order Item for Order 101
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd7ebb1aa-1fd2-4e52-9585-3b67cc8ef5d4',
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order Item for Order 101
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3f00228c-d07b-46bc-9367-955e97bdbe18',
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order Item for Order 101
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5cecb17a-c0fc-474f-aaf7-7ce12f539f96',
  '55f1a6fa-7629-46a2-83fe-c8a04b515b83',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-06T16:18:33.234Z',
  '2024-09-06T16:18:33.234Z'
);

-- Order 102/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '94c9cc4b-d9f6-49b3-99ee-dc397eec25b1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  537.69,
  499.98,
  45.30,
  22.33,
  29.92,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-08T06:05:43.098Z',
  '2024-11-08T06:05:43.098Z'
);

-- Order Item for Order 102
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a3ff2961-13d1-4feb-a95a-dfdbd2e7e845',
  '94c9cc4b-d9f6-49b3-99ee-dc397eec25b1',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-08T06:05:43.098Z',
  '2024-11-08T06:05:43.098Z'
);

-- Order 103/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bb09739b-bb6e-4aff-8d31-18a7f36986b5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  3430.22,
  3226.97,
  196.20,
  7.05,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-12T12:06:09.086Z',
  '2024-07-12T12:06:09.086Z'
);

-- Order Item for Order 103
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c754130e-610d-45f1-87e8-257d0ba1f07a',
  'bb09739b-bb6e-4aff-8d31-18a7f36986b5',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-12T12:06:09.086Z',
  '2024-07-12T12:06:09.086Z'
);

-- Order Item for Order 103
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5ce63a18-2f6e-45b4-9dfe-009d2cc58230',
  'bb09739b-bb6e-4aff-8d31-18a7f36986b5',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-12T12:06:09.086Z',
  '2024-07-12T12:06:09.086Z'
);

-- Order Item for Order 103
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '05cc0e8a-4995-4261-b0f7-c7671c1dca7e',
  'bb09739b-bb6e-4aff-8d31-18a7f36986b5',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-12T12:06:09.086Z',
  '2024-07-12T12:06:09.086Z'
);

-- Order Item for Order 103
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '38ed37cb-4e12-4da2-b5dc-92420d772c5a',
  'bb09739b-bb6e-4aff-8d31-18a7f36986b5',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-12T12:06:09.086Z',
  '2024-07-12T12:06:09.086Z'
);

-- Order 104/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b93b2011-ba05-4183-8cdf-4b66e36e06b6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  3490.19,
  3203.95,
  288.04,
  5.18,
  6.98,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-22T17:05:59.348Z',
  '2024-11-22T17:05:59.348Z'
);

-- Order Item for Order 104
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6951d83b-f4d8-4c4c-823c-947569cbf8ad',
  'b93b2011-ba05-4183-8cdf-4b66e36e06b6',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-22T17:05:59.348Z',
  '2024-11-22T17:05:59.348Z'
);

-- Order Item for Order 104
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e65918fd-2ba8-4138-a7e8-d4fe0b68cb0f',
  'b93b2011-ba05-4183-8cdf-4b66e36e06b6',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-22T17:05:59.348Z',
  '2024-11-22T17:05:59.348Z'
);

-- Order Item for Order 104
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '07dc47c7-196a-4ec3-924b-c19c265c980f',
  'b93b2011-ba05-4183-8cdf-4b66e36e06b6',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-22T17:05:59.348Z',
  '2024-11-22T17:05:59.348Z'
);

-- Order Item for Order 104
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd3737d4d-6101-4669-82e8-cba74da21ed1',
  'b93b2011-ba05-4183-8cdf-4b66e36e06b6',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-22T17:05:59.348Z',
  '2024-11-22T17:05:59.348Z'
);

-- Order 105/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '380d8db3-5d6b-4741-964e-808adaf78b5a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1700.98,
  1587.75,
  93.68,
  19.55,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-12-18T05:01:46.296Z',
  '2024-12-18T05:01:46.296Z'
);

-- Order Item for Order 105
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '64fe0a6e-57ce-4758-8c9b-8a9395dc9dff',
  '380d8db3-5d6b-4741-964e-808adaf78b5a',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-18T05:01:46.296Z',
  '2024-12-18T05:01:46.296Z'
);

-- Order Item for Order 105
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5721bc99-b68b-4c1b-9519-a2993b8d73e6',
  '380d8db3-5d6b-4741-964e-808adaf78b5a',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-18T05:01:46.296Z',
  '2024-12-18T05:01:46.296Z'
);

-- Order Item for Order 105
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c16ed7b3-a395-428d-9a15-2b6a951e3d11',
  '380d8db3-5d6b-4741-964e-808adaf78b5a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-18T05:01:46.296Z',
  '2024-12-18T05:01:46.296Z'
);

-- Order Item for Order 105
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5cba4f5f-7e17-42f2-9eaf-0d34d12db60a',
  '380d8db3-5d6b-4741-964e-808adaf78b5a',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-18T05:01:46.296Z',
  '2024-12-18T05:01:46.296Z'
);

-- Order 106/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6cbba75e-2120-41ca-852e-20a3e3e13732',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1006.75,
  939.99,
  60.82,
  5.94,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-06-16T04:58:06.341Z',
  '2024-06-16T04:58:06.341Z'
);

-- Order Item for Order 106
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e75343d0-478d-4f8a-9af7-a567bbcef064',
  '6cbba75e-2120-41ca-852e-20a3e3e13732',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-06-16T04:58:06.341Z',
  '2024-06-16T04:58:06.341Z'
);

-- Order Item for Order 106
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '945f962f-642f-48da-98e4-26f8876ea1bc',
  '6cbba75e-2120-41ca-852e-20a3e3e13732',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-16T04:58:06.341Z',
  '2024-06-16T04:58:06.341Z'
);

-- Order 107/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b2aa9864-b6cf-422e-8452-7e6a496c273f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2395.13,
  2209.95,
  164.20,
  20.98,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-02T07:27:09.698Z',
  '2024-05-02T07:27:09.698Z'
);

-- Order Item for Order 107
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '789d8fc5-b609-4ac2-8976-80fde7a1cf17',
  'b2aa9864-b6cf-422e-8452-7e6a496c273f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-02T07:27:09.698Z',
  '2024-05-02T07:27:09.698Z'
);

-- Order Item for Order 107
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bd92336a-3826-40bd-a068-524d77c8a7d8',
  'b2aa9864-b6cf-422e-8452-7e6a496c273f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-02T07:27:09.698Z',
  '2024-05-02T07:27:09.698Z'
);

-- Order Item for Order 107
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd6bf9cc0-a5b0-47c3-9e02-9240d8eb5fe1',
  'b2aa9864-b6cf-422e-8452-7e6a496c273f',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-02T07:27:09.698Z',
  '2024-05-02T07:27:09.698Z'
);

-- Order Item for Order 107
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'badc505f-e566-444d-9781-a7b4343b24b4',
  'b2aa9864-b6cf-422e-8452-7e6a496c273f',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-02T07:27:09.698Z',
  '2024-05-02T07:27:09.698Z'
);

-- Order 108/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5b764f76-608c-4f89-b618-9aeeffcf614f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  279.31,
  250.00,
  19.40,
  9.91,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-06-30T21:55:12.413Z',
  '2024-06-30T21:55:12.413Z'
);

-- Order Item for Order 108
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '749f2015-6c44-4b94-b0ce-3cbbf0cb4e45',
  '5b764f76-608c-4f89-b618-9aeeffcf614f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-30T21:55:12.413Z',
  '2024-06-30T21:55:12.413Z'
);

-- Order 109/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'af779391-1e45-48bd-be30-97373c55d7ed',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  798.74,
  749.97,
  38.77,
  10.00,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-11-01T08:05:49.329Z',
  '2024-11-01T08:05:49.329Z'
);

-- Order Item for Order 109
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '27d4f5d5-e97c-4cee-9a4c-780520136b76',
  'af779391-1e45-48bd-be30-97373c55d7ed',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-01T08:05:49.329Z',
  '2024-11-01T08:05:49.329Z'
);

-- Order 110/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2216.54,
  2039.46,
  181.92,
  24.59,
  29.43,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order Item for Order 110
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f14cfb4f-b3bd-4c8d-83a4-d226dd9f5f0f',
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order Item for Order 110
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ba6fe0ca-612d-4d7a-906e-0421e769b27e',
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order Item for Order 110
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b9bbca3c-3a04-4b7c-a799-faf9804a8d95',
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order Item for Order 110
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c06f1c80-54a9-41e9-baac-97d800808ee1',
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order Item for Order 110
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '62d0a49a-5482-4c9f-9c29-43b86a1f3e9c',
  '3956a3a2-3a66-40ae-9983-7f99f0e3ce57',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-01T07:44:31.176Z',
  '2024-11-01T07:44:31.176Z'
);

-- Order 111/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6b03aad8-11d8-485d-8768-6d75dda609ad',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  3970.08,
  3707.73,
  247.31,
  15.04,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-26T07:22:27.530Z',
  '2024-11-26T07:22:27.530Z'
);

-- Order Item for Order 111
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73970d39-ca88-4076-9ffb-e18e39eccaa1',
  '6b03aad8-11d8-485d-8768-6d75dda609ad',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-26T07:22:27.530Z',
  '2024-11-26T07:22:27.530Z'
);

-- Order Item for Order 111
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e25c44dc-73a2-494a-b0a8-eb6f0148ec9f',
  '6b03aad8-11d8-485d-8768-6d75dda609ad',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-26T07:22:27.530Z',
  '2024-11-26T07:22:27.530Z'
);

-- Order Item for Order 111
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '50e7bcce-f87e-4217-94ac-89f8441a92d4',
  '6b03aad8-11d8-485d-8768-6d75dda609ad',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-26T07:22:27.530Z',
  '2024-11-26T07:22:27.530Z'
);

-- Order 112/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd4e3d097-3c5d-45f0-9ed8-972d07f75d0c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1488.45,
  1415.57,
  71.34,
  6.83,
  5.29,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-04-13T17:41:48.709Z',
  '2024-04-13T17:41:48.709Z'
);

-- Order Item for Order 112
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9a71b3bc-9967-40aa-80b1-b619dcde3002',
  'd4e3d097-3c5d-45f0-9ed8-972d07f75d0c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-13T17:41:48.709Z',
  '2024-04-13T17:41:48.709Z'
);

-- Order Item for Order 112
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '12b0601c-1e84-4f73-b0d2-1278b2e2c674',
  'd4e3d097-3c5d-45f0-9ed8-972d07f75d0c',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-13T17:41:48.709Z',
  '2024-04-13T17:41:48.709Z'
);

-- Order 113/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'df0bd0ee-1f04-41a5-8e85-8ac72adfe0af',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  295.81,
  257.79,
  15.70,
  22.32,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-05-25T01:24:47.774Z',
  '2024-05-25T01:24:47.774Z'
);

-- Order Item for Order 113
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2546cced-8017-4df8-a37c-a2aa5b6f7a41',
  'df0bd0ee-1f04-41a5-8e85-8ac72adfe0af',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-25T01:24:47.774Z',
  '2024-05-25T01:24:47.774Z'
);

-- Order 114/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b2a10e0e-d4c1-48c8-8ecd-7867607eac93',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1600.77,
  1469.96,
  124.65,
  6.16,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-14T22:24:31.403Z',
  '2024-08-14T22:24:31.403Z'
);

-- Order Item for Order 114
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6315557a-3ea5-4e46-acbf-5ec5a8cfa6c3',
  'b2a10e0e-d4c1-48c8-8ecd-7867607eac93',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-14T22:24:31.403Z',
  '2024-08-14T22:24:31.403Z'
);

-- Order Item for Order 114
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e9bf55b3-02d8-4197-bb84-4f067036b242',
  'b2a10e0e-d4c1-48c8-8ecd-7867607eac93',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-14T22:24:31.403Z',
  '2024-08-14T22:24:31.403Z'
);

-- Order 115/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2880.97,
  2712.13,
  154.05,
  14.79,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order Item for Order 115
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '354b1d08-4f7d-4ef3-b9d3-e831f1f4d986',
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order Item for Order 115
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1ac744eb-5f7d-4d75-9fae-d5e8485b1e1b',
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order Item for Order 115
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '92c2c3c2-5e3d-4599-8cfa-6416637938c3',
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order Item for Order 115
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '39c6a042-28ae-4d8e-b96d-9adefc44e8d5',
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order Item for Order 115
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '820ec4ea-9755-4472-8db3-3b5505a64be6',
  'a3c1d1f9-3131-42e5-a87f-57db690021c6',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-21T03:01:50.525Z',
  '2024-09-21T03:01:50.525Z'
);

-- Order 116/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '530bbe8f-4b2a-40d8-b8cc-fbabcd05747d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  688.45,
  626.10,
  58.35,
  23.20,
  19.20,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-23T15:43:33.819Z',
  '2024-07-23T15:43:33.819Z'
);

-- Order Item for Order 116
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bdbc3ad3-3575-4634-a2d9-11c889cdde3f',
  '530bbe8f-4b2a-40d8-b8cc-fbabcd05747d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-23T15:43:33.819Z',
  '2024-07-23T15:43:33.819Z'
);

-- Order Item for Order 116
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'db858415-7f46-49e5-917d-2ea94f42a036',
  '530bbe8f-4b2a-40d8-b8cc-fbabcd05747d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-23T15:43:33.819Z',
  '2024-07-23T15:43:33.819Z'
);

-- Order 117/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '395c3729-9779-48bc-b953-1d46a48cc1f2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3554.70,
  3251.31,
  285.14,
  18.25,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-18T10:03:48.066Z',
  '2024-06-18T10:03:48.066Z'
);

-- Order Item for Order 117
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '05827a07-5e54-49c4-8353-3ac5172cbeb4',
  '395c3729-9779-48bc-b953-1d46a48cc1f2',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-18T10:03:48.066Z',
  '2024-06-18T10:03:48.066Z'
);

-- Order Item for Order 117
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f65eca20-a6b7-4d15-9ac8-d109894a9855',
  '395c3729-9779-48bc-b953-1d46a48cc1f2',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-18T10:03:48.066Z',
  '2024-06-18T10:03:48.066Z'
);

-- Order 118/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '63b33634-d0e0-49d1-91cc-154cce3d11b0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2017.07,
  1839.95,
  164.49,
  22.44,
  9.81,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-07T12:55:50.414Z',
  '2025-01-07T12:55:50.414Z'
);

-- Order Item for Order 118
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '63d1c5c9-32b9-4269-85cc-9586388ec510',
  '63b33634-d0e0-49d1-91cc-154cce3d11b0',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-07T12:55:50.414Z',
  '2025-01-07T12:55:50.414Z'
);

-- Order Item for Order 118
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8eacf9c8-eb84-4a36-b690-b814fab50401',
  '63b33634-d0e0-49d1-91cc-154cce3d11b0',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-01-07T12:55:50.414Z',
  '2025-01-07T12:55:50.414Z'
);

-- Order Item for Order 118
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ef2ccaf6-b655-4530-8ede-0673ddeac8f7',
  '63b33634-d0e0-49d1-91cc-154cce3d11b0',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-07T12:55:50.414Z',
  '2025-01-07T12:55:50.414Z'
);

-- Order 119/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '050f1147-5b72-4518-ae1d-793c6659603b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1925.80,
  1799.56,
  133.71,
  16.27,
  23.74,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order Item for Order 119
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed1e22b4-743c-4196-9ce8-10ca7ba59a53',
  '050f1147-5b72-4518-ae1d-793c6659603b',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order Item for Order 119
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '869f56ae-cc0c-4677-b5a7-5b689e03514a',
  '050f1147-5b72-4518-ae1d-793c6659603b',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order Item for Order 119
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9b420615-dce2-4c18-905d-0c0a3ac510ba',
  '050f1147-5b72-4518-ae1d-793c6659603b',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order Item for Order 119
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd5f08444-a7b8-4d95-98d7-0a500f205a9d',
  '050f1147-5b72-4518-ae1d-793c6659603b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order Item for Order 119
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76884bae-f944-48ec-b00d-518127409f8e',
  '050f1147-5b72-4518-ae1d-793c6659603b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-27T22:06:41.105Z',
  '2024-06-27T22:06:41.105Z'
);

-- Order 120/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '38238dde-cae8-4bb3-9fb4-f7595f0919b3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1969.01,
  1799.98,
  178.20,
  5.04,
  14.21,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-06-21T09:20:33.893Z',
  '2024-06-21T09:20:33.893Z'
);

-- Order Item for Order 120
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '94490a66-da20-4cfc-a6fb-5aa6c35b6706',
  '38238dde-cae8-4bb3-9fb4-f7595f0919b3',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-21T09:20:33.893Z',
  '2024-06-21T09:20:33.893Z'
);

-- Order 121/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  4825.55,
  4426.62,
  385.12,
  13.81,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order Item for Order 121
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '86b18c44-03ac-461c-976e-a8f6277150b8',
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order Item for Order 121
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9ebedc9d-267f-4dab-a2c7-273dce0cb62a',
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order Item for Order 121
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6e3da223-585e-474f-b408-ba56088c0c1c',
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order Item for Order 121
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2fd9604b-7de3-436e-90a1-dc12084fbd84',
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order Item for Order 121
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0a735d43-7044-4e51-81cd-6b52f7ac84c4',
  '79c47cf3-e0cf-4ddf-b7e8-c6708c04a695',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-05T17:27:16.924Z',
  '2024-04-05T17:27:16.924Z'
);

-- Order 122/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '0a5251d4-4eb3-4c79-9ed7-598b0d7171d0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  677.56,
  622.20,
  46.54,
  23.30,
  14.48,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-08T06:56:35.898Z',
  '2024-06-08T06:56:35.898Z'
);

-- Order Item for Order 122
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5d3b0c4b-9071-4317-a63a-a23218b9c86f',
  '0a5251d4-4eb3-4c79-9ed7-598b0d7171d0',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-08T06:56:35.898Z',
  '2024-06-08T06:56:35.898Z'
);

-- Order Item for Order 122
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b1baaac1-3a3b-4f50-a20f-98cca257ccfd',
  '0a5251d4-4eb3-4c79-9ed7-598b0d7171d0',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-08T06:56:35.898Z',
  '2024-06-08T06:56:35.898Z'
);

-- Order Item for Order 122
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '37b1b097-a3d7-44d1-909b-bf16393f1476',
  '0a5251d4-4eb3-4c79-9ed7-598b0d7171d0',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-08T06:56:35.898Z',
  '2024-06-08T06:56:35.898Z'
);

-- Order 123/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'cd91d6fa-2863-4efd-b05d-49e7aaa0b2b1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  916.74,
  827.01,
  80.14,
  17.75,
  8.16,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-03T20:05:13.242Z',
  '2025-02-03T20:05:13.242Z'
);

-- Order Item for Order 123
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8d62450d-22f5-4db7-9745-1054ad7740ad',
  'cd91d6fa-2863-4efd-b05d-49e7aaa0b2b1',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-03T20:05:13.242Z',
  '2025-02-03T20:05:13.242Z'
);

-- Order 124/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '452b7bc7-de12-4454-9e7f-5663a4f060ed',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1501.40,
  1412.01,
  75.12,
  14.27,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-27T16:56:41.373Z',
  '2024-07-27T16:56:41.373Z'
);

-- Order Item for Order 124
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0e401b29-f723-4376-b3e6-c556cb8242e2',
  '452b7bc7-de12-4454-9e7f-5663a4f060ed',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-27T16:56:41.373Z',
  '2024-07-27T16:56:41.373Z'
);

-- Order Item for Order 124
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2b2e00cd-9d7e-4778-968f-5c9d23c31fe0',
  '452b7bc7-de12-4454-9e7f-5663a4f060ed',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-27T16:56:41.373Z',
  '2024-07-27T16:56:41.373Z'
);

-- Order 125/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'bd6e31c0-380f-42cd-b3ff-abdeb5062d22',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1949.65,
  1799.98,
  136.26,
  13.41,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-29T23:25:26.196Z',
  '2024-12-29T23:25:26.196Z'
);

-- Order Item for Order 125
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5541aa9-6cbd-4a25-9530-72bb49da08bf',
  'bd6e31c0-380f-42cd-b3ff-abdeb5062d22',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-29T23:25:26.196Z',
  '2024-12-29T23:25:26.196Z'
);

-- Order 126/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'cdc39813-b7ab-4e7a-9639-9d660e095496',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  284.64,
  252.20,
  13.95,
  18.49,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-15T09:31:29.472Z',
  '2025-02-15T09:31:29.472Z'
);

-- Order Item for Order 126
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4bebf609-5a50-430a-9faf-d553cca8b79b',
  'cdc39813-b7ab-4e7a-9639-9d660e095496',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-15T09:31:29.472Z',
  '2025-02-15T09:31:29.472Z'
);

-- Order 127/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '45f49ae4-2060-4898-b2c5-73f66112f9c4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  711.12,
  628.29,
  61.70,
  21.13,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-20T20:08:59.165Z',
  '2024-12-20T20:08:59.165Z'
);

-- Order Item for Order 127
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bb4ecc0b-fdca-4de8-b0df-503fbd7331fa',
  '45f49ae4-2060-4898-b2c5-73f66112f9c4',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-20T20:08:59.165Z',
  '2024-12-20T20:08:59.165Z'
);

-- Order Item for Order 127
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5734b642-a78e-4a4f-ba93-f29a9d285a65',
  '45f49ae4-2060-4898-b2c5-73f66112f9c4',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-20T20:08:59.165Z',
  '2024-12-20T20:08:59.165Z'
);

-- Order 128/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8366f5ee-a746-4ad7-9d6f-e0324d885ca0',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2370.82,
  2156.07,
  213.88,
  22.96,
  22.09,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-18T05:31:19.308Z',
  '2024-12-18T05:31:19.308Z'
);

-- Order Item for Order 128
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6145c2f6-31b0-4de6-bd67-186d8258ff71',
  '8366f5ee-a746-4ad7-9d6f-e0324d885ca0',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-18T05:31:19.308Z',
  '2024-12-18T05:31:19.308Z'
);

-- Order Item for Order 128
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1d382410-a8a0-420e-9a56-29e7f66b0fe2',
  '8366f5ee-a746-4ad7-9d6f-e0324d885ca0',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-18T05:31:19.308Z',
  '2024-12-18T05:31:19.308Z'
);

-- Order Item for Order 128
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5f8cc4b6-d6d8-4165-a18d-ecbba8d69049',
  '8366f5ee-a746-4ad7-9d6f-e0324d885ca0',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-18T05:31:19.308Z',
  '2024-12-18T05:31:19.308Z'
);

-- Order Item for Order 128
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5631d161-63db-49e7-bc6d-c022d2756c3e',
  '8366f5ee-a746-4ad7-9d6f-e0324d885ca0',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-18T05:31:19.308Z',
  '2024-12-18T05:31:19.308Z'
);

-- Order 129/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9bf5da4d-bbfc-4d0d-8efe-788ab4ff3f5a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  894.88,
  819.97,
  72.16,
  14.02,
  11.27,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-01T05:19:56.861Z',
  '2024-10-01T05:19:56.861Z'
);

-- Order Item for Order 129
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'eb9642ba-fa83-4098-bd66-8b3f62b3a118',
  '9bf5da4d-bbfc-4d0d-8efe-788ab4ff3f5a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-01T05:19:56.861Z',
  '2024-10-01T05:19:56.861Z'
);

-- Order Item for Order 129
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8cfdb031-ac56-42e4-a021-da693d920305',
  '9bf5da4d-bbfc-4d0d-8efe-788ab4ff3f5a',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-01T05:19:56.861Z',
  '2024-10-01T05:19:56.861Z'
);

-- Order 130/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c095a3ad-9992-413e-a986-3bfdc0d69eb5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  281.14,
  249.99,
  20.25,
  10.90,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-06-17T20:27:53.093Z',
  '2024-06-17T20:27:53.093Z'
);

-- Order Item for Order 130
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bcb8ef19-4e08-49c9-a4c1-7b9ae609505d',
  'c095a3ad-9992-413e-a986-3bfdc0d69eb5',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-06-17T20:27:53.093Z',
  '2024-06-17T20:27:53.093Z'
);

-- Order 131/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b88020c1-680e-4469-902d-fac6b50cf024',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  238.38,
  240.00,
  13.46,
  5.38,
  20.46,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-23T14:31:42.498Z',
  '2025-02-23T14:31:42.498Z'
);

-- Order Item for Order 131
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '690402e4-ff51-407e-a4d6-ae7198975297',
  'b88020c1-680e-4469-902d-fac6b50cf024',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-23T14:31:42.498Z',
  '2025-02-23T14:31:42.498Z'
);

-- Order 132/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c79f5b4e-432b-43ad-b849-8622329a8b5a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1232.08,
  1155.65,
  61.48,
  14.95,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-10T09:59:34.005Z',
  '2024-07-10T09:59:34.005Z'
);

-- Order Item for Order 132
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a9418c03-31dc-42cd-877c-02e820292555',
  'c79f5b4e-432b-43ad-b849-8622329a8b5a',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-07-10T09:59:34.005Z',
  '2024-07-10T09:59:34.005Z'
);

-- Order Item for Order 132
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8cecf572-7581-43bc-a20b-2fd5336112b1',
  'c79f5b4e-432b-43ad-b849-8622329a8b5a',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-10T09:59:34.005Z',
  '2024-07-10T09:59:34.005Z'
);

-- Order Item for Order 132
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd3b0a8d5-c137-4186-9e6a-be139267ef23',
  'c79f5b4e-432b-43ad-b849-8622329a8b5a',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-10T09:59:34.005Z',
  '2024-07-10T09:59:34.005Z'
);

-- Order 133/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '199afa2e-5943-4dca-8b75-8c326466e493',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2390.08,
  2191.22,
  175.08,
  23.78,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-16T15:19:10.535Z',
  '2024-05-16T15:19:10.535Z'
);

-- Order Item for Order 133
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f30f476d-85a2-4065-a6c2-106c69e456f9',
  '199afa2e-5943-4dca-8b75-8c326466e493',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-16T15:19:10.535Z',
  '2024-05-16T15:19:10.535Z'
);

-- Order Item for Order 133
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2265c0c9-381a-4aa8-91bd-8fd7ad083b2f',
  '199afa2e-5943-4dca-8b75-8c326466e493',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-05-16T15:19:10.535Z',
  '2024-05-16T15:19:10.535Z'
);

-- Order Item for Order 133
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7b8a6657-0974-446f-8dfb-27ee279cb06c',
  '199afa2e-5943-4dca-8b75-8c326466e493',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-16T15:19:10.535Z',
  '2024-05-16T15:19:10.535Z'
);

-- Order Item for Order 133
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '48cbec5c-a553-4296-b1b5-2a9faf0b4ba7',
  '199afa2e-5943-4dca-8b75-8c326466e493',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-05-16T15:19:10.535Z',
  '2024-05-16T15:19:10.535Z'
);

-- Order 134/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2895.91,
  2744.98,
  142.19,
  21.11,
  12.37,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order Item for Order 134
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fbbc8eca-8c79-4aec-800b-03c06462787e',
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order Item for Order 134
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7c94372b-e903-4b7a-bf5c-1a480bb0a310',
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order Item for Order 134
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e3f0a46c-a433-469a-bd45-b7d8a9c2dc88',
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order Item for Order 134
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3f438396-6108-461e-8aa7-df5c78eae175',
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order Item for Order 134
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '18dcc66b-c94d-4833-8518-048c54465d39',
  '3277e5f1-dafc-4118-9867-f155cc272cb7',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-09-01T17:07:09.180Z',
  '2024-09-01T17:07:09.180Z'
);

-- Order 135/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2948.56,
  2706.86,
  228.73,
  12.97,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order Item for Order 135
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6ddd1ac7-3f3f-4cc3-8731-44411f74b3e6',
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order Item for Order 135
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a8381ed9-01f0-4806-943a-83c3f86f659e',
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order Item for Order 135
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '41233dee-f83e-4650-8d49-b488539d4aec',
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order Item for Order 135
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1a73390a-c28a-4413-a3b2-3bc31c99642b',
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order Item for Order 135
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1cc97442-a84c-4213-b6fc-27d372ef266c',
  '6d889df2-0e4e-4354-9f22-6a7d2019d8f4',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-05T20:20:17.958Z',
  '2024-03-05T20:20:17.958Z'
);

-- Order 136/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9be2c94e-8285-4291-935e-a3f3d2a09ff5',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  269.33,
  250.00,
  15.25,
  19.52,
  15.44,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-09-17T00:16:09.682Z',
  '2024-09-17T00:16:09.682Z'
);

-- Order Item for Order 136
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7beb9a24-117f-4aea-83a4-5ddc40f98768',
  '9be2c94e-8285-4291-935e-a3f3d2a09ff5',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-09-17T00:16:09.682Z',
  '2024-09-17T00:16:09.682Z'
);

-- Order 137/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'fb394a8d-f6f6-4410-a22b-4e7a8ba17206',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  808.15,
  749.97,
  40.12,
  18.06,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":true,"tags":["VIP","Recurring"]}',
  '2024-12-02T20:43:17.927Z',
  '2024-12-02T20:43:17.927Z'
);

-- Order Item for Order 137
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f82bfc9b-be34-4795-923b-89c8d9a00084',
  'fb394a8d-f6f6-4410-a22b-4e7a8ba17206',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-02T20:43:17.927Z',
  '2024-12-02T20:43:17.927Z'
);

-- Order 138/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6de9bd72-c187-48ac-b18a-7e817248202d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  146.64,
  126.10,
  12.11,
  8.43,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-07-06T16:42:15.722Z',
  '2024-07-06T16:42:15.722Z'
);

-- Order Item for Order 138
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dd6d92e0-9f43-49f6-b2d7-c94072d4103e',
  '6de9bd72-c187-48ac-b18a-7e817248202d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-06T16:42:15.722Z',
  '2024-07-06T16:42:15.722Z'
);

-- Order 139/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  4881.93,
  4446.04,
  439.71,
  7.83,
  11.65,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order Item for Order 139
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8df5eac8-92b3-42c7-8bf1-aca2bdbf4773',
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order Item for Order 139
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ca78810f-8023-4f3d-914b-8823874be0a0',
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order Item for Order 139
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f7339110-7e91-4243-afea-5a489ca9e4ae',
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order Item for Order 139
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '373e2152-221d-4af0-8549-5d067431abb5',
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order Item for Order 139
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e92e60da-94bc-4019-aad1-137a5e9426c6',
  'a034f2d8-bf37-4136-aae5-c5e6a42f7502',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-05T15:10:35.290Z',
  '2025-02-05T15:10:35.290Z'
);

-- Order 140/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '746bb1c1-2c83-4474-8aea-03aa1cb11ac4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  417.78,
  370.00,
  30.60,
  17.18,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-12T13:42:34.298Z',
  '2024-05-12T13:42:34.298Z'
);

-- Order Item for Order 140
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b0b80a91-f936-4c9f-a396-9a2ad500a075',
  '746bb1c1-2c83-4474-8aea-03aa1cb11ac4',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-12T13:42:34.298Z',
  '2024-05-12T13:42:34.298Z'
);

-- Order Item for Order 140
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4ae00d60-5e57-417b-8da1-8db74c577168',
  '746bb1c1-2c83-4474-8aea-03aa1cb11ac4',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-12T13:42:34.298Z',
  '2024-05-12T13:42:34.298Z'
);

-- Order 141/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2741.50,
  2580.79,
  155.62,
  5.09,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order Item for Order 141
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '114a0bbf-9cd2-4cdf-8c48-7a668e505f87',
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order Item for Order 141
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7e6c21c9-16f5-4dd6-aec3-0d198f4254c3',
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order Item for Order 141
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '268e29c2-0435-4c2b-8c1d-aa3372ec9333',
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order Item for Order 141
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a6f0fe9f-54eb-43bb-9db1-ffdf9aa3a43b',
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order Item for Order 141
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6561b566-41a0-48f0-9781-f32638cc5c45',
  '941c5aac-698b-471e-865e-70fa0ea2903b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-09T15:36:32.999Z',
  '2024-10-09T15:36:32.999Z'
);

-- Order 142/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ace49b52-9eed-4b27-bdab-978587b9cb19',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  799.65,
  746.34,
  60.60,
  6.83,
  14.12,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-07-08T23:18:57.316Z',
  '2024-07-08T23:18:57.316Z'
);

-- Order Item for Order 142
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b3d8ab2c-18f6-47b7-816d-62ac97c02f06',
  'ace49b52-9eed-4b27-bdab-978587b9cb19',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-08T23:18:57.316Z',
  '2024-07-08T23:18:57.316Z'
);

-- Order Item for Order 142
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '995e0d30-e1b3-4bd6-a4bc-31d4f4846267',
  'ace49b52-9eed-4b27-bdab-978587b9cb19',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-08T23:18:57.316Z',
  '2024-07-08T23:18:57.316Z'
);

-- Order 143/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd73760d9-8ee8-4c54-9ef3-1fad4ff09b1c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1365.58,
  1273.35,
  79.84,
  20.84,
  8.45,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-08-11T21:31:06.779Z',
  '2024-08-11T21:31:06.779Z'
);

-- Order Item for Order 143
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2233501a-948d-40bf-9516-ab2685f8fb17',
  'd73760d9-8ee8-4c54-9ef3-1fad4ff09b1c',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-11T21:31:06.779Z',
  '2024-08-11T21:31:06.779Z'
);

-- Order Item for Order 143
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '89ef0cd7-ae8e-400f-8ecb-54bb3b91f0b0',
  'd73760d9-8ee8-4c54-9ef3-1fad4ff09b1c',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-11T21:31:06.779Z',
  '2024-08-11T21:31:06.779Z'
);

-- Order 144/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'fcc5a78f-73c1-4b46-8430-59b13900a7a4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1771.17,
  1663.35,
  126.08,
  6.39,
  24.65,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-09T18:52:48.874Z',
  '2024-10-09T18:52:48.874Z'
);

-- Order Item for Order 144
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e6d7a2f1-5ef6-4ed1-9c4a-47db6829f073',
  'fcc5a78f-73c1-4b46-8430-59b13900a7a4',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-09T18:52:48.874Z',
  '2024-10-09T18:52:48.874Z'
);

-- Order Item for Order 144
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'beb08fd9-dc03-4924-879d-ddcc938efab4',
  'fcc5a78f-73c1-4b46-8430-59b13900a7a4',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-10-09T18:52:48.874Z',
  '2024-10-09T18:52:48.874Z'
);

-- Order Item for Order 144
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '983bc7c2-93cb-4ee4-8a4c-602ede01c5be',
  'fcc5a78f-73c1-4b46-8430-59b13900a7a4',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-09T18:52:48.874Z',
  '2024-10-09T18:52:48.874Z'
);

-- Order 145/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3ea44d20-b7f4-412b-8185-7dfcb51799b2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  4329.24,
  4019.18,
  286.97,
  23.09,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-05-30T08:24:24.547Z',
  '2024-05-30T08:24:24.547Z'
);

-- Order Item for Order 145
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6d5341f7-3232-48a8-9de8-507e87bdea2e',
  '3ea44d20-b7f4-412b-8185-7dfcb51799b2',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-30T08:24:24.547Z',
  '2024-05-30T08:24:24.547Z'
);

-- Order Item for Order 145
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c43b60e4-742b-42e9-b626-c0305bb16dad',
  '3ea44d20-b7f4-412b-8185-7dfcb51799b2',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-05-30T08:24:24.547Z',
  '2024-05-30T08:24:24.547Z'
);

-- Order Item for Order 145
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c36a7130-8eaa-4825-8f62-fce0afea372c',
  '3ea44d20-b7f4-412b-8185-7dfcb51799b2',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-05-30T08:24:24.547Z',
  '2024-05-30T08:24:24.547Z'
);

-- Order Item for Order 145
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd22d70cb-2b33-4caf-acfc-923184432ca3',
  '3ea44d20-b7f4-412b-8185-7dfcb51799b2',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-05-30T08:24:24.547Z',
  '2024-05-30T08:24:24.547Z'
);

-- Order 146/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '1add9ee6-c106-46c8-b71b-d441892bffb9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  554.81,
  499.98,
  33.55,
  21.28,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-01-24T01:06:21.865Z',
  '2025-01-24T01:06:21.865Z'
);

-- Order Item for Order 146
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c9720508-e1b7-4e80-b3b3-9986dbb83ee6',
  '1add9ee6-c106-46c8-b71b-d441892bffb9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2025-01-24T01:06:21.865Z',
  '2025-01-24T01:06:21.865Z'
);

-- Order 147/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd0a5a6ff-b379-486d-b690-ed4ab77e7d42',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  311.14,
  275.67,
  23.60,
  11.87,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-09-20T01:12:01.421Z',
  '2024-09-20T01:12:01.421Z'
);

-- Order Item for Order 147
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b589f35e-2bff-49bc-b352-6e3e25f55aec',
  'd0a5a6ff-b379-486d-b690-ed4ab77e7d42',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-09-20T01:12:01.421Z',
  '2024-09-20T01:12:01.421Z'
);

-- Order 148/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5940457a-7373-4d4f-ac09-55637c2fea5c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3086.17,
  2851.32,
  218.13,
  16.72,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-18T21:47:27.133Z',
  '2024-12-18T21:47:27.133Z'
);

-- Order Item for Order 148
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bde79f52-d9de-43a5-ad45-b636599c1dd7',
  '5940457a-7373-4d4f-ac09-55637c2fea5c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-18T21:47:27.133Z',
  '2024-12-18T21:47:27.133Z'
);

-- Order Item for Order 148
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c2da2138-d89b-4423-90a0-3d0ce6eb96c4',
  '5940457a-7373-4d4f-ac09-55637c2fea5c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-18T21:47:27.133Z',
  '2024-12-18T21:47:27.133Z'
);

-- Order Item for Order 148
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dfb9e3c1-5bc6-4c76-9947-491232c9e73a',
  '5940457a-7373-4d4f-ac09-55637c2fea5c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-18T21:47:27.133Z',
  '2024-12-18T21:47:27.133Z'
);

-- Order 149/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e38c585d-39a0-4362-bb0a-a93d517c6692',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1557.40,
  1399.99,
  134.26,
  23.15,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-03-03T01:19:00.865Z',
  '2025-03-03T01:19:00.865Z'
);

-- Order Item for Order 149
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e2f757b4-7149-4c47-b783-9391b26bc6e1',
  'e38c585d-39a0-4362-bb0a-a93d517c6692',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-03-03T01:19:00.865Z',
  '2025-03-03T01:19:00.865Z'
);

-- Order Item for Order 149
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2b5ef897-533c-4370-8985-ea636ccf3b06',
  'e38c585d-39a0-4362-bb0a-a93d517c6692',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2025-03-03T01:19:00.865Z',
  '2025-03-03T01:19:00.865Z'
);

-- Order 150/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1656.05,
  1533.42,
  97.68,
  24.95,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order Item for Order 150
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1743e836-f9d7-4685-9a3b-609b9a54bcda',
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order Item for Order 150
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f5994522-d351-48ec-8c5b-852424be012e',
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order Item for Order 150
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '784782b4-81c9-4c4a-9589-b716fcc7b5d9',
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order Item for Order 150
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a5c6201f-c98f-4496-81fe-5c37910b2418',
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order Item for Order 150
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4e167263-8931-44cf-82b8-43193be30e8d',
  '4668f8ba-c853-491c-b39f-0c0cb7ad1daf',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-05T19:22:20.476Z',
  '2024-04-05T19:22:20.476Z'
);

-- Order 151/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '977537e5-77e3-4dad-b973-21943681224d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1621.56,
  1505.20,
  92.42,
  23.94,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-08T06:37:55.704Z',
  '2024-10-08T06:37:55.704Z'
);

-- Order Item for Order 151
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '83f06675-7fe4-4c00-8ec5-4b506c8fd6a7',
  '977537e5-77e3-4dad-b973-21943681224d',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-08T06:37:55.704Z',
  '2024-10-08T06:37:55.704Z'
);

-- Order Item for Order 151
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4cfb4dad-1290-4a9f-b60f-fee82b69171f',
  '977537e5-77e3-4dad-b973-21943681224d',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-08T06:37:55.704Z',
  '2024-10-08T06:37:55.704Z'
);

-- Order Item for Order 151
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0acaed8f-8136-4333-93a3-e469148a574a',
  '977537e5-77e3-4dad-b973-21943681224d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-08T06:37:55.704Z',
  '2024-10-08T06:37:55.704Z'
);

-- Order Item for Order 151
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '659392ef-4445-4ade-af38-f920c286b773',
  '977537e5-77e3-4dad-b973-21943681224d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-08T06:37:55.704Z',
  '2024-10-08T06:37:55.704Z'
);

-- Order 152/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b117459a-ba00-4dca-b4f6-dc6051d28f47',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1353.83,
  1266.10,
  68.37,
  19.36,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-27T07:25:04.242Z',
  '2025-02-27T07:25:04.242Z'
);

-- Order Item for Order 152
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f67e3128-a95b-4667-b177-f865ecb245bc',
  'b117459a-ba00-4dca-b4f6-dc6051d28f47',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-27T07:25:04.242Z',
  '2025-02-27T07:25:04.242Z'
);

-- Order Item for Order 152
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '471ee665-2a91-43fd-a687-660e141321ba',
  'b117459a-ba00-4dca-b4f6-dc6051d28f47',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-27T07:25:04.242Z',
  '2025-02-27T07:25:04.242Z'
);

-- Order Item for Order 152
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c9b2ccb4-d11c-4ee7-9707-6e0dd2d3e451',
  'b117459a-ba00-4dca-b4f6-dc6051d28f47',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-02-27T07:25:04.242Z',
  '2025-02-27T07:25:04.242Z'
);

-- Order 153/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c5b97371-e01e-4c03-85cf-8d9fba2ac33f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1802.75,
  1692.17,
  95.95,
  14.63,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-14T16:52:55.203Z',
  '2024-05-14T16:52:55.203Z'
);

-- Order Item for Order 153
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3e5250d2-5bb9-49e5-acd0-2d3e8fd98331',
  'c5b97371-e01e-4c03-85cf-8d9fba2ac33f',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-14T16:52:55.203Z',
  '2024-05-14T16:52:55.203Z'
);

-- Order Item for Order 153
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4ed356d4-1cd6-457c-8c7b-d3104b229e73',
  'c5b97371-e01e-4c03-85cf-8d9fba2ac33f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-14T16:52:55.203Z',
  '2024-05-14T16:52:55.203Z'
);

-- Order Item for Order 153
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0d75825a-0101-4e59-98b0-581ac1e67f4a',
  'c5b97371-e01e-4c03-85cf-8d9fba2ac33f',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-05-14T16:52:55.203Z',
  '2024-05-14T16:52:55.203Z'
);

-- Order Item for Order 153
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '4fb146ce-7c86-497d-bf81-ac77caf13f87',
  'c5b97371-e01e-4c03-85cf-8d9fba2ac33f',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-05-14T16:52:55.203Z',
  '2024-05-14T16:52:55.203Z'
);

-- Order 154/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '75fad0a8-1979-4cde-80bb-f76bcb14a54c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  687.14,
  620.00,
  49.23,
  17.91,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-20T16:12:53.853Z',
  '2024-08-20T16:12:53.853Z'
);

-- Order Item for Order 154
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1f2bfbff-bdb5-4748-9648-54d1613045e3',
  '75fad0a8-1979-4cde-80bb-f76bcb14a54c',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-20T16:12:53.853Z',
  '2024-08-20T16:12:53.853Z'
);

-- Order Item for Order 154
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6aad2586-a69a-4a0b-abc9-d0d4771f7a0f',
  '75fad0a8-1979-4cde-80bb-f76bcb14a54c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-20T16:12:53.853Z',
  '2024-08-20T16:12:53.853Z'
);

-- Order 155/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5dd7f680-cf4a-4f77-91c9-bf57a551927e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  3852.54,
  3514.95,
  321.27,
  16.32,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-09-09T05:20:21.662Z',
  '2024-09-09T05:20:21.662Z'
);

-- Order Item for Order 155
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73e47a86-5e2f-4f18-b3b8-9db742f68c83',
  '5dd7f680-cf4a-4f77-91c9-bf57a551927e',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-09-09T05:20:21.662Z',
  '2024-09-09T05:20:21.662Z'
);

-- Order Item for Order 155
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8d3a76f8-b18f-46ff-a4e8-7c3a376b2b0a',
  '5dd7f680-cf4a-4f77-91c9-bf57a551927e',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-09-09T05:20:21.662Z',
  '2024-09-09T05:20:21.662Z'
);

-- Order Item for Order 155
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '73f9c136-ba3c-4a3a-ae17-c71c9c535e54',
  '5dd7f680-cf4a-4f77-91c9-bf57a551927e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-09-09T05:20:21.662Z',
  '2024-09-09T05:20:21.662Z'
);

-- Order Item for Order 155
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8b4847f6-9c0a-4078-9776-d0a4466c94a2',
  '5dd7f680-cf4a-4f77-91c9-bf57a551927e',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-09-09T05:20:21.662Z',
  '2024-09-09T05:20:21.662Z'
);

-- Order 156/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6bbb5a1c-d297-4e10-9ace-db73bbbe478b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1353.33,
  1220.67,
  118.65,
  14.01,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-05-01T07:11:13.719Z',
  '2024-05-01T07:11:13.719Z'
);

-- Order Item for Order 156
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3942dd7-b920-40f1-84b8-dc07eaa9e1ce',
  '6bbb5a1c-d297-4e10-9ace-db73bbbe478b',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-01T07:11:13.719Z',
  '2024-05-01T07:11:13.719Z'
);

-- Order Item for Order 156
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c51a4a5a-c878-4536-8643-b3fc7f8b0513',
  '6bbb5a1c-d297-4e10-9ace-db73bbbe478b',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-05-01T07:11:13.719Z',
  '2024-05-01T07:11:13.719Z'
);

-- Order Item for Order 156
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '79c848ba-f583-415a-82b8-681d151e29c7',
  '6bbb5a1c-d297-4e10-9ace-db73bbbe478b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-05-01T07:11:13.719Z',
  '2024-05-01T07:11:13.719Z'
);

-- Order 157/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3badedde-3a8c-4826-8c35-6b6d3341ce02',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  1881.38,
  1748.54,
  109.28,
  23.56,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-08-02T14:09:25.494Z',
  '2024-08-02T14:09:25.494Z'
);

-- Order Item for Order 157
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9da13778-77bb-4641-9cd3-6a61cb93f6c5',
  '3badedde-3a8c-4826-8c35-6b6d3341ce02',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-02T14:09:25.494Z',
  '2024-08-02T14:09:25.494Z'
);

-- Order Item for Order 157
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '597742f6-5354-43cb-b620-973dc81b839f',
  '3badedde-3a8c-4826-8c35-6b6d3341ce02',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-02T14:09:25.494Z',
  '2024-08-02T14:09:25.494Z'
);

-- Order Item for Order 157
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aa8aeb16-7ddd-4804-b024-d249a8c180a4',
  '3badedde-3a8c-4826-8c35-6b6d3341ce02',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-02T14:09:25.494Z',
  '2024-08-02T14:09:25.494Z'
);

-- Order Item for Order 157
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c8838065-9e1b-4419-9733-df9f2c8b4cd0',
  '3badedde-3a8c-4826-8c35-6b6d3341ce02',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-02T14:09:25.494Z',
  '2024-08-02T14:09:25.494Z'
);

-- Order 158/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '51465027-cb13-4911-827d-b6694dffd101',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  3110.62,
  2842.55,
  262.08,
  5.99,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order Item for Order 158
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a0799baf-60c0-427b-9954-c7ef33ef6836',
  '51465027-cb13-4911-827d-b6694dffd101',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order Item for Order 158
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'db0703d5-e356-447b-aea6-6761ff3512ac',
  '51465027-cb13-4911-827d-b6694dffd101',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order Item for Order 158
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '03fc5967-7309-456f-b282-83c09a38d235',
  '51465027-cb13-4911-827d-b6694dffd101',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order Item for Order 158
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b71b0b09-53c8-41af-aeb3-f2ad7520859d',
  '51465027-cb13-4911-827d-b6694dffd101',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order Item for Order 158
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b242a0b5-6c3f-4831-82eb-152ae1285297',
  '51465027-cb13-4911-827d-b6694dffd101',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-11-09T21:08:13.952Z',
  '2024-11-09T21:08:13.952Z'
);

-- Order 159/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd40950a2-1aec-4672-9e65-82b0294070d9',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1555.00,
  1460.55,
  106.91,
  7.11,
  19.57,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-26T21:42:39.238Z',
  '2024-12-26T21:42:39.238Z'
);

-- Order Item for Order 159
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '46b9fb1c-14d2-42d0-8cd8-b5ddf20c0880',
  'd40950a2-1aec-4672-9e65-82b0294070d9',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-26T21:42:39.238Z',
  '2024-12-26T21:42:39.238Z'
);

-- Order Item for Order 159
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '782d707a-5592-43a1-85c8-906af7ab7ea8',
  'd40950a2-1aec-4672-9e65-82b0294070d9',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-26T21:42:39.238Z',
  '2024-12-26T21:42:39.238Z'
);

-- Order Item for Order 159
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'faad0f2e-8ccf-45b6-b147-286f20fc1363',
  'd40950a2-1aec-4672-9e65-82b0294070d9',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-26T21:42:39.238Z',
  '2024-12-26T21:42:39.238Z'
);

-- Order 160/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6944a412-5663-47b6-be87-f5869b5b8301',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  976.86,
  889.98,
  67.37,
  19.51,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-08T03:41:50.981Z',
  '2024-07-08T03:41:50.981Z'
);

-- Order Item for Order 160
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cfed5033-f7c0-44f7-bf66-b3529b674b0a',
  '6944a412-5663-47b6-be87-f5869b5b8301',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-08T03:41:50.981Z',
  '2024-07-08T03:41:50.981Z'
);

-- Order Item for Order 160
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1bf8888-f585-4e11-a1b5-9316e6e4bb94',
  '6944a412-5663-47b6-be87-f5869b5b8301',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-07-08T03:41:50.981Z',
  '2024-07-08T03:41:50.981Z'
);

-- Order 161/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f4da66e8-34a5-4e87-abeb-308ccd07b592',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  525.15,
  498.30,
  26.66,
  11.63,
  11.44,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-16T18:03:19.183Z',
  '2024-08-16T18:03:19.183Z'
);

-- Order Item for Order 161
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '42fb06b7-9af2-4098-988f-feff228f7efb',
  'f4da66e8-34a5-4e87-abeb-308ccd07b592',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-16T18:03:19.183Z',
  '2024-08-16T18:03:19.183Z'
);

-- Order Item for Order 161
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '004cbf0c-b8cf-411c-911d-e1f0a381a9ea',
  'f4da66e8-34a5-4e87-abeb-308ccd07b592',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-16T18:03:19.183Z',
  '2024-08-16T18:03:19.183Z'
);

-- Order 162/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a78d34ad-d0b4-48de-a80a-cfb169e02560',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1667.89,
  1519.97,
  131.63,
  16.29,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-05-24T13:20:31.187Z',
  '2024-05-24T13:20:31.187Z'
);

-- Order Item for Order 162
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f115833b-751d-4962-a9cd-a05fabad902d',
  'a78d34ad-d0b4-48de-a80a-cfb169e02560',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-24T13:20:31.187Z',
  '2024-05-24T13:20:31.187Z'
);

-- Order Item for Order 162
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'aeb09852-4fc7-404d-9c8f-bbb43dfe3089',
  'a78d34ad-d0b4-48de-a80a-cfb169e02560',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-05-24T13:20:31.187Z',
  '2024-05-24T13:20:31.187Z'
);

-- Order Item for Order 162
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1e15c9b5-67bf-4644-b11f-16b3397e2190',
  'a78d34ad-d0b4-48de-a80a-cfb169e02560',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-24T13:20:31.187Z',
  '2024-05-24T13:20:31.187Z'
);

-- Order 163/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  3680.23,
  3393.09,
  277.89,
  9.25,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order Item for Order 163
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '95f2e75c-3f22-4cde-a602-c42c5cb61750',
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order Item for Order 163
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '62111c43-9d9a-4d47-b66e-5e31bd6eb717',
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order Item for Order 163
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1d6ca26-b946-48fb-b56e-860f7994c31b',
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order Item for Order 163
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f9fa5d90-e0dc-4009-904f-93c6ef477b01',
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order Item for Order 163
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2e0aac55-e114-4174-b2a4-1a62d7a048b0',
  'afefdf98-3690-46f5-9bbb-9cdd1608803c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-07-21T05:10:37.125Z',
  '2024-07-21T05:10:37.125Z'
);

-- Order 164/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '02fc100b-29b7-44fc-9cb0-6cfd781df417',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  3053.67,
  2789.95,
  274.81,
  12.76,
  23.85,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-05T07:22:11.490Z',
  '2024-08-05T07:22:11.490Z'
);

-- Order Item for Order 164
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1709f1af-dbbe-4c15-86f0-484c73d7da40',
  '02fc100b-29b7-44fc-9cb0-6cfd781df417',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-05T07:22:11.490Z',
  '2024-08-05T07:22:11.490Z'
);

-- Order Item for Order 164
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6e8212c0-b9db-4ec0-8cba-422f4904e15d',
  '02fc100b-29b7-44fc-9cb0-6cfd781df417',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-05T07:22:11.490Z',
  '2024-08-05T07:22:11.490Z'
);

-- Order Item for Order 164
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a230c2a0-4124-4c86-9dad-b1846a7f3a30',
  '02fc100b-29b7-44fc-9cb0-6cfd781df417',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-05T07:22:11.490Z',
  '2024-08-05T07:22:11.490Z'
);

-- Order Item for Order 164
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f6da0ddf-9d70-4245-9422-045da403daab',
  '02fc100b-29b7-44fc-9cb0-6cfd781df417',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-05T07:22:11.490Z',
  '2024-08-05T07:22:11.490Z'
);

-- Order 165/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '1d8ca65f-3583-487f-a705-26bb8b192930',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  1454.18,
  1319.94,
  112.19,
  22.05,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":[]}',
  '2024-10-01T05:45:57.211Z',
  '2024-10-01T05:45:57.211Z'
);

-- Order Item for Order 165
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'add58665-469b-427f-9773-d85b8f75b06c',
  '1d8ca65f-3583-487f-a705-26bb8b192930',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-01T05:45:57.211Z',
  '2024-10-01T05:45:57.211Z'
);

-- Order Item for Order 165
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5f1fd8ae-78a7-4c3c-a584-77b3d5e11589',
  '1d8ca65f-3583-487f-a705-26bb8b192930',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-01T05:45:57.211Z',
  '2024-10-01T05:45:57.211Z'
);

-- Order 166/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'af378542-2076-4bec-b2c5-27db06730687',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1952.28,
  1832.87,
  106.86,
  12.55,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order Item for Order 166
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '924293f9-c863-4887-90a5-703be769ebd0',
  'af378542-2076-4bec-b2c5-27db06730687',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order Item for Order 166
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dca49141-a792-40ae-a2f9-d2afabe225f0',
  'af378542-2076-4bec-b2c5-27db06730687',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order Item for Order 166
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed51ec79-37a2-4b09-91d0-12f1ededf2c5',
  'af378542-2076-4bec-b2c5-27db06730687',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order Item for Order 166
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f3096b2c-9bff-46fd-98a2-2cca08b73f65',
  'af378542-2076-4bec-b2c5-27db06730687',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order Item for Order 166
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3e557d5d-7c7a-41ea-a6cb-c8f41ca4933d',
  'af378542-2076-4bec-b2c5-27db06730687',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-04T06:08:32.467Z',
  '2024-06-04T06:08:32.467Z'
);

-- Order 167/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1855.29,
  1743.51,
  96.24,
  15.54,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order Item for Order 167
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd059b21b-b686-4fe0-9a95-9dec3d41fc44',
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order Item for Order 167
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5115d42c-f41d-48c3-b0f1-ff2be22f358e',
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order Item for Order 167
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e5269b90-9abc-4c08-959b-3ac9c334e392',
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order Item for Order 167
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b46625e1-3f28-43c2-a839-90c1f85b7a6a',
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order Item for Order 167
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ec75718e-0346-4a11-9e7d-6085002a9fcc',
  'd4b1078b-101e-4f23-bf74-232d2c4c1342',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-27T11:04:36.948Z',
  '2024-10-27T11:04:36.948Z'
);

-- Order 168/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'b8807007-d4e9-4dbc-9da3-c1709323430c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  703.34,
  633.88,
  50.77,
  18.69,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-02T12:12:09.987Z',
  '2024-12-02T12:12:09.987Z'
);

-- Order Item for Order 168
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e11c1a7d-89ab-4902-9cec-f4c8d643ccaa',
  'b8807007-d4e9-4dbc-9da3-c1709323430c',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-12-02T12:12:09.987Z',
  '2024-12-02T12:12:09.987Z'
);

-- Order Item for Order 168
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '45f9a004-69fc-4da0-8e32-eeaf86d780ae',
  'b8807007-d4e9-4dbc-9da3-c1709323430c',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-02T12:12:09.987Z',
  '2024-12-02T12:12:09.987Z'
);

-- Order Item for Order 168
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '99f75cf3-6827-44a5-9524-1e99183203df',
  'b8807007-d4e9-4dbc-9da3-c1709323430c',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-12-02T12:12:09.987Z',
  '2024-12-02T12:12:09.987Z'
);

-- Order 169/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '94e24664-d46c-44c5-a816-356e251dcadd',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1838.15,
  1716.06,
  110.69,
  11.40,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order Item for Order 169
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b6e6bb5b-f1cb-40c7-a6a9-2d679a930353',
  '94e24664-d46c-44c5-a816-356e251dcadd',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order Item for Order 169
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'de6334c2-f4f8-4cb2-8ced-19f183e11baa',
  '94e24664-d46c-44c5-a816-356e251dcadd',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order Item for Order 169
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a1802be6-49fe-4bb7-b7c4-f27272aff829',
  '94e24664-d46c-44c5-a816-356e251dcadd',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order Item for Order 169
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd323a062-9c36-4b12-ae70-f141a4c184c0',
  '94e24664-d46c-44c5-a816-356e251dcadd',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order Item for Order 169
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f2c943cc-dabf-4992-8e19-8ee33e3fbcb8',
  '94e24664-d46c-44c5-a816-356e251dcadd',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-13T11:58:13.284Z',
  '2024-03-13T11:58:13.284Z'
);

-- Order 170/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '221beced-b6a7-47bc-b52e-8cfb254b2f2b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1148.24,
  1066.92,
  69.24,
  12.08,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-11-20T21:46:27.271Z',
  '2024-11-20T21:46:27.271Z'
);

-- Order Item for Order 170
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '638794d3-1bc1-4f61-950e-af483eddf5ff',
  '221beced-b6a7-47bc-b52e-8cfb254b2f2b',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-20T21:46:27.271Z',
  '2024-11-20T21:46:27.271Z'
);

-- Order Item for Order 170
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '434bf4b1-a945-4128-b2f9-29da524820e8',
  '221beced-b6a7-47bc-b52e-8cfb254b2f2b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-11-20T21:46:27.271Z',
  '2024-11-20T21:46:27.271Z'
);

-- Order 171/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '40f33394-3910-4734-8b15-a0616952a761',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1987.68,
  1799.98,
  176.04,
  11.66,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-23T06:01:26.211Z',
  '2024-10-23T06:01:26.211Z'
);

-- Order Item for Order 171
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '61a88cc5-4860-403c-9ca0-7a104df4b092',
  '40f33394-3910-4734-8b15-a0616952a761',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-23T06:01:26.211Z',
  '2024-10-23T06:01:26.211Z'
);

-- Order 172/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '5845c7d8-7bfb-4330-ad4f-a4d36acf0154',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1452.49,
  1342.77,
  111.85,
  9.31,
  11.44,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-21T12:55:14.645Z',
  '2024-04-21T12:55:14.645Z'
);

-- Order Item for Order 172
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f4e67c91-9106-40c9-9911-91bc8f2d5625',
  '5845c7d8-7bfb-4330-ad4f-a4d36acf0154',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-21T12:55:14.645Z',
  '2024-04-21T12:55:14.645Z'
);

-- Order Item for Order 172
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '722bdf47-ff6e-4597-86c1-8d3d062f2797',
  '5845c7d8-7bfb-4330-ad4f-a4d36acf0154',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-21T12:55:14.645Z',
  '2024-04-21T12:55:14.645Z'
);

-- Order Item for Order 172
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd189337d-1b51-48f2-a291-10c7a3a0cb65',
  '5845c7d8-7bfb-4330-ad4f-a4d36acf0154',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-21T12:55:14.645Z',
  '2024-04-21T12:55:14.645Z'
);

-- Order 173/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e63aabb6-b6d9-4f70-aa1d-42879dbc0df3',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  543.28,
  500.00,
  39.55,
  12.42,
  8.69,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-12-19T10:32:18.143Z',
  '2024-12-19T10:32:18.143Z'
);

-- Order Item for Order 173
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f0f94d78-05a5-413a-b1e4-856b66edfb0c',
  'e63aabb6-b6d9-4f70-aa1d-42879dbc0df3',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-12-19T10:32:18.143Z',
  '2024-12-19T10:32:18.143Z'
);

-- Order 174/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '208593e1-2966-46a8-811e-02a23191db17',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  824.67,
  765.57,
  46.70,
  12.40,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-27T23:47:23.906Z',
  '2024-08-27T23:47:23.906Z'
);

-- Order Item for Order 174
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '99f33e74-0287-4380-82db-f03f49f332d8',
  '208593e1-2966-46a8-811e-02a23191db17',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-27T23:47:23.906Z',
  '2024-08-27T23:47:23.906Z'
);

-- Order Item for Order 174
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '54587290-1414-4714-be41-ee02d487ac91',
  '208593e1-2966-46a8-811e-02a23191db17',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-27T23:47:23.906Z',
  '2024-08-27T23:47:23.906Z'
);

-- Order 175/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3864.73,
  3572.56,
  280.80,
  11.37,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order Item for Order 175
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a93600dc-ca5f-4f36-a77c-f50e617a8c74',
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order Item for Order 175
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8bbd21de-bb78-487a-9248-a72f0bf679d1',
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order Item for Order 175
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '657f9e6f-1155-4756-b8c3-6f486e77ae27',
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order Item for Order 175
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b662b4b3-a277-4d6d-b820-466b69e9455a',
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order Item for Order 175
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '57354e5a-43a5-4667-937e-1a9276944194',
  '6a040af6-55cf-4a36-b9ce-7fdc72c24641',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-29T04:34:46.270Z',
  '2024-10-29T04:34:46.270Z'
);

-- Order 176/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  5615.35,
  5240.31,
  365.77,
  9.27,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order Item for Order 176
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '632a7e75-42b1-4bf2-a42d-18cbd6c84350',
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order Item for Order 176
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e9fb36cc-3941-406f-9b12-ebaf57e41adc',
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order Item for Order 176
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c27549fe-9309-481d-afee-44a8722f5ab3',
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order Item for Order 176
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3462dffb-dbbe-4dfb-907e-3bae80247ec2',
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order Item for Order 176
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '63ba7954-0b98-4a0e-842e-c3c8ec2e88c0',
  '979114bf-979e-49c1-b4d5-28cb39ce9d32',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-04-16T16:02:35.594Z',
  '2024-04-16T16:02:35.594Z'
);

-- Order 177/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '9c205b0b-39a8-4dd7-b5bf-12f0236697af',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  210.70,
  195.00,
  10.10,
  22.25,
  16.65,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-02-06T20:41:13.426Z',
  '2025-02-06T20:41:13.426Z'
);

-- Order Item for Order 177
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b2bc084a-09f5-4589-bf0f-e879bc530502',
  '9c205b0b-39a8-4dd7-b5bf-12f0236697af',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-06T20:41:13.426Z',
  '2025-02-06T20:41:13.426Z'
);

-- Order 178/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c3d12650-27c8-41ff-995b-a8206b5bff87',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  750.45,
  705.00,
  52.24,
  16.35,
  23.14,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-29T19:24:31.024Z',
  '2024-04-29T19:24:31.024Z'
);

-- Order Item for Order 178
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ce2d3a41-3881-4358-8c80-de7bec043640',
  'c3d12650-27c8-41ff-995b-a8206b5bff87',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-29T19:24:31.024Z',
  '2024-04-29T19:24:31.024Z'
);

-- Order Item for Order 178
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7316ffd5-586f-4da0-b3ec-5a9513639a60',
  'c3d12650-27c8-41ff-995b-a8206b5bff87',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-29T19:24:31.024Z',
  '2024-04-29T19:24:31.024Z'
);

-- Order 179/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ae4ed67f-86de-40a5-b1f6-352c03b3cd0c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1755.03,
  1645.65,
  95.94,
  13.44,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":true,"tags":["VIP","Recurring"]}',
  '2025-02-16T23:20:07.061Z',
  '2025-02-16T23:20:07.061Z'
);

-- Order Item for Order 179
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '33c642f9-28ba-46a2-8def-c7e793ae2513',
  'ae4ed67f-86de-40a5-b1f6-352c03b3cd0c',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-02-16T23:20:07.061Z',
  '2025-02-16T23:20:07.061Z'
);

-- Order Item for Order 179
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0c2d9cb8-d445-4255-a8a0-bc3029150617',
  'ae4ed67f-86de-40a5-b1f6-352c03b3cd0c',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-02-16T23:20:07.061Z',
  '2025-02-16T23:20:07.061Z'
);

-- Order Item for Order 179
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '29b3d2de-dbaa-441d-bed3-99cc8f3af175',
  'ae4ed67f-86de-40a5-b1f6-352c03b3cd0c',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-16T23:20:07.061Z',
  '2025-02-16T23:20:07.061Z'
);

-- Order Item for Order 179
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76a9536f-c67f-4a43-9688-2c068d9ac527',
  'ae4ed67f-86de-40a5-b1f6-352c03b3cd0c',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2025-02-16T23:20:07.061Z',
  '2025-02-16T23:20:07.061Z'
);

-- Order 180/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a572079d-6d16-4295-b387-e98b579d74de',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1746.78,
  1622.34,
  113.73,
  10.71,
  0.00,
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2025-01-05T03:20:39.971Z',
  '2025-01-05T03:20:39.971Z'
);

-- Order Item for Order 180
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd4a3252d-39ea-45d5-a009-cd806499a37c',
  'a572079d-6d16-4295-b387-e98b579d74de',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-01-05T03:20:39.971Z',
  '2025-01-05T03:20:39.971Z'
);

-- Order Item for Order 180
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a9d05b2d-ac8c-4f2b-a2c9-2066ea0024c1',
  'a572079d-6d16-4295-b387-e98b579d74de',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-01-05T03:20:39.971Z',
  '2025-01-05T03:20:39.971Z'
);

-- Order Item for Order 180
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2addb4f5-ab8c-4c50-a446-8df2b7f69179',
  'a572079d-6d16-4295-b387-e98b579d74de',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-05T03:20:39.971Z',
  '2025-01-05T03:20:39.971Z'
);

-- Order Item for Order 180
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cbc3e368-c387-4f65-95f5-7c06a376177f',
  'a572079d-6d16-4295-b387-e98b579d74de',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-05T03:20:39.971Z',
  '2025-01-05T03:20:39.971Z'
);

-- Order 181/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'dc302ba6-fcf5-4fde-a9c5-7245834e0ad1',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1779.16,
  1651.92,
  133.14,
  17.30,
  23.20,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-03-15T04:42:08.961Z',
  '2024-03-15T04:42:08.961Z'
);

-- Order Item for Order 181
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0238abfe-a5b0-4db6-b4d6-4c88a6ace60c',
  'dc302ba6-fcf5-4fde-a9c5-7245834e0ad1',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-03-15T04:42:08.961Z',
  '2024-03-15T04:42:08.961Z'
);

-- Order Item for Order 181
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '14c14dfc-d91d-4a9b-a1b0-68709d49699a',
  'dc302ba6-fcf5-4fde-a9c5-7245834e0ad1',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-15T04:42:08.961Z',
  '2024-03-15T04:42:08.961Z'
);

-- Order Item for Order 181
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b27d8b5a-a768-4006-9171-92c16f438e37',
  'dc302ba6-fcf5-4fde-a9c5-7245834e0ad1',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-03-15T04:42:08.961Z',
  '2024-03-15T04:42:08.961Z'
);

-- Order 182/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c99e511f-5ac3-4484-816c-83441772fb67',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  4827.44,
  4509.59,
  305.30,
  12.55,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order Item for Order 182
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1944ffed-8365-4e3b-afb9-adbb6de17766',
  'c99e511f-5ac3-4484-816c-83441772fb67',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order Item for Order 182
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '30227bb5-007d-45fe-9524-56718db5c537',
  'c99e511f-5ac3-4484-816c-83441772fb67',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order Item for Order 182
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9a90f4c5-28a5-4f7f-b342-efb522b627ea',
  'c99e511f-5ac3-4484-816c-83441772fb67',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order Item for Order 182
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b2df01e5-0237-455f-b404-8ca4309a296e',
  'c99e511f-5ac3-4484-816c-83441772fb67',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  2,
  275.67,
  551.34,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order Item for Order 182
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ed6e541e-0bd9-4171-9112-500649ccfbe4',
  'c99e511f-5ac3-4484-816c-83441772fb67',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-23T05:04:57.445Z',
  '2024-08-23T05:04:57.445Z'
);

-- Order 183/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'fe92cf39-1124-42f0-9f98-9fb7ac30103d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2100.54,
  1955.52,
  128.67,
  16.35,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-29T21:27:30.802Z',
  '2024-10-29T21:27:30.802Z'
);

-- Order Item for Order 183
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c52e33a9-e278-431c-8f75-f800718f90ce',
  'fe92cf39-1124-42f0-9f98-9fb7ac30103d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-10-29T21:27:30.802Z',
  '2024-10-29T21:27:30.802Z'
);

-- Order Item for Order 183
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8f2bce29-a3e9-4b32-9e2a-b33ab766cf6a',
  'fe92cf39-1124-42f0-9f98-9fb7ac30103d',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-10-29T21:27:30.802Z',
  '2024-10-29T21:27:30.802Z'
);

-- Order Item for Order 183
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '421190cf-0cd4-465b-ae35-704e839cd53e',
  'fe92cf39-1124-42f0-9f98-9fb7ac30103d',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-29T21:27:30.802Z',
  '2024-10-29T21:27:30.802Z'
);

-- Order Item for Order 183
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c68f8bfd-28f7-4b39-8077-04614d6e6fe3',
  'fe92cf39-1124-42f0-9f98-9fb7ac30103d',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-29T21:27:30.802Z',
  '2024-10-29T21:27:30.802Z'
);

-- Order 184/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '413fe9fb-51d2-46ae-8edf-a955a1f0069b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  1275.95,
  1193.11,
  65.26,
  17.58,
  0.00,
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-04-03T03:28:09.160Z',
  '2024-04-03T03:28:09.160Z'
);

-- Order Item for Order 184
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7ccf3949-ee17-400b-b02a-dd9afdd8f044',
  '413fe9fb-51d2-46ae-8edf-a955a1f0069b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-03T03:28:09.160Z',
  '2024-04-03T03:28:09.160Z'
);

-- Order Item for Order 184
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '01cc9a52-e8e4-4393-a1f3-9eff54ab2118',
  '413fe9fb-51d2-46ae-8edf-a955a1f0069b',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-03T03:28:09.160Z',
  '2024-04-03T03:28:09.160Z'
);

-- Order Item for Order 184
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '76def357-e3f4-4c70-8496-ef51cf2f8340',
  '413fe9fb-51d2-46ae-8edf-a955a1f0069b',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-04-03T03:28:09.160Z',
  '2024-04-03T03:28:09.160Z'
);

-- Order 185/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  4524.42,
  4158.33,
  346.80,
  19.29,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order Item for Order 185
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7aaa406e-82e6-4892-9a67-c630d2d782a1',
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order Item for Order 185
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f2225482-ce41-4201-81ae-fd5deeb9b8fb',
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order Item for Order 185
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e970fe0c-5951-432d-8d80-19ef700952bb',
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  3,
  257.79,
  773.37,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order Item for Order 185
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a0a6dcbc-2a45-4b72-bc38-8a99fc2c2717',
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order Item for Order 185
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ac635081-ac5a-4a17-82b9-b2510f902d25',
  'c8716e45-7f01-4a4e-9484-83a98cbdbc17',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-11-18T16:46:34.474Z',
  '2024-11-18T16:46:34.474Z'
);

-- Order 186/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  2424.77,
  2205.53,
  209.30,
  9.94,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"source":"mobile_app","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order Item for Order 186
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a64fa45e-78e3-4854-965e-301c1e528dcb',
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order Item for Order 186
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ea3e8908-0fd5-48b8-a04f-ea8a868f1bc3',
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order Item for Order 186
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '33262bf3-c08e-45dc-b9ea-a28456121750',
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order Item for Order 186
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3b0719fd-92d6-4611-8a51-a2b1ea999a62',
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order Item for Order 186
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0eb8df2c-f807-41f3-8c47-7c4f5a07956b',
  '3a8d9a65-68df-49b5-a53b-0a2d40d32afa',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-27T10:38:39.872Z',
  '2024-08-27T10:38:39.872Z'
);

-- Order 187/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'a3cdaa62-7664-436f-afe6-705e0e8ef932',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2001.04,
  1826.99,
  160.96,
  13.09,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-04-25T23:40:05.061Z',
  '2024-04-25T23:40:05.061Z'
);

-- Order Item for Order 187
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '60e58890-5363-444f-b3c3-d528597394ca',
  'a3cdaa62-7664-436f-afe6-705e0e8ef932',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-04-25T23:40:05.061Z',
  '2024-04-25T23:40:05.061Z'
);

-- Order Item for Order 187
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '6cf1cee6-0f20-471b-8016-7919f70840ef',
  'a3cdaa62-7664-436f-afe6-705e0e8ef932',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  2,
  250.00,
  500.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-04-25T23:40:05.061Z',
  '2024-04-25T23:40:05.061Z'
);

-- Order Item for Order 187
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '08431ca2-2528-448c-88ad-66f4da61c460',
  'a3cdaa62-7664-436f-afe6-705e0e8ef932',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  2,
  249.99,
  499.98,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-25T23:40:05.061Z',
  '2024-04-25T23:40:05.061Z'
);

-- Order 188/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '7c16c0b7-b7ef-4196-a0e7-d24d73d2ab98',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  742.70,
  699.98,
  49.35,
  19.31,
  25.94,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-03-12T23:01:42.277Z',
  '2024-03-12T23:01:42.277Z'
);

-- Order Item for Order 188
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '79ad2752-19ad-4823-b42a-b2dffdc199c9',
  '7c16c0b7-b7ef-4196-a0e7-d24d73d2ab98',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  2,
  126.10,
  252.20,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-03-12T23:01:42.277Z',
  '2024-03-12T23:01:42.277Z'
);

-- Order Item for Order 188
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a4e0b392-9b39-45f3-a675-6c272ca7b3ec',
  '7c16c0b7-b7ef-4196-a0e7-d24d73d2ab98',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-03-12T23:01:42.277Z',
  '2024-03-12T23:01:42.277Z'
);

-- Order Item for Order 188
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1acc523c-7ae6-452d-bd3c-26866410ada6',
  '7c16c0b7-b7ef-4196-a0e7-d24d73d2ab98',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-03-12T23:01:42.277Z',
  '2024-03-12T23:01:42.277Z'
);

-- Order 189/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'ad15b4f9-e74d-4a29-b40e-88db579d46f4',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'pending',
  2056.01,
  1922.00,
  116.28,
  17.73,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-12-21T06:44:30.313Z',
  '2024-12-21T06:44:30.313Z'
);

-- Order Item for Order 189
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c3243cf9-4635-4ad7-a62b-4c7b00d99218',
  'ad15b4f9-e74d-4a29-b40e-88db579d46f4',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-12-21T06:44:30.313Z',
  '2024-12-21T06:44:30.313Z'
);

-- Order Item for Order 189
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5037f19c-f6d3-430a-b3b0-3e509fc8a195',
  'ad15b4f9-e74d-4a29-b40e-88db579d46f4',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  3,
  275.67,
  827.01,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-12-21T06:44:30.313Z',
  '2024-12-21T06:44:30.313Z'
);

-- Order Item for Order 189
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bba842e5-a34b-4730-ae1b-0ca98529b35c',
  'ad15b4f9-e74d-4a29-b40e-88db579d46f4',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-21T06:44:30.313Z',
  '2024-12-21T06:44:30.313Z'
);

-- Order 190/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '8423b931-0049-492d-8d2a-75ed6729d0c2',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  233.09,
  189.99,
  18.87,
  24.23,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-10-02T16:26:53.532Z',
  '2024-10-02T16:26:53.532Z'
);

-- Order Item for Order 190
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dbf54f7a-2e70-4fab-853e-389982c10917',
  '8423b931-0049-492d-8d2a-75ed6729d0c2',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  1,
  189.99,
  189.99,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-10-02T16:26:53.532Z',
  '2024-10-02T16:26:53.532Z'
);

-- Order 191/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '7a4d718c-4cde-4ecf-9767-9366515ff097',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  2643.68,
  2435.65,
  197.04,
  10.99,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-10-22T04:14:29.907Z',
  '2024-10-22T04:14:29.907Z'
);

-- Order Item for Order 191
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3c98929d-9d04-48c6-8409-6e422705e284',
  '7a4d718c-4cde-4ecf-9767-9366515ff097',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-10-22T04:14:29.907Z',
  '2024-10-22T04:14:29.907Z'
);

-- Order Item for Order 191
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'b736d009-b3c3-466a-b35c-ec428191f77e',
  '7a4d718c-4cde-4ecf-9767-9366515ff097',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-10-22T04:14:29.907Z',
  '2024-10-22T04:14:29.907Z'
);

-- Order Item for Order 191
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '2a8fa4cc-440c-489d-a4d2-89afeb518179',
  '7a4d718c-4cde-4ecf-9767-9366515ff097',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-10-22T04:14:29.907Z',
  '2024-10-22T04:14:29.907Z'
);

-- Order 192/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c8c8c2e4-c903-4722-8298-02eefc0d733c',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  413.45,
  378.30,
  30.11,
  5.04,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2024-11-22T22:29:09.234Z',
  '2024-11-22T22:29:09.234Z'
);

-- Order Item for Order 192
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bc385e69-9473-4571-a280-0579f6794dce',
  'c8c8c2e4-c903-4722-8298-02eefc0d733c',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  3,
  126.10,
  378.30,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-11-22T22:29:09.234Z',
  '2024-11-22T22:29:09.234Z'
);

-- Order 193/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  2806.28,
  2573.45,
  220.80,
  12.03,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order Item for Order 193
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'a13eca8b-c426-4846-95dd-dfb494d82e2d',
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order Item for Order 193
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '14abcb55-6964-4217-b1c8-28988830d5ea',
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order Item for Order 193
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd2a67c58-97e7-41ea-bd6e-b0ecb730e9c1',
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  2,
  195.00,
  390.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order Item for Order 193
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '697ac614-3cb0-4112-8448-60b1f57db8e0',
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order Item for Order 193
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '8092b888-d12c-4391-8f82-0683df837972',
  '4f23b985-e4c9-46f3-8e76-eb3e750fa76d',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2024-08-25T01:11:26.337Z',
  '2024-08-25T01:11:26.337Z'
);

-- Order 194/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '047acb8c-7dea-4726-be6a-0ccdf508215b',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  947.66,
  860.67,
  73.85,
  13.14,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2025-02-16T09:46:01.091Z',
  '2025-02-16T09:46:01.091Z'
);

-- Order Item for Order 194
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd6dbe76d-3f7e-49d8-82f3-1ada6bb8e688',
  '047acb8c-7dea-4726-be6a-0ccdf508215b',
  '0476471a-40e4-41c4-ae0b-1dd4abed1f65',
  1,
  275.67,
  275.67,
  '{"product_variant_id":"0476471a-40e4-41c4-ae0b-1dd4abed1f65"}',
  '2025-02-16T09:46:01.091Z',
  '2025-02-16T09:46:01.091Z'
);

-- Order Item for Order 194
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '649ce43c-dc27-404d-8511-30c926f38d3a',
  '047acb8c-7dea-4726-be6a-0ccdf508215b',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2025-02-16T09:46:01.091Z',
  '2025-02-16T09:46:01.091Z'
);

-- Order 195/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'f08a6e8e-00b9-44f1-9722-0e7221988d5a',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'processing',
  2039.31,
  1854.98,
  169.17,
  15.16,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"mobile_app","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-04-05T08:24:19.940Z',
  '2024-04-05T08:24:19.940Z'
);

-- Order Item for Order 195
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '1ef8ef9a-1137-4796-b371-959d79ae0981',
  'f08a6e8e-00b9-44f1-9722-0e7221988d5a',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  3,
  195.00,
  585.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-04-05T08:24:19.940Z',
  '2024-04-05T08:24:19.940Z'
);

-- Order Item for Order 195
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ef54b1e9-360d-4767-9f08-e081ad5e27c4',
  'f08a6e8e-00b9-44f1-9722-0e7221988d5a',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-04-05T08:24:19.940Z',
  '2024-04-05T08:24:19.940Z'
);

-- Order Item for Order 195
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'dfaa0046-9149-472c-a68a-b434bf4bf8ae',
  'f08a6e8e-00b9-44f1-9722-0e7221988d5a',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-04-05T08:24:19.940Z',
  '2024-04-05T08:24:19.940Z'
);

-- Order Item for Order 195
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '00f2ea51-f49e-40a7-ab9f-2bfcad20f47a',
  'f08a6e8e-00b9-44f1-9722-0e7221988d5a',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  1,
  120.00,
  120.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-04-05T08:24:19.940Z',
  '2024-04-05T08:24:19.940Z'
);

-- Order 196/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'c03a9873-3fd5-4355-83b4-21b11696d01e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1091.67,
  1013.87,
  92.46,
  12.22,
  26.88,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Robert","last_name":"Johnson","address_line1":"789 Oak St","city":"Chicago","state":"IL","postal_code":"60601","country":"USA","phone":"555-567-8901"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":[]}',
  '2025-01-27T04:44:10.343Z',
  '2025-01-27T04:44:10.343Z'
);

-- Order Item for Order 196
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'cb24c520-055c-451f-aaca-009559921b96',
  'c03a9873-3fd5-4355-83b4-21b11696d01e',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2025-01-27T04:44:10.343Z',
  '2025-01-27T04:44:10.343Z'
);

-- Order Item for Order 196
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'fff270c9-2c03-45fc-aa68-7e3a73535477',
  'c03a9873-3fd5-4355-83b4-21b11696d01e',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  1,
  250.00,
  250.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2025-01-27T04:44:10.343Z',
  '2025-01-27T04:44:10.343Z'
);

-- Order Item for Order 196
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '79cde6f8-418f-46d3-a581-fcd1902a6a2a',
  'c03a9873-3fd5-4355-83b4-21b11696d01e',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  2,
  189.99,
  379.98,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2025-01-27T04:44:10.343Z',
  '2025-01-27T04:44:10.343Z'
);

-- Order Item for Order 196
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'f44c6786-d780-4027-8a6e-e2b0bc457245',
  'c03a9873-3fd5-4355-83b4-21b11696d01e',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2025-01-27T04:44:10.343Z',
  '2025-01-27T04:44:10.343Z'
);

-- Order 197/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd15bb7c3-cbf5-41fb-8d06-7d268f309b6f',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'cancelled',
  1887.18,
  1767.77,
  97.76,
  21.65,
  0.00,
  '{"first_name":"John","last_name":"Doe","address_line1":"123 Main St","city":"New York","state":"NY","postal_code":"10001","country":"USA","phone":"555-123-4567"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-05-11T22:49:18.895Z',
  '2024-05-11T22:49:18.895Z'
);

-- Order Item for Order 197
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'c0301305-7e1b-4006-a653-6f52c557e51f',
  'd15bb7c3-cbf5-41fb-8d06-7d268f309b6f',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  1,
  899.99,
  899.99,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-05-11T22:49:18.895Z',
  '2024-05-11T22:49:18.895Z'
);

-- Order Item for Order 197
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e973f27f-aa84-494a-8833-bc6c0576c56b',
  'd15bb7c3-cbf5-41fb-8d06-7d268f309b6f',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-11T22:49:18.895Z',
  '2024-05-11T22:49:18.895Z'
);

-- Order Item for Order 197
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'e2fed4c4-ca61-4a7c-9a83-becffe73c415',
  'd15bb7c3-cbf5-41fb-8d06-7d268f309b6f',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  3,
  120.00,
  360.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-05-11T22:49:18.895Z',
  '2024-05-11T22:49:18.895Z'
);

-- Order Item for Order 197
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '9bc22742-e004-424e-ad58-2bc3e9fdb60c',
  'd15bb7c3-cbf5-41fb-8d06-7d268f309b6f',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  1,
  249.99,
  249.99,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-11T22:49:18.895Z',
  '2024-05-11T22:49:18.895Z'
);

-- Order 198/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'd1401c0f-8e3f-4f25-9330-6c010d0d2096',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3601.27,
  3396.04,
  195.27,
  9.96,
  0.00,
  '{"first_name":"Emily","last_name":"Brown","address_line1":"321 Pine St","city":"San Francisco","state":"CA","postal_code":"94101","country":"USA","phone":"555-234-5678"}',
  '{"first_name":"Jane","last_name":"Smith","address_line1":"456 Park Ave","city":"Boston","state":"MA","postal_code":"02108","country":"USA","phone":"555-987-6543"}',
  '{"source":"website","customer_notes":"Please deliver in the evening","gift_order":true,"tags":[]}',
  '2024-12-23T15:41:22.151Z',
  '2024-12-23T15:41:22.151Z'
);

-- Order Item for Order 198
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'ec5edcac-a86d-4bba-aed6-5268b92e0eb3',
  'd1401c0f-8e3f-4f25-9330-6c010d0d2096',
  '80516055-b364-4fe4-bd34-d7cde437a2c5',
  1,
  126.10,
  126.10,
  '{"product_variant_id":"80516055-b364-4fe4-bd34-d7cde437a2c5"}',
  '2024-12-23T15:41:22.151Z',
  '2024-12-23T15:41:22.151Z'
);

-- Order Item for Order 198
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '5a400397-54a9-4fc9-a3c7-7c3e22c280d7',
  'd1401c0f-8e3f-4f25-9330-6c010d0d2096',
  '624ca9a9-37f5-462b-9a6b-93fe20c568b9',
  3,
  189.99,
  569.97,
  '{"product_variant_id":"624ca9a9-37f5-462b-9a6b-93fe20c568b9"}',
  '2024-12-23T15:41:22.151Z',
  '2024-12-23T15:41:22.151Z'
);

-- Order Item for Order 198
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '3eb2d484-69e2-4752-9c01-8579e7a498db',
  'd1401c0f-8e3f-4f25-9330-6c010d0d2096',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  3,
  899.99,
  2699.97,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-12-23T15:41:22.151Z',
  '2024-12-23T15:41:22.151Z'
);

-- Order 199/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  'e2dc401c-d3e3-4ada-95fc-5cda2bffaa1e',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'completed',
  1310.06,
  1202.76,
  100.55,
  6.75,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":["VIP","Recurring"]}',
  '2024-05-01T19:00:54.786Z',
  '2024-05-01T19:00:54.786Z'
);

-- Order Item for Order 199
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'bb00babd-0b5b-43e0-9b7d-3a222689d9ff',
  'e2dc401c-d3e3-4ada-95fc-5cda2bffaa1e',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  1,
  257.79,
  257.79,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-05-01T19:00:54.786Z',
  '2024-05-01T19:00:54.786Z'
);

-- Order Item for Order 199
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd00c37b8-5d69-4b62-afea-a5e935a2742f',
  'e2dc401c-d3e3-4ada-95fc-5cda2bffaa1e',
  '99ae755d-0e3c-4467-b2ba-ea0fe2834c94',
  1,
  195.00,
  195.00,
  '{"product_variant_id":"99ae755d-0e3c-4467-b2ba-ea0fe2834c94"}',
  '2024-05-01T19:00:54.786Z',
  '2024-05-01T19:00:54.786Z'
);

-- Order Item for Order 199
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '7adeb546-1b8f-44de-b00f-4b818992e02b',
  'e2dc401c-d3e3-4ada-95fc-5cda2bffaa1e',
  'dcca32d6-c59f-4493-94d7-c806a736c930',
  3,
  249.99,
  749.97,
  '{"product_variant_id":"dcca32d6-c59f-4493-94d7-c806a736c930"}',
  '2024-05-01T19:00:54.786Z',
  '2024-05-01T19:00:54.786Z'
);

-- Order 200/200
INSERT INTO orders (
  id, store_id, user_id, status, total_amount, subtotal_amount, 
  tax_amount, shipping_amount, discount_amount, shipping_address, 
  billing_address, metadata, created_at, updated_at
)
VALUES (
  '45d10d48-1f4a-4c58-b9c3-5b8d3edf7d13',
  'a2af36c3-5054-4f94-b6f9-5846860781cc',
  '00000000-0000-0000-0000-000000000000',
  'refunded',
  3520.17,
  3305.56,
  208.58,
  6.03,
  0.00,
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"first_name":"Michael","last_name":"Wilson","address_line1":"654 Elm St","city":"Miami","state":"FL","postal_code":"33101","country":"USA","phone":"555-345-6789"}',
  '{"source":"website","customer_notes":null,"gift_order":false,"tags":[]}',
  '2024-06-06T04:24:39.155Z',
  '2024-06-06T04:24:39.155Z'
);

-- Order Item for Order 200
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '58c93340-c54d-4e8d-a00b-46406cc3ac93',
  '45d10d48-1f4a-4c58-b9c3-5b8d3edf7d13',
  '326062ea-8022-4875-949d-9c4ff34f635a',
  2,
  120.00,
  240.00,
  '{"product_variant_id":"326062ea-8022-4875-949d-9c4ff34f635a"}',
  '2024-06-06T04:24:39.155Z',
  '2024-06-06T04:24:39.155Z'
);

-- Order Item for Order 200
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0595628c-c877-4b5f-b409-5fd340d8064a',
  '45d10d48-1f4a-4c58-b9c3-5b8d3edf7d13',
  'b4e49629-e90f-4dcc-92a2-7ed4dc25cea6',
  2,
  257.79,
  515.58,
  '{"product_variant_id":"b4e49629-e90f-4dcc-92a2-7ed4dc25cea6"}',
  '2024-06-06T04:24:39.155Z',
  '2024-06-06T04:24:39.155Z'
);

-- Order Item for Order 200
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  'd9bc5d29-5c79-41fa-80df-4fc9d74d0246',
  '45d10d48-1f4a-4c58-b9c3-5b8d3edf7d13',
  'b50dd546-7875-4edc-9aff-4ed170c6c062',
  3,
  250.00,
  750.00,
  '{"product_variant_id":"b50dd546-7875-4edc-9aff-4ed170c6c062"}',
  '2024-06-06T04:24:39.155Z',
  '2024-06-06T04:24:39.155Z'
);

-- Order Item for Order 200
INSERT INTO order_items (
  id, order_id, variant_id, quantity, unit_price, 
  total_price, metadata, created_at, updated_at
)
VALUES (
  '0dae9f43-11a4-4d53-9bb8-558f716a814f',
  '45d10d48-1f4a-4c58-b9c3-5b8d3edf7d13',
  'b601de2c-6f5f-4445-9db5-e542d77fda23',
  2,
  899.99,
  1799.98,
  '{"product_variant_id":"b601de2c-6f5f-4445-9db5-e542d77fda23"}',
  '2024-06-06T04:24:39.155Z',
  '2024-06-06T04:24:39.155Z'
);

-- Re-enable triggers
ALTER TABLE orders ENABLE TRIGGER audit_orders;
ALTER TABLE orders ENABLE TRIGGER update_orders_updated_at;
ALTER TABLE order_items ENABLE TRIGGER audit_order_items;
ALTER TABLE order_items ENABLE TRIGGER update_order_items_updated_at;

COMMIT;
  