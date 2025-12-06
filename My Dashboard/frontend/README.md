# Frontend - Productivity Dashboard

Next.js 15 frontend with React, TypeScript, TailwindCSS, and ShadCN UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Development:
```bash
npm run dev
```

4. Build:
```bash
npm run build
```

5. Production:
```bash
npm start
```

## Features

- User authentication (login/register)
- Dashboard with statistics and charts
- Certifications management
- Degrees/Education management
- Todo tasks with filters
- Goals with milestones and progress tracking
- Dark/light theme support
- Responsive design

## Pages

- `/` - Home (redirects to dashboard or login)
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Main dashboard
- `/dashboard/certifications` - Certifications management
- `/dashboard/degrees` - Degrees management
- `/dashboard/todos` - Todos management
- `/dashboard/goals` - Goals management
- `/dashboard/profile` - User profile
