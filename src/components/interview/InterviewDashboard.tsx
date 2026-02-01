import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Mic, Brain, Target, Zap } from 'lucide-react';
import { useInterviewStore } from '@/store/interviewStore';

interface Metrics {
  responseTime: number;
  speakingPace: number;
  confidenceLevel: number;
  questionsAnswered: number;
  averageScore: number;
}

const InterviewDashboard = () => {
  const { messages, status } = useInterviewStore();
  const [metrics, setMetrics] = useState<Metrics>({
    responseTime: 0,
    speakingPace: 0,
    confidenceLevel: 0,
    questionsAnswered: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (messages.length === 0) return;

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    // Calculate response time (average time between assistant question and user answer)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 0; i < userMessages.length; i++) {
      const userMsg = userMessages[i];
      const prevAssistantMsg = assistantMessages[i];
      
      if (userMsg.timestamp && prevAssistantMsg?.timestamp) {
        const timeDiff = new Date(userMsg.timestamp).getTime() - new Date(prevAssistantMsg.timestamp).getTime();
        totalResponseTime += timeDiff;
        responseCount++;
      }
    }
    
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0;
    
    // Calculate speaking pace (words per minute)
    const totalWords = userMessages.reduce((acc, msg) => {
      return acc + msg.content.split(' ').length;
    }, 0);
    
    const totalTime = userMessages.length > 0 && userMessages[0].timestamp 
      ? (new Date().getTime() - new Date(userMessages[0].timestamp).getTime()) / 1000 / 60
      : 1;
    
    const speakingPace = totalTime > 0 ? Math.round(totalWords / totalTime) : 0;
    
    // Calculate confidence level (based on response length and complexity)
    const avgResponseLength = userMessages.length > 0 
      ? userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length
      : 0;
    
    const confidenceLevel = Math.min(100, Math.round((avgResponseLength / 200) * 100));
    
    setMetrics({
      responseTime: avgResponseTime,
      speakingPace: speakingPace,
      confidenceLevel: confidenceLevel,
      questionsAnswered: assistantMessages.length,
      averageScore: Math.round((confidenceLevel + (speakingPace > 100 ? 50 : speakingPace / 2)) / 2),
    });
  }, [messages]);

  if (status !== 'active') return null;

  const MetricCard = ({ icon: Icon, label, value, unit, color }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {value}{unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      <MetricCard
        icon={Clock}
        label="Response Time"
        value={metrics.responseTime}
        unit="s"
        color="bg-blue-500"
      />
      <MetricCard
        icon={Mic}
        label="Speaking Pace"
        value={metrics.speakingPace}
        unit="wpm"
        color="bg-green-500"
      />
      <MetricCard
        icon={Brain}
        label="Confidence"
        value={metrics.confidenceLevel}
        unit="%"
        color="bg-purple-500"
      />
      <MetricCard
        icon={Target}
        label="Questions"
        value={metrics.questionsAnswered}
        color="bg-orange-500"
      />
      <MetricCard
        icon={TrendingUp}
        label="Overall Score"
        value={metrics.averageScore}
        unit="%"
        color="bg-red-500"
      />
      <MetricCard
        icon={Zap}
        label="Status"
        value={status === 'active' ? 'Active' : 'Completed'}
        color="bg-indigo-500"
      />
    </div>
  );
};

export default InterviewDashboard;
