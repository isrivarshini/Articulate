from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_practice_date = Column(DateTime(timezone=True), nullable=True)

    # Meta
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sessions = relationship("PracticeSession", back_populates="user", lazy="selectin")
    badges = relationship("UserBadge", back_populates="user", lazy="selectin")