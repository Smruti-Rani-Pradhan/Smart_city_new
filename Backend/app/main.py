import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes_auth import router as auth_router
from app.routes_incidents import router as incident_router
from app.routes_tickets import router as ticket_router
from app.routes_ws import router as ws_router
from app.routes_users import router as users_router
from app.routes_analytics import router as analytics_router
from app.routes_public import router as public_router
from app.database import init_db
from app.config.settings import settings

app = FastAPI(title="SafeLive Smart Incident Backend")

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.CORS_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

os.makedirs(settings.IMAGE_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=settings.IMAGE_DIR), name="images")

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(ticket_router)
app.include_router(ws_router)
app.include_router(users_router)
app.include_router(analytics_router)
app.include_router(public_router)

@app.on_event("startup")
def startup():
    init_db()
