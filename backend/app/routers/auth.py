from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_token, get_current_user, hash_password, verify_password
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenOut)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(models.User).where(models.User.email == data.email)):
        raise HTTPException(400, "Cet email est déjà utilisé")
    user = models.User(name=data.name, email=data.email, phone=data.phone, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_token(user.id), "user": user}


@router.post("/login", response_model=schemas.TokenOut)
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == data.email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {"access_token": create_token(user.id), "user": user}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
