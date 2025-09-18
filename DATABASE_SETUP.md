# 🗄️ Database Setup Guide

This guide will walk you through setting up your PostgreSQL database with Vercel and Prisma.

## Step 1: Create a Vercel Project

1. **Deploy to Vercel** (if you haven't already):
   ```bash
   npx vercel
   ```
   
2. **Link your local project**:
   ```bash
   vercel link
   ```

## Step 2: Add a PostgreSQL Database

1. **Go to your Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (darrwin)
3. **Go to the Storage tab**
4. **Click "Create Database"**
5. **Select "Postgres"**
6. **Choose a name** (e.g., "darrwin-db")
7. **Select a region** (choose closest to your users)
8. **Click "Create"**

## Step 3: Environment Variables

After creating the database, Vercel will automatically add these environment variables to your project:

- `POSTGRES_PRISMA_URL` - For connection pooling (recommended for serverless)
- `POSTGRES_URL_NON_POOLING` - Direct connection for migrations

## Step 4: Pull Environment Variables Locally

```bash
vercel env pull .env.local
```

This command downloads the database URLs from Vercel to your local environment.

## Step 5: Generate Prisma Client and Run Migrations

```bash
# Install dependencies (if you haven't already)
npm install

# Generate the Prisma client
npx prisma generate

# Push the schema to your database (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

## Step 6: Test the Setup

```bash
# Start your development server
npm run dev

# Visit http://localhost:3000/patients
# Try adding a new patient to test the database connection
```

## Troubleshooting

### If you get connection errors:

1. **Check your environment variables**:
   ```bash
   cat .env.local
   ```

2. **Verify database connection**:
   ```bash
   npx prisma db pull
   ```

3. **Reset database if needed**:
   ```bash
   npx prisma db push --force-reset
   ```

### If Prisma client is not found:

```bash
npx prisma generate
```

## Database Schema Overview

Your database includes these tables:

- **patients** - Pet information and owner details
- **appointments** - Scheduled visits
- **sessions** - Completed visits with notes and treatments

The schema supports:
- ✅ Patient profiles with medical history
- ✅ Appointment scheduling
- ✅ Session notes and treatments
- ✅ File attachments (for future scan results)
- ✅ Cascading deletes (safe data relationships)

## Next Steps

Once your database is set up:
1. Test creating patients through the UI
2. Add appointment scheduling
3. Implement session tracking
4. Add file upload for scan results
