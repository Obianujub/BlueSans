from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============= MODELS =============

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    hashed_password: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    username: str

class Artisan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    location: str
    job_type: str
    photo_url: Optional[str] = None
    status: str = "approved"
    average_rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArtisanCreate(BaseModel):
    name: str
    phone: str
    location: str
    job_type: str
    photo_url: Optional[str] = None

class ArtisanUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    artisan_id: str
    user_name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    artisan_id: str
    user_name: str
    rating: int = Field(ge=1, le=5)
    comment: str

class WorkerSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    location: str
    job_type: str
    status: str = "pending"
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkerSubmissionCreate(BaseModel):
    name: str
    phone: str
    location: str
    job_type: str

# ============= UTILITIES =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(username: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {
        'username': username,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    username = payload.get('username')
    admin = await db.admins.find_one({'username': username}, {'_id': 0})
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")
    return admin

# ============= AUTH ROUTES =============

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: AdminLogin):
    admin = await db.admins.find_one({'username': credentials.username}, {'_id': 0})
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not verify_password(credentials.password, admin['hashed_password']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    token = create_token(credentials.username)
    return TokenResponse(token=token, username=credentials.username)

@api_router.get("/auth/verify")
async def verify_auth(admin: dict = Depends(get_current_admin)):
    return {"username": admin['username'], "role": admin['role']}

# ============= ARTISAN ROUTES =============

@api_router.get("/artisans", response_model=List[Artisan])
async def get_artisans(job_type: Optional[str] = None, location: Optional[str] = None):
    query = {'status': 'approved'}
    if job_type:
        query['job_type'] = job_type
    if location:
        query['location'] = {'$regex': location, '$options': 'i'}
    
    artisans = await db.artisans.find(query, {'_id': 0}).sort('created_at', -1).to_list(1000)
    for artisan in artisans:
        if isinstance(artisan.get('created_at'), str):
            artisan['created_at'] = datetime.fromisoformat(artisan['created_at'])
    return artisans

@api_router.get("/artisans/{artisan_id}", response_model=Artisan)
async def get_artisan(artisan_id: str):
    artisan = await db.artisans.find_one({'id': artisan_id}, {'_id': 0})
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    if isinstance(artisan.get('created_at'), str):
        artisan['created_at'] = datetime.fromisoformat(artisan['created_at'])
    return artisan

@api_router.post("/artisans", response_model=Artisan)
async def create_artisan(artisan_data: ArtisanCreate, admin: dict = Depends(get_current_admin)):
    artisan = Artisan(**artisan_data.model_dump())
    doc = artisan.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.artisans.insert_one(doc)
    return artisan

@api_router.put("/artisans/{artisan_id}", response_model=Artisan)
async def update_artisan(artisan_id: str, artisan_data: ArtisanUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.artisans.find_one({'id': artisan_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Artisan not found")
    
    update_data = {k: v for k, v in artisan_data.model_dump().items() if v is not None}
    if update_data:
        await db.artisans.update_one({'id': artisan_id}, {'$set': update_data})
    
    updated = await db.artisans.find_one({'id': artisan_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Artisan(**updated)

@api_router.delete("/artisans/{artisan_id}")
async def delete_artisan(artisan_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.artisans.delete_one({'id': artisan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artisan not found")
    await db.reviews.delete_many({'artisan_id': artisan_id})
    return {"message": "Artisan deleted successfully"}

# ============= REVIEW ROUTES =============

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate):
    artisan = await db.artisans.find_one({'id': review_data.artisan_id}, {'_id': 0})
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    
    review = Review(**review_data.model_dump())
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    reviews = await db.reviews.find({'artisan_id': review_data.artisan_id}, {'_id': 0}).to_list(1000)
    total_reviews = len(reviews)
    avg_rating = sum(r['rating'] for r in reviews) / total_reviews if total_reviews > 0 else 0
    
    await db.artisans.update_one(
        {'id': review_data.artisan_id},
        {'$set': {'average_rating': round(avg_rating, 1), 'total_reviews': total_reviews}}
    )
    
    return review

@api_router.get("/reviews/{artisan_id}", response_model=List[Review])
async def get_reviews(artisan_id: str):
    reviews = await db.reviews.find({'artisan_id': artisan_id}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

# ============= SUBMISSION ROUTES =============

@api_router.post("/submissions", response_model=WorkerSubmission)
async def create_submission(submission_data: WorkerSubmissionCreate):
    submission = WorkerSubmission(**submission_data.model_dump())
    doc = submission.model_dump()
    doc['submitted_at'] = doc['submitted_at'].isoformat()
    await db.worker_submissions.insert_one(doc)
    return submission

@api_router.get("/submissions", response_model=List[WorkerSubmission])
async def get_submissions(admin: dict = Depends(get_current_admin)):
    submissions = await db.worker_submissions.find({}, {'_id': 0}).sort('submitted_at', -1).to_list(1000)
    for submission in submissions:
        if isinstance(submission.get('submitted_at'), str):
            submission['submitted_at'] = datetime.fromisoformat(submission['submitted_at'])
    return submissions

@api_router.put("/submissions/{submission_id}/approve")
async def approve_submission(submission_id: str, admin: dict = Depends(get_current_admin)):
    submission = await db.worker_submissions.find_one({'id': submission_id}, {'_id': 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    artisan = Artisan(
        name=submission['name'],
        phone=submission['phone'],
        location=submission['location'],
        job_type=submission['job_type']
    )
    doc = artisan.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.artisans.insert_one(doc)
    
    await db.worker_submissions.update_one(
        {'id': submission_id},
        {'$set': {'status': 'approved'}}
    )
    
    return {"message": "Submission approved and artisan created", "artisan_id": artisan.id}

@api_router.delete("/submissions/{submission_id}")
async def delete_submission(submission_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.worker_submissions.delete_one({'id': submission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission deleted successfully"}

# ============= UTILITY ROUTES =============

@api_router.get("/job-types")
async def get_job_types():
    return {
        "job_types": [
            "Mechanic",
            "Electrician",
            "Plumber",
            "Carpenter",
            "Painter",
            "Welder",
            "Bricklayer",
            "Tiler",
            "HVAC Technician",
            "Other"
        ]
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def startup_db():
    admin_exists = await db.admins.find_one({'username': 'admin'})
    if not admin_exists:
        default_admin = Admin(
            username='admin',
            hashed_password=hash_password('admin123'),
            role='admin'
        )
        doc = default_admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admins.insert_one(doc)
        logger.info("Default admin created: username='admin', password='admin123'")
