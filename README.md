# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/f4bfaef6-12d5-4eb4-8b06-07e0f8c4a717

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f4bfaef6-12d5-4eb4-8b06-07e0f8c4a717) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Running BabyBloom locally

1. Install dependencies
```bash
npm install
npm install --prefix server
```

2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env if needed (CORS, PORT)
```

3. Start client and server together
```bash
npm run dev:full
```

Client runs on `http://localhost:5173`, API server on `http://localhost:4000`.

### API endpoints (server)
- POST `/auth/register` { email, password }
- POST `/auth/login` { email, password }
- POST `/quiz/submit` (JWT required)
- GET `/milestones/:userId` (JWT required)
- POST `/milestones/:userId` (JWT required)
- POST `/milestones/:userId/photo/:id` (multipart, JWT required)
- GET `/milestones/:userId/export/pdf` (JWT required)
- GET `/tips/:userId` (JWT required)
- GET `/me`, PUT `/me/profile` (JWT required)

### Styling & UX
- Mobile-first, soft pastels (blush pink #F8D7DA, sage green #D4E4BC, light blue #E0F2FE)
- Bottom nav on mobile: Home, Appts, Shop, Social, Premium
- Animations via Framer Motion
