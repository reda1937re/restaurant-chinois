from datetime import date as Date, datetime, time as Time

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Auth ---
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    password: str = Field(min_length=6)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORM):
    id: int
    name: str
    email: str
    phone: str
    is_admin: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Menu ---
class CategoryOut(ORM):
    id: int
    name: str
    position: int


class DishBase(BaseModel):
    category_id: int
    name: str = Field(min_length=1, max_length=120)
    description: str = ""
    price: float = Field(gt=0)
    image: str = ""
    spicy: bool = False
    vegetarian: bool = False
    available: bool = True


class DishOut(DishBase, ORM):
    id: int


# --- Réservations ---
class ReservationIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=6, max_length=30)
    email: str = ""
    date: Date
    time: Time
    guests: int = Field(ge=1, le=20)
    note: str = ""


class ReservationOut(ORM):
    id: int
    name: str
    phone: str
    email: str
    date: Date
    time: Time
    guests: int
    status: str
    note: str
    table_number: int
    created_at: datetime


class StatusIn(BaseModel):
    status: str


# --- Commandes ---
class OrderItemIn(BaseModel):
    dish_id: int
    quantity: int = Field(ge=1, le=50)


class OrderIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=6, max_length=30)
    address: str = Field(min_length=5)
    note: str = ""
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(ORM):
    dish_id: int
    dish_name: str
    quantity: int
    unit_price: float


class OrderOut(ORM):
    id: int
    name: str
    phone: str
    address: str
    note: str
    subtotal: float
    delivery_fee: float
    total: float
    payment_method: str
    status: str
    created_at: datetime
    items: list[OrderItemOut]
