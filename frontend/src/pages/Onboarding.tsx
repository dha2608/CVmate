import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import SEOHead from '@/components/SEOHead';
import { Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const Onboarding = () => {
  const [selectedGoal, setSelectedGoal] = useState<'new-job' | 'internship' | 'career-switch' | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();
  const toast = useToastStore();

  const handleSubmit = async () => {
    if (!selectedGoal) {
      toast.error('Vui lòng chọn mục tiêu của bạn');
      return;
    }

    setLoading(true);
    try {
      const response = await api.completeOnboarding(selectedGoal);

      if (response.success) {
        // Update user trong store
        if (user) {
          setUser({ ...user, onboardingCompleted: true, careerGoal: selectedGoal });
        }
        toast.success('Đã cập nhật mục tiêu của bạn');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    {
      id: 'new-job' as const,
      title: 'Tìm việc mới',
      description: 'Bạn đang tìm kiếm cơ hội việc làm mới phù hợp với kinh nghiệm của mình',
      icon: Briefcase,
      color: 'bg-crimson-red',
    },
    {
      id: 'internship' as const,
      title: 'Thực tập',
      description: 'Bạn đang tìm kiếm cơ hội thực tập để tích lũy kinh nghiệm',
      icon: GraduationCap,
      color: 'bg-blue-500',
    },
    {
      id: 'career-switch' as const,
      title: 'Nhảy việc / Chuyển ngành',
      description: 'Bạn muốn chuyển sang một lĩnh vực hoặc vị trí công việc mới',
      icon: ArrowRight,
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      <SEOHead 
        title="Onboarding - CV Mate" 
        description="Chọn mục tiêu sự nghiệp của bạn để được hỗ trợ tốt nhất"
      />
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-crimson-red rounded-2xl text-white font-black text-3xl mb-6">
            CV
          </div>
          <h1 className="text-4xl font-black text-jet-black mb-3">
            Chào mừng đến với CV Mate!
          </h1>
          <p className="text-lg text-gray-600">
            Hãy cho chúng tôi biết mục tiêu của bạn để chúng tôi có thể hỗ trợ bạn tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedGoal === goal.id
                    ? 'border-crimson-red bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 ${goal.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-jet-black mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedGoal || loading}
          className="w-full h-14 bg-crimson-red hover:bg-fire-red text-white font-semibold text-lg rounded-lg"
        >
          {loading ? 'Đang xử lý...' : 'Tiếp tục'}
        </Button>
      </div>
    </div>
    </>
  );
};

export default Onboarding;
