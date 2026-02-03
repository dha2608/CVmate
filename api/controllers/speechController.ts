import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

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

    const openai = getOpenAIClient();
    if (!openai) {
      res.status(503).json({ 
        success: false, 
        message: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.',
      });
      return;
    }

    // For Node.js, OpenAI SDK accepts File objects
    // Use File from 'undici' package (available in Node.js 18+)
    let FileConstructor: typeof File;
    try {
      // Try to use File from undici (Node.js 18+)
      const undici = await import('undici');
      FileConstructor = undici.File as unknown as typeof File;
    } catch {
      // Fallback: Use global File if available (Node.js 20+)
      if (typeof File !== 'undefined') {
        FileConstructor = File;
      } else {
        res.status(500).json({
          success: false,
          message: 'File API not available. Please use Node.js 18+ or ensure undici is installed.',
        });
        return;
      }
    }
    
    try {
      // Create File object from buffer for OpenAI SDK
      const file = new FileConstructor([audioBuffer], `audio.${audioFormat}`, {
        type: `audio/${audioFormat}`,
      });

      const transcription = await openai.audio.transcriptions.create({
        file: file as any,
        model: 'whisper-1',
        language: 'en', // Can be made dynamic
      });

      res.json({
        success: true,
        data: {
          text: transcription.text,
        },
      });
    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      logger.error('OpenAI Whisper Error', apiError instanceof Error ? apiError : new Error(String(apiError)), {
        userId: req.user?._id,
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
