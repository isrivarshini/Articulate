"""Seed the database with initial badges and skill nodes."""
import asyncio
from sqlalchemy import select
from app.core.database import engine, async_session, Base
from app.models.badge import Badge
from app.models.skill import SkillNode


INITIAL_BADGES = [
    {"name": "First Word", "emoji": "✦", "category": "milestone", "description": "Complete your first practice session", "requirement_type": "sessions_count", "requirement_value": 1},
    {"name": "Week Warrior", "emoji": "🔥", "category": "streak", "description": "Maintain a 7-day streak", "requirement_type": "streak_days", "requirement_value": 7},
    {"name": "Smooth Talker", "emoji": "◆", "category": "skill", "description": "Score 80+ on clarity", "requirement_type": "score_threshold", "requirement_value": 80},
    {"name": "Debate Champ", "emoji": "⚔", "category": "skill", "description": "Complete 10 debate sessions", "requirement_type": "sessions_count", "requirement_value": 10},
    {"name": "Storyteller", "emoji": "✎", "category": "skill", "description": "Complete 10 story sessions", "requirement_type": "sessions_count", "requirement_value": 10},
    {"name": "30-Day Streak", "emoji": "⚡", "category": "streak", "description": "Maintain a 30-day streak", "requirement_type": "streak_days", "requirement_value": 30},
    {"name": "Vocabulary God", "emoji": "✸", "category": "skill", "description": "Earn 25,000 total XP", "requirement_type": "xp_total", "requirement_value": 25000},
    {"name": "Stage Ready", "emoji": "✰", "category": "milestone", "description": "Score 90+ composite", "requirement_type": "score_threshold", "requirement_value": 90},
]

INITIAL_SKILL_NODES = [
    {"branch": "scenarios", "label": "First Words", "icon": "A", "order_index": 1, "required_xp": 0},
    {"branch": "scenarios", "label": "Self-Intro", "icon": "B", "order_index": 2, "required_xp": 100},
    {"branch": "prompts", "label": "60-sec Riff", "icon": "C", "order_index": 3, "required_xp": 300},
    {"branch": "prompts", "label": "Topic Toss", "icon": "D", "order_index": 4, "required_xp": 600},
    {"branch": "scenarios", "label": "Small Talk", "icon": "E", "order_index": 5, "required_xp": 1000},
    {"branch": "debates", "label": "Soft Debates", "icon": "F", "order_index": 6, "required_xp": 1500},
    {"branch": "prompts", "label": "Speed Pivot", "icon": "G", "order_index": 7, "required_xp": 2100},
    {"branch": "stories", "label": "Mini Story", "icon": "H", "order_index": 8, "required_xp": 2800},
    {"branch": "scenarios", "label": "Conflict Talk", "icon": "I", "order_index": 9, "required_xp": 3600},
    {"branch": "debates", "label": "Hot Takes", "icon": "J", "order_index": 10, "required_xp": 4500},
    {"branch": "stories", "label": "The Setup", "icon": "K", "order_index": 11, "required_xp": 5500},
    {"branch": "scenarios", "label": "Pitch It", "icon": "L", "order_index": 12, "required_xp": 6600},
    {"branch": "prompts", "label": "Free Association", "icon": "M", "order_index": 13, "required_xp": 7800},
    {"branch": "debates", "label": "Cross-Examine", "icon": "N", "order_index": 14, "required_xp": 9100},
    {"branch": "stories", "label": "The Twist", "icon": "O", "order_index": 15, "required_xp": 10500},
    {"branch": "scenarios", "label": "Hard Convo", "icon": "P", "order_index": 16, "required_xp": 12000},
    {"branch": "debates", "label": "Steelman", "icon": "Q", "order_index": 17, "required_xp": 13600},
    {"branch": "stories", "label": "Long Form", "icon": "R", "order_index": 18, "required_xp": 15300},
    {"branch": "prompts", "label": "Cold Open", "icon": "S", "order_index": 19, "required_xp": 17100},
    {"branch": "scenarios", "label": "Keynote", "icon": "T", "order_index": 20, "required_xp": 19000},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Seed badges
        result = await session.execute(select(Badge))
        if not result.scalars().first():
            for b in INITIAL_BADGES:
                session.add(Badge(**b))
            print(f"Seeded {len(INITIAL_BADGES)} badges")

        # Seed skill nodes
        result = await session.execute(select(SkillNode))
        if not result.scalars().first():
            for n in INITIAL_SKILL_NODES:
                session.add(SkillNode(**n))
            print(f"Seeded {len(INITIAL_SKILL_NODES)} skill nodes")

        await session.commit()
        print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())