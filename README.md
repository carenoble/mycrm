# CRM Lead Tracker

A comprehensive Lead Tracker CRM system designed specifically for business brokers specializing in the sales of care homes and care agencies in the UK.

## Features

- **User Authentication** - Secure login/registration system
- **Client Management** - Track care home and care agency clients with detailed information
- **Buyer Management** - Manage potential buyers and their requirements
- **Process Tracking** - Monitor deal progress for each client
- **Custom Alerts & To-dos** - Create custom alerts and tasks with due dates
- **Image Upload** - Upload and manage screenshots and images for each client
- **File Management** - Attach files with shareable private links
- **Dashboard** - Overview of all activities and key metrics

## Technologies Used

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL/MySQL/SQLite with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **File Storage**: Local filesystem (can be easily extended to cloud storage)
- **UI Components**: Lucide React icons, React Hook Form, Zod validation

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd crm-lead-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Time Setup

1. Register a new account at `/register`
2. Login with your credentials
3. Start adding clients, buyers, and managing your leads!

## Project Structure

```
crm-lead-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── clients/           # Client management pages
│   ├── buyers/            # Buyer management pages
│   ├── alerts/            # Alerts & to-dos page
│   ├── files/             # File management page
│   └── dashboard/         # Dashboard page
├── components/            # Reusable components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static files
```

## Database Schema

The application uses Prisma ORM with the following main entities:

- **Users** - System users (brokers)
- **Clients** - Care homes and care agencies for sale
- **Buyers** - Potential purchasers
- **ClientBuyer** - Many-to-many relationship tracking buyer interest
- **Processes** - Deal progress tracking
- **Alerts** - Custom alerts and to-dos
- **Images** - Uploaded images linked to clients
- **Files** - Document attachments with shareable links

## Key Features

### Client Management
- Add care homes and care agencies
- Track asking prices, contact information, and status
- Upload images and documents
- Monitor deal processes

### Buyer Management
- Maintain buyer database with budgets and requirements
- Link buyers to interested properties
- Track interaction history

### Alerts & To-dos
- Create custom alerts with due dates
- Mark tasks as complete
- Filter by urgency and status

### File Sharing
- Upload files and images
- Generate shareable private links
- Organize by client/buyer

## Environment Variables

The following environment variables are used:

```env
# For SQLite (local development)
DATABASE_URL="file:./dev.db"

# For PostgreSQL (production)
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# For MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/dbname"

JWT_SECRET="your-secret-key-here"
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions, including Netlify setup and database configuration.

### Quick Deployment Configuration

1. **Database Setup**:
   - Choose your database provider (PostgreSQL, MySQL, or SQLite)
   - Create a database instance
   - Update the DATABASE_URL in your environment variables

2. **Environment Variables** (set in your deployment platform):
   ```env
   DATABASE_URL="your-database-connection-string"
   JWT_SECRET="your-secure-secret-key"
   NODE_ENV="production"
   ```

3. **Database Migration**:
   - Run migrations: `npx prisma migrate deploy`
   - Or generate schema: `npx prisma db push`

4. **Build Process**:
   - The build automatically runs `prisma generate` before building
   - Prisma Client is generated fresh on each deploy

### Platform-Specific Deployment

For other platforms:

1. Use a production database (PostgreSQL recommended)
2. Set up cloud storage for file uploads (AWS S3, etc.)
3. Configure proper environment variables
4. Run database migrations: `npx prisma migrate deploy`
5. Set up SSL certificates
6. Consider using a CDN for static assets

## Contributing

This is a custom CRM solution. For modifications or enhancements, please follow standard React/Next.js development practices.

## License

This project is proprietary software designed for business broker use.
