from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.database import users_collection
from app.models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    # Check if email already exists
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user document
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "role": user.role.value,
        "specialization": user.specialization,
        "phone": user.phone,
        "age": user.age,
        "gender": user.gender,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate token
    token = create_access_token({"sub": user_id, "role": user.role.value})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user.name,
            email=user.email,
            role=user.role.value,
            specialization=user.specialization,
            phone=user.phone,
            age=user.age,
            gender=user.gender,
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            role=user["role"],
            specialization=user.get("specialization"),
            phone=user.get("phone"),
            age=user.get("age"),
            gender=user.get("gender"),
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        specialization=current_user.get("specialization"),
        phone=current_user.get("phone"),
        age=current_user.get("age"),
        gender=current_user.get("gender"),
    )
