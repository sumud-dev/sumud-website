## 🧩 Core Features & Architecture

### Database & ORM
- **PostgreSQL** is the main database. Use Drizzle ORM for type-safe access and migrations.
- **Schema**: See `src/lib/db/schema/` for campaigns, posts, events, and translations.
- **Client**: See `src/lib/db/index.ts` for DB initialization.
- **Migrations**: Run with `npm run db:migrate`.

#### Run Postgres with Docker
Quick local setup:
```bash
docker run --name sumud-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sumud -p 5432:5432 -d postgres:15
```
Set your `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sumud
```

### State Management
- Uses **@tanstack/react-query** for client-side state, caching, and fetching (see `src/lib/hooks/`).
- No Redux/Zustand; state is managed via hooks and React Query.

### Server Actions
- All data access/mutations use **Next.js Server Actions** in `src/actions/` (e.g., `events.actions.ts`).
- Prefer these over direct API routes.

### Content & Static Data
- Static content uses a **locale-first structure** in `content/{locale}/pages/` and `content/{locale}/navigation/`
- UI translations in `messages/{locale}.json`
- See [Content Management Guide](./docs/CONTENT_MANAGEMENT.md) for details
- Content utilities in `src/lib/content/`

### Media & Cloudinary
- Image uploads use Cloudinary (see `.env` for config).

### Auth
- **Clerk** for authentication (see `.env`).

### Scripts
- Migration/seeding scripts in `scripts/` (run with `npx ts-node ...`).

---

# Sumud Website — Local Development & Setup

Welcome! This project is built with [Next.js](https://nextjs.org) and uses Drizzle ORM, PostgreSQL, Clerk, Cloudinary, and more.

---

## 🚀 Quick Start

1. **Clone the repository:**
	```bash
	git clone <repo-url>
	cd sumud-official
	```

2. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	# or
	pnpm install
	# or
	bun install
	```

3. **Copy and configure environment variables:**
	- Copy `.env.example` to `.env` and fill in the required values (see below for details).
	```bash
	cp .env.example .env
	```

4. **Run the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	# or
	pnpm dev
	# or
	bun dev
	```
	The app will be available at [http://localhost:3001](http://localhost:3001).

---

## ⚙️ Environment Variables

Edit your `.env` file with the following (see `.env.example` for all options):
- `DATABASE_URL` (PostgreSQL connection string)
- `DEEPL_API_KEY` (for translations)
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (for image uploads)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (for authentication)

---

## 🗄️ Database & Migrations

This project uses **Drizzle ORM** with PostgreSQL.

- **Configure your database** in `.env` as above.
- **Run migrations:**
  ```bash
  npm run db:migrate
  ```
- **Drizzle Studio (optional):**
  ```bash
  npm run db:studio
  ```
- **Seed data or run migration scripts:**
  See the `scripts/` folder for available migration and seeding scripts. Example:
  ```bash
  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-events.ts
  ```

---

## 📁 Project Structure

- `src/` — Main application code (components, lib, types, actions, etc.)
- `content/` — Static content in JSON (navigation, pages, etc.)
- `drizzle/` — Database migrations
- `scripts/` — Data migration and seeding scripts
- `public/` — Static assets (images, etc.)

---

## 🛠️ Useful Commands

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run db:migrate` — Run database migrations
- `npm run db:studio` — Open Drizzle Studio
- `npm run lint` — Run ESLint

---

## 🐞 Troubleshooting

- **Port in use?** The app runs on port 3001 by default. Change it in `package.json` if needed.
- **Database errors?** Check your `DATABASE_URL` and ensure PostgreSQL is running and accessible.
- **Missing env vars?** Double-check your `.env` file.

---

## 🤝 Contributing & Contact

- Please follow the existing code style and structure.
- For questions, contact the project maintainer or open an issue.

---

## 📚 References
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](./DRIZZLE_GUIDE.md)
- [Content Management Guide](./docs/CONTENT_MANAGEMENT.md)
- [Content Schema Documentation](./docs/CONTENT_SCHEMA.md)
- [Localization Migration Plan](./docs/localizing-content.md)
- [Project Structure & Scripts](#project-structure)

---

Happy coding! ✨