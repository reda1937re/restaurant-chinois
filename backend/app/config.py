import os
from datetime import time

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-a-changer-en-production-0123456789")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24

# Horaires d'ouverture (dernier créneau de réservation inclus)
OPENING_TIME = time(11, 30)
LAST_RESERVATION_TIME = time(22, 0)
RESERVATION_DURATION_MINUTES = 120

DELIVERY_FEE = 3.0
FREE_DELIVERY_THRESHOLD = 30.0
