# Data Model: Next.js Authentication System

## Entities

### User
- **email**: string (required, validated)
- **name**: string (optional)
- **id**: string (unique identifier from JWT payload)
- **createdAt**: Date (timestamp when user was registered)
- **updatedAt**: Date (timestamp when user was last updated)

### Authentication State
- **isAuthenticated**: boolean (current authentication status)
- **user**: User object (user data when authenticated)
- **token**: string (JWT token for API authorization)
- **isLoading**: boolean (loading state during auth operations)
- **error**: string (error message if authentication failed)

### Form Data
- **Login Data**:
  - email: string (user's email address)
  - password: string (user's password)
  - rememberMe: boolean (whether to persist session)

- **Registration Data**:
  - email: string (user's email address)
  - password: string (user's password)
  - confirmPassword: string (confirmation of password)
  - name: string (user's name)

### JWT Token
- **accessToken**: string (JWT access token)
- **expiresAt**: Date (expiration timestamp)
- **refreshToken**: string (optional refresh token)

## State Transitions

### Authentication Flow
1. **Unauthenticated** → **Authenticating** (when login/register initiated)
2. **Authenticating** → **Authenticated** (on successful login/register)
3. **Authenticating** → **Unauthenticated** (on failed login/register)
4. **Authenticated** → **Unauthenticated** (on logout or token expiration)

### Form Validation States
1. **Initial** → **Validating** (when user interacts with form)
2. **Validating** → **Valid** (when all validations pass)
3. **Validating** → **Invalid** (when validations fail)
4. **Valid** → **Submitting** (when form is submitted)
5. **Submitting** → **Success/Error** (after API response)

## Validation Rules

### User Registration
- Email must be a valid email format (using Zod)
- Password must be at least 8 characters with mixed case, number, and symbol
- Password and confirmPassword must match
- Email must be unique (validated by backend)

### User Login
- Email must be a valid email format
- Password must be provided
- Credentials must match existing user in backend

### Protected Route Access
- User must have valid JWT token
- Token must not be expired
- Token must be properly formatted