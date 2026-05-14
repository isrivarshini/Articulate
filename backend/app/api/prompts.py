import random
from fastapi import APIRouter

router = APIRouter(prefix="/prompts", tags=["prompts"])

# Prompt bank organized by mode and context
PROMPT_BANK = {
    "scenarios": {
        "Technical": [
            "Explain to a non-technical stakeholder why the database migration is blocking the launch — without making them panic.",
            "Your team's deploy broke production at 2 AM. Walk your manager through what happened, what you did, and what you'll do to prevent it.",
            "A junior engineer just pushed code that bypasses authentication. Explain why this is critical without making them feel terrible.",
            "Convince your CTO to adopt a new framework when the team is already behind on delivery.",
            "Explain the concept of technical debt to a product manager who wants to ship faster.",
        ],
        "Work": [
            "You're in a 1-on-1 and your manager asks why the project is behind schedule. Respond honestly without throwing anyone under the bus.",
            "A colleague keeps taking credit for your ideas in meetings. Address this directly but professionally.",
            "Your team disagrees on the approach. Facilitate a resolution without picking sides.",
            "Deliver a project status update to leadership when you have mixed news — some wins, some risks.",
            "Negotiate a deadline extension with a stakeholder who is already frustrated.",
        ],
        "Interviews": [
            "Walk the interviewer through your most impactful project from start to finish.",
            "Describe a time you disagreed with a technical decision and what you did about it.",
            "Explain a gap in your resume confidently and pivot to your strengths.",
            "Answer 'Why should we hire you?' without sounding rehearsed or arrogant.",
            "Describe a failure, what you learned, and how you applied the lesson.",
        ],
        "Presentations": [
            "Open a technical presentation with a hook that makes a non-technical audience care.",
            "Summarize a complex architecture decision in under 90 seconds for an executive audience.",
            "Close a demo presentation with a compelling call to action.",
            "Transition smoothly between two unrelated topics in a presentation.",
            "Handle a tough audience question mid-presentation without losing your thread.",
        ],
        "Social": [
            "Introduce yourself at a networking event in a way that's memorable but not try-hard.",
            "Make small talk with a stranger at a conference when you'd rather be on your phone.",
            "Gracefully exit a conversation that's going nowhere at a social event.",
            "Explain what you do for a living to someone who's never heard of your industry.",
            "Respond when someone asks 'So what's next for you?' and you genuinely don't know.",
        ],
        "Content Creation": [
            "Record a 60-second hook for a YouTube video about a technical topic you love.",
            "Explain a complex concept in exactly 30 seconds for a TikTok-style clip.",
            "Do a cold open for a podcast episode about your biggest professional lesson.",
            "Tell a personal story in 90 seconds that connects to a broader professional insight.",
            "Pitch an idea for a blog post to a content editor in under a minute.",
        ],
    },
    "prompts": {
        "Technical": [
            "In 60 seconds, explain the difference between concurrency and parallelism using an analogy a junior engineer would understand.",
            "Explain what a race condition is using a real-world metaphor.",
            "Describe the CAP theorem to someone who's never heard of it.",
            "Explain why you'd choose a microservices architecture over a monolith — or vice versa.",
            "Walk through how HTTPS works in plain language.",
        ],
        "Work": [
            "Explain your team's biggest win this quarter in 60 seconds.",
            "Describe your ideal work environment and why.",
            "Pitch a process improvement idea to your manager.",
            "Summarize the last book or article that changed how you work.",
            "Explain a lesson you learned the hard way at work.",
        ],
    },
    "debates": {
        "Technical": [
            'Defend the position: "Microservices are over-engineered for teams under 20 engineers." No retreat.',
            'Argue: "AI code generation will make junior developer roles obsolete within 5 years."',
            'Take a side: "TypeScript is not worth the overhead for small projects."',
            'Defend: "Code reviews are more valuable than automated testing."',
            'Argue: "Monorepos are strictly superior to multi-repo setups."',
        ],
        "Work": [
            'Defend: "Remote work produces better output than office work for engineering teams."',
            'Argue: "Meetings are a net negative for productivity and should be eliminated wherever possible."',
            'Take a side: "Unlimited PTO policies actually result in employees taking less time off."',
            'Defend: "Every engineer should spend at least 20% of their time on learning."',
            'Argue: "The best career move is changing companies every 2 years."',
        ],
    },
    "stories": {
        "Technical": [
            "Walk through a production incident you led: the alert, the hypothesis, the root cause, the fix, the follow-up.",
            "Tell the story of the hardest bug you ever debugged — what made it hard, and what cracked it.",
            "Describe a feature you built that you're genuinely proud of. What made it special?",
            "Tell the story of a code review that taught you something fundamental.",
            "Walk through a system design decision that seemed right at the time but turned out to be wrong.",
        ],
        "Work": [
            "Tell the story of your best collaboration with a non-technical team member.",
            "Describe a time when mentoring someone taught you more than it taught them.",
            "Walk through a project pivot — what changed, why, and how you adapted.",
            "Tell the story of a time you said no to something at work and it was the right call.",
            "Describe the moment you realized you were ready for more responsibility.",
        ],
    },
}


@router.get("/{mode}")
async def get_prompts(mode: str, context: str = "Technical"):
    if mode not in PROMPT_BANK:
        return {"prompts": [], "error": f"Unknown mode: {mode}"}

    mode_prompts = PROMPT_BANK[mode]
    context_prompts = mode_prompts.get(context, mode_prompts.get("Technical", []))

    return {"mode": mode, "context": context, "prompts": context_prompts}


@router.get("/{mode}/random")
async def get_random_prompt(mode: str, context: str = "Technical"):
    if mode not in PROMPT_BANK:
        return {"prompt": None, "error": f"Unknown mode: {mode}"}

    mode_prompts = PROMPT_BANK[mode]
    context_prompts = mode_prompts.get(context, mode_prompts.get("Technical", []))

    if not context_prompts:
        return {"prompt": None, "error": "No prompts available for this context"}

    return {"mode": mode, "context": context, "prompt": random.choice(context_prompts)}