from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import UPLOAD_DIR
from app.routes import auth, patients, doctors

app = FastAPI(
    title="Health Tracker API",
    description="Doctor Dashboard & Patient Database API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routes
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)


@app.get("/")
async def root():
    return {
        "message": "Health Tracker API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
