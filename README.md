# AI FARM - Fixed Application

## Recommended startup
1. Open `backend`.
2. Run `START-AI-FARM.ps1` in PowerShell.
3. Open `https://localhost:5226/auth.html`.
4. After login, use **Farm Structure** in the sidebar to add Greenhouses and Growing Zones.

The frontend is also kept in the `frontend` folder for editing. The same frontend is copied into `backend/wwwroot` so the ASP.NET API can serve it over HTTPS on the same origin.

If HTTPS is not trusted, run `backend/TRUST-HTTPS-CERTIFICATE.ps1` once.


## Security and password reset

See `SECURITY-AND-PASSWORD-RESET.md` for the RBAC rules, security controls, Forgot Password flow, SMTP setup and database migration.


## Roles and what each one sees

Each person sees only the tabs and data their role allows. The dashboard hides everything else, and the API refuses those requests too (HTTP 403), so access can't be bypassed from the browser.

| Area | Owner | Manager | Agronomist | Technician | Worker |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard, Help, Settings, clock in/out | ✓ | ✓ | ✓ | ✓ | ✓ |
| Farms & Fields, Farm Structure | manage | manage | view | view | view |
| Crop Lifecycle | manage | manage | manage | — | view |
| Livestock | manage | manage | — | — | view |
| Inventory & Procurement | manage | manage | view | view | — |
| Operating costs (finance) | ✓ | ✓ | — | — | — |
| Tasks & Workforce | manage | manage | view | view | view |
| Reports | approve | approve | review + recommend | submit own | submit own |
| Users & Roles, team shift history | ✓ | ✓ | — | — | — |
| Edit role permissions, delete zones | ✓ | — | — | — | — |

The defaults live in `backend/Data/RbacSeeder.cs`. The Owner can also change any role's permissions from **Users & Roles**. People pick up permission changes the next time they sign in.

After updating to this version, everyone must sign out and sign back in so their session includes the new permissions.
