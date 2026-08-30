-- Migration: 002_create_notification_events
-- Creates the notification_events table to track email and whatsapp delivery statuses

CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    recipient TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('operator_new_order', 'customer_order_confirmation')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying by order_id
CREATE INDEX IF NOT EXISTS idx_notification_events_order_id ON public.notification_events(order_id);

-- Enforce idempotency: We only want ONE notification per order per event per recipient
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_events_idempotency 
ON public.notification_events(order_id, event_type, recipient, channel);

-- Enable RLS (Service role only access)
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
