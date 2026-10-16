from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import admin, auth, menu, orders, reservations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Le Dragon d'Or — API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, menu.router, reservations.router, orders.router, admin.router):
    app.include_router(r)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/api/health")
def health():
    return {"status": "ok"}
