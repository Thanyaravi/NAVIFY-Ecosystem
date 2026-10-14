from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import httpx
from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

try:
    from twilio.rest import Client as TwilioClient
except Exception:
    TwilioClient = None

# ------------------------------------------------------------------ setup
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "navify_ecosystem")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(
    title="NAVIFY Ecosystem API",
    description="Production-grade secure API for NAVIFY Assistive Ecosystem",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("navify")


# ------------------------------------------------------------------ security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ------------------------------------------------------------------ notifications
EMAIL_API_KEY = os.environ.get("SENDGRID_API_KEY") or os.environ.get("EMAIL_API_KEY") or ""
EMAIL_FROM = os.environ.get("EMAIL_FROM", "alerts@navify.org")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "NAVIFY Ecosystem")
SOS_CC_OWNER = os.environ.get("SOS_CC_OWNER", "true").lower() == "true"
TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID") or ""
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN") or ""
TWILIO_FROM = os.environ.get("TWILIO_PHONE_NUMBER") or ""


def email_configured() -> bool:
    return bool(EMAIL_API_KEY)


def sms_configured() -> bool:
    return bool(TWILIO_SID and TWILIO_TOKEN and TWILIO_FROM and TwilioClient)


async def send_email(to: str, subject: str, html: str) -> bool:
    if not email_configured():
        logger.info(f"[SIMULATED EMAIL] To: {to} | Subject: {subject}")
        return True
    try:
        # Standard HTTPS notification dispatcher
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {EMAIL_API_KEY}"},
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": EMAIL_FROM, "name": EMAIL_FROM_NAME},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html}],
                },
            )
        return r.status_code in (200, 202)
    except Exception as e:
        logger.error(f"email send failed to {to}: {e}")
        return False


def _send_sms_sync(to: str, body: str):
    client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
    client.messages.create(to=to, from_=TWILIO_FROM, body=body)


async def send_sms(to: str, body: str) -> bool:
    if not sms_configured():
        return False
    try:
        await asyncio.to_thread(_send_sms_sync, to, body)
        return True
    except Exception as e:
        logger.error(f"sms send failed to {to}: {e}")
        return False


async def reverse_geocode(lat: float, lng: float):
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.get(
                "https://api.bigdatacloud.net/data/reverse-geocode-client",
                params={"latitude": lat, "longitude": lng, "localityLanguage": "en"},
            )
        g = r.json()
        parts = [g.get("locality") or g.get("city"), g.get("principalSubdivision"), g.get("countryName")]
        parts = [p for p in parts if p]
        return ", ".join(parts) if parts else None
    except Exception as e:
        logger.error(f"reverse geocode failed: {e}")
        return None


def sos_email_html(name: str, location: str, maps_url: str, when: str) -> str:
    link = f'<a href="{maps_url}" style="color:#4f46e5;font-weight:600">View live location</a>' if maps_url else ""
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;font-family:Arial,sans-serif">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08)">
          <tr><td style="background:linear-gradient(135deg,#e11d48,#be123c);padding:24px 32px">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700">🚨 SOS Emergency Alert</p>
          </td></tr>
          <tr><td style="padding:28px 32px;color:#0f172a">
            <p style="font-size:16px;margin:0 0 16px">
              <strong>{name}</strong> has triggered an emergency SOS from their NAVIFY smart cane.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;margin:8px 0">
              <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Location</td></tr>
              <tr><td style="color:#0f172a;font-size:15px;font-weight:600;padding:0 0 8px">{location}</td></tr>
              <tr><td style="padding:4px 0">{link}</td></tr>
            </table>
            <p style="color:#64748b;font-size:13px;margin:16px 0 0">Triggered at {when}. Please check on them immediately.</p>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center">
            NAVIFY Ecosystem · Edge AI Assistive Navigation
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


# ------------------------------------------------------------------ security helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def public_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "name": doc.get("name", ""),
        "role": doc.get("role", "user"),
        "avatar": doc.get(
            "avatar",
            "https://images.pexels.com/photos/33261951/pexels-photo-33261951.jpeg",
        ),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=604800, path="/",
    )


# ------------------------------------------------------------------ models
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(default="NAVIFY User")


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class DetectionIn(BaseModel):
    label: str
    confidence: int
    source: str = "mobile"  # mobile | cane


