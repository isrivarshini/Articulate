from pydantic import BaseModel, EmailStr
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    display_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    display_name: str | None
    avatar_url: str | None
    xp: int
    level: int
    streak_days: int
    longest_streak: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Practice Sessions ───────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    mode: str
    context: str | None = None
    prompt_text: str | None = None


class FillerWordDetail(BaseModel):
    word: str
    count: int


class StrongWordDetail(BaseModel):
    word: str
    tag: str


class VocabUpgrade(BaseModel):
    original: str
    suggestion: str


class LexicalMetrics(BaseModel):
    unique_words_ratio: float
    avg_syllables_per_word: float
    domain_precision: str
    hedge_word_count: int
    reading_grade_level: float


class AnalysisResponse(BaseModel):
    session_id: int
    audio_duration_sec: float
    word_count: int
    words_per_minute: float

    clarity_score: int
    vocabulary_score: int
    confidence_score: int
    composite_score: int

    filler_words: list[FillerWordDetail]
    strong_words: list[StrongWordDetail]
    suggested_upgrades: list[VocabUpgrade]
    lexical_metrics: LexicalMetrics

    transcript: str
    coach_feedback: str
    improvement_tips: list[str]
    xp_earned: int


class SessionResponse(BaseModel):
    id: int
    mode: str
    context: str | None
    prompt_text: str | None
    composite_score: int | None
    xp_earned: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Leaderboard ─────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    display_name: str | None
    xp: int
    streak_days: int
    avatar_url: str | None


# ─── Skill Tree ──────────────────────────────────────────────────────────────

class SkillNodeResponse(BaseModel):
    id: int
    branch: str
    label: str
    icon: str
    order_index: int
    state: str  # locked, current, done

    class Config:
        from_attributes = True


# ─── Badges ──────────────────────────────────────────────────────────────────

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str | None
    emoji: str | None
    category: str | None
    earned: bool
    earned_at: datetime | None = None

    class Config:
        from_attributes = True


# ─── Stats ───────────────────────────────────────────────────────────────────

class UserStats(BaseModel):
    total_xp: int
    level: int
    streak_days: int
    longest_streak: int
    total_sessions: int
    avg_score: float | None
    score_history: list[int]  # last 30 composite scores