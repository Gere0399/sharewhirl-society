CREATE OR REPLACE FUNCTION deduct_credits(
  amount INTEGER,
  user_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE credits
  SET amount = amount - amount
  WHERE user_id = user_id
  AND amount >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
END;
$$ LANGUAGE plpgsql;