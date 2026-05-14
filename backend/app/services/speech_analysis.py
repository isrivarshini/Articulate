import whisper
import tempfile
import os
import re
from collections import Counter
from app.core.config import get_settings

settings = get_settings()

# Load Whisper model once at startup
_model = None


def get_whisper_model():
    global _model
    if _model is None:
        _model = whisper.load_model(settings.whisper_model)
    return _model


# ─── Filler Words ────────────────────────────────────────────────────────────

FILLER_PATTERNS = [
    r"\bum\b", r"\bumm\b", r"\buh\b", r"\buhh\b",
    r"\blike\b", r"\byou know\b", r"\bi mean\b",
    r"\bbasically\b", r"\bactually\b", r"\bliterally\b",
    r"\bkind of\b", r"\bsort of\b", r"\bso\b",
    r"\bright\b", r"\bokay\b",
]

# ─── Strong / Technical Vocabulary ───────────────────────────────────────────

DOMAIN_WORDS = {
    "technical": [
        "idempotent", "deterministic", "latency", "throughput", "concurrency",
        "parallelism", "mutex", "semaphore", "deadlock", "race condition",
        "polymorphism", "encapsulation", "abstraction", "microservice",
        "monolith", "kubernetes", "containerized", "orchestration",
    ],
    "incident lexicon": [
        "blast radius", "root cause", "postmortem", "rollback", "degraded",
        "outage", "sla", "slo", "incident commander", "war room",
    ],
    "distributed sys": [
        "eventual consistency", "cap theorem", "partition tolerance",
        "consensus", "replication", "sharding", "quorum",
    ],
    "data eng": [
        "backfill", "etl", "pipeline", "schema migration", "data warehouse",
        "batch processing", "stream processing",
    ],
    "ops": [
        "rollback path", "feature flag", "canary deploy", "blue-green",
        "circuit breaker", "load balancer", "auto-scaling",
    ],
    "sre": [
        "observability", "telemetry", "monitoring", "alerting", "toil",
        "error budget", "reliability", "chaos engineering",
    ],
}


async def transcribe_audio(audio_bytes: bytes, filename: str) -> dict:
    """Transcribe audio using Whisper and return raw transcript."""
    model = get_whisper_model()

    # Write to temp file (Whisper needs a file path)
    suffix = os.path.splitext(filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path, language="en")
        return {
            "text": result["text"].strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", "en"),
        }
    finally:
        os.unlink(tmp_path)


