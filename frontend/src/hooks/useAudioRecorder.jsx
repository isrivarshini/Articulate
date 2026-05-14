import { useState, useRef, useCallback } from 'react';

export default function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // collect data every 250ms
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      console.error('Microphone error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
  }, []);

  return {
    recording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}