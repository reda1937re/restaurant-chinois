from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import config, models
from .database import get_db

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=config.TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, config.SECRET_KEY, algorithm=config.ALGORITHM)


def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)
) -> models.User | None:
    if creds is None:
        return None
    try:
        payload = jwt.decode(creds.credentials, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expirée, veuillez vous reconnecter")
    return db.get(models.User, int(payload["sub"]))


def get_current_user(user: models.User | None = Depends(get_optional_user)) -> models.User:
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Connexion requise")
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès réservé à l'administrateur")
    return user
