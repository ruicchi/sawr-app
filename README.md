# SaWrap

The files from `sawrap-project.zip` are in [`sawrap-project/`](sawrap-project/).
The folder contains the storefront source, the admin portal source, and a
ready-to-serve `combined` build.

## Run the included build

Install Node.js, then run these commands from the repository root:

```powershell
cd sawrap-project
npx serve combined -l 3000
```

Open `http://localhost:3000` for the storefront and
`http://localhost:3000/admin` for the admin portal.

The archive's `node_modules` directories are omitted from Git. To work on
either source project, run `npm ci` in its directory. The included
`serve-local.sh` rebuilds both projects and serves them on port 3000 in a
Bash environment.

This project uses browser storage and includes demo admin credentials in its
client-side source. Do not use its authentication as production security.

For the code audit and proposed Supabase architecture, see the
[Supabase backend guide](docs/SUPABASE_BACKEND_GUIDE.md).
