# Prowider Mini Lead Distribution System

A production-ready Full Stack Monorepo for lead distribution and management.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (via Prisma ORM)
- **Auth**: JWT-based authentication

## Project Structure

```
prowider-system/
├── frontend/          # Next.js frontend application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── ...
├── backend/          # Express.js backend API
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── services/   # Business logic
│   │   ├── routes/    # API routes
│   │   ├── middleware/ # Express middleware
│   │   └── utils/     # Utility functions
│   ├── prisma/      # Prisma schema
│   └── ...
└── shared/           # Shared TypeScript types
    └── types.ts     # Common interfaces
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory

2. Install all dependencies:
```bash
npm run install:all
```

### Environment Setup

#### Backend
Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mongodb://localhost:27017/prowider_lead_db"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

#### Frontend
Create a `.env.local` file in the `frontend` directory (copy from `.env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Database Setup

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Running the Application

#### Development Mode

Run both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

#### Production Build

Build for production:

```bash
npm run build
```

## Deployment

### Deploy with Render (Backend) + Vercel (Frontend)

#### Step 1: Set up MongoDB Atlas

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user with username/password
4. Get the connection string (replace `<password>` with your password)
5. Whitelist IP addresses (use 0.0.0.0/0 for Render)

#### Step 2: Deploy Backend to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the `prowider-system/backend` directory as Root Directory
6. Configure:
   - **Name**: prowider-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
7. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong secret key
   - `JWT_EXPIRE`: `7d`
   - `FRONTEND_URL`: Your Vercel frontend URL (add after Step 3)
8. Click "Deploy Web Service"
9. Wait for deployment and note the backend URL (e.g., `https://prowider-backend.onrender.com`)

#### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL from Step 2
6. Click "Deploy"
7. Wait for deployment and note the frontend URL

#### Step 4: Update Backend FRONTEND_URL

1. Go back to your Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel frontend URL
5. Save changes (this will trigger a redeploy)

#### Step 5: Run Prisma Migrations

After the backend is deployed, you need to set up the database schema:

1. Go to Render dashboard → Backend service
2. Click "Shell" in the top right
3. Run:
   ```bash
   cd /opt/render/project/src
   npx prisma generate
   npx prisma db push
   ```

#### Step 6: Test the Deployment

1. Visit your Vercel frontend URL
2. Try registering a new user
3. Check if the application connects to the backend correctly

### Alternative Deployment Options

For other deployment platforms, see the deployment section above.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Leads
- `GET /api/leads` - Get all leads (with optional filters)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create a new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Data Models

### User
- `id`: string (ObjectId)
- `email`: string (unique)
- `password`: string (hashed)
- `name`: string
- `role`: ADMIN | MANAGER | AGENT
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Lead
- `id`: string (ObjectId)
- `name`: string
- `email`: string
- `phone`: string
- `status`: NEW | CONTACTED | QUALIFIED | PROPOSAL | WON | LOST
- `source`: string (optional)
- `assignedTo`: string (ObjectId, optional)
- `createdBy`: string (ObjectId)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Default Credentials

After setting up the database, register a new user through the registration endpoint or use the API to create an admin user.

## Development

### Prisma Studio

Open Prisma Studio to view and edit database data:

```bash
npm run prisma:studio
```

## License

ISC
