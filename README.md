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
