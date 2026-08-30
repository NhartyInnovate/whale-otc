-- Migration: 003_create_order_events
-- Creates the order_events table for a permanent audit trail of order creation and status changes

CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('ORDER_CREATED', 'STATUS_CHANGED')),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast querying of order history
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(created_at);

-- Enable RLS (Service role only access)
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
