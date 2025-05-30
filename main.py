
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Enum, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum as PyEnum
import uuid
import math

# Database setup
DATABASE_URL = "postgresql://user:password@localhost/climbing_tracker"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enums
class ClimbType(PyEnum):
    BOULDER = "boulder"
    SPORT = "sport"
    TRAD = "trad"
    TOP_ROPE = "top_rope"

class LocationType(PyEnum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"

class GradeSystem(PyEnum):
    V_SCALE = "v_scale"  # V0-V17 for bouldering
    YDS = "yds"         # 5.0-5.15 for sport/trad
    FONT = "font"       # 4a-9a for European bouldering

class FriendshipStatus(PyEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    bio = Column(Text)
    location = Column(String(100))
    home_latitude = Column(Float)
    home_longitude = Column(Float)
    preferred_grade_system = Column(Enum(GradeSystem), default=GradeSystem.V_SCALE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = relationship("ClimbingSession", back_populates="user")
    friendships_sent = relationship("Friendship", foreign_keys="Friendship.requester_id", back_populates="requester")
    friendships_received = relationship("Friendship", foreign_keys="Friendship.addressee_id", back_populates="addressee")
    comments = relationship("SessionComment", back_populates="user")
    likes = relationship("SessionLike", back_populates="user")

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    location_type = Column(Enum(LocationType), nullable=False)
    address = Column(String(300))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text)
    website = Column(String(200))
    phone = Column(String(20))
    
    # Gym-specific fields
    day_pass_price = Column(Float)
    monthly_price = Column(Float)
    
    # Outdoor-specific fields
    approach_time = Column(Integer)  # minutes
    difficulty_range = Column(String(50))  # e.g., "V0-V8"
    rock_type = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = relationship("ClimbingSession", back_populates="location")

class ClimbingSession(Base):
    __tablename__ = "climbing_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))
    
    date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)  # session duration
    notes = Column(Text)
    energy_level = Column(Integer)  # 1-10 scale
    conditions = Column(String(100))  # weather for outdoor, crowd level for indoor
    
    # Session metrics (calculated from climbs)
    total_climbs = Column(Integer, default=0)
    sends = Column(Integer, default=0)  # successful completions
    attempts = Column(Integer, default=0)  # total attempts including fails
    max_grade = Column(String(10))  # hardest grade sent
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    location = relationship("Location", back_populates="sessions")
    climbs = relationship("Climb", back_populates="session")
    comments = relationship("SessionComment", back_populates="session")
    likes = relationship("SessionLike", back_populates="session")

class Climb(Base):
    __tablename__ = "climbs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("climbing_sessions.id"), nullable=False)
    
    climb_type = Column(Enum(ClimbType), nullable=False)
    grade = Column(String(10), nullable=False)  # V0, 5.10a, etc.
    grade_system = Column(Enum(GradeSystem), nullable=False)
    
    # Route/problem details
    route_name = Column(String(200))
    route_setter = Column(String(100))  # for gym routes
    color = Column(String(50))  # route color/tag
    
    # Performance tracking
    sent = Column(Boolean, default=False)  # successfully completed
    attempts = Column(Integer, default=1)
    flash = Column(Boolean, default=False)  # sent on first try
    onsight = Column(Boolean, default=False)  # sent first try without beta
    
    # Additional details
    style_notes = Column(Text)  # climbing style, technique notes
    beta = Column(Text)  # sequence description
    rating = Column(Integer)  # 1-5 stars for route quality
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("ClimbingSession", back_populates="climbs")

class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    addressee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(FriendshipStatus), default=FriendshipStatus.PENDING)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="friendships_sent")
    addressee = relationship("User", foreign_keys=[addressee_id], back_populates="friendships_received")

class SessionComment(Base):
    __tablename__ = "session_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("climbing_sessions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    session = relationship("ClimbingSession", back_populates="comments")
    user = relationship("User", back_populates="comments")

class SessionLike(Base):
    __tablename__ = "session_likes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("climbing_sessions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("ClimbingSession", back_populates="likes")
    user = relationship("User", back_populates="likes")

