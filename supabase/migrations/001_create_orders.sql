-- 001_create_orders.sql

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT UNIQUE NOT NULL,
  side TEXT NOT NULL,
  asset TEXT NOT NULL,
  input_amount NUMERIC NOT NULL,
  input_currency TEXT NOT NULL,
  output_amount NUMERIC NOT NULL,
  output_currency TEXT NOT NULL,
  customer_rate NUMERIC NOT NULL,
  market_price NUMERIC NOT NULL,
  market_side TEXT NOT NULL,
  ngn_reference_rate NUMERIC NOT NULL,
  margin_percent NUMERIC NOT NULL,
  percentage_margin_value NUMERIC NOT NULL,
  minimum_service_usd NUMERIC NOT NULL,
  minimum_service_value_ngn NUMERIC NOT NULL,
  minimum_service_applied BOOLEAN NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  wallet_address TEXT,
  wallet_network TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  status TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  quote_generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS and deny access to all anonymous users.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- No policies are created for anon users, meaning they cannot select, insert, update, or delete.
-- Only the service_role key used server-side will be able to perform these actions.
