-- Export Full Schema Script for Migration to Test Database
-- This script exports all database objects including tables, constraints, indexes, 
-- RLS policies, functions, and custom types from the production database.
-- The output can be directly executed on the test database to recreate the exact schema.

-- Combine all SQL generation into a single query with UNION ALL

WITH 
-- Section headers
headers AS (
  SELECT 1 AS sort_order, '-- CUSTOM TYPES' AS sql_statement
  UNION ALL
  SELECT 2, '-- TABLE DEFINITIONS'
  UNION ALL
  SELECT 3, '-- PRIMARY KEYS'
  UNION ALL
  SELECT 4, '-- FOREIGN KEYS'
  UNION ALL
  SELECT 5, '-- UNIQUE CONSTRAINTS'
  UNION ALL
  SELECT 6, '-- CHECK CONSTRAINTS'
  UNION ALL
  SELECT 7, '-- INDEXES'
  UNION ALL
  SELECT 8, '-- ROW LEVEL SECURITY POLICIES'
  UNION ALL
  SELECT 9, '-- FUNCTIONS AND PROCEDURES'
  UNION ALL
  SELECT 10, '-- TRIGGERS'
  UNION ALL
  SELECT 11, '-- SEQUENCES (OPTIONAL)'
),

-- Step 1: Export custom types (enums, domains, etc.)
enum_types AS (
  SELECT 
    1.1 AS sort_order,
    'CREATE TYPE ' || n.nspname || '.' || t.typname || ' AS ENUM (' ||
    string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) || ');' AS sql_statement
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  GROUP BY n.nspname, t.typname
),

domain_types AS (
  SELECT 
    1.2 AS sort_order,
    'CREATE DOMAIN ' || n.nspname || '.' || t.typname || ' AS ' || 
    pg_catalog.format_type(t.typbasetype, t.typtypmod) || 
    CASE WHEN t.typnotnull THEN ' NOT NULL' ELSE '' END || 
    CASE WHEN t.typdefault IS NOT NULL THEN ' DEFAULT ' || t.typdefault ELSE '' END || ';' AS sql_statement
  FROM pg_catalog.pg_type t
  JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  WHERE t.typtype = 'd' -- Domain
  AND n.nspname = 'public'
),

-- Step 2: Export table definitions (without constraints)
table_defs AS (
  SELECT 
    2.1 AS sort_order,
    'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
    string_agg(
      column_name || ' ' || 
      data_type || 
      CASE 
        WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
        ELSE ''
      END ||
      CASE 
        WHEN is_nullable = 'NO' THEN ' NOT NULL'
        ELSE ''
      END ||
      CASE 
        WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
        ELSE ''
      END,
      ', '
    ) || ');' AS sql_statement
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
    AND table_name NOT LIKE 'test_%'  -- Exclude any remaining test tables
  GROUP BY 
    table_name
),

-- Step 3: Export primary keys
primary_keys AS (
  SELECT 
    3.1 AS sort_order,
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || ' PRIMARY KEY (' ||
    string_agg(kcu.column_name, ', ') || ');' AS sql_statement
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name NOT LIKE 'test_%'  -- Exclude any remaining test tables
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
),

-- Step 4: Export foreign keys
foreign_keys AS (
  SELECT 
    4.1 AS sort_order,
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || ' FOREIGN KEY (' ||
    string_agg(kcu.column_name, ', ') || ') REFERENCES ' ||
    ccu.table_schema || '.' || ccu.table_name || ' (' ||
    string_agg(ccu.column_name, ', ') || ');' AS sql_statement
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name NOT LIKE 'test_%'  -- Exclude any remaining test tables
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name, ccu.table_schema, ccu.table_name
),

-- Step 5: Export unique constraints
unique_constraints AS (
  SELECT 
    5.1 AS sort_order,
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || ' UNIQUE (' ||
    string_agg(kcu.column_name, ', ') || ');' AS sql_statement
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name NOT LIKE 'test_%'  -- Exclude any remaining test tables
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
),

-- Step 6: Export check constraints
check_constraints AS (
  SELECT 
    6.1 AS sort_order,
    'ALTER TABLE ' || n.nspname || '.' || r.relname || 
    ' ADD CONSTRAINT ' || c.conname || ' CHECK ' || 
    pg_get_constraintdef(c.oid) || ';' AS sql_statement
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  JOIN pg_class r ON r.oid = c.conrelid
  WHERE c.contype = 'c'
    AND n.nspname = 'public'
    AND r.relname NOT LIKE 'test_%'  -- Exclude any remaining test tables
),

-- Step 7: Export indexes (excluding those for constraints)
indexes AS (
  SELECT 
    7.1 AS sort_order,
    'CREATE INDEX IF NOT EXISTS ' || indexname || ' ON ' || 
    tablename || ' USING ' || indexdef || ';' AS sql_statement
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'test_%'  -- Exclude any remaining test tables
    AND indexdef NOT LIKE '%PRIMARY KEY%'
    AND indexdef NOT LIKE '%UNIQUE%'
),

