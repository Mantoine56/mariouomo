--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgsodium;


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_monitor; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_monitor WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_monitor; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_monitor IS 'The pg_stat_monitor is a PostgreSQL Query Performance Monitoring tool, based on PostgreSQL contrib module pg_stat_statements. pg_stat_monitor provides aggregated statistics, client information, plan details including plan, and histogram information.';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


--
-- Name: check_connection_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_connection_status() RETURNS TABLE(pid integer, username text, database text, client_addr inet, connection_state text, query text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pid::int,
        usename::text,
        datname::text,
        client_addr,
        state::text,
        query::text
    FROM 
        pg_stat_activity 
    WHERE 
        state = 'active';
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$;


--
-- Name: log_table_event(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_table_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO events (
        user_id,
        store_id,
        event_type,
        event_data
    ) VALUES (
        auth.uid(),
        CASE 
            WHEN TG_TABLE_NAME = 'stores' THEN NEW.id
            WHEN TG_TABLE_NAME IN ('products', 'orders', 'discounts') THEN NEW.store_id
            ELSE NULL
        END,
        TG_TABLE_NAME || '_' || TG_OP,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'action', TG_OP,
            'record_id', NEW.id,
            'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            'new_data', row_to_json(NEW)
        )
    );
    RETURN NEW;
END;
$$;


--
-- Name: refresh_materialized_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_materialized_views() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY order_daily_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;
END;
$$;


--
-- Name: update_cart_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_cart_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_cart_totals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_cart_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE shopping_carts
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM cart_items
            WHERE cart_id = NEW.cart_id
        ),
        updated_at = now()
    WHERE id = NEW.cart_id;
    
    -- Calculate total (considering discounts and taxes)
    UPDATE shopping_carts
    SET 
        total = subtotal - discount_amount + tax_amount,
        updated_at = now()
    WHERE id = NEW.cart_id;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_metrics_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_metrics_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: verify_backup_integrity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.verify_backup_integrity() RETURNS TABLE(table_name text, row_count bigint, last_updated timestamp without time zone, has_valid_constraints boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::text,
        (SELECT count(*) FROM (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS count)::bigint,
        (SELECT max(updated_at) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::timestamp,
        (SELECT bool_and(convalidated) FROM pg_constraint WHERE conrelid = t.table_name::regclass)
    FROM (
        SELECT DISTINCT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    ) t;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: -
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    street character varying NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    country character varying NOT NULL,
    postal_code character varying NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    userid uuid
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid,
    variant_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    image_url character varying,
    "position" integer DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    seo_metadata jsonb,
    child_count integer DEFAULT 0 NOT NULL,
    total_products integer DEFAULT 0 NOT NULL,
    parentid uuid
);


--
-- Name: categories_closure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories_closure (
    id_ancestor uuid NOT NULL,
    id_descendant uuid NOT NULL
);


--
-- Name: customer_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    new_customers integer DEFAULT 0 NOT NULL,
    returning_customers integer DEFAULT 0 NOT NULL,
    customer_lifetime_value numeric(10,2) DEFAULT 0 NOT NULL,
    retention_rate numeric(5,2) DEFAULT 0 NOT NULL,
    churn_rate numeric(5,2) DEFAULT 0 NOT NULL,
    purchase_frequency jsonb DEFAULT '[]'::jsonb,
    customer_segments jsonb DEFAULT '[]'::jsonb,
    geographic_distribution jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    traffic_source character varying(255),
    store_id uuid,
    last_purchase_date date
);


--
-- Name: discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    code character varying(100),
    discount_type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    usage_limit integer,
    used_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    store_id uuid,
    event_type character varying(100),
    event_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: gift_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    code character varying(100) NOT NULL,
    initial_balance numeric(10,2) NOT NULL,
    current_balance numeric(10,2) NOT NULL,
    expires_at timestamp with time zone,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    location character varying(255),
    reorder_point integer DEFAULT 0,
    reorder_quantity integer DEFAULT 0,
    version integer DEFAULT 1,
    last_counted_at timestamp with time zone,
    metadata jsonb
);


--
-- Name: TABLE inventory_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_items IS 'Tracks product inventory levels across locations';


--
-- Name: COLUMN inventory_items.reorder_point; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.reorder_point IS 'Quantity threshold that triggers reordering';


--
-- Name: COLUMN inventory_items.reorder_quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.reorder_quantity IS 'Default quantity to reorder when below reorder_point';