def analyze_speech(transcript: str, duration_sec: float) -> dict:
    """Run full speech analysis on a transcript."""
    words = transcript.lower().split()
    word_count = len(words)
    wpm = (word_count / duration_sec * 60) if duration_sec > 0 else 0

    # Filler words
    filler_counts = {}
    text_lower = transcript.lower()
    for pattern in FILLER_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches:
            clean_word = matches[0].strip()
            filler_counts[clean_word] = len(matches)
    total_fillers = sum(filler_counts.values())

    # Strong words
    strong_words = []
    for tag, word_list in DOMAIN_WORDS.items():
        for term in word_list:
            if term.lower() in text_lower:
                strong_words.append({"word": term, "tag": tag})

    # Lexical diversity
    unique_words = set(words)
    unique_ratio = len(unique_words) / max(word_count, 1)

    # Syllable count (rough estimate)
    def count_syllables(word):
        word = word.lower().strip(".,!?;:")
        if len(word) <= 3:
            return 1
        count = len(re.findall(r"[aeiouy]+", word))
        return max(count, 1)

    total_syllables = sum(count_syllables(w) for w in words)
    avg_syllables = total_syllables / max(word_count, 1)

    # Hedge words
    hedge_patterns = [r"\bmaybe\b", r"\bperhaps\b", r"\bi think\b", r"\bi guess\b", r"\bprobably\b", r"\bsomewhat\b"]
    hedge_count = sum(len(re.findall(p, text_lower)) for p in hedge_patterns)

    # Reading grade level (Flesch-Kincaid approximation)
    sentence_count = max(len(re.split(r"[.!?]+", transcript)), 1)
    grade_level = (0.39 * (word_count / sentence_count) + 11.8 * (total_syllables / max(word_count, 1)) - 15.59)
    grade_level = max(1.0, min(20.0, grade_level))

    # Vocabulary suggestions
    weak_to_strong = {
        "thing": "mechanism / artifact",
        "stuff": "components / elements",
        "fix it": "mitigate / remediate",
        "fix": "resolve / remediate",
        "really fast": "sub-millisecond",
        "really slow": "high-latency",
        "kinda broken": "in a degraded state",
        "a lot": "substantially / significantly",
        "big": "substantial / significant",
        "good": "effective / optimal",
        "bad": "suboptimal / degraded",
    }
    suggested_upgrades = []
    for weak, strong in weak_to_strong.items():
        if weak in text_lower:
            suggested_upgrades.append({"from": weak, "to": strong})

    # ─── Scoring ─────────────────────────────────────────────────────────────

    # Clarity: penalize fillers and very high WPM
    filler_penalty = min(total_fillers * 4, 40)
    speed_penalty = max(0, (wpm - 160) * 0.3) if wpm > 160 else 0
    clarity_score = max(0, min(100, round(85 - filler_penalty - speed_penalty)))

    # Vocabulary: reward strong words, unique ratio, and domain precision
    strong_bonus = min(len(strong_words) * 8, 40)
    diversity_bonus = unique_ratio * 30
    vocabulary_score = max(0, min(100, round(40 + strong_bonus + diversity_bonus)))

    # Confidence: penalize hedges and fillers, reward steady pacing
    hedge_penalty = hedge_count * 5
    pacing_bonus = 15 if 120 <= wpm <= 160 else 0
    confidence_score = max(0, min(100, round(80 - hedge_penalty - filler_penalty * 0.5 + pacing_bonus)))

    composite = round((clarity_score + vocabulary_score + confidence_score) / 3)

    # ─── Coach Feedback ──────────────────────────────────────────────────────

    tips = []
    if total_fillers > 3:
        top_filler = max(filler_counts, key=filler_counts.get)
        tips.append(f"Cut filler words: {total_fillers} fillers detected, especially '{top_filler}'.")
    if wpm > 170:
        tips.append(f"You spoke at {round(wpm)} wpm — slow down during technical sections.")
    elif wpm < 100:
        tips.append(f"You spoke at {round(wpm)} wpm — try to pick up the pace slightly for engagement.")
    if hedge_count > 2:
        tips.append("Reduce hedge words ('maybe', 'I think') — commit to your statements.")
    if len(strong_words) > 0:
        tips.append(f"Great domain vocabulary: {', '.join(w['word'] for w in strong_words[:3])} landed well.")
    if unique_ratio < 0.5:
        tips.append("Try varying your word choices more — your lexical diversity is low.")

    coach_feedback = _generate_coach_feedback(
        clarity_score, vocabulary_score, confidence_score,
        total_fillers, wpm, strong_words
    )

    # XP calculation
    xp = _calculate_xp(composite, total_fillers, len(strong_words))

    return {
        "word_count": word_count,
        "words_per_minute": round(wpm, 1),
        "clarity_score": clarity_score,
        "vocabulary_score": vocabulary_score,
        "confidence_score": confidence_score,
        "composite_score": composite,
        "filler_words": [{"word": k, "count": v} for k, v in filler_counts.items()],
        "strong_words": strong_words,
        "suggested_upgrades": suggested_upgrades,
        "lexical_metrics": {
            "unique_words_ratio": round(unique_ratio, 2),
            "avg_syllables_per_word": round(avg_syllables, 1),
            "domain_precision": "High" if len(strong_words) >= 4 else "Medium" if len(strong_words) >= 2 else "Low",
            "hedge_word_count": hedge_count,
            "reading_grade_level": round(grade_level, 1),
        },
        "coach_feedback": coach_feedback,
        "improvement_tips": tips,
        "xp_earned": xp,
    }


def _generate_coach_feedback(clarity, vocab, confidence, fillers, wpm, strong_words) -> str:
    """Generate a Coach Vox style feedback paragraph."""
    parts = []

    if clarity >= 80:
        parts.append("Clear delivery — your points landed without ambiguity.")
    elif clarity >= 60:
        parts.append("Decent clarity, but the fillers are diluting your message.")
    else:
        parts.append("Your clarity needs work — too many pauses and fillers are breaking the flow.")

    if len(strong_words) >= 3:
        words_str = ", ".join(f"'{w['word']}'" for w in strong_words[:3])
        parts.append(f"Strong technical vocabulary: {words_str} showed real domain command.")
    elif len(strong_words) >= 1:
        parts.append("Some good word choices, but lean harder into precise terminology.")
    else:
        parts.append("Your vocabulary was generic — use more domain-specific language to sound authoritative.")

    if fillers > 5:
        parts.append(f"But {fillers} filler words in one session means a skeptical listener tuned out halfway through.")
    elif fillers > 2:
        parts.append(f"Watch the fillers — {fillers} is manageable but not clean.")

    if wpm > 170:
        parts.append("You were racing. Slow the technical sections so your ideas have room to breathe.")
    elif wpm < 100:
        parts.append("The pace dragged. Tighten your sentences and cut the dead air.")

    return " ".join(parts)


def _calculate_xp(composite: int, fillers: int, strong_count: int) -> int:
    """Calculate XP earned from a session."""
    base_xp = max(25, composite)  # minimum 25 XP for completing a session
    filler_bonus = 15 if fillers <= 2 else 0
    vocab_bonus = strong_count * 5
    return min(150, base_xp + filler_bonus + vocab_bonus)  # cap at 150