class JourneyIn(BaseModel):
    route: str
    distance: str
    duration: str
    detections: int = 0


class SOSIn(BaseModel):
    type: str = "Manual Trigger"
    location: str = "Unknown"
    lat: Optional[float] = None
    lng: Optional[float] = None
    accuracy: Optional[float] = None
    maps_url: Optional[str] = None


class ContactIn(BaseModel):
    name: str
    relation: str
    phone: str
    email: Optional[str] = None
    primary: bool = False


class SettingsIn(BaseModel):
    theme: Optional[str] = None
    notifications: Optional[dict] = None
    device: Optional[dict] = None
    cloud: Optional[dict] = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ------------------------------------------------------------------ auth routes
@api.get("/")
async def root():
    return {"message": "NAVIFY Ecosystem API"}


@api.get("/status")
async def health_check():
    return {
        "status": "healthy",
        "service": "navify-api",
        "version": "2.0.0",
        "timestamp": now_iso()
    }


@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": "user",
        "created_at": now_iso(),
    }
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    token = create_access_token(str(res.inserted_id), email)
    set_auth_cookie(response, token)
    await seed_user_data(str(res.inserted_id))
    return {"user": public_user(doc), "token": token}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    set_auth_cookie(response, token)
    return {"user": public_user(user), "token": token}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


