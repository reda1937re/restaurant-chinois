"""Remplit la base avec un menu d'exemple, les tables et un compte admin.

Usage : python -m app.seed   (ajoutez --reset pour tout effacer avant)
"""
import sys

from sqlalchemy import select

from . import models
from .auth import hash_password
from .database import Base, SessionLocal, engine

MENU = {
    "Entrées": [
        ("Nems au porc", "4 rouleaux croustillants, salade et menthe fraîche", 6.5, False, False),
        ("Rouleaux de printemps", "Crevettes, vermicelles et herbes, sauce cacahuète", 6.0, False, False),
        ("Soupe aigre-piquante", "Tofu, champignons noirs, pousses de bambou", 5.5, True, True),
        ("Salade de concombre à l'ail", "Concombre frappé, ail, huile de sésame", 4.5, False, True),
    ],
    "Dim Sum": [
        ("Har gow", "4 raviolis vapeur aux crevettes", 6.9, False, False),
        ("Siu mai", "4 bouchées porc et crevettes", 6.5, False, False),
        ("Xiao long bao", "6 raviolis soupe au porc", 8.5, False, False),
        ("Raviolis aux légumes", "6 raviolis grillés, légumes et shiitakés", 6.9, False, True),
    ],
    "Nouilles": [
        ("Chow mein au poulet", "Nouilles sautées, poulet, légumes croquants", 11.5, False, False),
        ("Nouilles Dan Dan", "Porc haché, sauce sésame et piment du Sichuan", 12.0, True, False),
        ("Nouilles sautées au bœuf", "Nouilles de riz larges, bœuf, oignons verts", 12.5, False, False),
    ],
    "Riz": [
        ("Riz cantonais", "Riz sauté, œuf, petits pois, jambon", 8.0, False, False),
        ("Riz sauté aux crevettes", "Riz sauté au wok, crevettes et ciboule", 10.5, False, False),
        ("Riz blanc parfumé", "Riz jasmin vapeur", 2.5, False, True),
    ],
    "Plats": [
        ("Canard laqué", "Demi-canard, crêpes, concombre et sauce hoisin", 22.0, False, False),
        ("Poulet Kung Pao", "Poulet sauté, cacahuètes, piments séchés", 14.0, True, False),
        ("Porc aigre-doux", "Porc pané, ananas, poivrons, sauce aigre-douce", 13.5, False, False),
        ("Bœuf aux oignons", "Bœuf tendre sauté au wok, oignons et sauce soja", 14.5, False, False),
        ("Mapo tofu", "Tofu soyeux, sauce pimentée au poivre du Sichuan", 12.0, True, True),
        ("Crevettes au sel et poivre", "Crevettes croustillantes, ail et piment", 16.5, True, False),
    ],
    "Desserts": [
        ("Perles de coco", "Boules de riz gluant à la noix de coco", 5.0, False, True),
        ("Beignets de banane", "Banane frite, miel et sésame", 5.5, False, True),
        ("Tarte aux œufs", "2 tartelettes à la crème façon Hong Kong", 4.5, False, True),
    ],
    "Boissons": [
        ("Thé au jasmin", "Théière pour 2", 3.5, False, True),
        ("Thé glacé maison", "Thé noir, citron et litchi", 4.0, False, True),
        ("Bière Tsingtao", "33 cl", 4.5, False, True),
        ("Eau minérale", "50 cl", 2.0, False, True),
    ],
}

TABLES = [(1, 2), (2, 2), (3, 2), (4, 4), (5, 4), (6, 4), (7, 4), (8, 6), (9, 6), (10, 10)]


def seed(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.scalar(select(models.Category).limit(1)):
            print("La base contient déjà des données (utilisez --reset pour recommencer).")
            return
        for position, (cat_name, dishes) in enumerate(MENU.items()):
            category = models.Category(name=cat_name, position=position)
            db.add(category)
            for name, desc, price, spicy, veg in dishes:
                category.dishes.append(
                    models.Dish(name=name, description=desc, price=price, spicy=spicy, vegetarian=veg)
                )
        for number, capacity in TABLES:
            db.add(models.DiningTable(number=number, capacity=capacity))
        db.add(
            models.User(
                name="Administrateur", email="admin@resto.com", phone="",
                password_hash=hash_password("admin123"), is_admin=True,
            )
        )
        db.commit()
        print("Base initialisée : menu, tables et admin (admin@resto.com / admin123).")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
