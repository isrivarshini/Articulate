from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class SkillNode(Base):
    __tablename__ = "skill_nodes"

    id = Column(Integer, primary_key=True, index=True)
    branch = Column(String(50), nullable=False)        # scenarios, prompts, debates, stories
    label = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=False)
    order_index = Column(Integer, nullable=False)       # position in the path
    required_xp = Column(Integer, default=0)            # XP needed to unlock


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    node_id = Column(Integer, ForeignKey("skill_nodes.id"), nullable=False, index=True)
    state = Column(String(20), default="locked")       # locked, current, done
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())