from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Practice context
    mode = Column(String(50), nullable=False)          # scenarios, prompts, debates, stories
    context = Column(String(100), nullable=True)       # Technical, Work, Interviews, etc.
    prompt_text = Column(Text, nullable=True)

    # Audio
    audio_duration_sec = Column(Float, nullable=True)
    word_count = Column(Integer, nullable=True)
    words_per_minute = Column(Float, nullable=True)

    # Scores (0-100)
    clarity_score = Column(Integer, nullable=True)
    vocabulary_score = Column(Integer, nullable=True)
    confidence_score = Column(Integer, nullable=True)
    composite_score = Column(Integer, nullable=True)

    # Detailed analysis (stored as JSON)
    filler_words = Column(JSON, nullable=True)         # {"um": 6, "like": 4, "you know": 2}
    strong_words = Column(JSON, nullable=True)          # [{"word": "idempotent", "tag": "technical"}]
    suggested_upgrades = Column(JSON, nullable=True)    # [{"from": "thing", "to": "mechanism"}]
    lexical_metrics = Column(JSON, nullable=True)       # {"unique_ratio": 0.71, "avg_syllables": 2.1, ...}

    # Transcript
    transcript = Column(Text, nullable=True)
    transcript_annotated = Column(JSON, nullable=True)  # [{text, type: "filler"|"strong"|"normal"}]

    # Coach feedback
    coach_feedback = Column(Text, nullable=True)
    improvement_tips = Column(JSON, nullable=True)      # ["Cut filler words", "Slow the opener"]

    # XP earned
    xp_earned = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="sessions")