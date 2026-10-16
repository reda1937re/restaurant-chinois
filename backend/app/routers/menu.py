from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_admin
from ..database import get_db

router = APIRouter(prefix="/api", tags=["menu"])


@router.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(select(models.Category).order_by(models.Category.position)).all()


@router.get("/dishes", response_model=list[schemas.DishOut])
def list_dishes(category_id: int | None = None, db: Session = Depends(get_db)):
    query = select(models.Dish).where(models.Dish.available.is_(True)).order_by(models.Dish.category_id, models.Dish.name)
    if category_id:
        query = query.where(models.Dish.category_id == category_id)
    return db.scalars(query).all()


@router.get("/admin/dishes", response_model=list[schemas.DishOut], dependencies=[Depends(require_admin)])
def list_all_dishes(db: Session = Depends(get_db)):
    return db.scalars(select(models.Dish).order_by(models.Dish.category_id, models.Dish.name)).all()


@router.post("/admin/dishes", response_model=schemas.DishOut, dependencies=[Depends(require_admin)])
def create_dish(data: schemas.DishBase, db: Session = Depends(get_db)):
    if not db.get(models.Category, data.category_id):
        raise HTTPException(400, "Catégorie inconnue")
    dish = models.Dish(**data.model_dump())
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return dish


@router.put("/admin/dishes/{dish_id}", response_model=schemas.DishOut, dependencies=[Depends(require_admin)])
def update_dish(dish_id: int, data: schemas.DishBase, db: Session = Depends(get_db)):
    dish = db.get(models.Dish, dish_id)
    if not dish:
        raise HTTPException(404, "Plat introuvable")
    if not db.get(models.Category, data.category_id):
        raise HTTPException(400, "Catégorie inconnue")
    for key, value in data.model_dump().items():
        setattr(dish, key, value)
    db.commit()
    db.refresh(dish)
    return dish


@router.delete("/admin/dishes/{dish_id}", dependencies=[Depends(require_admin)])
def delete_dish(dish_id: int, db: Session = Depends(get_db)):
    dish = db.get(models.Dish, dish_id)
    if not dish:
        raise HTTPException(404, "Plat introuvable")
    # Un plat déjà commandé est seulement désactivé pour garder l'historique des commandes
    if db.scalar(select(models.OrderItem.id).where(models.OrderItem.dish_id == dish_id).limit(1)):
        dish.available = False
    else:
        db.delete(dish)
    db.commit()
    return {"ok": True}
