# Data Model: User Authentication

## User Entity

### Fields
- **id** (string, required): Unique identifier from Better Auth system
- **email** (string, required): User's email address for authentication
- **createdAt** (Date, required): Timestamp when account was created
- **updatedAt** (Date, required): Timestamp when account was last updated
- **isActive** (boolean, optional): Account status flag (default: true)

### Relationships
- **Tasks**: One-to-many relationship with Task entities (via user_id foreign key)

### Validation Rules
- Email must be in valid email format
- Email must be unique across all users
- ID must be non-empty string
- CreatedAt and UpdatedAt must be valid ISO date strings

## Session Entity

### Fields
- **userId** (string, required): Reference to User.id
- **accessToken** (string, required): JWT access token
- **refreshToken** (string, required): JWT refresh token
- **expiresAt** (Date, required): Access token expiration timestamp
- **refreshExpiresAt** (Date, required): Refresh token expiration timestamp
- **isActive** (boolean, required): Current session status (default: true)
- **createdAt** (Date, required): Session creation timestamp

### Relationships
- **User**: Many-to-one relationship with User entity

### Validation Rules
- UserId must reference existing user
- Access and refresh tokens must be non-empty strings
- Expiration timestamps must be in the future
- Active sessions must have valid, unexpired tokens

## Authentication Credentials

### Fields
- **email** (string, required): User's email address
- **password** (string, required): User's password (hashed server-side)
- **confirmPassword** (string, required): Password confirmation for signup

### Validation Rules
- Email must be in valid email format
- Password must meet strength requirements (min 8 chars, mixed case, number, symbol)
- ConfirmPassword must match password exactly
- Email must not already exist in system (for signup)

## API Request/Response Objects

### Signup Request
- **email** (string, required): User's email address
- **password** (string, required): User's desired password
- **confirmPassword** (string, required): Password confirmation

### Signin Request
- **email** (string, required): User's email address
- **password** (string, required): User's password

### Authentication Response
- **success** (boolean, required): Whether authentication was successful
- **user** (User, optional): User object if successful
- **accessToken** (string, optional): JWT access token if successful
- **refreshToken** (string, optional): JWT refresh token if successful
- **expiresAt** (Date, optional): Access token expiration time
- **error** (string, optional): Error message if unsuccessful

### Protected API Request Headers
- **Authorization** (string, required): Format "Bearer {token}"

## State Transitions

### Session Lifecycle
1. **Inactive** → **Active**: On successful authentication
   - Conditions: Valid credentials provided
   - Actions: Generate tokens, update session state

2. **Active** → **Expired**: When access token expires
   - Conditions: Current time > expiresAt
   - Actions: Attempt token refresh or require re-authentication

3. **Active** → **Inactive**: On logout or forced termination
   - Conditions: User initiates logout or admin action
   - Actions: Invalidate tokens, clear session data