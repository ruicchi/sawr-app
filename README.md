# SaWrap

The customer storefront and admin portal now use the same Supabase backend.
Their source apps live in `sawrap-project/sawrap-ecommerce` and
`sawrap-project/sawrap-admin-portal`. The original `sawrap-project/combined`
directory is a legacy static build from the supplied ZIP and should not be
deployed.

See [the backend implementation and release guide](docs/BACKEND_IMPLEMENTATION.md)
for current status, local commands, database design, deployment roots, and
remaining setup. The [original code audit](docs/SUPABASE_BACKEND_GUIDE.md)
records problems found in the supplied ZIP.
