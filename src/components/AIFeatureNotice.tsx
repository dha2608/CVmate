import { AlertCircle, Brain, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface AIFeatureNoticeProps {
  feature: string;
  onDismiss?: () => void;
}

const AIFeatureNotice = ({ feature, onDismiss }: AIFeatureNoticeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1 flex items-center gap-2">
            <Brain size={16} />
            Tính năng AI tạm thời không khả dụng
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
            {feature} hiện không thể sử dụng vì chưa được cấu hình OpenAI API Key. 
            Vui lòng liên hệ admin để được hỗ trợ.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
              className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            >
              Tìm hiểu thêm
              <ExternalLink size={14} className="ml-1" />
            </Button>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-yellow-700 dark:text-yellow-300"
              >
                Đóng
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIFeatureNotice;