--
-- Name: COLUMN inventory_items.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.version IS 'Used for optimistic locking';


--
-- Name: COLUMN inventory_items.last_counted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.last_counted_at IS 'Timestamp of last physical inventory count';


--
-- Name: COLUMN inventory_items.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.metadata IS 'Additional metadata for inventory items';


--
-- Name: inventory_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    turnover_rate numeric(5,2) DEFAULT 0 NOT NULL,
    total_sku_count integer DEFAULT 0 NOT NULL,
    low_stock_items integer DEFAULT 0 NOT NULL,
    out_of_stock_items integer DEFAULT 0 NOT NULL,
    inventory_value numeric(10,2) DEFAULT 0 NOT NULL,
    dead_stock_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    stock_by_location jsonb DEFAULT '[]'::jsonb,
    category_metrics jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    store_id uuid
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    total_amount numeric(10,2) NOT NULL,
    subtotal_amount numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0,
    shipping_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    shipping_address jsonb,
    billing_address jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: order_daily_stats; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.order_daily_stats AS
 SELECT orders.store_id,
    date_trunc('day'::text, orders.created_at) AS day,
    count(*) AS total_orders,
    sum(orders.total_amount) AS total_revenue,
    avg(orders.total_amount) AS avg_order_value,
    sum(orders.discount_amount) AS total_discounts
   FROM public.orders
  GROUP BY orders.store_id, (date_trunc('day'::text, orders.created_at))
  WITH NO DATA;


--
-- Name: order_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_discounts (
    order_id uuid NOT NULL,
    discount_id uuid NOT NULL,
    amount_applied numeric(10,2) NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    provider character varying(50),
    status character varying(50) DEFAULT 'pending'::character varying,
    transaction_id character varying(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    product_id uuid NOT NULL,
    category_id uuid NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    url text NOT NULL,
    alt_text character varying(255),
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    sku character varying(100),
    barcode character varying(100),
    option_values jsonb,
    price_adjustment numeric(10,2) DEFAULT 0,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'draft'::character varying,
    price numeric(10,2) NOT NULL,
    compare_at_price numeric(10,2),
    cost_price numeric(10,2),
    metadata jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_performance; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.product_performance AS
 SELECT p.id AS product_id,
    p.store_id,
    p.name,
    count(DISTINCT o.id) AS order_count,
    sum(oi.quantity) AS units_sold,
    sum(oi.total_price) AS total_revenue,
    avg(oi.unit_price) AS avg_selling_price
   FROM (((public.products p
     LEFT JOIN public.product_variants pv ON ((p.id = pv.product_id)))
     LEFT JOIN public.order_items oi ON ((pv.id = oi.variant_id)))
     LEFT JOIN public.orders o ON ((oi.order_id = o.id)))
  WHERE ((o.status)::text = 'completed'::text)
  GROUP BY p.id, p.store_id, p.name
  WITH NO DATA;


--
-- Name: product_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid,
    session_id character varying(100) NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    view_duration integer,
    referrer_page character varying(255),
    device_type character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE product_views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.product_views IS 'Tracks when and how users view products for analytics purposes';


--
-- Name: COLUMN product_views.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.id IS 'Primary key for the product view event';


--
-- Name: COLUMN product_views.product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.product_id IS 'Foreign key to the products table';


--
-- Name: COLUMN product_views.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.user_id IS 'Foreign key to the user profile, null for anonymous users';


--
-- Name: COLUMN product_views.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.session_id IS 'Session identifier to track user journey';


--
-- Name: COLUMN product_views.viewed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.viewed_at IS 'Timestamp when the product was viewed';


--
-- Name: COLUMN product_views.view_duration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.view_duration IS 'Time spent viewing the product in seconds';


--
-- Name: COLUMN product_views.referrer_page; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.referrer_page IS 'The page from which the user navigated to this product';


--
-- Name: COLUMN product_views.device_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_views.device_type IS 'Type of device used to view the product';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role character varying(50) DEFAULT 'customer'::character varying NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    full_name character varying(255),
    email character varying(255),
    phone character varying(20),
    preferences jsonb
);


--
-- Name: TABLE profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.profiles IS 'User profiles with extended information beyond auth.users';


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address inet NOT NULL,
    endpoint character varying(255) NOT NULL,
    hits integer DEFAULT 1,
    reset_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: real_time_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.real_time_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    active_users integer DEFAULT 0 NOT NULL,
    active_sessions integer DEFAULT 0 NOT NULL,
    cart_count integer DEFAULT 0 NOT NULL,
    cart_value numeric(10,2) DEFAULT 0 NOT NULL,
    pending_orders integer DEFAULT 0 NOT NULL,
    pending_revenue numeric(10,2) DEFAULT 0 NOT NULL,
    current_popular_products jsonb DEFAULT '[]'::jsonb,
    traffic_sources jsonb DEFAULT '[]'::jsonb,
    page_views jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    store_id uuid
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason character varying(255),
    status character varying(50) DEFAULT 'initiated'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sales_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    total_revenue numeric(10,2) DEFAULT 0 NOT NULL,
    total_orders integer DEFAULT 0 NOT NULL,
    average_order_value numeric(10,2) DEFAULT 0 NOT NULL,
    total_units_sold integer DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    conversion_rate numeric(5,2) DEFAULT 0 NOT NULL,
    top_products jsonb DEFAULT '[]'::jsonb,
    sales_by_category jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    product_id uuid,
    category_id uuid,
    store_id uuid,
    views integer DEFAULT 0
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    shipping_provider character varying(50),
    tracking_number character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    label_url text,
    cost numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: shopping_carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    store_id uuid,
    cart_id text NOT NULL,
    total numeric DEFAULT 0,
    subtotal numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    session_id text
);


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    address_type character varying(50) DEFAULT 'shipping'::character varying,
    line1 character varying(255),
    line2 character varying(255),
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    country character varying(100),
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: decrypted_secrets; Type: VIEW; Schema: vault; Owner: -
--

