import { create } from 'zustand';

type Language = 'vi' | 'en';

interface Translations {
  nav: {
    home: string;
    community: string;
    blog: string;
    jobs: string;
    messages: string;
    alerts: string;
    signOut: string;
  };
  common: {
    search: string;
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    upload: string;
    choose: string;
    or: string;
  };
  profile: {
    title: string;
    editProfile: string;
    saveChanges: string;
    fullName: string;
    email: string;
    emailCannotChange: string;
    profilePicture: string;
    accountRole: string;
    premiumMember: string;
    freePlan: string;
    activeSubscription: string;
    expiresOn: string;
    upgradeToUnlock: string;
    upgradeToPremium: string;
    chooseImage: string;
    pasteImageUrl: string;
    maxFileSize: string;
    avatarUploaded: string;
    profileUpdated: string;
    uploadFailed: string;
    updateFailed: string;
    selectImageFile: string;
    imageTooLarge: string;
  };
  dashboard: {
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    readyToBoost: string;
    startPost: string;
    createCV: string;
    atsFriendly: string;
    interview: string;
    practiceAI: string;
    community: string;
    getAdvice: string;
    article: string;
    shareKnowledge: string;
    yourActivity: string;
    cvsCreated: string;
    interviews: string;
    postViews: string;
    recommendedForYou: string;
    viewAll: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    getStartedFree: string;
    signIn: string;
    noCreditCard: string;
    atsOptimized: string;
    aiPowered: string;
    everythingYouNeed: string;
    allInOnePlatform: string;
    aiCVBuilder: string;
    aiCVBuilderDesc: string;
    aiInterviewPractice: string;
    aiInterviewPracticeDesc: string;
    careerCommunity: string;
    careerCommunityDesc: string;
    howItWorks: string;
    simpleFastEffective: string;
    signUp: string;
    signUpDesc: string;
    buildYourCV: string;
    buildYourCVDesc: string;
    practiceApply: string;
    practiceApplyDesc: string;
    latestCareerInsights: string;
    readLatestArticles: string;
    readMore: string;
    viewAllArticles: string;
    noArticlesYet: string;
    readyToLand: string;
    joinThousands: string;
    startBuildingNow: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    forgotPassword: string;
    rememberMe: string;
    loginWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createAccount: string;
  };
  builder: {
    title: string;
    personalInfo: string;
    experience: string;
    education: string;
    skills: string;
    preview: string;
    download: string;
    generate: string;
  };
}

