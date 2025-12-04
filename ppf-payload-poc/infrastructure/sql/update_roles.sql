-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ppf-portal-plcms-test-ca-id') THEN
--         CREATE ROLE app_users;
--     END IF;
-- END

-- WHERE rolname = 'ppf-portal-plcms-test-ca-id';

-- -- 1. Create the role
-- CREATE ROLE app_users;

-- -- 2. Grant USAGE on the public schema
-- GRANT USAGE ON SCHEMA public TO app_users;

-- -- 3. Grant SELECT, INSERT, UPDATE, DELETE on all existing tables in the public schema
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_users;

-- -- 4. Grant SELECT, INSERT, UPDATE, DELETE on all future tables in the public schema
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_users;

-- -- 5. Grant the role to the user
-- GRANT app_users TO "ppf-portal-plcms-test-ca-id";


-- -- SINCE THE ROLE EXISTS
-- The role should already exist but if it doesn't we add it


IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ppf-portal-plcms-test-ca-id') THEN
    CREATE ROLE 'ppf-portal-plcms-test-ca-id';
END IF;


-- 2. Grant USAGE on the public schema
GRANT USAGE ON SCHEMA public TO 'ppf-portal-plcms-test-ca-id';

-- 3. Grant SELECT, INSERT, UPDATE, DELETE on all existing tables in the public schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO 'ppf-portal-plcms-test-ca-id';

-- 4. Grant SELECT, INSERT, UPDATE, DELETE on all future tables in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO 'ppf-portal-plcms-test-ca-id';

SELECT * FROM pg_roles WHERE rolname = 'ppf-portal-plcms-test-ca-id';

-- Same as above
DECLARE role_name TEXT := :'role_name';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('CREATE ROLE %I', role_name);
    END IF;
END

-- Grant USAGE on the public schema
EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', role_name);

-- Grant SELECT, INSERT, UPDATE, DELETE on all existing tables
EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', role_name);

-- Grant the same privileges for future tables
EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', role_name);

SELECT * FROM pg_roles WHERE rolname = :role_name;