# Pydantic models for API
class UserCreate(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    home_latitude: Optional[float] = None
    home_longitude: Optional[float] = None
    preferred_grade_system: Optional[GradeSystem] = GradeSystem.V_SCALE

class ClimbCreate(BaseModel):
    climb_type: ClimbType
    grade: str
    grade_system: GradeSystem
    route_name: Optional[str] = None
    route_setter: Optional[str] = None
    color: Optional[str] = None
    sent: bool = False
    attempts: int = 1
    flash: bool = False
    onsight: bool = False
    style_notes: Optional[str] = None
    beta: Optional[str] = None
    rating: Optional[int] = None

class SessionCreate(BaseModel):
    location_id: Optional[str] = None
    date: datetime
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    energy_level: Optional[int] = None
    conditions: Optional[str] = None
    climbs: List[ClimbCreate] = []

class LocationCreate(BaseModel):
    name: str
    location_type: LocationType
    address: Optional[str] = None
    latitude: float
    longitude: float
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    day_pass_price: Optional[float] = None
    monthly_price: Optional[float] = None
    approach_time: Optional[int] = None
    difficulty_range: Optional[str] = None
    rock_type: Optional[str] = None

# FastAPI app
app = FastAPI(title="Climbing Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

def update_session_metrics(session: ClimbingSession, db: Session):
    """Update session metrics based on climbs"""
    climbs = db.query(Climb).filter(Climb.session_id == session.id).all()
    
    session.total_climbs = len(climbs)
    session.sends = len([c for c in climbs if c.sent])
    session.attempts = sum(c.attempts for c in climbs)
    
    # Find max grade (simplified - would need proper grade comparison logic)
    sent_climbs = [c for c in climbs if c.sent]
    if sent_climbs:
        session.max_grade = max(sent_climbs, key=lambda x: x.grade).grade
    
    db.commit()

# API Endpoints

# User endpoints
@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/{user_id}/progress")
def get_user_progress(user_id: str, days: int = 90, db: Session = Depends(get_db)):
    """Get user's climbing progress analytics"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get sessions in date range
    sessions = db.query(ClimbingSession).filter(
        ClimbingSession.user_id == user_id,
        ClimbingSession.date >= cutoff_date
    ).all()
    
    # Get all climbs from these sessions
    session_ids = [s.id for s in sessions]
    climbs = db.query(Climb).filter(Climb.session_id.in_(session_ids)).all()
    
    # Calculate metrics
    total_sessions = len(sessions)
    total_climbs = len(climbs)
    total_sends = len([c for c in climbs if c.sent])
    send_ratio = total_sends / total_climbs if total_climbs > 0 else 0
    
    # Grade distribution
    grade_counts = {}
    for climb in climbs:
        if climb.sent:
            grade_counts[climb.grade] = grade_counts.get(climb.grade, 0) + 1
    
    # Session frequency (sessions per week)
    weeks = max(1, days / 7)
    session_frequency = total_sessions / weeks
    
    return {
        "period_days": days,
        "total_sessions": total_sessions,
        "total_climbs": total_climbs,
        "total_sends": total_sends,
        "send_ratio": round(send_ratio, 3),
        "session_frequency_per_week": round(session_frequency, 2),
        "grade_distribution": grade_counts,
        "avg_session_duration": sum(s.duration_minutes or 0 for s in sessions) / max(1, total_sessions)
    }

# Session endpoints
@app.post("/sessions/")
def create_session(session_data: SessionCreate, user_id: str, db: Session = Depends(get_db)):
    # Create session
    session_dict = session_data.dict(exclude={'climbs'})
    session_dict['user_id'] = user_id
    
    db_session = ClimbingSession(**session_dict)
    db.add(db_session)
    db.flush()  # Get session ID
    
    # Add climbs
    for climb_data in session_data.climbs:
        climb_dict = climb_data.dict()
        climb_dict['session_id'] = db_session.id
        db_climb = Climb(**climb_dict)
        db.add(db_climb)
    
    db.commit()
    
    # Update session metrics
    update_session_metrics(db_session, db)
    
    db.refresh(db_session)
    return db_session

@app.get("/sessions/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ClimbingSession).filter(ClimbingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/users/{user_id}/sessions")
def get_user_sessions(user_id: str, limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    sessions = db.query(ClimbingSession).filter(
        ClimbingSession.user_id == user_id
    ).order_by(ClimbingSession.date.desc()).offset(offset).limit(limit).all()
    return sessions

# Location endpoints
@app.post("/locations/")
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.get("/locations/nearby")
def get_nearby_locations(
    latitude: float,
    longitude: float,
    radius_km: float = 50,
    location_type: Optional[LocationType] = None,
    db: Session = Depends(get_db)
):
    """Find locations within radius of given coordinates"""
    query = db.query(Location)
    
    if location_type:
        query = query.filter(Location.location_type == location_type)
    
    locations = query.all()
    
    # Filter by distance and add distance field
    nearby_locations = []
    for location in locations:
        distance = calculate_distance(latitude, longitude, location.latitude, location.longitude)
        if distance <= radius_km:
            location_dict = location.__dict__.copy()
            location_dict['distance_km'] = round(distance, 2)
            nearby_locations.append(location_dict)
    
    # Sort by distance
    nearby_locations.sort(key=lambda x: x['distance_km'])
    
    return nearby_locations

# Social features
@app.post("/friendships/")
def send_friend_request(requester_id: str, addressee_id: str, db: Session = Depends(get_db)):
    # Check if friendship already exists
    existing = db.query(Friendship).filter(
        ((Friendship.requester_id == requester_id) & (Friendship.addressee_id == addressee_id)) |
        ((Friendship.requester_id == addressee_id) & (Friendship.addressee_id == requester_id))
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")
    
    friendship = Friendship(requester_id=requester_id, addressee_id=addressee_id)
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return friendship

@app.put("/friendships/{friendship_id}/accept")
def accept_friend_request(friendship_id: str, db: Session = Depends(get_db)):
    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    friendship.status = FriendshipStatus.ACCEPTED
    db.commit()
    return friendship

@app.get("/users/{user_id}/friends")
def get_user_friends(user_id: str, db: Session = Depends(get_db)):
    friendships = db.query(Friendship).filter(
        ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id)) &
        (Friendship.status == FriendshipStatus.ACCEPTED)
    ).all()
    
    friends = []
    for friendship in friendships:
        friend_id = friendship.addressee_id if friendship.requester_id == user_id else friendship.requester_id
        friend = db.query(User).filter(User.id == friend_id).first()
        if friend:
            friends.append(friend)
    
    return friends

@app.get("/users/{user_id}/feed")
def get_user_feed(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    """Get climbing sessions from user's friends"""
    # Get friend IDs
    friendships = db.query(Friendship).filter(
        ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id)) &
        (Friendship.status == FriendshipStatus.ACCEPTED)
    ).all()
    
    friend_ids = []
    for friendship in friendships:
        friend_id = friendship.addressee_id if friendship.requester_id == user_id else friendship.requester_id
        friend_ids.append(friend_id)
    
    # Get recent sessions from friends
    sessions = db.query(ClimbingSession).filter(
        ClimbingSession.user_id.in_(friend_ids)
    ).order_by(ClimbingSession.date.desc()).limit(limit).all()
    
    return sessions

# Session interactions
@app.post("/sessions/{session_id}/comments")
def add_session_comment(session_id: str, content: str, user_id: str, db: Session = Depends(get_db)):
    comment = SessionComment(session_id=session_id, user_id=user_id, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@app.post("/sessions/{session_id}/like")
def like_session(session_id: str, user_id: str, db: Session = Depends(get_db)):
    # Check if already liked
    existing = db.query(SessionLike).filter(
        SessionLike.session_id == session_id,
        SessionLike.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Session already liked")
    
    like = SessionLike(session_id=session_id, user_id=user_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like

@app.delete("/sessions/{session_id}/like")
def unlike_session(session_id: str, user_id: str, db: Session = Depends(get_db)):
    like = db.query(SessionLike).filter(
        SessionLike.session_id == session_id,
        SessionLike.user_id == user_id
    ).first()
    
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    
    db.delete(like)
    db.commit()
    return {"message": "Session unliked"}

# Create tables
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