CREATE VIEW vault.decrypted_secrets AS
 SELECT secrets.id,
    secrets.name,
    secrets.description,
    secrets.secret,
        CASE
            WHEN (secrets.secret IS NULL) THEN NULL::text
            ELSE
            CASE
                WHEN (secrets.key_id IS NULL) THEN NULL::text
                ELSE convert_from(pgsodium.crypto_aead_det_decrypt(decode(secrets.secret, 'base64'::text), convert_to(((((secrets.id)::text || secrets.description) || (secrets.created_at)::text) || (secrets.updated_at)::text), 'utf8'::name), secrets.key_id, secrets.nonce), 'utf8'::name)
            END
        END AS decrypted_secret,
    secrets.key_id,
    secrets.nonce,
    secrets.created_at,
    secrets.updated_at
   FROM vault.secrets;


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories_closure categories_closure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_closure
    ADD CONSTRAINT categories_closure_pkey PRIMARY KEY (id_ancestor, id_descendant);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: customer_metrics customer_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_metrics
    ADD CONSTRAINT customer_metrics_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: gift_cards gift_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_metrics inventory_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_metrics
    ADD CONSTRAINT inventory_metrics_pkey PRIMARY KEY (id);


--
-- Name: order_discounts order_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discounts
    ADD CONSTRAINT order_discounts_pkey PRIMARY KEY (order_id, discount_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: product_views product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (id);


--
-- Name: real_time_metrics real_time_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.real_time_metrics
    ADD CONSTRAINT real_time_metrics_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: sales_metrics sales_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_metrics
    ADD CONSTRAINT sales_metrics_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: shopping_carts shopping_carts_cart_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_cart_id_key UNIQUE (cart_id);


--
-- Name: shopping_carts shopping_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: idx_cart_items_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_variant_id ON public.cart_items USING btree (variant_id);


--
-- Name: idx_categories_closure_ancestor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_closure_ancestor ON public.categories_closure USING btree (id_ancestor);


--
-- Name: idx_categories_closure_descendant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_closure_descendant ON public.categories_closure USING btree (id_descendant);


--
-- Name: idx_customer_metrics_churn_rate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_churn_rate ON public.customer_metrics USING btree (churn_rate);


--
-- Name: idx_customer_metrics_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_created_at ON public.customer_metrics USING btree (created_at);


--
-- Name: idx_customer_metrics_created_at_for_cohort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_created_at_for_cohort ON public.customer_metrics USING btree (created_at);


--
-- Name: idx_customer_metrics_customer_segments_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_customer_segments_gin ON public.customer_metrics USING gin (customer_segments);


--
-- Name: idx_customer_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_date ON public.customer_metrics USING btree (date);


--
-- Name: idx_customer_metrics_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_date_range ON public.customer_metrics USING btree (date, created_at);


--
-- Name: idx_customer_metrics_geographic_distribution_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_geographic_distribution_gin ON public.customer_metrics USING gin (geographic_distribution);


--
-- Name: idx_customer_metrics_high_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_high_value ON public.customer_metrics USING btree (customer_lifetime_value);


--
-- Name: idx_customer_metrics_last_purchase_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_last_purchase_date ON public.customer_metrics USING btree (last_purchase_date);


--
-- Name: idx_customer_metrics_purchase_frequency_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_purchase_frequency_gin ON public.customer_metrics USING gin (purchase_frequency);


--
-- Name: idx_customer_metrics_retention_rate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_retention_rate ON public.customer_metrics USING btree (retention_rate);


--
-- Name: idx_customer_metrics_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_store_id ON public.customer_metrics USING btree (store_id);


--
-- Name: idx_customer_metrics_traffic_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_traffic_source ON public.customer_metrics USING btree (traffic_source);


--
-- Name: idx_discounts_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_discounts_code ON public.discounts USING btree (store_id, code) WHERE (code IS NOT NULL);


--
-- Name: idx_discounts_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discounts_dates ON public.discounts USING btree (starts_at, ends_at);


--
-- Name: idx_gift_cards_balance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gift_cards_balance ON public.gift_cards USING btree (current_balance) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_gift_cards_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_gift_cards_code ON public.gift_cards USING btree (store_id, code);


--
-- Name: idx_inventory_metrics_category_metrics_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_category_metrics_gin ON public.inventory_metrics USING gin (category_metrics);


--
-- Name: idx_inventory_metrics_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_created_at ON public.inventory_metrics USING btree (created_at);


--
-- Name: idx_inventory_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_date ON public.inventory_metrics USING btree (date);


--
-- Name: idx_inventory_metrics_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_date_range ON public.inventory_metrics USING btree (date, created_at);


--
-- Name: idx_inventory_metrics_low_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_low_stock ON public.inventory_metrics USING btree (low_stock_items);


--
-- Name: idx_inventory_metrics_low_stock_items; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_low_stock_items ON public.inventory_metrics USING btree (low_stock_items);


--
-- Name: idx_inventory_metrics_out_of_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_out_of_stock ON public.inventory_metrics USING btree (out_of_stock_items);


--
-- Name: idx_inventory_metrics_stock_by_location_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_stock_by_location_gin ON public.inventory_metrics USING gin (stock_by_location);


--
-- Name: idx_inventory_metrics_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_store_id ON public.inventory_metrics USING btree (store_id);


--
-- Name: idx_inventory_metrics_turnover_rate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_metrics_turnover_rate ON public.inventory_metrics USING btree (turnover_rate);


--
-- Name: idx_inventory_quantity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_quantity ON public.inventory_items USING btree (quantity) WHERE (quantity > 0);


--
-- Name: idx_inventory_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_variant ON public.inventory_items USING btree (variant_id);


--
-- Name: idx_order_stats_store_day; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_order_stats_store_day ON public.order_daily_stats USING btree (store_id, day);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_store; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_store ON public.orders USING btree (store_id);


--
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- Name: idx_product_categories_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_categories_category_id ON public.product_categories USING btree (category_id);


--
-- Name: idx_product_categories_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_categories_product_id ON public.product_categories USING btree (product_id);


--
-- Name: idx_product_performance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_product_performance_id ON public.product_performance USING btree (product_id);


--
-- Name: idx_product_views_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_views_product_id ON public.product_views USING btree (product_id);


--
-- Name: idx_product_views_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_views_session_id ON public.product_views USING btree (session_id);


--
-- Name: idx_product_views_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_views_user_id ON public.product_views USING btree (user_id);


--
-- Name: idx_product_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_views_viewed_at ON public.product_views USING btree (viewed_at);


--
-- Name: idx_products_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created ON public.products USING btree (created_at);


--
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name ON public.products USING gin (to_tsvector('english'::regconfig, (name)::text));


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (status);


--
-- Name: idx_products_store; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_store ON public.products USING btree (store_id);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);


