from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.models.badge import Badge, UserBadge
from app.schemas import LeaderboardEntry, UserStats, BadgeResponse

router = APIRouter(tags=["social"])


# ─── Leaderboard ─────────────────────────────────────────────────────────────

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .order_by(desc(User.xp))
        .limit(limit)
    )
    users = result.scalars().all()

    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=u.id,
            username=u.username,
            display_name=u.display_name,
            xp=u.xp,
            streak_days=u.streak_days,
            avatar_url=u.avatar_url,
        )
        for i, u in enumerate(users)
    ]


# ─── User Stats ──────────────────────────────────────────────────────────────

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Total sessions
    result = await db.execute(
        select(func.count(PracticeSession.id)).where(PracticeSession.user_id == user.id)
    )
    total_sessions = result.scalar() or 0

    # Average score
    result = await db.execute(
        select(func.avg(PracticeSession.composite_score)).where(
            PracticeSession.user_id == user.id,
            PracticeSession.composite_score.isnot(None),
        )
    )
    avg_score = result.scalar()

    # Score history (last 30)
    result = await db.execute(
        select(PracticeSession.composite_score)
        .where(
            PracticeSession.user_id == user.id,
            PracticeSession.composite_score.isnot(None),
        )
        .order_by(desc(PracticeSession.created_at))
        .limit(30)
    )
    scores = [row[0] for row in result.all()]
    scores.reverse()  # chronological order

    return UserStats(
        total_xp=user.xp,
        level=user.level,
        streak_days=user.streak_days,
        longest_streak=user.longest_streak,
        total_sessions=total_sessions,
        avg_score=round(avg_score, 1) if avg_score else None,
        score_history=scores,
    )


# ─── Badges ──────────────────────────────────────────────────────────────────

@router.get("/badges", response_model=list[BadgeResponse])
async def get_badges(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get all badges
    result = await db.execute(select(Badge))
    all_badges = result.scalars().all()

    # Get user's earned badges
    result = await db.execute(
        select(UserBadge).where(UserBadge.user_id == user.id)
    )
    earned = {ub.badge_id: ub.earned_at for ub in result.scalars().all()}

    return [
        BadgeResponse(
            id=b.id,
            name=b.name,
            description=b.description,
            emoji=b.emoji,
            category=b.category,
            earned=b.id in earned,
            earned_at=earned.get(b.id),
        )
        for b in all_badges
    ]