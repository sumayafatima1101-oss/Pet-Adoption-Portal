# Mimme's Patal Paws 🐾

A beginner-friendly pet adoption portal built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js and Supabase (PostgreSQL).

## Features

- Responsive pastel-pink pet listing
- Search by pet name, breed, or description
- Filter by species and adoption status
- Adoption request form with browser and backend validation
- Supabase storage for pets and adoption requests
- Admin-key-protected request listing, status updates and deletion
- Sample pet cards work before the backend is connected

## Folder structure

```text
mimme-patal-paws/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── .env
│   └── package.json
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18 or later
- A Supabase account
- A code editor such as VS Code
- A browser

## 1. Set up Supabase

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and create a new query.
3. Copy all of `database/schema.sql` into the editor and run it.
4. In **Project Settings → API**, copy the project URL and the **service_role** key.
5. Keep the service-role key private. Never add it to frontend JavaScript, screenshots, public repositories, or chat.

## 2. Configure the backend

Open a terminal in the project folder and run:

```bash
cd backend
npm install
```

Edit `backend/.env` and replace the placeholder values:

- `SUPABASE_URL`: your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: your private service-role key
- `ADMIN_API_KEY`: choose a long, unique random secret
- `FRONTEND_ORIGIN`: the local origin used by your frontend

Do not commit `backend/.env` to GitHub.

## 3. Start the API

From the `backend` directory:

```bash
npm run dev
```

Or run:

```bash
npm start
```

Open `http://localhost:3000/api/health`. A successful response looks like:

```json
{"ok":true,"service":"Mimme's Patal Paws API"}
```

Try `http://localhost:3000/api/pets` to confirm that sample database pets load.

## 4. Open the frontend

Use the VS Code **Live Server** extension and open `frontend/index.html` with Live Server. Its default address is usually `http://127.0.0.1:5500`.

If you use a different frontend port, update `FRONTEND_ORIGIN` in `backend/.env` and restart the backend. The frontend uses sample cards automatically if the API is unavailable; adoption requests are not saved in demo mode.

## API endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | Public |
| GET | `/api/pets` | Public |
| GET | `/api/pets/:id` | Public |
| POST | `/api/adoption-requests` | Public, validated |
| GET | `/api/adoption-requests` | Requires `x-admin-key` |
| PATCH | `/api/adoption-requests/:id` | Requires `x-admin-key` |
| DELETE | `/api/adoption-requests/:id` | Requires `x-admin-key` |

For the local admin panel, expand **Project admin · Manage adoption requests** on the website and enter the same `ADMIN_API_KEY` configured in the backend. The key is held in page memory only and is not saved in local storage.

## Important security notes

- This is a college/demo project, not a production adoption service.
- The service-role key bypasses Row Level Security, so it must only be used on the backend.
- Admin-key authentication is a simple demo safeguard, not a replacement for a production authentication system. Do not deploy the admin endpoints publicly without stronger authentication, rate limiting, and auditing.
- Do not collect or store real applicants' personal data unless you have a proper privacy and security plan.
- Never commit `.env` or secret keys.

## Quick test checklist

- [ ] `/api/health` returns `ok: true`
- [ ] `/api/pets` returns pets from Supabase
- [ ] Search and species/status filters work
- [ ] Invalid form data is rejected
- [ ] A valid adoption request appears in Supabase
- [ ] Admin request list requires the correct key
- [ ] Admin can update request status and delete a request
- [ ] Layout works on mobile and desktop
- [ ] `.env` is excluded from Git

## GitHub submission

From the project root:

```bash
git init
git add .
git status
git commit -m "Build Mimme's Patal Paws pet adoption portal"
```

Create an empty repository on GitHub, then follow GitHub's instructions to add the remote and push. Verify that `backend/.env` is not included in the commit.
