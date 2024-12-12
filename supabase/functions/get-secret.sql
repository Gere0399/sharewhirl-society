CREATE OR REPLACE FUNCTION public.get_secret(secret_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Directly return the raw value from the secrets table
  RETURN (SELECT value FROM secrets WHERE name = secret_name);
END;
$$;