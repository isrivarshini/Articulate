from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.schemas import AnalysisResponse, SessionResponse
from app.services.speech_analysis import transcribe_audio, analyze_speech
from app.services.gamification import award_xp, update_streak, check_and_award_badges

router = APIRouter(prefix="/practice", tags=["practice"])

MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_recording(
    audio: UploadFile = File(...),
    mode: str = Form(...),
    context: str = Form(None),
    prompt_text: str = Form(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate file
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=400, detail="Audio file too large (max 25MB)")

    # Transcribe with Whisper
    transcription = await transcribe_audio(audio_bytes, audio.filename or "recording.webm")
    transcript = transcription["text"]

    if not transcript.strip():
        raise HTTPException(status_code=400, detail="No speech detected in the audio")

    # Calculate duration from segments
    segments = transcription.get("segments", [])
    duration_sec = segments[-1]["end"] if segments else 0

    # Run analysis
    analysis = analyze_speech(transcript, duration_sec)

    # Save session
    session = PracticeSession(
        user_id=user.id,
        mode=mode,
        context=context,
        prompt_text=prompt_text,
        audio_duration_sec=duration_sec,
        word_count=analysis["word_count"],
        words_per_minute=analysis["words_per_minute"],
        clarity_score=analysis["clarity_score"],
        vocabulary_score=analysis["vocabulary_score"],
        confidence_score=analysis["confidence_score"],
        composite_score=analysis["composite_score"],
        filler_words=analysis["filler_words"],
        strong_words=analysis["strong_words"],
        suggested_upgrades=analysis["suggested_upgrades"],
        lexical_metrics=analysis["lexical_metrics"],
        transcript=transcript,
        coach_feedback=analysis["coach_feedback"],
        improvement_tips=analysis["improvement_tips"],
        xp_earned=analysis["xp_earned"],
    )
    db.add(session)
    await db.flush()

    # Update gamification
    await award_xp(db, user, analysis["xp_earned"])
    await update_streak(db, user)
    await check_and_award_badges(db, user)

    return AnalysisResponse(
        session_id=session.id,
        audio_duration_sec=duration_sec,
        word_count=analysis["word_count"],
        words_per_minute=analysis["words_per_minute"],
        clarity_score=analysis["clarity_score"],
        vocabulary_score=analysis["vocabulary_score"],
        confidence_score=analysis["confidence_score"],
        composite_score=analysis["composite_score"],
        filler_words=analysis["filler_words"],
        strong_words=analysis["strong_words"],
        suggested_upgrades=analysis["suggested_upgrades"],
        lexical_metrics=analysis["lexical_metrics"],
        transcript=transcript,
        coach_feedback=analysis["coach_feedback"],
        improvement_tips=analysis["improvement_tips"],
        xp_earned=analysis["xp_earned"],
    )


@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    limit: int = 30,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticeSession)
        .where(PracticeSession.user_id == user.id)
        .order_by(desc(PracticeSession.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/sessions/{session_id}", response_model=AnalysisResponse)
async def get_session_detail(
    session_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return AnalysisResponse(
        session_id=session.id,
        audio_duration_sec=session.audio_duration_sec or 0,
        word_count=session.word_count or 0,
        words_per_minute=session.words_per_minute or 0,
        clarity_score=session.clarity_score or 0,
        vocabulary_score=session.vocabulary_score or 0,
        confidence_score=session.confidence_score or 0,
        composite_score=session.composite_score or 0,
        filler_words=session.filler_words or [],
        strong_words=session.strong_words or [],
        suggested_upgrades=session.suggested_upgrades or [],
        lexical_metrics=session.lexical_metrics or {},
        transcript=session.transcript or "",
        coach_feedback=session.coach_feedback or "",
        improvement_tips=session.improvement_tips or [],
        xp_earned=session.xp_earned or 0,
    )