-- Step 8: Export RLS policies
rls_enable AS (
  SELECT 
    8.1 AS sort_order,
    'ALTER TABLE ' || n.nspname || '.' || c.relname || ' ENABLE ROW LEVEL SECURITY;' AS sql_statement
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relrowsecurity = true
    AND n.nspname = 'public'
    AND c.relname NOT LIKE 'test_%'  -- Exclude any remaining test tables
),

rls_policies AS (
  SELECT 
    8.2 AS sort_order,
    'CREATE POLICY ' || polname || ' ON ' || 
    n.nspname || '.' || c.relname || ' FOR ' || 
    CASE 
      WHEN polcmd = 'r' THEN 'SELECT'
      WHEN polcmd = 'a' THEN 'INSERT'
      WHEN polcmd = 'w' THEN 'UPDATE'
      WHEN polcmd = 'd' THEN 'DELETE'
      WHEN polcmd = '*' THEN 'ALL'
    END || 
    ' TO ' || 
    CASE WHEN polroles = '{0}' THEN 'PUBLIC' ELSE 'ROLE_NAME' END ||  -- You may need to adjust roles here
    ' USING (' || pg_catalog.pg_get_expr(polqual, polrelid, true) || ')' ||
    CASE 
      WHEN polwithcheck IS NOT NULL 
      THEN ' WITH CHECK (' || pg_catalog.pg_get_expr(polwithcheck, polrelid, true) || ')'
      ELSE ''
    END || ';' AS sql_statement
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname NOT LIKE 'test_%'  -- Exclude any remaining test tables
),

-- Step 9: Export functions and procedures
functions AS (
  SELECT 
    9.1 AS sort_order,
    pg_get_functiondef(p.oid) || ';' AS sql_statement
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
),

-- Step 10: Export triggers
triggers AS (
  SELECT 
    10.1 AS sort_order,
    'CREATE TRIGGER ' || t.tgname || 
    ' ' || CASE WHEN (t.tgtype & 4) <> 0 THEN 'BEFORE' 
                WHEN (t.tgtype & 8) <> 0 THEN 'AFTER' 
                WHEN (t.tgtype & 16) <> 0 THEN 'INSTEAD OF' 
                ELSE NULL END || 
    ' ' || CASE WHEN (t.tgtype & 1) <> 0 THEN 'INSERT' ELSE '' END ||
           CASE WHEN (t.tgtype & 2) <> 0 THEN 
                  CASE WHEN (t.tgtype & 1) <> 0 THEN ' OR ' ELSE '' END || 'DELETE' 
                ELSE '' END ||
           CASE WHEN (t.tgtype & 16) <> 0 THEN 
                  CASE WHEN ((t.tgtype & 1) <> 0) OR ((t.tgtype & 2) <> 0) THEN ' OR ' ELSE '' END || 'UPDATE' 
                ELSE '' END ||
    ' ON ' || n.nspname || '.' || c.relname ||
    ' FOR EACH ' || CASE WHEN (t.tgtype & 1) <> 0 THEN 'ROW' ELSE 'STATEMENT' END ||
    ' EXECUTE FUNCTION ' || nf.nspname || '.' || p.proname || '();' AS sql_statement
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  JOIN pg_proc p ON t.tgfoid = p.oid
  JOIN pg_namespace nf ON p.pronamespace = nf.oid
  WHERE n.nspname = 'public'
    AND t.tgisinternal = false
    AND c.relname NOT LIKE 'test_%'  -- Exclude any remaining test tables
),

-- Step 11: Export sequence values (optional)
sequences AS (
  SELECT 
    11.1 AS sort_order,
    '-- Sequence: ' || sequence_name || 
    E'\n-- You may need to adjust sequence values manually after importing' || 
    E'\nSELECT setval(''' || sequence_name || ''', 1, false);' AS sql_statement
  FROM information_schema.sequences
  WHERE sequence_schema = 'public'
    AND sequence_name NOT LIKE 'test_%'  -- Exclude any remaining test tables
)

-- Combine all results in order
SELECT sort_order, sql_statement FROM headers
UNION ALL
SELECT sort_order, sql_statement FROM enum_types
UNION ALL
SELECT sort_order, sql_statement FROM domain_types
UNION ALL
SELECT sort_order, sql_statement FROM table_defs
UNION ALL
SELECT sort_order, sql_statement FROM primary_keys
UNION ALL
SELECT sort_order, sql_statement FROM foreign_keys
UNION ALL
SELECT sort_order, sql_statement FROM unique_constraints
UNION ALL
SELECT sort_order, sql_statement FROM check_constraints
UNION ALL
SELECT sort_order, sql_statement FROM indexes
UNION ALL
SELECT sort_order, sql_statement FROM rls_enable
UNION ALL
SELECT sort_order, sql_statement FROM rls_policies
UNION ALL
SELECT sort_order, sql_statement FROM functions
UNION ALL
SELECT sort_order, sql_statement FROM triggers
UNION ALL
SELECT sort_order, sql_statement FROM sequences
ORDER BY sort_order; 