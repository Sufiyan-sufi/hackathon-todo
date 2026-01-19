# Todo App

## Authentication Setup

This project uses Better Auth for user authentication with JWT tokens.

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Dependencies

Install the required dependencies:

```bash
npm install @better-auth/react @better-auth/client better-auth
npm install axios
```

### Features

- User signup with email and password
- User signin with email and password
- JWT token management
- Secure API requests with authorization headers
- Session management
- Protected routes
- Responsive authentication UI

### Components

- `AuthProvider`: Manages authentication state
- `SignupForm`: Handles user registration
- `SigninForm`: Handles user login
- `LogoutButton`: Handles user logout
- `ProtectedRoute`: Ensures authentication for certain pages
- `api-client`: Intercepts API requests to include JWT tokens