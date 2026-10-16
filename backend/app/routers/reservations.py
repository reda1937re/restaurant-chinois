from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config, models, schemas
from ..auth import get_current_user, get_optional_user, require_admin
from ..database import get_db

router = APIRouter(prefix="/api", tags=["réservations"])

STATUSES = {"en_attente", "confirmée", "annulée"}


def to_out(r: models.Reservation) -> schemas.ReservationOut:
    return schemas.ReservationOut(
        id=r.id, name=r.name, phone=r.phone, email=r.email, date=r.date, time=r.time,
        guests=r.guests, status=r.status, note=r.note, table_number=r.table.number, created_at=r.created_at,
    )


def find_free_table(db: Session, day: date, start: datetime, guests: int) -> models.DiningTable | None:
    """Plus petite table assez grande, sans réservation active qui chevauche le créneau."""
    duration = timedelta(minutes=config.RESERVATION_DURATION_MINUTES)
    busy_ids = set()
    for r in db.scalars(
        select(models.Reservation).where(models.Reservation.date == day, models.Reservation.status != "annulée")
    ):
        other = datetime.combine(r.date, r.time)
        if abs(other - start) < duration:
            busy_ids.add(r.table_id)
    tables = db.scalars(
        select(models.DiningTable).where(models.DiningTable.capacity >= guests).order_by(models.DiningTable.capacity)
    )
    return next((t for t in tables if t.id not in busy_ids), None)


def validate_slot(data: schemas.ReservationIn) -> datetime:
    start = datetime.combine(data.date, data.time)
    if start < datetime.now():
        raise HTTPException(400, "La date de réservation est déjà passée")
    if not (config.OPENING_TIME <= data.time <= config.LAST_RESERVATION_TIME):
        raise HTTPException(
            400,
            f"Réservations possibles entre {config.OPENING_TIME:%H:%M} et {config.LAST_RESERVATION_TIME:%H:%M}",
        )
    return start


@router.get("/reservations/availability")
def availability(day: date, time: str, guests: int, db: Session = Depends(get_db)):
    start = datetime.combine(day, datetime.strptime(time, "%H:%M").time())
    return {"available": find_free_table(db, day, start, guests) is not None}


@router.post("/reservations", response_model=schemas.ReservationOut)
def create_reservation(
    data: schemas.ReservationIn,
    db: Session = Depends(get_db),
    user: models.User | None = Depends(get_optional_user),
):
    start = validate_slot(data)
    table = find_free_table(db, data.date, start, data.guests)
    if table is None:
        raise HTTPException(409, "Désolé, aucune table n'est disponible à ce créneau. Essayez un autre horaire.")
    reservation = models.Reservation(**data.model_dump(), table_id=table.id, user_id=user.id if user else None)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return to_out(reservation)


@router.get("/reservations/mine", response_model=list[schemas.ReservationOut])
def my_reservations(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    rows = db.scalars(
        select(models.Reservation)
        .where(models.Reservation.user_id == user.id)
        .order_by(models.Reservation.date.desc(), models.Reservation.time.desc())
    )
    return [to_out(r) for r in rows]


@router.post("/reservations/{reservation_id}/cancel", response_model=schemas.ReservationOut)
def cancel_my_reservation(
    reservation_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)
):
    r = db.get(models.Reservation, reservation_id)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Réservation introuvable")
    r.status = "annulée"
    db.commit()
    return to_out(r)


@router.get("/admin/reservations", response_model=list[schemas.ReservationOut], dependencies=[Depends(require_admin)])
def admin_list(day: date | None = None, db: Session = Depends(get_db)):
    query = select(models.Reservation).order_by(models.Reservation.date.desc(), models.Reservation.time)
    if day:
        query = query.where(models.Reservation.date == day)
    return [to_out(r) for r in db.scalars(query)]


@router.patch(
    "/admin/reservations/{reservation_id}", response_model=schemas.ReservationOut, dependencies=[Depends(require_admin)]
)
def admin_set_status(reservation_id: int, data: schemas.StatusIn, db: Session = Depends(get_db)):
    if data.status not in STATUSES:
        raise HTTPException(400, "Statut invalide")
    r = db.get(models.Reservation, reservation_id)
    if not r:
        raise HTTPException(404, "Réservation introuvable")
    r.status = data.status
    db.commit()
    return to_out(r)
