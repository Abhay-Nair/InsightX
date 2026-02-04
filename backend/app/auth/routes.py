from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.models import UserCreate
from app.db.database import get_db
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate):
    try:
        db = get_db()
        users = db.users

        # Check if user already exists
        existing_user = users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password and create user
        hashed_pwd = hash_password(user.password)

        user_doc = {
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_pwd
        }
        
        result = users.insert_one(user_doc)
        
        if result.inserted_id:
            return {"message": "User registered successfully", "user_id": str(result.inserted_id)}
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        db = get_db()
        users = db.users

        email = form_data.username   # OAuth2 uses "username" field
        password = form_data.password

        # Find user by email
        user = users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create access token
        token = create_access_token({"sub": user["email"]})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")
