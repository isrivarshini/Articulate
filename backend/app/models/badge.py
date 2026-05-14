from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    emoji = Column(String(10), nullable=True)
    category = Column(String(50), nullable=True)  # streak, skill, milestone
    requirement_type = Column(String(50), nullable=False)  # sessions_count, streak_days, score_threshold, xp_total
    requirement_value = Column(Integer, nullable=False)


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False, index=True)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", lazy="joined")