const translations: Record<Language, Translations> = {
  vi: {
    nav: {
      home: 'Trang chủ',
      community: 'Cộng đồng',
      blog: 'Blog',
      jobs: 'Việc làm',
      messages: 'Tin nhắn',
      alerts: 'Thông báo',
      signOut: 'Đăng xuất',
    },
    common: {
      search: 'Tìm kiếm',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      save: 'Lưu',
      cancel: 'Hủy',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      confirm: 'Xác nhận',
      close: 'Đóng',
      back: 'Quay lại',
      next: 'Tiếp theo',
      submit: 'Gửi',
      upload: 'Tải lên',
      choose: 'Chọn',
      or: 'hoặc',
    },
    profile: {
      title: 'Hồ sơ',
      editProfile: 'Chỉnh sửa hồ sơ',
      saveChanges: 'Lưu thay đổi',
      fullName: 'Họ và tên',
      email: 'Email',
      emailCannotChange: 'Email không thể thay đổi',
      profilePicture: 'Ảnh đại diện',
      accountRole: 'Vai trò tài khoản',
      premiumMember: 'Thành viên Premium',
      freePlan: 'Gói miễn phí',
      activeSubscription: 'Đang kích hoạt',
      expiresOn: 'Hết hạn vào',
      upgradeToUnlock: 'Nâng cấp để mở khóa tất cả tính năng premium',
      upgradeToPremium: 'Nâng cấp lên Premium',
      chooseImage: 'Chọn ảnh',
      pasteImageUrl: 'Dán link ảnh trực tiếp',
      maxFileSize: 'Tối đa 5MB (JPG, PNG, GIF, WebP)',
      avatarUploaded: 'Tải ảnh đại diện thành công!',
      profileUpdated: 'Cập nhật hồ sơ thành công!',
      uploadFailed: 'Tải ảnh thất bại',
      updateFailed: 'Cập nhật thất bại',
      selectImageFile: 'Vui lòng chọn file ảnh',
      imageTooLarge: 'Kích thước ảnh phải nhỏ hơn 5MB',
    },
    dashboard: {
      goodMorning: 'Chào buổi sáng',
      goodAfternoon: 'Chào buổi chiều',
      goodEvening: 'Chào buổi tối',
      readyToBoost: 'Sẵn sàng thăng tiến sự nghiệp hôm nay?',
      startPost: 'Bắt đầu một bài đăng, thử viết với AI...',
      createCV: 'Tạo CV',
      atsFriendly: 'Thân thiện ATS',
      interview: 'Phỏng vấn',
      practiceAI: 'Luyện tập AI',
      community: 'Cộng đồng',
      getAdvice: 'Nhận lời khuyên',
      article: 'Bài viết',
      shareKnowledge: 'Chia sẻ kiến thức',
      yourActivity: 'Hoạt động của bạn',
      cvsCreated: 'CV đã tạo',
      interviews: 'Phỏng vấn',
      postViews: 'Lượt xem bài đăng',
      recommendedForYou: 'Đề xuất cho bạn',
      viewAll: 'Xem tất cả',
    },
    home: {
      heroTitle: 'Tạo CV Hoàn Hảo',
      heroSubtitle: 'Trong Vòng 5 Phút',
      heroDescription: 'Trình tạo CV hỗ trợ AI giúp bạn có được công việc mơ ước. Mẫu thân thiện ATS. Luyện phỏng vấn. Tất cả ở một nơi.',
      getStartedFree: 'Bắt đầu miễn phí',
      signIn: 'Đăng nhập',
      noCreditCard: 'Không cần thẻ tín dụng',
      atsOptimized: 'Tối ưu ATS',
      aiPowered: 'Hỗ trợ AI',
      everythingYouNeed: 'Mọi thứ bạn cần để thành công',
      allInOnePlatform: 'Nền tảng All-in-one hỗ trợ sự nghiệp',
      aiCVBuilder: 'Trình tạo CV AI',
      aiCVBuilderDesc: 'Tạo CV thân thiện ATS trong vài phút. AI nâng cao nội dung của bạn để trở nên chuyên nghiệp và ấn tượng.',
      aiInterviewPractice: 'Luyện phỏng vấn AI',
      aiInterviewPracticeDesc: 'Luyện tập với các nhân vật AI khác nhau - HR thân thiện, Quản lý nghiêm khắc, hoặc Người bản ngữ. Nhận phản hồi tức thì.',
      careerCommunity: 'Cộng đồng sự nghiệp',
      careerCommunityDesc: 'Chia sẻ CV của bạn, nhận phản hồi và kết nối với các chuyên gia. Học hỏi từ kinh nghiệm của người khác.',
      howItWorks: 'Cách hoạt động',
      simpleFastEffective: 'Đơn giản. Nhanh chóng. Hiệu quả.',
      signUp: 'Đăng ký',
      signUpDesc: 'Tạo tài khoản miễn phí trong vài giây. Không cần thẻ tín dụng.',
      buildYourCV: 'Tạo CV của bạn',
      buildYourCVDesc: 'Sử dụng trình tạo hỗ trợ AI của chúng tôi để tạo CV chuyên nghiệp, thân thiện ATS.',
      practiceApply: 'Luyện tập & Ứng tuyển',
      practiceApplyDesc: 'Luyện phỏng vấn với AI, sau đó xuất CV và bắt đầu ứng tuyển.',
      latestCareerInsights: 'Thông tin sự nghiệp mới nhất',
      readLatestArticles: 'Đọc các bài viết mới nhất từ cộng đồng chuyên gia',
      readMore: 'Đọc thêm',
      viewAllArticles: 'Xem tất cả bài viết',
      noArticlesYet: 'Chưa có bài viết nào. Hãy là người đầu tiên viết bài!',
      readyToLand: 'Sẵn sàng có được công việc mơ ước?',
      joinThousands: 'Tham gia cùng hàng nghìn chuyên gia đã tạo CV hoàn hảo với CV Mate.',
      startBuildingNow: 'Bắt đầu tạo CV ngay',
    },
    auth: {
      login: 'Đăng nhập',
      register: 'Đăng ký',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      name: 'Họ và tên',
      forgotPassword: 'Quên mật khẩu?',
      rememberMe: 'Ghi nhớ đăng nhập',
      loginWithGoogle: 'Đăng nhập với Google',
      alreadyHaveAccount: 'Đã có tài khoản?',
      dontHaveAccount: 'Chưa có tài khoản?',
      createAccount: 'Tạo tài khoản',
    },
    builder: {
      title: 'Tạo CV',
      personalInfo: 'Thông tin cá nhân',
      experience: 'Kinh nghiệm',
      education: 'Học vấn',
      skills: 'Kỹ năng',
      preview: 'Xem trước',
      download: 'Tải xuống',
      generate: 'Tạo',
    },
  },
  en: {
    nav: {
      home: 'Home',
      community: 'Community',
      blog: 'Blog',
      jobs: 'Jobs',
      messages: 'Messages',
      alerts: 'Alerts',
      signOut: 'Sign Out',
    },
    common: {
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      upload: 'Upload',
      choose: 'Choose',
      or: 'or',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      fullName: 'Full Name',
      email: 'Email',
      emailCannotChange: 'Email cannot be changed',
      profilePicture: 'Profile Picture',
      accountRole: 'Account Role',
      premiumMember: 'Premium Member',
      freePlan: 'Free Plan',
      activeSubscription: 'Active subscription',
      expiresOn: 'Expires on',
      upgradeToUnlock: 'Upgrade to unlock all premium features',
      upgradeToPremium: 'Upgrade to Premium',
      chooseImage: 'Choose Image',
      pasteImageUrl: 'Paste a direct link to an image',
      maxFileSize: 'Max 5MB (JPG, PNG, GIF, WebP)',
      avatarUploaded: 'Avatar uploaded successfully!',
      profileUpdated: 'Profile updated successfully!',
      uploadFailed: 'Failed to upload image',
      updateFailed: 'Failed to update profile',
      selectImageFile: 'Please select an image file',
      imageTooLarge: 'Image size must be less than 5MB',
    },
    dashboard: {
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      readyToBoost: 'Ready to boost your career today?',
      startPost: 'Start a post, try writing with AI...',
      createCV: 'Create CV',
      atsFriendly: 'ATS-Friendly',
      interview: 'Interview',
      practiceAI: 'Practice AI',
      community: 'Community',
      getAdvice: 'Get Advice',
      article: 'Article',
      shareKnowledge: 'Share Knowledge',
      yourActivity: 'Your Activity',
      cvsCreated: 'CVs Created',
      interviews: 'Interviews',
      postViews: 'Post Views',
      recommendedForYou: 'Recommended for you',
      viewAll: 'View all',
    },
    home: {
      heroTitle: 'Create Your Perfect CV',
      heroSubtitle: 'in Under 5 Minutes',
      heroDescription: 'AI-powered resume builder that helps you land your dream job. ATS-friendly templates. Interview practice. All in one place.',
      getStartedFree: 'Get Started Free',
      signIn: 'Sign In',
      noCreditCard: 'No Credit Card Required',
      atsOptimized: 'ATS-Optimized',
      aiPowered: 'AI-Powered',
      everythingYouNeed: 'Everything You Need to Succeed',
      allInOnePlatform: 'All-in-one career platform powered by AI',
      aiCVBuilder: 'AI CV Builder',
      aiCVBuilderDesc: 'Create ATS-friendly resumes in minutes. AI enhances your content to make it professional and impactful.',
      aiInterviewPractice: 'AI Interview Practice',
      aiInterviewPracticeDesc: 'Practice with different AI personas - Friendly HR, Strict Manager, or English Native. Get instant feedback.',
      careerCommunity: 'Career Community',
      careerCommunityDesc: 'Share your CV, get feedback, and connect with professionals. Learn from others\' experiences.',
      howItWorks: 'How It Works',
      simpleFastEffective: 'Simple. Fast. Effective.',
      signUp: 'Sign Up',
      signUpDesc: 'Create your free account in seconds. No credit card required.',
      buildYourCV: 'Build Your CV',
      buildYourCVDesc: 'Use our AI-powered builder to create a professional, ATS-friendly resume.',
      practiceApply: 'Practice & Apply',
      practiceApplyDesc: 'Practice interviews with AI, then export your CV and start applying.',
      latestCareerInsights: 'Latest Career Insights',
      readLatestArticles: 'Read the latest articles from expert community',
      readMore: 'Read more',
      viewAllArticles: 'View all articles',
      noArticlesYet: 'No articles yet. Be the first to write one!',
      readyToLand: 'Ready to Land Your Dream Job?',
      joinThousands: 'Join thousands of professionals who have already created their perfect CV with CV Mate.',
      startBuildingNow: 'Start Building Your CV Now',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      loginWithGoogle: 'Login with Google',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      createAccount: 'Create Account',
    },
    builder: {
      title: 'CV Builder',
      personalInfo: 'Personal Information',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      preview: 'Preview',
      download: 'Download',
      generate: 'Generate',
    },
  },
};

interface I18nState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nState>((set, get) => {
  const getLanguage = (): Language => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'vi';
  };

  const language = getLanguage();

  return {
    language,
    translations: translations[language],
    setLanguage: (lang: Language) => {
      localStorage.setItem('language', lang);
      set({ language: lang, translations: translations[lang] });
    },
    toggleLanguage: () => {
      const current = get().language;
      const next = current === 'vi' ? 'en' : 'vi';
      get().setLanguage(next);
    },
    t: (key: string) => {
      const { translations } = get();
      const keys = key.split('.');
      let value: any = translations;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    },
  };
});
