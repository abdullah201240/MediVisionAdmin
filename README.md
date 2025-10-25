# MediVision Admin Portal

Modern admin dashboard for managing the MediVision medicine management system.

## Features

- 🔐 **Secure Authentication** - Admin-only login with JWT tokens
- 💊 **Medicine Management** - Full CRUD operations for medicines
- 👥 **User Management** - View and manage user accounts
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 🎨 **Modern UI** - Built with shadcn/ui components
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **API Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:3000`
- Admin account created in the database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Default Admin Login

Use the credentials created via the backend seed script:
```
Email: admin@medivision.com
Password: admin123
```

## Project Structure

```
admin/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home
│   │   ├── medicines/           # Medicine management
│   │   └── users/               # User management
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root redirect
├── components/
│   └── ui/                      # shadcn/ui components
├── context/
│   └── auth-context.tsx         # Authentication context
├── hooks/
│   └── use-toast.ts             # Toast notifications
├── lib/
│   ├── api.ts                   # API client
│   └── utils.ts                 # Utility functions
└── .env.local                   # Environment variables
```

## Available Pages

- `/login` - Admin login page
- `/dashboard` - Main dashboard with statistics
- `/dashboard/medicines` - Medicine management (CRUD)
- `/dashboard/users` - User management and viewing

## API Integration

The admin portal connects to the NestJS backend API:

### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Logout
- `GET /users/profile` - Get current user profile

### Medicines
- `GET /medicines` - List all medicines
- `POST /medicines` - Create medicine (admin only)
- `PATCH /medicines/:id` - Update medicine (admin only)
- `DELETE /medicines/:id` - Delete medicine (admin only)

### Users
- `GET /users` - List all users (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## Features Breakdown

### Dashboard
- Real-time statistics (total medicines, users, etc.)
- Quick action cards
- System status indicators

### Medicine Management
- Search and filter medicines
- Create new medicines with full details
- Edit existing medicine information
- Delete medicines
- Image upload support (ready for integration)

### User Management
- View all registered users
- Filter by role (admin/user)
- Delete user accounts
- User statistics

### Authentication
- Secure admin-only access
- JWT token-based authentication
- HTTP-only cookie storage
- Auto-redirect for unauthorized access

## Development

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Security Features

- Admin role verification on login
- Protected routes with authentication checks
- HTTP-only cookies for token storage
- CORS configuration with backend
- XSS protection via React

## Customization

### Theme Colors
Edit `app/globals.css` to customize the color scheme:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... more colors */
}
```

### API URL
Change the API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Troubleshooting

### CORS Issues
Ensure the backend `.env` includes:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Authentication Failed
1. Verify admin account exists in database
2. Check backend is running on correct port
3. Clear browser cookies and try again

### Connection Refused
- Ensure backend server is running
- Check `NEXT_PUBLIC_API_URL` matches backend port

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow shadcn/ui patterns for new components
4. Test all CRUD operations before committing

## License

Part of the MediVision project.
