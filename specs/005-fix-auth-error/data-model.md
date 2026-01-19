# Data Model: Authentication Error Fix and Page Redirection

## Entities

### AuthToken
- **Description**: Represents the JWT token with expiration information
- **Fields**:
  - `token`: string - The actual JWT token value
  - `expiry`: number - Unix timestamp (in milliseconds) of token expiration
  - `type`: string - Token type (e.g., "Bearer")
- **Validation**: Must conform to JWT format standards
- **Relationships**: Associated with a specific user session

### AuthState
- **Description**: Current authentication state managed by the AuthProvider
- **Fields**:
  - `isAuthenticated`: boolean - Whether the user is currently authenticated
  - `user`: object|null - User information retrieved from token
  - `token`: string|null - Current JWT token
  - `isLoading`: boolean - Loading state during authentication operations
  - `error`: string|null - Error message if authentication failed
- **State Transitions**: Unauthenticated → Authenticating → Authenticated/Failed
- **Relationships**: Contains reference to AuthToken when authenticated

### User
- **Description**: User account information retrieved from token
- **Fields**:
  - `id`: string - Unique identifier for the user
  - `email`: string - Email address of the user
  - `name`: string - Full name of the user (optional)
- **Validation**: Email must be in valid format, ID must be unique
- **Relationships**: Associated with AuthState when authenticated

## Storage Model

### Local Storage Keys
- `authTokenInfo`: Stores token and expiration information as JSON
- `token`: Legacy storage for token (fallback when authTokenInfo doesn't exist)
- `authTokenInfo` structure: `{ token: string, expiry: number }`

### Session Storage Keys
- `token`: Temporary storage for session-only tokens (when "remember me" is not selected)

## Validation Rules

### Token Validation
- Tokens must be valid JWT format
- Expiration time must be in the future
- Token must not be empty or null when authenticated

### Session Validation
- Authenticated state must match token validity
- User data must be consistent with token claims
- Error states should be cleared after successful authentication

### Redirect Validation
- Unauthenticated users must be redirected to login page
- Authenticated users must be redirected to dashboard page
- Redirect logic must not create infinite loops