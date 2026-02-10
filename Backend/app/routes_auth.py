from datetime import datetime, timedelta
import secrets
from fastapi import APIRouter, HTTPException
from app.models import RegisterModel, LoginModel, ForgotPasswordRequest, ResetPasswordRequest
from app.database import users, password_resets
from app.auth import hash_password, verify_password, create_token
from app.config.settings import settings
from app.services.email_service import send_password_reset_email
from app.utils import serialize_doc

router = APIRouter(prefix="/api/auth")

@router.post("/register")
def register(user: RegisterModel):
    if not user.email and not user.phone:
        raise HTTPException(status_code=400, detail="Email or phone required")
    conditions = []
    if user.email:
        conditions.append({"email": user.email})
    if user.phone:
        conditions.append({"phone": user.phone})
    if conditions and users.find_one({"$or": conditions}):
        raise HTTPException(status_code=400, detail="User exists")
    data = user.dict()
    data["password"] = hash_password(user.password)
    data["createdAt"] = datetime.utcnow().isoformat()
    data["emailVerified"] = False
    result = users.insert_one(data)
    db_user = users.find_one({"_id": result.inserted_id})
    token = create_token({"sub": str(result.inserted_id), "email": db_user.get("email"), "phone": db_user.get("phone")})
    user_payload = serialize_doc(db_user)
    user_payload.pop("password", None)
    return {
        "success": True,
        "data": {
            "token": token,
            "user": user_payload
        }
    }

@router.post("/login")
def login(user: LoginModel):
    query = None
    if user.email:
        query = {"email": user.email}
    elif user.phone:
        query = {"phone": user.phone}
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")
    db_user = users.find_one(query)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": str(db_user["_id"]), "email": db_user.get("email"), "phone": db_user.get("phone")})
    user_payload = serialize_doc(db_user)
    user_payload.pop("password", None)
    return {
        "success": True,
        "data": {
            "token": token,
            "user": user_payload
        }
    }

@router.post("/logout")
def logout():
    return {"success": True, "data": True}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email or phone required")
    user = None
    if payload.email:
        user = users.find_one({"email": payload.email})
    elif payload.phone:
        user = users.find_one({"phone": payload.phone})
    if not user:
        return {"success": True, "data": {"message": "If the account exists, a reset link was sent"}}
    target_email = payload.email or user.get("email")
    if not target_email:
        return {"success": True, "data": {"message": "If the account exists, a reset link was sent"}}
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)
    password_resets.insert_one({
        "email": target_email,
        "token": token,
        "expiresAt": expires_at,
        "used": False,
        "createdAt": datetime.utcnow()
    })
    reset_link = f"{settings.DOMAIN}/reset-password?token={token}"
    try:
        send_password_reset_email(target_email, reset_link)
    except Exception:
        raise HTTPException(status_code=500, detail="Email service not configured")
    return {"success": True, "data": {"message": "Password reset link sent"}}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    record = password_resets.find_one({
        "token": payload.token,
        "used": False,
        "expiresAt": {"$gte": datetime.utcnow()}
    })
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = users.find_one({"email": record["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    users.update_one({"_id": user["_id"]}, {"$set": {"password": hash_password(payload.password), "updatedAt": datetime.utcnow().isoformat()}})
    password_resets.update_one({"_id": record["_id"]}, {"$set": {"used": True, "usedAt": datetime.utcnow()}})
    return {"success": True, "data": {"message": "Password updated"}}

@router.post("/verify-email")
def verify_email(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    users.update_one({"email": email}, {"$set": {"emailVerified": True, "updatedAt": datetime.utcnow().isoformat()}})
    return {"success": True, "data": {"verified": True}}