--
-- Name: idx_rate_limits_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_ip ON public.rate_limits USING btree (ip_address, endpoint);


--
-- Name: idx_real_time_metrics_active_users; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_active_users ON public.real_time_metrics USING btree (active_users);


--
-- Name: idx_real_time_metrics_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_created_at ON public.real_time_metrics USING btree (created_at);


--
-- Name: idx_real_time_metrics_current_popular_products_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_current_popular_products_gin ON public.real_time_metrics USING gin (current_popular_products);


--
-- Name: idx_real_time_metrics_page_views_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_page_views_gin ON public.real_time_metrics USING gin (page_views);


--
-- Name: idx_real_time_metrics_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_store_id ON public.real_time_metrics USING btree (store_id);


--
-- Name: idx_real_time_metrics_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_timestamp ON public.real_time_metrics USING btree ("timestamp");


--
-- Name: idx_real_time_metrics_timestamp_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_timestamp_range ON public.real_time_metrics USING btree ("timestamp", created_at);


--
-- Name: idx_real_time_metrics_traffic_sources_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_real_time_metrics_traffic_sources_gin ON public.real_time_metrics USING gin (traffic_sources);


--
-- Name: idx_sales_metrics_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_category_id ON public.sales_metrics USING btree (category_id);


--
-- Name: idx_sales_metrics_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_created_at ON public.sales_metrics USING btree (created_at);


