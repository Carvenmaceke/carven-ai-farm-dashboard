# AI FARM local HTTPS troubleshooting

The normal development URL is:
- `https://localhost:5226/auth.html`
- `https://localhost:5226/swagger`

If Windows/antivirus/proxy software allows TCP port 5226 but the HTTPS/TLS request times out, use the included HTTP fallback profile. This is a local-development fallback only.

From `backend` run:

```powershell
dotnet run --launch-profile http-fallback
```

Then open:

- `http://localhost:5227/auth.html`
- `http://localhost:5227/swagger`
- `http://localhost:5227/api/health`

The frontend detects its own localhost origin, so when served from the fallback it calls the API on the same HTTP origin. No frontend URL editing is required.

For normal HTTPS, run:

```powershell
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

Then restart Visual Studio and use the `https` launch profile.
