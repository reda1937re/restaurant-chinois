from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models
from ..auth import require_admin
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    today = date.today()
    active_orders = ("reçue", "en_préparation", "en_livraison")
    return {
        "reservations_today": db.scalar(
            select(func.count()).where(models.Reservation.date == today, models.Reservation.status != "annulée")
        ),
        "reservations_pending": db.scalar(
            select(func.count()).where(models.Reservation.status == "en_attente", models.Reservation.date >= today)
        ),
        "orders_active": db.scalar(select(func.count()).where(models.Order.status.in_(active_orders))),
        "revenue_today": db.scalar(
            select(func.coalesce(func.sum(models.Order.total), 0)).where(
                func.date(models.Order.created_at) == today.isoformat(), models.Order.status == "livrée"
            )
        ),
        "dishes_count": db.scalar(select(func.count()).select_from(models.Dish)),
    }
