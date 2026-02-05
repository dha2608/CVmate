import { Response, NextFunction } from 'express';
import { HfInference } from '@huggingface/inference';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getHFClient = () => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new HfInference(apiKey);
};

export const chatWithAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const hf = getHFClient();
    if (!hf) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please configure HF_API_KEY.',
      });
    }

    // Build context for CV Mate support
    const systemPrompt = `Bạn là trợ lý AI thông minh của CV Mate - một nền tảng tạo CV và tìm việc làm chuyên nghiệp. 
Nhiệm vụ của bạn là:
1. Trả lời câu hỏi về cách sử dụng CV Mate
2. Hướng dẫn người dùng tạo CV, tìm việc, sử dụng các tính năng
3. Giải đáp thắc mắc về tài khoản, thanh toán, premium features
4. Cung cấp lời khuyên về nghề nghiệp và CV
5. Luôn lịch sự, thân thiện và chuyên nghiệp
6. Nếu không biết câu trả lời, hướng dẫn người dùng liên hệ support@cvmate.com

Hãy trả lời bằng tiếng Việt, ngắn gọn và hữu ích.`;

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((msg: { type: string; text: string }) => 
        msg.type === 'user' ? `Người dùng: ${msg.text}` : `Trợ lý: ${msg.text}`
      )
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n${conversationContext ? `Lịch sử hội thoại:\n${conversationContext}\n\n` : ''}Người dùng: ${message}\nTrợ lý:`;

    try {
      // Use text generation model for chat
      const response = await hf.textGeneration({
        model: 'microsoft/DialoGPT-medium', // Or use a better model like 'mistralai/Mistral-7B-Instruct-v0.2'
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      });

      let aiResponse = '';
      if (typeof response === 'string') {
        aiResponse = response.trim();
      } else if (response.generated_text) {
        aiResponse = response.generated_text.trim();
      } else if (Array.isArray(response) && response.length > 0) {
        aiResponse = response[0].generated_text?.trim() || '';
      }

      // Clean up response
      aiResponse = aiResponse
        .replace(/^Trợ lý:\s*/i, '')
        .replace(/Người dùng:.*$/g, '')
        .trim();

      // Fallback if response is empty
      if (!aiResponse) {
        aiResponse = 'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể mô tả chi tiết hơn không? Hoặc liên hệ support@cvmate.com để được hỗ trợ.';
      }

      res.json({
        success: true,
        data: {
          message: aiResponse,
        },
      });
    } catch (error: any) {
      logger.error('AI Chat Error', error, {
        userId: req.user?._id,
        message: message.substring(0, 100),
      });

      let errorMessage = 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.';
      
      if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = 'AI service authentication failed. Please check API configuration.';
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = 'AI service đang quá tải. Vui lòng thử lại sau vài phút.';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = 'AI service quota đã hết. Vui lòng liên hệ support@cvmate.com.';
      }

      res.status(503).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error: any) {
    next(error);
  }
};
