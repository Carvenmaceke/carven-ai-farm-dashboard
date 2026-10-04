# AI FARM - Fixed build setup

This package keeps the existing UI and backend architecture, but fixes the
frontend/backend connection path for farm structure and adds a clear database
setup path.

## What was fixed

- Greenhouse list now loads from `GET /api/Greenhouse`.
- Zone list now loads from `GET /api/Zone`.
- Owner/Manager can create Greenhouses from the dashboard.
- Owner/Manager can create Zones from the dashboard and select a real Greenhouse.
- All Greenhouse/Zone data is stored through the ASP.NET API and SQL Server,
  rather than only in browser memory.
- Frontend connection failures now show a more useful error.
- Backend startup now gives a clear database-schema error instead of silently
  leaving the browser with a generic connection message.
- HTTPS remains the normal development mode at `https://localhost:5226`.
- An HTTP fallback profile is included at `http://localhost:5227` for Windows machines where the local TLS handshake times out.
- Existing JWT/RBAC and farm-scoping rules are preserved.

## Important: one-time database setup

The uploaded project did not contain generated EF Core migration files. The
current model includes RBAC, Shifts and FieldReports, so an old database can
prevent the API from starting.

### Recommended for this development project

1. Open the `backend` folder in a terminal.
2. Run:

```powershell
.\RESET-DEV-DATABASE-AND-RUN.ps1
```

3. Type `RESET` when asked.
4. The script will:
   - delete the old local `FarmManagementDB`
   - generate a fresh `InitialCreate` migration
   - apply the migration
   - start the API using HTTPS on port 5226
5. Open:

`https://localhost:5226/swagger`

6. Register a new Owner account.

**The reset deletes development/test data. Do not use it against a database
containing real data.**

### Manual alternative

From `backend`:

```powershell
dotnet ef database drop --force
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run --launch-profile https
```

If the browser reports an HTTPS certificate error, trust the development
certificate:

```powershell
dotnet dev-certs https --trust
```

## Testing the fixed dashboard

1. Start the backend and confirm Swagger opens.
2. Open `https://localhost:5226/auth.html` while the HTTPS profile is running. If HTTPS times out, run `dotnet run --launch-profile http-fallback` and open `http://localhost:5227/auth.html`.
3. Sign in as Owner.
4. Open **Farms & Fields**.
5. Add a Greenhouse.
6. Confirm it appears in the Greenhouses table.
7. Add a Zone and select that Greenhouse.
8. Refresh the page. The Greenhouse and Zone should still exist because they
   are stored in SQL Server.

## Remaining project work

Crop Lifecycle, Livestock, Inventory and Tasks still contain local/demo data
until their corresponding backend models/controllers are implemented. They
were not falsely marked as database-connected in this fix.
