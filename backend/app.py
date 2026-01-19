from datetime import datetime, timedelta
from typing import Optional, List
from sqlmodel import SQLModel, Field, create_engine, Session, select
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from pydantic import BaseModel
import jwt
from contextlib import contextmanager
import logging
from fastapi.responses import JSONResponse
import hashlib
import secrets
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(bind=engine)

# Task Model
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = False
    user_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

# User Model
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# JWT Authentication
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using SHA256 with a salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(salt.encode() + password.encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    try:
        salt, stored_hash = hashed_password.split(":")
        computed_hash = hashlib.sha256(salt.encode() + plain_password.encode()).hexdigest()
        return computed_hash == stored_hash
    except ValueError:
        return False

def create_jwt_token(user_id: int) -> str:
    """Create a JWT token for the given user"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        "iat": datetime.utcnow()
    }
    # Use the secret from environment variable
    secret = os.getenv("BETTER_AUTH_SECRET", "fallback-secret-key-for-development")
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify JWT token and extract user information.
    This function assumes Better Auth format for JWT tokens.
    """
    token = credentials.credentials

    try:
        # Use the secret from environment variable
        secret = os.getenv("BETTER_AUTH_SECRET", "fallback-secret-key-for-development")
        payload = jwt.decode(token, secret, algorithms=["HS256"])

        # Extract user_id from the payload (Better Auth typically has a user object)
        user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {"user_id": int(user_id)}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Login endpoint"""
    with get_session() as session:
        user = session.exec(select(User).where(User.email == request.email)).first()

        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        token = create_jwt_token(user.id)
        user_response = UserResponse(id=user.id, email=user.email, name=user.name)

        return LoginResponse(access_token=token, user=user_response)

@app.post("/register", response_model=LoginResponse)
def register(user_data: UserCreate):
    """Register endpoint"""
    with get_session() as session:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists"
            )

        # Hash the password
        hashed_password = hash_password(user_data.password)

        # Create new user
        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        # Create token for the new user
        token = create_jwt_token(user.id)
        user_response = UserResponse(id=user.id, email=user.email, name=user.name)

        return LoginResponse(access_token=token, user=user_response)

@app.get("/user", response_model=UserResponse)
def get_user(current_user: dict = Depends(verify_jwt_token)):
    """Get current user info"""
    user_id = current_user["user_id"]

    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(id=user.id, email=user.email, name=user.name)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session

# Root route: GET / – Return JSON {"message": "Todo API"}
@app.get("/")
def root():
    return {"message": "Todo API"}

# Favicon route: Ignore or return empty 204 for /favicon.ico
@app.get("/favicon.ico", status_code=204)
def favicon():
    return {}

# GET /api/{user_id}/tasks – List all tasks
@app.get("/api/{user_id}/tasks", response_model=List[TaskResponse])
def list_tasks(user_id: int, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to access these tasks"}
        )

    with get_session() as session:
        tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
        return tasks

# POST /api/{user_id}/tasks – Create task
@app.post("/api/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(user_id: int, task: TaskCreate, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to create tasks for this user"}
        )

    with get_session() as session:
        db_task = Task(
            title=task.title,
            description=task.description,
            completed=task.completed,
            user_id=user_id
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

# GET /api/{user_id}/tasks/{id} – Get task
@app.get("/api/{user_id}/tasks/{id}", response_model=TaskResponse)
def get_task(user_id: int, id: int, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to access this task"}
        )

    with get_session() as session:
        task = session.get(Task, id)
        if not task or task.user_id != user_id:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Task not found"}
            )
        return task

# PUT /api/{user_id}/tasks/{id} – Update task
@app.put("/api/{user_id}/tasks/{id}", response_model=TaskResponse)
def update_task(user_id: int, id: int, task_update: TaskUpdate, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to update this task"}
        )

    with get_session() as session:
        task = session.get(Task, id)
        if not task or task.user_id != user_id:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Task not found"}
            )

        # Update task fields
        for field, value in task_update.dict(exclude_unset=True).items():
            setattr(task, field, value)

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# DELETE /api/{user_id}/tasks/{id} – Delete task
@app.delete("/api/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(user_id: int, id: int, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to delete this task"}
        )

    with get_session() as session:
        task = session.get(Task, id)
        if not task or task.user_id != user_id:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Task not found"}
            )

        session.delete(task)
        session.commit()
        return

# PATCH /api/{user_id}/tasks/{id}/complete – Toggle completion
@app.patch("/api/{user_id}/tasks/{id}/complete", response_model=TaskResponse)
def toggle_task_completion(user_id: int, id: int, current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Not authorized to update this task"}
        )

    with get_session() as session:
        task = session.get(Task, id)
        if not task or task.user_id != user_id:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Task not found"}
            )

        task.completed = not task.completed  # Toggle completion status
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task