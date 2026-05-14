from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.badge import Badge, UserBadge
from app.models.session import PracticeSession


# XP thresholds per level
LEVEL_THRESHOLDS = [
    0, 500, 1200, 2100, 3200, 4500, 6000, 8000, 10500, 13500,
    17000, 21000, 25500, 30500, 36000, 42000, 48500, 55500, 63000, 71000,
]


def get_level_for_xp(xp: int) -> int:
    """Determine level based on total XP."""
    for i in range(len(LEVEL_THRESHOLDS) - 1, -1, -1):
        if xp >= LEVEL_THRESHOLDS[i]:
            return i + 1
    return 1


async def award_xp(db: AsyncSession, user: User, xp: int) -> User:
    """Add XP and update level."""
    user.xp += xp
    user.level = get_level_for_xp(user.xp)
    db.add(user)
    return user


async def update_streak(db: AsyncSession, user: User) -> User:
    """Update daily streak based on last practice date."""
    now = datetime.now(timezone.utc)
    today = now.date()

    if user.last_practice_date:
        last_date = user.last_practice_date.date()
        if last_date == today:
            # Already practiced today, no change
            pass
        elif last_date == today - timedelta(days=1):
            # Consecutive day
            user.streak_days += 1
            user.longest_streak = max(user.longest_streak, user.streak_days)
        else:
            # Streak broken
            user.streak_days = 1
    else:
        # First ever practice
        user.streak_days = 1

    user.last_practice_date = now
    db.add(user)
    return user


async def check_and_award_badges(db: AsyncSession, user: User) -> list[dict]:
    """Check if user qualifies for any new badges and award them."""
    # Get user's existing badges
    result = await db.execute(
        select(UserBadge.badge_id).where(UserBadge.user_id == user.id)
    )
    existing_badge_ids = set(row[0] for row in result.all())

    # Get all badges
    result = await db.execute(select(Badge))
    all_badges = result.scalars().all()

    # Get session count
    result = await db.execute(
        select(func.count(PracticeSession.id)).where(PracticeSession.user_id == user.id)
    )
    session_count = result.scalar() or 0

    # Get best score
    result = await db.execute(
        select(func.max(PracticeSession.composite_score)).where(PracticeSession.user_id == user.id)
    )
    best_score = result.scalar() or 0

    newly_earned = []

    for badge in all_badges:
        if badge.id in existing_badge_ids:
            continue

        earned = False
        if badge.requirement_type == "sessions_count":
            earned = session_count >= badge.requirement_value
        elif badge.requirement_type == "streak_days":
            earned = user.streak_days >= badge.requirement_value
        elif badge.requirement_type == "score_threshold":
            earned = best_score >= badge.requirement_value
        elif badge.requirement_type == "xp_total":
            earned = user.xp >= badge.requirement_value

        if earned:
            user_badge = UserBadge(user_id=user.id, badge_id=badge.id)
            db.add(user_badge)
            newly_earned.append({
                "name": badge.name,
                "emoji": badge.emoji,
                "description": badge.description,
            })

    return newly_earned