--
-- Name: idx_sales_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_date ON public.sales_metrics USING btree (date);


--
-- Name: idx_sales_metrics_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_date_range ON public.sales_metrics USING btree (date, created_at);


--
-- Name: idx_sales_metrics_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_product_id ON public.sales_metrics USING btree (product_id);


--
-- Name: idx_sales_metrics_sales_by_category_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_sales_by_category_gin ON public.sales_metrics USING gin (sales_by_category);


--
-- Name: idx_sales_metrics_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_store_id ON public.sales_metrics USING btree (store_id);


--
-- Name: idx_sales_metrics_top_products_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_top_products_gin ON public.sales_metrics USING gin (top_products);


--
-- Name: idx_sales_metrics_total_orders; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_total_orders ON public.sales_metrics USING btree (total_orders);


--
-- Name: idx_sales_metrics_total_revenue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_total_revenue ON public.sales_metrics USING btree (total_revenue);


--
-- Name: idx_sales_metrics_views; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_metrics_views ON public.sales_metrics USING btree (views);


--
-- Name: idx_sessions_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expiry ON public.sessions USING btree (expires_at);


--
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id);


--
-- Name: idx_shopping_carts_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_session_id ON public.shopping_carts USING btree (session_id);


--
-- Name: idx_shopping_carts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_status ON public.shopping_carts USING btree (status);


--
-- Name: idx_shopping_carts_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_store_id ON public.shopping_carts USING btree (store_id);


--
-- Name: idx_shopping_carts_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_updated_at ON public.shopping_carts USING btree (updated_at);


--
-- Name: idx_shopping_carts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_user_id ON public.shopping_carts USING btree (user_id);


--
-- Name: idx_variants_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_variants_product ON public.product_variants USING btree (product_id);


--
-- Name: idx_variants_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_variants_sku ON public.product_variants USING btree (sku);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: orders audit_orders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_orders AFTER INSERT OR DELETE OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_table_event();


--
-- Name: products audit_products; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_products AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.log_table_event();


--
-- Name: stores audit_stores; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_stores AFTER INSERT OR DELETE OR UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.log_table_event();


--
-- Name: user_addresses update_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shopping_carts update_cart_timestamp_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cart_timestamp_trigger BEFORE UPDATE ON public.shopping_carts FOR EACH ROW EXECUTE FUNCTION public.update_cart_timestamp();


--
-- Name: cart_items update_cart_totals_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cart_totals_trigger AFTER INSERT OR DELETE OR UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_cart_totals();


--
-- Name: customer_metrics update_customer_metrics_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customer_metrics_timestamp BEFORE UPDATE ON public.customer_metrics FOR EACH ROW EXECUTE FUNCTION public.update_metrics_timestamp();


--
-- Name: discounts update_discounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON public.discounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: gift_cards update_gift_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON public.gift_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_metrics update_inventory_metrics_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_metrics_timestamp BEFORE UPDATE ON public.inventory_metrics FOR EACH ROW EXECUTE FUNCTION public.update_metrics_timestamp();


--
-- Name: inventory_items update_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: order_items update_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_images update_product_images_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_views update_product_views_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_product_views_updated_at BEFORE UPDATE ON public.product_views FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: real_time_metrics update_real_time_metrics_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_real_time_metrics_timestamp BEFORE UPDATE ON public.real_time_metrics FOR EACH ROW EXECUTE FUNCTION public.update_metrics_timestamp();


--
-- Name: refunds update_refunds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales_metrics update_sales_metrics_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sales_metrics_timestamp BEFORE UPDATE ON public.sales_metrics FOR EACH ROW EXECUTE FUNCTION public.update_metrics_timestamp();