# ------------------------------------------------------------------ detections
@api.get("/detections")
async def list_detections(limit: int = 50, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    items = (
        await db.detections.find({"user_id": uid}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )
    return items


@api.post("/detections")
async def create_detection(body: DetectionIn, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "label": body.label,
        "confidence": body.confidence,
        "source": body.source,
        "created_at": now_iso(),
    }
    await db.detections.insert_one(dict(doc))
    return doc


@api.get("/detections/stats")
async def detection_stats(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$label", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6},
    ]
    rows = await db.detections.aggregate(pipeline).to_list(6)
    total = sum(r["count"] for r in rows) or 1
    return [
        {"label": r["_id"], "count": r["count"], "pct": round(r["count"] * 100 / total)}
        for r in rows
    ]


# ------------------------------------------------------------------ journeys
@api.get("/journeys")
async def list_journeys(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    return (
        await db.journeys.find({"user_id": uid}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(100)
    )


@api.post("/journeys")
async def create_journey(body: JourneyIn, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "date": datetime.now(timezone.utc).strftime("%b %d, %Y"),
        "route": body.route,
        "distance": body.distance,
        "duration": body.duration,
        "detections": body.detections,
        "created_at": now_iso(),
    }
    await db.journeys.insert_one(dict(doc))
    return doc


# ------------------------------------------------------------------ sos
@api.get("/sos")
async def list_sos(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    return (
        await db.sos_events.find({"user_id": uid}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(100)
    )


@api.post("/sos")
async def create_sos(body: SOSIn, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    maps = body.maps_url or (
        f"https://maps.google.com/?q={body.lat},{body.lng}" if body.lat and body.lng else ""
    )
    when = datetime.now(timezone.utc).strftime("%b %d, %Y · %I:%M %p")
    location = body.location if (body.location and body.location != "Unknown") else (
        f"{body.lat:.5f}, {body.lng:.5f}" if body.lat and body.lng else "Unknown"
    )
    # Server-side reverse-geocode fallback (e.g. auto fall path with no client address)
    _loc_raw = (body.location or "").strip()
    needs_geo = (not _loc_raw) or _loc_raw.lower() == "unknown" or not any(ch.isalpha() for ch in _loc_raw)
    if body.lat and body.lng and needs_geo:
        addr = await reverse_geocode(body.lat, body.lng)
        if addr:
            location = addr
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "type": body.type,
        "status": "Active",
        "location": location,
        "lat": body.lat,
        "lng": body.lng,
        "maps_url": maps,
        "time": when,
        "created_at": now_iso(),
    }
    await db.sos_events.insert_one(dict(doc))

    # Notify emergency contacts (email + SMS)
    contacts = await db.contacts.find({"user_id": uid}, {"_id": 0}).to_list(100)
    name = user.get("name", "A NAVIFY user")
    loc_text = location + (f" — {maps}" if maps else "")

    emails = {c["email"] for c in contacts if c.get("email")}
    if SOS_CC_OWNER and user.get("email"):
        emails.add(user["email"])
    phones = {
        c["phone"] for c in contacts
        if c.get("phone") and c["phone"].strip().startswith("+") and "•" not in c["phone"]
    }

    subject = "🚨 SOS Emergency Alert — NAVIFY"
    html = sos_email_html(name, location, maps, when)
    sms_body = f"🚨 SOS: {name} needs help. Location: {loc_text}"

    email_sent = sum([1 for ok in await asyncio.gather(*[send_email(e, subject, html) for e in emails]) if ok]) if emails else 0
    sms_sent = sum([1 for ok in await asyncio.gather(*[send_sms(p, sms_body) for p in phones]) if ok]) if phones else 0

    notified = {
        "email": email_sent,
        "sms": sms_sent,
        "email_configured": email_configured(),
        "sms_configured": sms_configured(),
    }
    await db.sos_events.update_one({"id": doc["id"]}, {"$set": {"notified": notified}})
    return {**doc, "notified": notified}


@api.get("/notifications/status")
async def notifications_status(user: dict = Depends(get_current_user)):
    return {"email_configured": email_configured(), "sms_configured": sms_configured()}


# ------------------------------------------------------------------ contacts
@api.get("/contacts")
async def list_contacts(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    return await db.contacts.find({"user_id": uid}, {"_id": 0}).to_list(100)


@api.post("/contacts")
async def create_contact(body: ContactIn, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "name": body.name,
        "relation": body.relation,
        "phone": body.phone,
        "email": body.email,
        "primary": body.primary,
        "created_at": now_iso(),
    }
    await db.contacts.insert_one(dict(doc))
    return doc


@api.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    await db.contacts.delete_one({"user_id": uid, "id": contact_id})
    return {"ok": True}


# ------------------------------------------------------------------ settings
DEFAULT_SETTINGS = {
    "theme": "light",
    "notifications": {"detections": True, "sos": True, "journey": False},
    "device": {"haptic": True},
    "cloud": {"autoSync": True},
}


@api.get("/settings")
async def get_settings(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    doc = await db.settings.find_one({"user_id": uid}, {"_id": 0, "user_id": 0})
    return doc or DEFAULT_SETTINGS


@api.put("/settings")
async def update_settings(body: SettingsIn, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.settings.update_one({"user_id": uid}, {"$set": update}, upsert=True)
    doc = await db.settings.find_one({"user_id": uid}, {"_id": 0, "user_id": 0})
    return doc


# ------------------------------------------------------------------ dashboard summary
@api.get("/dashboard/summary")
async def dashboard_summary(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    today = datetime.now(timezone.utc).date().isoformat()
    total_detections = await db.detections.count_documents({"user_id": uid})
    today_detections = await db.detections.count_documents(
        {"user_id": uid, "created_at": {"$regex": f"^{today}"}}
    )
    journeys = await db.journeys.find({"user_id": uid}, {"_id": 0}).to_list(100)
    last_sos = (
        await db.sos_events.find({"user_id": uid}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(1)
    )
    journey_km = 2.4  # today's live distance (device telemetry placeholder)
    sos_status = "Alert" if (last_sos and last_sos[0]["status"] == "Active") else "Safe"

    return {
        "stats": [
            {"id": "journey", "label": "Journey Today", "value": str(journey_km), "unit": "km", "trend": "+18%", "trendUp": True, "accent": "indigo"},
            {"id": "battery", "label": "Battery", "value": "86", "unit": "%", "trend": "-4%", "trendUp": False, "accent": "emerald"},
            {"id": "detections", "label": "AI Detections", "value": str(total_detections), "unit": "", "trend": f"+{today_detections} today", "trendUp": True, "accent": "blue"},
            {"id": "sos", "label": "SOS Status", "value": sos_status, "unit": "", "trend": "All clear" if sos_status == "Safe" else "Active", "trendUp": sos_status == "Safe", "accent": "emerald" if sos_status == "Safe" else "rose"},
        ],
        "statusPills": [
            {"id": "cane", "label": "Smart Cane Connected", "tone": "success"},
            {"id": "cloud", "label": "Cloud Synced", "tone": "info"},
            {"id": "npu", "label": "RKNN NPU Active", "tone": "info"},
        ],
        "hardwareStatus": [
            {"id": "camera", "label": "Camera", "icon": "Camera", "status": "online"},
            {"id": "ultrasonic", "label": "Dual JSN-SR04T", "icon": "Radar", "status": "online"},
            {"id": "battery", "label": "2S 18650 Battery", "icon": "BatteryFull", "status": "online"},
            {"id": "gps", "label": "GPS", "icon": "MapPin", "status": "online"},
            {"id": "speaker", "label": "Bluetooth Audio", "icon": "Volume2", "status": "online"},
            {"id": "radxa", "label": "Radxa ZERO 3W", "icon": "Cpu", "status": "online"},
            {"id": "cloud", "label": "Cloud", "icon": "Cloud", "status": "online"},
        ],
        "deviceHealth": [
            {"id": "battery", "label": "Battery", "value": 86, "tone": "emerald"},
            {"id": "cpu", "label": "CPU", "value": 42, "tone": "indigo"},
            {"id": "temp", "label": "Temperature", "value": 54, "tone": "amber", "suffix": "°C"},
            {"id": "storage", "label": "Storage", "value": 63, "tone": "blue"},
            {"id": "ram", "label": "RAM", "value": 38, "tone": "indigo"},
        ],
    }


# ------------------------------------------------------------------ seeding
async def seed_user_data(uid: str):
    if await db.contacts.count_documents({"user_id": uid}) > 0:
        return
    base = datetime.now(timezone.utc)
    contacts = [
        {"name": "Priya Sharma", "relation": "Daughter", "phone": "+91 98••• ••210", "primary": True},
        {"name": "Dr. Mehta", "relation": "Physician", "phone": "+91 98••• ••554", "primary": False},
        {"name": "Rahul Verma", "relation": "Neighbour", "phone": "+91 99••• ••102", "primary": False},
    ]
    for c in contacts:
        await db.contacts.insert_one({"id": str(uuid.uuid4()), "user_id": uid, "created_at": now_iso(), **c})

    journeys = [
        {"route": "Home → Office", "distance": "3.2 km", "duration": "42 min", "detections": 24},
        {"route": "Office → Cafe", "distance": "1.1 km", "duration": "16 min", "detections": 9},
        {"route": "Cafe → Home", "distance": "2.8 km", "duration": "38 min", "detections": 18},
        {"route": "Home → Park", "distance": "2.4 km", "duration": "31 min", "detections": 21},
    ]
    for i, j in enumerate(journeys):
        ts = (base - timedelta(days=i)).isoformat()
        await db.journeys.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid,
            "date": (base - timedelta(days=i)).strftime("%b %d, %Y"),
            "created_at": ts, **j,
        })

    dets = [
        ("Person", 98), ("Chair", 94), ("Door", 91), ("Stairs", 89), ("Obstacle", 87),
        ("Person", 96), ("Chair", 90), ("Person", 93), ("Door", 88), ("Vehicle", 85),
    ]
    for i, (label, conf) in enumerate(dets):
        ts = (base - timedelta(minutes=i * 6)).isoformat()
        await db.detections.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid, "label": label,
            "confidence": conf, "source": "cane", "created_at": ts,
        })

    sos = [
        {"type": "Manual Trigger", "status": "Resolved", "location": "MG Road, Bengaluru"},
        {"type": "Fall Detected", "status": "Resolved", "location": "Indiranagar, Bengaluru"},
    ]
    for i, s in enumerate(sos):
        ts = (base - timedelta(days=i * 5 + 2)).isoformat()
        await db.sos_events.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid,
            "time": (base - timedelta(days=i * 5 + 2)).strftime("%b %d, %Y · %I:%M %p"),
            "created_at": ts, **s,
        })


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@navify.io").lower()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        res = await db.users.insert_one({
            "email": email, "password_hash": hash_password(password),
            "name": "Ravi Thanya", "role": "admin", "created_at": now_iso(),
        })
        await seed_user_data(str(res.inserted_id))
        logger.info(f"Seeded admin user {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
