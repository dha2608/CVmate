import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, logAIUsage } from '../utils/aiClient.js';

// Speech-to-Text endpoint using OpenAI Whisper API
export const speechToText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Note: This endpoint expects audio file in base64 or multipart/form-data
    // For production, you might want to use Web Speech API on frontend
    // or a dedicated service like Google Speech-to-Text
    
    const { audioData, audioFormat = 'webm' } = req.body;

    if (!audioData) {
      res.status(400).json({ 
        success: false, 
        message: 'Audio data is required. Send as base64 string or use multipart/form-data' 
      });
      return;
    }

    // Convert base64 to buffer if needed
    let audioBuffer: Buffer;
    try {
      if (typeof audioData === 'string' && audioData.startsWith('data:')) {
        // Remove data URL prefix
        const base64Data = audioData.split(',')[1];
        audioBuffer = Buffer.from(base64Data, 'base64');
      } else if (typeof audioData === 'string') {
        audioBuffer = Buffer.from(audioData, 'base64');
      } else {
        res.status(400).json({ success: false, message: 'Invalid audio data format' });
        return;
      }
    } catch (_error) {
      res.status(400).json({ success: false, message: 'Failed to process audio data' });
      return;
    }

    const model = resolveModel(req, 'stt');
    const startedAt = Date.now();

    try {
      const hf = getHFOrThrow();

      const transcription = await hf.automaticSpeechRecognition({
        model,
        data: audioBuffer,
      });

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/speech/transcribe',
        type: 'speech_to_text',
        model,
        durationMs,
        success: true,
      });

      res.json({
        success: true,
        data: {
          text: (transcription as any).text || '',
        },
      });
    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      logger.error('AI Speech-to-Text Error', apiError instanceof Error ? apiError : new Error(String(apiError)), {
        userId: req.user?._id,
      });

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/speech/transcribe',
        type: 'speech_to_text',
        model,
        durationMs,
        success: false,
        errorCode: 'STT_ERROR',
      });

      res.status(503).json({
        success: false,
        message: 'Speech-to-text service unavailable. Please try typing instead.',
        error: errorMessage,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Alternative: Simple endpoint that returns instructions for using Web Speech API
export const getSpeechInstructions = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'For best performance, use browser Web Speech API on frontend. This endpoint is for server-side processing.',
      browserAPI: 'Use navigator.mediaDevices.getUserMedia() and SpeechRecognition API',
    },
  });
};
