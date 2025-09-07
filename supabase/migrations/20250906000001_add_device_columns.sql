-- Add device detection columns to url_clicks table
-- These will store parsed information from the user_agent string

ALTER TABLE public.url_clicks 
ADD COLUMN device_type TEXT,    -- Will store: Mobile, Desktop, Tablet, Unknown
ADD COLUMN browser TEXT,        -- Will store: Chrome, Firefox, Safari, Edge, etc.
ADD COLUMN os TEXT;             -- Will store: Windows, Mac, iOS, Android, Linux, etc.

-- Create indexes for faster analytics queries
-- An index is like a "table of contents" for your database
-- Without indexes, finding data is like searching every page of a book
-- With indexes, it's like jumping to the right chapter immediately

CREATE INDEX idx_url_clicks_device_type ON public.url_clicks(device_type);
CREATE INDEX idx_url_clicks_browser ON public.url_clicks(browser);
CREATE INDEX idx_url_clicks_country ON public.url_clicks(country);

-- Create a helpful view for analytics
-- A VIEW is like a "saved query" that looks like a table
-- Instead of writing complex queries each time, we can just SELECT from this view

CREATE OR REPLACE VIEW url_analytics AS
SELECT 
  -- Basic URL information
  u.id as url_id,
  u.short_code,
  u.original_url,
  u.user_id,
  
  -- Click counts (using COUNT to aggregate data)
  COUNT(uc.id) as total_clicks,
  COUNT(DISTINCT uc.ip_address) as unique_visitors,
  
  -- Time-based counts (using conditional counting)
  -- CASE WHEN is like an "if statement" in SQL
  COUNT(CASE 
    WHEN uc.clicked_at >= NOW() - INTERVAL '24 hours' 
    THEN 1 
    END) as clicks_today,
  COUNT(CASE 
    WHEN uc.clicked_at >= NOW() - INTERVAL '7 days' 
    THEN 1 
    END) as clicks_week,
  COUNT(CASE 
    WHEN uc.clicked_at >= NOW() - INTERVAL '30 days' 
    THEN 1 
    END) as clicks_month,
  
  -- Most recent click
  MAX(uc.clicked_at) as last_clicked

FROM urls u
-- LEFT JOIN means "include all URLs, even if they have 0 clicks"
-- Regular JOIN would only include URLs that have at least 1 click
LEFT JOIN url_clicks uc ON u.id = uc.url_id
-- GROUP BY combines rows with the same URL into summary statistics
GROUP BY u.id, u.short_code, u.original_url, u.user_id;

-- Give authenticated users permission to read from this view
GRANT SELECT ON url_analytics TO authenticated;
