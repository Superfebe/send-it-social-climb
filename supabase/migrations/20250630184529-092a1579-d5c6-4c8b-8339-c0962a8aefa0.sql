
-- Add missing columns to routes table for OpenBeta integration
ALTER TABLE public.routes 
ADD COLUMN source TEXT,
ADD COLUMN external_id TEXT,
ADD COLUMN last_synced TIMESTAMP WITH TIME ZONE;

-- Create index for external_id for efficient lookups
CREATE INDEX idx_routes_external_id ON public.routes(external_id);
CREATE INDEX idx_routes_source ON public.routes(source);