--
-- Name: shipments update_shipments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shopping_carts update_shopping_carts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON public.shopping_carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stores update_stores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_variants update_variants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.shopping_carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: discounts discounts_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: events events_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: events events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: addresses fk_addresses_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_addresses_user_id FOREIGN KEY (userid) REFERENCES public.profiles(id);


--
-- Name: categories_closure fk_categories_closure_ancestor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_closure
    ADD CONSTRAINT fk_categories_closure_ancestor FOREIGN KEY (id_ancestor) REFERENCES public.categories(id);


--
-- Name: categories_closure fk_categories_closure_descendant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_closure
    ADD CONSTRAINT fk_categories_closure_descendant FOREIGN KEY (id_descendant) REFERENCES public.categories(id);


--
-- Name: categories fk_categories_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT fk_categories_parent_id FOREIGN KEY (parentid) REFERENCES public.categories(id);


--
-- Name: product_categories fk_product_categories_category_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT fk_product_categories_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: product_categories fk_product_categories_product_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT fk_product_categories_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: gift_cards gift_cards_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_cards
    ADD CONSTRAINT gift_cards_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: order_discounts order_discounts_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discounts
    ADD CONSTRAINT order_discounts_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id);


--
-- Name: order_discounts order_discounts_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discounts
    ADD CONSTRAINT order_discounts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_views product_views_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_views product_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: products products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: shipments shipments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: shopping_carts Admins can view all carts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all carts" ON public.shopping_carts USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role)::text = 'admin'::text)))));


--
-- Name: products Allow admin full access to products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access to products" ON public.products TO authenticated USING (((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text));


--
-- Name: orders Allow admin to manage orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to manage orders" ON public.orders TO authenticated USING (((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text));


--
-- Name: user_addresses Allow modify own addresses or admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow modify own addresses or admin" ON public.user_addresses TO authenticated USING (((profile_id = auth.uid()) OR ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text))) WITH CHECK (((profile_id = auth.uid()) OR ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text)));


--
-- Name: products Allow public to view active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public to view active products" ON public.products FOR SELECT USING ((((status)::text = 'active'::text) AND (deleted_at IS NULL)));


--
-- Name: user_addresses Allow select own addresses or admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow select own addresses or admin" ON public.user_addresses FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text)));


--
-- Name: profiles Allow select own profile or admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow select own profile or admin" ON public.profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR ((( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))::text = 'admin'::text)));


--
-- Name: profiles Allow update own profile or admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update own profile or admin" ON public.profiles FOR UPDATE TO authenticated USING (((id = auth.uid()) OR ((( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))::text = 'admin'::text))) WITH CHECK (((id = auth.uid()) OR ((( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))::text = 'admin'::text)));


--
-- Name: orders Allow users to view own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to view own orders" ON public.orders FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))::text = 'admin'::text)));


--
-- Name: shopping_carts Store staff can view carts for their store; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store staff can view carts for their store" ON public.shopping_carts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (((profiles.role)::text = 'admin'::text) OR ((profiles.role)::text = 'store_manager'::text))))));


--
-- Name: shopping_carts Users can view their own carts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own carts" ON public.shopping_carts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: product_views analytics_read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analytics_read_policy ON public.product_views FOR SELECT USING (true);


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: cart_items cart_items_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_items_delete_policy ON public.cart_items FOR DELETE USING (true);


--
-- Name: cart_items cart_items_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_items_insert_policy ON public.cart_items FOR INSERT WITH CHECK (true);


--
-- Name: cart_items cart_items_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_items_select_policy ON public.cart_items FOR SELECT USING (true);


--
-- Name: cart_items cart_items_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_items_update_policy ON public.cart_items FOR UPDATE USING (true);


--
-- Name: product_views insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.product_views FOR INSERT WITH CHECK (true);


--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: product_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: shopping_carts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

--
-- Name: shopping_carts shopping_carts_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shopping_carts_delete_policy ON public.shopping_carts FOR DELETE USING (true);


--
-- Name: shopping_carts shopping_carts_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shopping_carts_insert_policy ON public.shopping_carts FOR INSERT WITH CHECK (true);


--
-- Name: shopping_carts shopping_carts_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shopping_carts_select_policy ON public.shopping_carts FOR SELECT USING (true);


--
-- Name: shopping_carts shopping_carts_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shopping_carts_update_policy ON public.shopping_carts FOR UPDATE USING (true);


--
-- Name: user_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

