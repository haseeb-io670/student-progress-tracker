# BaliTech React Website

A modern React website with proper routing and a careers page featuring job listings, application form, and admin panel for managing job postings, applications, and contact form submissions.

## Features

- Modern responsive design with Framer Motion animations
- React Router for multi-page navigation
- Careers page with job listings and application form
- Admin panel for managing:
  - Job postings (create, edit, delete)
  - Job applications (view, update status)
  - Contact form submissions (view, update status)

## Tech Stack

- Frontend:
  - React 18
  - React Router v7
  - Tailwind CSS
  - Framer Motion
  - React Icons

- Backend:
  - Express
  - MongoDB
  - Mongoose
  - Multer (file uploads)

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB installed locally or a MongoDB Atlas account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/balitech-react.git
cd balitech-react
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/balitech
NODE_ENV=development
```

4. Create an uploads folder in the root directory
```bash
mkdir uploads
```

### Running the application

#### Development

Run frontend and backend concurrently:
```bash
npm run dev:full
```

Or separately:
```bash
# Frontend only
npm run dev

# Backend only
npm run server
```

#### Production

Build the frontend:
```bash
npm run build
```

Start the server (which also serves the frontend):
```bash
NODE_ENV=production npm run server
```

## Routes

- `/` - Home page
- `/about` - About page
- `/services` - Services page
- `/contact` - Contact page
- `/faq` - FAQ page
- `/careers` - Careers page
- `/admin` - Admin dashboard (add authentication in a real application)

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all active job listings
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/job/:jobId` - Get applications for a specific job
- `POST /api/applications` - Submit a new application
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete an application

### Contacts
- `GET /api/contacts` - Get all contact form submissions
- `POST /api/contacts` - Submit a new contact form
- `PUT /api/contacts/:id/status` - Update contact status
- `DELETE /api/contacts/:id` - Delete a contact submission

## Important Notes for Production

1. Add authentication to the admin routes (using JWT or similar)
2. Configure proper MongoDB security (authentication, network rules)
3. Set up file upload to cloud storage (like AWS S3) instead of local storage
4. Implement CSRF protection
5. Set secure HTTP headers 