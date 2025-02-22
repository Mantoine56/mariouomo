-- Function to check active database connections and pool status
CREATE OR REPLACE FUNCTION check_connection_status()
RETURNS TABLE (
    pid int,
    username text,
    database text,
    client_addr inet,
    connection_state text,
    query text
) AS $$
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
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM check_connection_status();

-- Query to check connection counts by state
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;
