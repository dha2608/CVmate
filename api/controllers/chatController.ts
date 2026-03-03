import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, logAIUsage } from '../utils/aiClient.js';

export const chatWithAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message is required',
      });
      return;
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

    const model = resolveModel(req, 'chat');
    const startedAt = Date.now();

    try {
      const hf = getHFOrThrow();

      // Build messages array for chat completion
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-5).map((msg: { type: string; text: string }) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: message },
      ];

      const response: any = await hf.chatCompletion({
        model,
        messages,
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
      });

      let aiResponse = '';
      if (response.choices && response.choices.length > 0) {
        aiResponse = response.choices[0].message?.content?.trim() || '';
      } else if (typeof response === 'string') {
        aiResponse = response.trim();
      } else if (response.generated_text) {
        aiResponse = response.generated_text.trim();
      }

      // Clean up response
      aiResponse = aiResponse
        .replace(/^Trợ lý:\s*/i, '')
        .replace(/Người dùng:.*$/g, '')
        .replace(/^Assistant:\s*/i, '')
        .trim();

      // Fallback if response is empty
      if (!aiResponse) {
        aiResponse =
          'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể mô tả chi tiết hơn không? Hoặc liên hệ support@cvmate.com để được hỗ trợ.';
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/chat',
        type: 'chat',
        model,
        durationMs,
        success: true,
      });

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

      const msg = String(error.message || '');
      const lower = msg.toLowerCase();

      if (lower.includes('401') || lower.includes('403') || lower.includes('api key')) {
        errorMessage = 'AI service authentication failed. Please check API configuration.';
      } else if (lower.includes('429') || lower.includes('rate limit')) {
        errorMessage = 'AI service đang quá tải. Vui lòng thử lại sau vài phút.';
      } else if (lower.includes('quota') || lower.includes('limit') || lower.includes('billing')) {
        errorMessage = 'AI service quota đã hết. Vui lòng liên hệ support@cvmate.com.';
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/chat',
        type: 'chat',
        model,
        durationMs,
        success: false,
        errorCode: 'CHAT_ERROR',
      });

      res.status(503).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error: any) {
    next(error);
  }
};
