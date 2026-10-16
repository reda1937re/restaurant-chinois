from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config, models, schemas
from ..auth import get_current_user, get_optional_user, require_admin
from ..database import get_db

router = APIRouter(prefix="/api", tags=["commandes"])

STATUSES = ["reçue", "en_préparation", "en_livraison", "livrée", "annulée"]


@router.get("/delivery-info")
def delivery_info():
    return {"fee": config.DELIVERY_FEE, "free_threshold": config.FREE_DELIVERY_THRESHOLD}


@router.post("/orders", response_model=schemas.OrderOut)
def create_order(
    data: schemas.OrderIn,
    db: Session = Depends(get_db),
    user: models.User | None = Depends(get_optional_user),
):
    order = models.Order(
        user_id=user.id if user else None,
        name=data.name, phone=data.phone, address=data.address, note=data.note,
        subtotal=0, delivery_fee=0, total=0,
    )
    subtotal = 0.0
    # Les prix viennent toujours de la base, jamais du client
    for item in data.items:
        dish = db.get(models.Dish, item.dish_id)
        if not dish or not dish.available:
            raise HTTPException(400, "Un des plats de votre panier n'est plus disponible")
        order.items.append(
            models.OrderItem(dish_id=dish.id, dish_name=dish.name, quantity=item.quantity, unit_price=dish.price)
        )
        subtotal += dish.price * item.quantity
    fee = 0.0 if subtotal >= config.FREE_DELIVERY_THRESHOLD else config.DELIVERY_FEE
    order.subtotal = round(subtotal, 2)
    order.delivery_fee = fee
    order.total = round(subtotal + fee, 2)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/mine", response_model=list[schemas.OrderOut])
def my_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.scalars(
        select(models.Order).where(models.Order.user_id == user.id).order_by(models.Order.created_at.desc())
    ).all()


@router.get("/orders/track", response_model=schemas.OrderOut)
def track_order(id: int, phone: str, db: Session = Depends(get_db)):
    order = db.get(models.Order, id)
    if not order or order.phone.replace(" ", "") != phone.replace(" ", ""):
        raise HTTPException(404, "Commande introuvable. Vérifiez le numéro et le téléphone.")
    return order


@router.get("/admin/orders", response_model=list[schemas.OrderOut], dependencies=[Depends(require_admin)])
def admin_list(status: str | None = None, db: Session = Depends(get_db)):
    query = select(models.Order).order_by(models.Order.created_at.desc())
    if status:
        query = query.where(models.Order.status == status)
    return db.scalars(query).all()


@router.patch("/admin/orders/{order_id}", response_model=schemas.OrderOut, dependencies=[Depends(require_admin)])
def admin_set_status(order_id: int, data: schemas.StatusIn, db: Session = Depends(get_db)):
    if data.status not in STATUSES:
        raise HTTPException(400, "Statut invalide")
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(404, "Commande introuvable")
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
