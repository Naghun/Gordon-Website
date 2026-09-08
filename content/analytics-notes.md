# First-party analytics — local implementation

Dashboard: http://127.0.0.1:8011/admin/analytics/ (requires an authenticated staff user with website.view_analyticsvisit).

- Explicit opt-in; withdrawal via Postavke statistike. DNT/GPC disables collection.
- Anonymous tab session identifier, not a count of unique people; no names, form values, full URLs, query strings or stored raw IPs.
- Page views, active-time heartbeat every 15 seconds, clicks on links/buttons, contact form visibility/start/submit attempt/server-success/server-error.
- Active time stops on hidden tabs and after 60 seconds without interaction; an estimate, not exact attention. Short visits can register zero seconds.
- Live means activity within 45 seconds; dashboard refreshes every 15 seconds.
- Sources from UTM source or referring hostname. Campaign = utm_campaign; placement = utm_content (must be supplied in campaign links, not discovered automatically).
- Mobile/tablet/desktop is an approximate browser classification.
- Form funnel counts sessions per independent step, not filled field contents or submitted lead identity.
- Data retained 30 days with cleanup on ingestion. No historical backfill. Existing Google integrations remain separate.
- GEOIP_PATH must point to a local GeoLite2-City.mmdb/compatible database and Python geoip2 must be installed to enable approximate country/city. No third-party IP lookup is sent. This database is not supplied yet; unknown locations are explicit. Before production verify REMOTE_ADDR is the real client address through the host's trusted proxy configuration; never trust arbitrary forwarded headers.
- Before live deployment: install GeoIP dependency/database if desired, review privacy notice, run migrations, collectstatic, import reviewed batches and media, deploy frontend. No live deployment performed in this task.
- Current cache rate limiter is process-local with default Django cache; use a shared cache for multi-worker production traffic. Origin checks reduce browser abuse, not automated spoofing; browser analytics are not an audit ledger.
- No session replay, heatmap or precise GPS. No claim of tracking every visitor; consent refusal and blockers result in missing data.

Verification: six isolated Django tests; browser consent/withdrawal and form-data privacy checks; six article APIs, galleries and unique slugs; three new article H1 checks; frontend build generates 21 crawler-visible documents.
