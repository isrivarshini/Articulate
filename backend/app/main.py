from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.practice import router as practice_router
from app.api.social import router as social_router
from app.api.prompts import router as prompts_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created.")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Articulate API",
    description="Backend for Articulate — a speaking and verbal articulation improvement app",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api")
app.include_router(practice_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(prompts_router, prefix="/api")


@app.get("/")
async def root():
    return {"app": "Articulate", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}