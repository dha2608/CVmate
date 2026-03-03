import { create } from 'zustand';

type Language = 'vi' | 'en';

interface Translations {
  notifications?: {
    title: string;
    new: string;
    markAllRead: string;
    searchPlaceholder: string;
    all: string;
    unread: string;
    likes: string;
    comments: string;
    jobs: string;
    noNotifications: string;
    noNotificationsDesc: string;
    noMatchingNotifications: string;
  };
  export?: {
    exportShare: string;
    exportAs: string;
    pdf: string;
    html: string;
    share: string;
    copyLink: string;
    copied: string;
    email: string;
    pdfExported: string;
    pdfExportFailed: string;
    htmlExported: string;
    linkCopied: string;
    copyFailed: string;
    elementNotFound: string;
  };
  messaging?: {
    title: string;
    online: string;
    writeMessage: string;
    selectConversation: string;
    noConversations: string;
    noMessages: string;
    sendFailed: string;
    typing: string;
    imageTooLarge: string;
    imageOnly: string;
    uploadFailed: string;
  };
  nav: {
    home: string;
    community: string;
    blog: string;
    jobs: string;
    messages: string;
    alerts: string;
    signOut: string;
    profile: string;
    settings: string;
    achievements: string;
  };
  settings?: {
    title: string;
    profile: string;
    security: string;
    notifications: string;
    privacy: string;
    account: string;
    profileSettings: string;
    name: string;
    email: string;
    emailCannotChange: string;
    headline: string;
    headlinePlaceholder: string;
    bio: string;
    bioPlaceholder: string;
    save: string;
    saving: string;
    profileUpdated: string;
    updateFailed: string;
    securitySettings: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    changePassword: string;
    changing: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    passwordChanged: string;
    passwordChangeFailed: string;
    notificationSettings: string;
    emailNotifications: string;
    emailNotificationsDesc: string;
    pushNotifications: string;
    pushNotificationsDesc: string;
    jobAlerts: string;
    jobAlertsDesc: string;
    privacySettings: string;
    publicProfile: string;
    publicProfileDesc: string;
    privacyUpdated: string;
    accountSettings: string;
    appearance: string;
    theme: string;
    dark: string;
    light: string;
    language: string;
    selectLanguage: string;
    dangerZone: string;
    deleteAccountWarning: string;
    deleteAccount: string;
    confirmDeleteAccount: string;
    delete: string;
    cancel: string;
    deleteAccountNotImplemented: string;
    accountDeleted: string;
    deleteAccountError: string;
    twoFactorAuth: string;
    twoFactorDesc: string;
    twoFactorEnabled: string;
    twoFactorDisabled: string;
    twoFactorActivated: string;
    setupTwoFactor: string;
    disableTwoFactor: string;
    scanQrCode: string;
    verificationCode: string;
    verifyAndEnable: string;
    enterCodeToDisable: string;
    invalidCode: string;
    twoFactorSetupError: string;
    settingUp: string;
    verifying: string;
    disabling: string;
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
    posting: string;
    post: string;
    imageUrl: string;
    all: string;
    backTo: string;
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
    monthlyPlan: string;
    yearlyPlan: string;
    switchToYearly: string;
    switchToMonthly: string;
    planSwitched: string;
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
    unsavedChangesWarning?: string;
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
    posts: string;
    articles: string;
    applications: string;
    avgAtsScore: string;
    avgInterviewScore: string;
    recentItems: string;
    recommendedForYou: string;
    viewAll: string;
    analytics: string;
    activityOverTime: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    achievements: string;
    yourProgress?: string;
    nextMilestone?: string;
    nextBestAction?: string;
    profileCompletion?: string;
    nextActionOnboarding?: string;
    nextActionOnboardingDesc?: string;
    nextActionCreateCV?: string;
    nextActionCreateCVDesc?: string;
    nextActionInterview?: string;
    nextActionInterviewDesc?: string;
    nextActionJobs?: string;
    nextActionJobsDesc?: string;
    completeOnboarding?: string;
    startInterview?: string;
    viewJobs?: string;
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
  login: {
    welcomeBack: string;
    signInToContinue: string;
    signingIn: string;
    signIn: string;
    orContinueWith: string;
    signInWithGoogle: string;
    dontHaveAccount: string;
    createOne: string;
    invalidCredentials: string;
    somethingWentWrong: string;
  };
  register: {
    createAccount: string;
    startBuilding: string;
    creatingAccount: string;
    passwordTooShort: string;
    registrationFailed: string;
    signUpWithGoogle: string;
    alreadyHaveAccount: string;
    signIn: string;
  };
  community: {
    sortBy: string;
    new: string;
    hot: string;
    top: string;
    loadingFeed: string;
    noPostsYet: string;
    beFirstToShare: string;
    sharePlaceholder: string;
    editPost: string;
    deletePost: string;
    deletePostConfirm: string;
    share: string;
    linkCopied: string;
    follow: string;
    unfollow: string;
    following: string;
    followers: string;
    guidelines?: string;
    guidelineRespect?: string;
    guidelineShare?: string;
    guidelineSupport?: string;
    guidelineNoSpam?: string;
    joinDescription?: string;
  };
  blog: {
    title: string;
    description: string;
    latestInsights: string;
    writingGoodArticle: string;
    focusTopic: string;
    useHeadings: string;
    addCoverImage: string;
    keepConcise: string;
    writeArticle: string;
    cancel: string;
    createNewArticle: string;
    titleLabel: string;
    categoryLabel: string;
    imageUrlLabel: string;
    contentLabel: string;
    publish: string;
    latestNews: string;
    refresh: string;
    noNewsAvailable: string;
    readMore: string;
    communityArticles: string;
    noArticlesYet: string;
    writeFirstArticle: string;
    views: string;
    new: string;
    searchPlaceholder?: string;
    filters?: string;
    category?: string;
    allCategories?: string;
    loadMore?: string;
    comments?: string;
    writeComment?: string;
    loginToComment?: string;
    noComments?: string;
  };
  interview: {
    simulator: string;
    choosePersona: string;
    friendlyHR: string;
    friendlyHRDesc: string;
    strictManager: string;
    strictManagerDesc: string;
    englishNative: string;
    englishNativeDesc: string;
    techLead: string;
    techLeadDesc: string;
    startupFounder: string;
    startupFounderDesc: string;
    executive: string;
    executiveDesc: string;
    academic: string;
    academicDesc: string;
    startInterview: string;
    backToDashboard: string;
    online: string;
    completed: string;
    ending: string;
    ended: string;
    endSession: string;
    aiFeedbackSummary: string;
    listening: string;
    typeAnswer: string;
    sending: string;
    send: string;
    microphoneDenied: string;
    microphoneError: string;
    speechNotSupported: string;
    speechError: string;
    rateLimitExceeded: string;
    serviceUnavailable: string;
    resultTitle?: string;
    resultSubtitle?: string;
    overallScore?: string;
    radarHint?: string;
    strengths?: string;
    noStrengths?: string;
    improvements?: string;
    noImprovements?: string;
    detailedSummary?: string;
    perQuestionFeedback?: string;
    yourAnswer?: string;
    sessionAnalytics?: string;
    questionsAnalyzed?: string;
    averageScore?: string;
    confidenceScore?: string;
    overallPerformance?: string;
    startNew?: string;
    history?: string;
    inProgress?: string;
  };
  jobs: {
    findDreamJob: string;
    searchPlaceholder: string;
    search: string;
    filters: string;
    all: string;
    fullTime: string;
    partTime: string;
    remote: string;
    contract: string;
    internship: string;
    location: string;
    loadingJobs: string;
    noJobsAvailable: string;
    noJobsMatch: string;
    noJobsAtMoment: string;
    clearSearch: string;
    applied: string;
    apply: string;
    pleaseLogin: string;
    appliedSuccessfully: string;
    failedToApply: string;
    jobSeekerGuidance: string;
    recommendedBasedOn: string;
    improveResume: string;
    exploreBuilder: string;
    salaryInsights: string;
    seeWhatWorth: string;
    salaryRange: string;
    postJob: string;
    hideForm: string;
    showPostForm: string;
    postSuccess: string;
    postFailed: string;
    posting: string;
    minSalary?: string;
    maxSalary?: string;
    experienceLevel?: string;
    entry?: string;
    junior?: string;
    mid?: string;
    senior?: string;
    lead?: string;
    executive?: string;
    companySize?: string;
    startup?: string;
    small?: string;
    medium?: string;
    large?: string;
    enterprise?: string;
    advancedFilters?: string;
    clearFilters?: string;
    saveAlert?: string;
    myAlerts?: string;
    alertName?: string;
    alertSaved?: string;
    alertDeleted?: string;
    alertToggled?: string;
    maxAlerts?: string;
    noAlerts?: string;
    manageAlerts?: string;
    activeAlerts?: string;
    matches?: string;
    practiceInterview?: string;
    aiInterview?: string;
    connectCommunity?: string;
    getAdvice?: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    company: string;
    legalSupport: string;
    cvBuilder: string;
    interviewPractice: string;
    jobSearch: string;
    careerBlog: string;
    community: string;
    pricing: string;
    aboutUs: string;
    blog: string;
    contact: string;
    careers: string;
    partners: string;
    termsOfService: string;
    privacyPolicy: string;
    cookiePolicy: string;
    helpCenter: string;
    allRightsReserved: string;
    sitemap: string;
    accessibility: string;
  };
  toast: {
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    registerFailed: string;
    postCreated: string;
    postFailed: string;
    profileUpdated: string;
    profileUpdateFailed: string;
    articlePublished: string;
    articlePublishFailed: string;
    jobApplied: string;
    jobApplyFailed: string;
    somethingWentWrong: string;
  };
  admin: {
    title: string;
    subtitle: string;
    refresh: string;
    accessDenied: string;
    accessDeniedDesc: string;
    backToDashboard: string;
    overview: string;
    users: string;
    posts: string;
    articles: string;
    jobs: string;
    bannedUsers: string;
    pendingPosts: string;
    premiumUsers: string;
    totalRevenue: string;
    monthlySubs: string;
    yearlySubs: string;
    searchPlaceholder: string;
    search: string;
    user: string;
    role: string;
    subscription: string;
    status: string;
    actions: string;
    setUser: string;
    setAdmin: string;
    setFree: string;
    setPremium: string;
    unban: string;
    ban: string;
    banned: string;
    active: string;
    all: string;
    pending: string;
    approved: string;
    rejected: string;
    content: string;
    created: string;
    approve: string;
    reject: string;
    delete: string;
    unknownUser: string;
    noContent: string;
    reason: string;
    titleColumn: string;
    author: string;
    category: string;
    published: string;
    yes: string;
    no: string;
    unpublish: string;
    publish: string;
    company: string;
    type: string;
    postedBy: string;
    applicants: string;
    deletePostConfirm: string;
    deletePostTitle: string;
    deleteArticleConfirm: string;
    deleteArticleTitle: string;
    deleteJobConfirm: string;
    deleteJobTitle: string;
    rejectPostTitle: string;
    rejectReason: string;
    rejectionReason: string;
    cancel: string;
    dataRefreshed: string;
    userBanned: string;
    userUnbanned: string;
    roleUpdated: string;
    subscriptionUpdated: string;
    postUpdated: string;
    postDeleted: string;
    articlePublishUpdated: string;
    articleDeleted: string;
    jobDeleted: string;
    loadFailed: string;
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
      profile: 'Hồ sơ',
      settings: 'Cài đặt',
      achievements: 'Thành tựu',
    },
    settings: {
      title: 'Cài đặt',
      profile: 'Hồ sơ',
      security: 'Bảo mật',
      notifications: 'Thông báo',
      privacy: 'Quyền riêng tư',
      account: 'Tài khoản',
      profileSettings: 'Cài đặt hồ sơ',
      name: 'Tên',
      email: 'Email',
      emailCannotChange: 'Email không thể thay đổi',
      headline: 'Tiêu đề',
      headlinePlaceholder: 'VD: Kỹ sư phần mềm cao cấp',
      bio: 'Giới thiệu',
      bioPlaceholder: 'Hãy giới thiệu về bản thân...',
      save: 'Lưu thay đổi',
      saving: 'Đang lưu...',
      profileUpdated: 'Cập nhật hồ sơ thành công',
      updateFailed: 'Cập nhật thất bại',
      securitySettings: 'Cài đặt bảo mật',
      currentPassword: 'Mật khẩu hiện tại',
      newPassword: 'Mật khẩu mới',
      confirmPassword: 'Xác nhận mật khẩu mới',
      changePassword: 'Đổi mật khẩu',
      changing: 'Đang đổi...',
      passwordsDoNotMatch: 'Mật khẩu không khớp',
      passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
      passwordChanged: 'Đổi mật khẩu thành công',
      passwordChangeFailed: 'Đổi mật khẩu thất bại',
      notificationSettings: 'Cài đặt thông báo',
      emailNotifications: 'Thông báo qua email',
      emailNotificationsDesc: 'Nhận thông báo qua email về tài khoản của bạn',
      pushNotifications: 'Thông báo đẩy',
      pushNotificationsDesc: 'Nhận thông báo đẩy từ trình duyệt',
      jobAlerts: 'Thông báo việc làm',
      jobAlertsDesc: 'Nhận thông báo về cơ hội việc làm mới',
      privacySettings: 'Cài đặt quyền riêng tư',
      publicProfile: 'Hồ sơ công khai',
      publicProfileDesc: 'Cho phép người khác xem hồ sơ của bạn',
      privacyUpdated: 'Cập nhật quyền riêng tư thành công',
      accountSettings: 'Cài đặt tài khoản',
      appearance: 'Giao diện',
      theme: 'Chế độ',
      dark: 'Tối',
      light: 'Sáng',
      language: 'Ngôn ngữ',
      selectLanguage: 'Chọn ngôn ngữ',
      dangerZone: 'Vùng nguy hiểm',
      deleteAccountWarning: 'Khi bạn xóa tài khoản, không thể hoàn tác. Hãy chắc chắn.',
      deleteAccount: 'Xóa tài khoản',
      confirmDeleteAccount:
        'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
      delete: 'Xóa',
      cancel: 'Hủy',
      deleteAccountNotImplemented: 'Tính năng xóa tài khoản chưa được triển khai',
      accountDeleted: 'Tài khoản của bạn đã được xóa',
      deleteAccountError: 'Không thể xóa tài khoản. Vui lòng thử lại.',
      twoFactorAuth: 'Xác thực hai yếu tố',
      twoFactorDesc: 'Thêm một lớp bảo mật bằng ứng dụng xác thực.',
      twoFactorEnabled: '2FA đang được bật',
      twoFactorDisabled: '2FA đã được tắt',
      twoFactorActivated: '2FA đã được bật!',
      setupTwoFactor: 'Thiết lập 2FA',
      disableTwoFactor: 'Tắt 2FA',
      scanQrCode: 'Quét mã QR bằng ứng dụng xác thực, sau đó nhập mã 6 chữ số bên dưới.',
      verificationCode: 'Mã xác thực',
      verifyAndEnable: 'Xác minh & Bật',
      enterCodeToDisable: 'Nhập mã từ ứng dụng xác thực để tắt',
      invalidCode: 'Mã không hợp lệ. Vui lòng thử lại.',
      twoFactorSetupError: 'Không thể thiết lập 2FA. Vui lòng thử lại.',
      settingUp: 'Đang thiết lập...',
      verifying: 'Đang xác minh...',
      disabling: 'Đang tắt...',
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
      posting: 'Đang đăng...',
      post: 'Đăng',
      imageUrl: 'URL ảnh (tùy chọn)',
      all: 'Tất cả',
      backTo: 'Quay lại',
      uploadImage: 'Tải ảnh lên',
      imageSelected: 'Đã chọn ảnh',
      uploading: 'Đang tải ảnh...',
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
      monthlyPlan: 'Gói tháng',
      yearlyPlan: 'Gói năm',
      switchToYearly: 'Chuyển sang gói năm',
      switchToMonthly: 'Chuyển sang gói tháng',
      planSwitched: 'Đã cập nhật gói thành viên',
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
      unsavedChangesWarning:
        'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này?',
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
      posts: 'Bài đăng',
      articles: 'Bài viết',
      applications: 'Ứng tuyển',
      avgAtsScore: 'Điểm ATS TB',
      avgInterviewScore: 'Điểm PV TB',
      recentItems: 'Hoạt động gần đây',
      recommendedForYou: 'Đề xuất cho bạn',
      viewAll: 'Xem tất cả',
      analytics: 'Phân tích nâng cao',
      activityOverTime: 'Hoạt động theo thời gian',
      thisWeek: 'Tuần này',
      lastWeek: 'Tuần trước',
      thisMonth: 'Tháng này',
      achievements: 'Thành tựu',
      yourProgress: 'Tiến độ của bạn',
      nextMilestone: 'Cột mốc tiếp theo',
      // Next best action & profile completion
      nextBestAction: 'Gợi ý bước tiếp theo',
      profileCompletion: 'Mức độ hoàn thiện hồ sơ',
      nextActionOnboarding: 'Hoàn thành onboarding để cá nhân hoá trải nghiệm',
      nextActionOnboardingDesc:
        'Chọn mục tiêu nghề nghiệp để chúng tôi gợi ý CV, interview và jobs phù hợp.',
      nextActionCreateCV: 'Tạo CV đầu tiên của bạn',
      nextActionCreateCVDesc:
        'Bắt đầu với template ATS-friendly và để AI tối ưu nội dung giúp bạn.',
      nextActionInterview: 'Luyện phỏng vấn với AI',
      nextActionInterviewDesc:
        'Chọn một persona phù hợp và luyện trả lời các câu hỏi phỏng vấn thực tế.',
      nextActionJobs: 'Khám phá các cơ hội việc làm phù hợp',
      nextActionJobsDesc: 'Dùng CV đã tối ưu để apply vào các job đang tuyển dụng.',
      completeOnboarding: 'Hoàn thành onboarding',
      startInterview: 'Bắt đầu interview',
      viewJobs: 'Xem jobs',
    },
    home: {
      heroTitle: 'Tạo CV Hoàn Hảo',
      heroSubtitle: 'Trong Vòng 5 Phút',
      heroDescription:
        'Trình tạo CV hỗ trợ AI giúp bạn có được công việc mơ ước. Mẫu thân thiện ATS. Luyện phỏng vấn. Tất cả ở một nơi.',
      getStartedFree: 'Bắt đầu miễn phí',
      signIn: 'Đăng nhập',
      noCreditCard: 'Không cần thẻ tín dụng',
      atsOptimized: 'Tối ưu ATS',
      aiPowered: 'Hỗ trợ AI',
      everythingYouNeed: 'Mọi thứ bạn cần để thành công',
      allInOnePlatform: 'Nền tảng All-in-one hỗ trợ sự nghiệp',
      aiCVBuilder: 'Trình tạo CV AI',
      aiCVBuilderDesc:
        'Tạo CV thân thiện ATS trong vài phút. AI nâng cao nội dung của bạn để trở nên chuyên nghiệp và ấn tượng.',
      aiInterviewPractice: 'Luyện phỏng vấn AI',
      aiInterviewPracticeDesc:
        'Luyện tập với các nhân vật AI khác nhau - HR thân thiện, Quản lý nghiêm khắc, hoặc Người bản ngữ. Nhận phản hồi tức thì.',
      careerCommunity: 'Cộng đồng sự nghiệp',
      careerCommunityDesc:
        'Chia sẻ CV của bạn, nhận phản hồi và kết nối với các chuyên gia. Học hỏi từ kinh nghiệm của người khác.',
      howItWorks: 'Cách hoạt động',
      simpleFastEffective: 'Đơn giản. Nhanh chóng. Hiệu quả.',
      signUp: 'Đăng ký',
      signUpDesc: 'Tạo tài khoản miễn phí trong vài giây. Không cần thẻ tín dụng.',
      buildYourCV: 'Tạo CV của bạn',
      buildYourCVDesc:
        'Sử dụng trình tạo hỗ trợ AI của chúng tôi để tạo CV chuyên nghiệp, thân thiện ATS.',
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
    login: {
      welcomeBack: 'Chào mừng trở lại',
      signInToContinue: 'Đăng nhập để tiếp tục hành trình sự nghiệp',
      signingIn: 'Đang đăng nhập...',
      signIn: 'Đăng nhập',
      orContinueWith: 'Hoặc tiếp tục với',
      signInWithGoogle: 'Đăng nhập với Google',
      dontHaveAccount: 'Chưa có tài khoản?',
      createOne: 'Tạo tài khoản',
      invalidCredentials: 'Email hoặc mật khẩu không đúng',
      somethingWentWrong: 'Đã xảy ra lỗi',
    },
    register: {
      createAccount: 'Tạo tài khoản',
      startBuilding: 'Bắt đầu tạo CV hoàn hảo ngay hôm nay',
      creatingAccount: 'Đang tạo tài khoản...',
      passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
      registrationFailed: 'Đăng ký thất bại',
      signUpWithGoogle: 'Đăng ký với Google',
      alreadyHaveAccount: 'Đã có tài khoản?',
      signIn: 'Đăng nhập',
    },
    community: {
      sortBy: 'Sắp xếp theo:',
      new: 'Mới nhất',
      hot: 'Nổi bật',
      top: 'Nhiều thích nhất',
      loadingFeed: 'Đang tải feed...',
      noPostsYet: 'Chưa có bài đăng nào',
      beFirstToShare: 'Hãy là người đầu tiên chia sẻ với cộng đồng!',
      sharePlaceholder: 'Chia sẻ cập nhật sự nghiệp hoặc hỏi về phản hồi CV...',
      editPost: 'Chỉnh sửa bài viết',
      deletePost: 'Xoá bài viết',
      deletePostConfirm: 'Bạn có chắc muốn xoá bài viết này? Hành động này không thể hoàn tác.',
      share: 'Chia sẻ',
      linkCopied: 'Đã sao chép liên kết bài viết!',
      follow: 'Theo dõi',
      unfollow: 'Bỏ theo dõi',
      following: 'đang theo dõi',
      followers: 'người theo dõi',
      guidelines: 'Quy tắc cộng đồng',
      guidelineRespect: 'Tôn trọng và chuyên nghiệp',
      guidelineShare: 'Chia sẻ kiến thức và kinh nghiệm',
      guidelineSupport: 'Hỗ trợ và khuyến khích nhau',
      guidelineNoSpam: 'Không spam hay tự quảng cáo',
      joinDescription:
        'Kết nối với các chuyên gia, chia sẻ kinh nghiệm và cùng phát triển sự nghiệp.',
    },
    blog: {
      title: 'Blog & Tin tức Sự nghiệp',
      description: 'Thông tin mới nhất, mẹo và tin tức ngành cho hành trình chuyên nghiệp của bạn.',
      latestInsights: 'Thông tin sự nghiệp mới nhất',
      writingGoodArticle: 'Viết bài viết hay',
      focusTopic: 'Tập trung vào một chủ đề cụ thể',
      useHeadings: 'Sử dụng tiêu đề rõ ràng',
      addCoverImage: 'Thêm ảnh bìa',
      keepConcise: 'Giữ nội dung ngắn gọn',
      writeArticle: 'Viết bài viết',
      cancel: 'Hủy',
      createNewArticle: 'Tạo bài viết mới',
      titleLabel: 'Tiêu đề',
      categoryLabel: 'Danh mục',
      imageUrlLabel: 'URL ảnh',
      contentLabel: 'Nội dung',
      publish: 'Xuất bản',
      latestNews: 'Tin tức sự nghiệp mới nhất',
      refresh: 'Làm mới',
      noNewsAvailable: 'Hiện không có tin tức.',
      readMore: 'Đọc thêm',
      communityArticles: 'Bài viết cộng đồng',
      noArticlesYet: 'Chưa có bài viết nào. Hãy là người đầu tiên viết!',
      writeFirstArticle: 'Viết bài viết đầu tiên',
      views: 'lượt xem',
      new: 'Mới',
      searchPlaceholder: 'Tìm kiếm bài viết hoặc tin tức...',
      filters: 'Bộ lọc',
      category: 'Danh mục',
      allCategories: 'Tất cả',
      loadMore: 'Tải thêm',
      comments: 'Bình luận',
      writeComment: 'Viết bình luận...',
      loginToComment: 'Đăng nhập để bình luận.',
      noComments: 'Chưa có bình luận. Hãy là người đầu tiên!',
    },
    interview: {
      simulator: 'Mô phỏng phỏng vấn',
      choosePersona: 'Chọn nhân vật để bắt đầu phiên luyện tập',
      friendlyHR: 'HR Thân thiện',
      friendlyHRDesc: 'Tập trung vào văn hóa và kỹ năng mềm. Nhẹ nhàng và khuyến khích.',
      strictManager: 'Quản lý Nghiêm khắc',
      strictManagerDesc:
        'Đi sâu vào chi tiết kỹ thuật và giải quyết vấn đề. Trực tiếp và thách thức.',
      englishNative: 'Người bản ngữ',
      englishNativeDesc: 'Kiểm tra trình độ ngôn ngữ, ngữ pháp và sự trôi chảy của bạn.',
      techLead: 'Tech Lead Cấp cao',
      techLeadDesc: 'Thách thức về thiết kế hệ thống, kiến trúc và thực hành lập trình tốt nhất.',
      startupFounder: 'Nhà sáng lập Startup',
      startupFounderDesc:
        'Kiểm tra tư duy khởi nghiệp, khả năng thích ứng và giải quyết vấn đề dưới áp lực.',
      executive: 'C-Level Executive',
      executiveDesc:
        'Tập trung vào tư duy chiến lược, khả năng lãnh đạo và hiểu biết kinh doanh cấp cao.',
      academic: 'Nhà nghiên cứu Học thuật',
      academicDesc:
        'Khám phá phương pháp nghiên cứu, tư duy phản biện và kiến thức chuyên ngành của bạn.',
      startInterview: 'Bắt đầu phỏng vấn',
      backToDashboard: 'Quay lại Dashboard',
      online: 'Trực tuyến',
      completed: 'Hoàn thành',
      ending: 'Đang kết thúc...',
      ended: 'Đã kết thúc',
      endSession: 'Kết thúc phiên',
      aiFeedbackSummary: 'Tóm tắt phản hồi AI',
      listening: 'Đang nghe...',
      typeAnswer: 'Nhập câu trả lời của bạn...',
      sending: 'Đang gửi...',
      send: 'Gửi',
      microphoneDenied:
        'Quyền truy cập microphone bị từ chối. Vui lòng bật trong cài đặt trình duyệt.',
      microphoneError: 'Không thể truy cập microphone. Vui lòng kiểm tra cài đặt trình duyệt.',
      speechNotSupported:
        'Nhận dạng giọng nói không được hỗ trợ trong trình duyệt của bạn. Vui lòng sử dụng Chrome hoặc Edge.',
      speechError: 'Lỗi nhận dạng giọng nói. Vui lòng thử lại.',
      rateLimitExceeded: 'API đã vượt quá giới hạn. Vui lòng đợi một chút và thử lại.',
      serviceUnavailable: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau vài phút.',
      // Kết quả & radar
      resultTitle: 'Kết quả phiên phỏng vấn',
      resultSubtitle: 'Đánh giá tổng quan và chi tiết từng kỹ năng',
      overallScore: 'Điểm tổng thể',
      radarHint: 'Vùng diện tích càng lớn thể hiện hiệu suất càng cao',
      strengths: 'Điểm mạnh',
      noStrengths: 'Chưa có điểm mạnh nào được ghi nhận.',
      improvements: 'Cần cải thiện',
      noImprovements: 'Chưa có gợi ý cải thiện cụ thể.',
      detailedSummary: 'Tóm tắt chi tiết',
      perQuestionFeedback: 'Phản hồi theo từng câu hỏi',
      yourAnswer: 'Câu trả lời của bạn',
      // Analytics session
      sessionAnalytics: 'Phân tích phiên phỏng vấn này',
      questionsAnalyzed: 'Số câu hỏi được phân tích',
      averageScore: 'Điểm trung bình',
      confidenceScore: 'Điểm tự tin',
      overallPerformance: 'Hiệu suất tổng thể',
      startNew: 'Phiên mới',
      history: 'Lịch sử phỏng vấn',
      inProgress: 'Đang diễn ra',
    },
    jobs: {
      findDreamJob: 'Tìm công việc mơ ước',
      searchPlaceholder: 'Tìm kiếm theo chức danh, kỹ năng hoặc công ty',
      search: 'Tìm kiếm',
      filters: 'Bộ lọc:',
      all: 'Tất cả',
      fullTime: 'Toàn thời gian',
      partTime: 'Bán thời gian',
      remote: 'Làm việc từ xa',
      contract: 'Hợp đồng',
      internship: 'Thực tập',
      location: 'Địa điểm',
      loadingJobs: 'Đang tải việc làm...',
      noJobsAvailable: 'Không có việc làm',
      noJobsMatch: 'Không có việc làm phù hợp với tiêu chí tìm kiếm. Thử từ khóa khác.',
      noJobsAtMoment: 'Hiện không có danh sách việc làm. Vui lòng quay lại sau!',
      clearSearch: 'Xóa tìm kiếm',
      applied: 'Đã ứng tuyển',
      apply: 'Ứng tuyển',
      pleaseLogin: 'Vui lòng đăng nhập để ứng tuyển',
      appliedSuccessfully: 'Ứng tuyển thành công!',
      failedToApply: 'Ứng tuyển thất bại',
      jobSeekerGuidance: 'Hướng dẫn người tìm việc',
      recommendedBasedOn: 'Đề xuất dựa trên hồ sơ và lịch sử tìm kiếm của bạn',
      improveResume: 'Tôi muốn cải thiện CV',
      exploreBuilder: 'Khám phá trình tạo CV',
      salaryInsights: 'Thông tin lương',
      seeWhatWorth: 'Xem bạn đáng giá bao nhiêu',
      salaryRange: 'Khoảng lương',
      postJob: 'Đăng việc',
      hideForm: 'Ẩn form',
      showPostForm: 'Hiển thị form đăng việc',
      postSuccess: 'Đăng việc thành công!',
      postFailed: 'Đăng việc thất bại',
      posting: 'Đang đăng...',
      minSalary: 'Lương tối thiểu',
      maxSalary: 'Lương tối đa',
      experienceLevel: 'Cấp độ kinh nghiệm',
      entry: 'Mới vào nghề',
      mid: 'Trung cấp',
      senior: 'Cao cấp',
      executive: 'Điều hành',
      companySize: 'Quy mô công ty',
      startup: 'Khởi nghiệp',
      small: 'Nhỏ',
      medium: 'Vừa',
      large: 'Lớn',
      enterprise: 'Doanh nghiệp',
      advancedFilters: 'Bộ lọc nâng cao',
      clearFilters: 'Xóa bộ lọc',
      saveAlert: 'Lưu thông báo',
      myAlerts: 'Thông báo việc làm',
      alertName: 'Tên thông báo',
      alertSaved: 'Đã lưu thông báo việc làm',
      alertDeleted: 'Đã xóa thông báo',
      alertToggled: 'Đã cập nhật thông báo',
      maxAlerts: 'Tối đa 10 thông báo',
      noAlerts: 'Chưa có thông báo việc làm',
      manageAlerts: 'Quản lý thông báo',
      activeAlerts: 'Đang hoạt động',
      matches: 'lượt khớp',
      practiceInterview: 'Luyện tập phỏng vấn',
      aiInterview: 'Mô phỏng phỏng vấn AI',
      connectCommunity: 'Kết nối cộng đồng',
      getAdvice: 'Nhận lời khuyên',
    },
    footer: {
      description:
        'Nền tảng AI-powered giúp bạn tạo CV chuyên nghiệp, luyện phỏng vấn và phát triển sự nghiệp. Tất cả trong một nơi.',
      quickLinks: 'Liên kết nhanh',
      company: 'Công ty',
      legalSupport: 'Pháp lý & Hỗ trợ',
      cvBuilder: 'Tạo CV',
      interviewPractice: 'Luyện phỏng vấn',
      jobSearch: 'Tìm việc',
      careerBlog: 'Blog sự nghiệp',
      community: 'Cộng đồng',
      pricing: 'Bảng giá',
      aboutUs: 'Về chúng tôi',
      blog: 'Blog',
      contact: 'Liên hệ',
      careers: 'Tuyển dụng',
      partners: 'Đối tác',
      termsOfService: 'Điều khoản dịch vụ',
      privacyPolicy: 'Chính sách bảo mật',
      cookiePolicy: 'Chính sách cookie',
      helpCenter: 'Trung tâm trợ giúp',
      allRightsReserved: 'Bảo lưu mọi quyền.',
      sitemap: 'Sơ đồ trang web',
      accessibility: 'Khả năng truy cập',
    },
    messaging: {
      title: 'Tin nhắn',
      online: 'Trực tuyến',
      writeMessage: 'Viết tin nhắn...',
      selectConversation: 'Chọn cuộc trò chuyện để bắt đầu nhắn tin',
      noConversations: 'Chưa có cuộc trò chuyện nào',
      noMessages: 'Chưa có tin nhắn',
      sendFailed: 'Gửi tin nhắn thất bại',
      typing: 'Đang nhập...',
      imageTooLarge: 'Ảnh phải nhỏ hơn 5MB',
      imageOnly: 'Chỉ chấp nhận file ảnh',
      uploadFailed: 'Tải ảnh thất bại',
    },
    export: {
      exportShare: 'Xuất & Chia sẻ',
      exportAs: 'Xuất dưới dạng',
      pdf: 'PDF',
      html: 'HTML',
      share: 'Chia sẻ',
      copyLink: 'Sao chép liên kết',
      copied: 'Đã sao chép!',
      email: 'Email',
      pdfExported: 'Xuất PDF thành công',
      pdfExportFailed: 'Xuất PDF thất bại',
      htmlExported: 'Xuất HTML thành công',
      linkCopied: 'Đã sao chép liên kết',
      copyFailed: 'Sao chép liên kết thất bại',
      elementNotFound: 'Không tìm thấy nội dung',
    },
    notifications: {
      title: 'Thông báo',
      new: 'mới',
      markAllRead: 'Đánh dấu tất cả đã đọc',
      searchPlaceholder: 'Tìm kiếm thông báo...',
      all: 'Tất cả',
      unread: 'Chưa đọc',
      likes: 'Thích',
      comments: 'Bình luận',
      jobs: 'Việc làm',
      noNotifications: 'Chưa có thông báo',
      noNotificationsDesc:
        'Chúng tôi sẽ thông báo khi có cập nhật về đơn ứng tuyển hoặc hoạt động cộng đồng của bạn.',
      noMatchingNotifications: 'Không có thông báo nào khớp với bộ lọc của bạn.',
    },
    toast: {
      loginSuccess: 'Đăng nhập thành công!',
      loginFailed: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      registerSuccess: 'Đăng ký thành công!',
      registerFailed: 'Đăng ký thất bại. Vui lòng thử lại.',
      postCreated: 'Đã đăng bài thành công!',
      postFailed: 'Đăng bài thất bại. Vui lòng thử lại.',
      profileUpdated: 'Cập nhật hồ sơ thành công!',
      profileUpdateFailed: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',
      articlePublished: 'Đã xuất bản bài viết thành công!',
      articlePublishFailed: 'Xuất bản bài viết thất bại. Vui lòng thử lại.',
      jobApplied: 'Đã ứng tuyển thành công!',
      jobApplyFailed: 'Ứng tuyển thất bại. Vui lòng thử lại.',
      somethingWentWrong: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
    },
    admin: {
      title: 'Bảng điều khiển quản trị',
      subtitle: 'Quản lý người dùng, nội dung, việc làm, gói đăng ký và kiểm duyệt.',
      refresh: 'Làm mới',
      accessDenied: 'Truy cập bị từ chối',
      accessDeniedDesc: 'Bạn cần quyền quản trị viên để xem trang này.',
      backToDashboard: 'Về trang chủ',
      overview: 'Tổng quan',
      users: 'Người dùng',
      posts: 'Bài đăng',
      articles: 'Bài viết',
      jobs: 'Việc làm',
      bannedUsers: 'Bị cấm',
      pendingPosts: 'Chờ duyệt',
      premiumUsers: 'Premium',
      totalRevenue: 'Tổng doanh thu',
      monthlySubs: 'Gói tháng',
      yearlySubs: 'Gói năm',
      searchPlaceholder: 'Tìm theo tên hoặc email',
      search: 'Tìm kiếm',
      user: 'Người dùng',
      role: 'Vai trò',
      subscription: 'Gói đăng ký',
      status: 'Trạng thái',
      actions: 'Thao tác',
      setUser: 'Đặt User',
      setAdmin: 'Đặt Admin',
      setFree: 'Đặt Free',
      setPremium: 'Đặt Premium',
      unban: 'Bỏ cấm',
      ban: 'Cấm',
      banned: 'Bị cấm',
      active: 'Hoạt động',
      all: 'Tất cả',
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Bị từ chối',
      content: 'Nội dung',
      created: 'Ngày tạo',
      approve: 'Duyệt',
      reject: 'Từ chối',
      delete: 'Xóa',
      unknownUser: 'Không rõ',
      noContent: '(Không có nội dung)',
      reason: 'Lý do:',
      titleColumn: 'Tiêu đề',
      author: 'Tác giả',
      category: 'Danh mục',
      published: 'Đã xuất bản',
      yes: 'Có',
      no: 'Không',
      unpublish: 'Gỡ xuất bản',
      publish: 'Xuất bản',
      company: 'Công ty',
      type: 'Loại',
      postedBy: 'Đăng bởi',
      applicants: 'Ứng viên',
      deletePostConfirm: 'Xóa vĩnh viễn bài đăng này? Hành động không thể hoàn tác.',
      deletePostTitle: 'Xóa bài đăng',
      deleteArticleConfirm: 'Xóa vĩnh viễn bài viết này? Hành động không thể hoàn tác.',
      deleteArticleTitle: 'Xóa bài viết',
      deleteJobConfirm: 'Xóa vĩnh viễn việc làm này? Hành động không thể hoàn tác.',
      deleteJobTitle: 'Xóa việc làm',
      rejectPostTitle: 'Từ chối bài đăng',
      rejectReason: 'Lý do từ chối (không bắt buộc):',
      rejectionReason: 'Lý do từ chối',
      cancel: 'Hủy',
      dataRefreshed: 'Đã làm mới dữ liệu quản trị',
      userBanned: 'Đã cấm người dùng',
      userUnbanned: 'Đã bỏ cấm người dùng',
      roleUpdated: 'Đã cập nhật vai trò',
      subscriptionUpdated: 'Đã cập nhật gói đăng ký',
      postUpdated: 'Đã cập nhật bài đăng',
      postDeleted: 'Đã xóa bài đăng',
      articlePublishUpdated: 'Đã cập nhật trạng thái xuất bản',
      articleDeleted: 'Đã xóa bài viết',
      jobDeleted: 'Đã xóa việc làm',
      loadFailed: 'Tải dữ liệu thất bại',
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
      profile: 'Profile',
      settings: 'Settings',
      achievements: 'Achievements',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      privacy: 'Privacy',
      account: 'Account',
      profileSettings: 'Profile Settings',
      name: 'Name',
      email: 'Email',
      emailCannotChange: 'Email cannot be changed',
      headline: 'Headline',
      headlinePlaceholder: 'e.g. Senior Software Engineer',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself...',
      save: 'Save Changes',
      saving: 'Saving...',
      profileUpdated: 'Profile updated successfully',
      updateFailed: 'Update failed',
      securitySettings: 'Security Settings',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      changePassword: 'Change Password',
      changing: 'Changing...',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordChanged: 'Password changed successfully',
      passwordChangeFailed: 'Password change failed',
      notificationSettings: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive email notifications about your account',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Receive push notifications in your browser',
      jobAlerts: 'Job Alerts',
      jobAlertsDesc: 'Get notified about new job opportunities',
      privacySettings: 'Privacy Settings',
      publicProfile: 'Public Profile',
      publicProfileDesc: 'Allow others to view your profile',
      privacyUpdated: 'Privacy settings updated',
      accountSettings: 'Account Settings',
      appearance: 'Appearance',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      language: 'Language',
      selectLanguage: 'Select Language',
      dangerZone: 'Danger Zone',
      deleteAccountWarning:
        'Once you delete your account, there is no going back. Please be certain.',
      deleteAccount: 'Delete Account',
      confirmDeleteAccount:
        'Are you sure you want to delete your account? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      deleteAccountNotImplemented: 'Account deletion is not yet implemented',
      accountDeleted: 'Your account has been deleted',
      deleteAccountError: 'Failed to delete account. Please try again.',
      twoFactorAuth: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security using an authenticator app.',
      twoFactorEnabled: '2FA is currently enabled',
      twoFactorDisabled: '2FA has been disabled',
      twoFactorActivated: '2FA has been enabled!',
      setupTwoFactor: 'Set Up 2FA',
      disableTwoFactor: 'Disable 2FA',
      scanQrCode:
        'Scan this QR code with your authenticator app, then enter the 6-digit code below.',
      verificationCode: 'Verification Code',
      verifyAndEnable: 'Verify & Enable',
      enterCodeToDisable: 'Enter code from authenticator to disable',
      invalidCode: 'Invalid code. Please try again.',
      twoFactorSetupError: 'Failed to set up 2FA. Please try again.',
      settingUp: 'Setting up...',
      verifying: 'Verifying...',
      disabling: 'Disabling...',
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
      posting: 'Posting...',
      post: 'Post',
      imageUrl: 'Image URL (optional)',
      all: 'All',
      backTo: 'Back to',
      uploadImage: 'Upload image',
      imageSelected: 'Image selected',
      uploading: 'Uploading image...',
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
      monthlyPlan: 'Monthly Plan',
      yearlyPlan: 'Yearly Plan',
      switchToYearly: 'Switch to Yearly Plan',
      switchToMonthly: 'Switch to Monthly Plan',
      planSwitched: 'Subscription plan updated',
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
      unsavedChangesWarning:
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
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
      posts: 'Posts',
      articles: 'Articles',
      applications: 'Applications',
      avgAtsScore: 'Avg ATS Score',
      avgInterviewScore: 'Avg Interview Score',
      recentItems: 'Recent Items',
      recommendedForYou: 'Recommended for you',
      viewAll: 'View all',
      analytics: 'Advanced Analytics',
      activityOverTime: 'Activity Over Time',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      achievements: 'Achievements',
      yourProgress: 'Your Progress',
      nextMilestone: 'Next Milestone',
      // Next best action & profile completion
      nextBestAction: 'Next best action',
      profileCompletion: 'Profile completion',
      nextActionOnboarding: 'Complete onboarding to personalize your experience',
      nextActionOnboardingDesc:
        'Choose your career goal so we can suggest the right CV, interviews, and jobs.',
      nextActionCreateCV: 'Create your first CV',
      nextActionCreateCVDesc:
        'Start with an ATS-friendly template and let AI optimize your content.',
      nextActionInterview: 'Practice interviews with AI',
      nextActionInterviewDesc: 'Pick a persona and practice realistic interview questions.',
      nextActionJobs: 'Explore matching job opportunities',
      nextActionJobsDesc: 'Use your optimized CV to apply for open roles.',
      completeOnboarding: 'Complete onboarding',
      startInterview: 'Start interview',
      viewJobs: 'View jobs',
    },
    home: {
      heroTitle: 'Create Your Perfect CV',
      heroSubtitle: 'in Under 5 Minutes',
      heroDescription:
        'AI-powered resume builder that helps you land your dream job. ATS-friendly templates. Interview practice. All in one place.',
      getStartedFree: 'Get Started Free',
      signIn: 'Sign In',
      noCreditCard: 'No Credit Card Required',
      atsOptimized: 'ATS-Optimized',
      aiPowered: 'AI-Powered',
      everythingYouNeed: 'Everything You Need to Succeed',
      allInOnePlatform: 'All-in-one career platform powered by AI',
      aiCVBuilder: 'AI CV Builder',
      aiCVBuilderDesc:
        'Create ATS-friendly resumes in minutes. AI enhances your content to make it professional and impactful.',
      aiInterviewPractice: 'AI Interview Practice',
      aiInterviewPracticeDesc:
        'Practice with different AI personas - Friendly HR, Strict Manager, or English Native. Get instant feedback.',
      careerCommunity: 'Career Community',
      careerCommunityDesc:
        "Share your CV, get feedback, and connect with professionals. Learn from others' experiences.",
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
      joinThousands:
        'Join thousands of professionals who have already created their perfect CV with CV Mate.',
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
    login: {
      welcomeBack: 'Welcome Back',
      signInToContinue: 'Sign in to continue your career journey',
      signingIn: 'Signing in...',
      signIn: 'Sign In',
      orContinueWith: 'Or continue with',
      signInWithGoogle: 'Sign in with Google',
      dontHaveAccount: "Don't have an account?",
      createOne: 'Create one',
      invalidCredentials: 'Invalid email or password',
      somethingWentWrong: 'Something went wrong',
    },
    register: {
      createAccount: 'Create Account',
      startBuilding: 'Start building your perfect CV today',
      creatingAccount: 'Creating account...',
      passwordTooShort: 'Password must be at least 6 characters',
      registrationFailed: 'Registration failed',
      signUpWithGoogle: 'Sign up with Google',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
    community: {
      sortBy: 'Sort by:',
      new: 'New',
      hot: 'Hot',
      top: 'Top',
      loadingFeed: 'Loading feed...',
      noPostsYet: 'No posts yet',
      beFirstToShare: 'Be the first to share something with the community!',
      sharePlaceholder: 'Share a career update or ask for CV feedback...',
      editPost: 'Edit post',
      deletePost: 'Delete post',
      deletePostConfirm: 'Are you sure you want to delete this post? This action cannot be undone.',
      share: 'Share',
      linkCopied: 'Post link copied!',
      follow: 'Follow',
      unfollow: 'Unfollow',
      following: 'following',
      followers: 'followers',
      guidelines: 'Community Guidelines',
      guidelineRespect: 'Be respectful and professional',
      guidelineShare: 'Share knowledge and experiences',
      guidelineSupport: 'Support and encourage others',
      guidelineNoSpam: 'No spam or self-promotion',
      joinDescription:
        'Connect with professionals, share experiences, and grow your career together.',
    },
    blog: {
      title: 'Career Blog & News',
      description: 'Latest insights, tips, and industry news for your professional journey.',
      latestInsights: 'Latest Career Insights',
      writingGoodArticle: 'Writing a good article',
      focusTopic: 'Focus on a specific topic',
      useHeadings: 'Use clear headings',
      addCoverImage: 'Add a cover image',
      keepConcise: 'Keep it concise',
      writeArticle: 'Write an Article',
      cancel: 'Cancel',
      createNewArticle: 'Create New Article',
      titleLabel: 'Title',
      categoryLabel: 'Category',
      imageUrlLabel: 'Image URL',
      contentLabel: 'Content',
      publish: 'Publish',
      latestNews: 'Latest Career News',
      refresh: 'Refresh',
      noNewsAvailable: 'No news available at the moment.',
      readMore: 'Read More',
      communityArticles: 'Community Articles',
      noArticlesYet: 'No articles yet. Be the first to write one!',
      writeFirstArticle: 'Write First Article',
      views: 'views',
      new: 'New',
      searchPlaceholder: 'Search articles or news...',
      filters: 'Filters',
      category: 'Category',
      allCategories: 'All categories',
      loadMore: 'Load more',
      comments: 'Comments',
      writeComment: 'Write a comment...',
      loginToComment: 'Log in to leave a comment.',
      noComments: 'No comments yet. Be the first to comment!',
    },
    interview: {
      simulator: 'Interview Simulator',
      choosePersona: 'Choose a persona to start your practice session',
      friendlyHR: 'Friendly HR',
      friendlyHRDesc: 'Focuses on culture fit and soft skills. Gentle and encouraging.',
      strictManager: 'Strict Manager',
      strictManagerDesc:
        'Drills into technical details and problem solving. Direct and challenging.',
      englishNative: 'English Native',
      englishNativeDesc: 'Checks your language proficiency, grammar, and fluency.',
      techLead: 'Senior Tech Lead',
      techLeadDesc: 'Challenges on system design, architecture, and coding best practices.',
      startupFounder: 'Startup Founder',
      startupFounderDesc:
        'Tests your entrepreneurial mindset, adaptability, and problem-solving under pressure.',
      executive: 'C-Level Executive',
      executiveDesc: 'Focuses on strategic thinking, leadership, and high-level business acumen.',
      academic: 'Academic Researcher',
      academicDesc:
        'Explores your research methodology, critical thinking, and domain-specific knowledge.',
      startInterview: 'Start Interview',
      backToDashboard: 'Back to Dashboard',
      online: 'Online',
      completed: 'Completed',
      ending: 'Ending...',
      ended: 'Ended',
      endSession: 'End Session',
      aiFeedbackSummary: 'AI Feedback Summary',
      listening: 'Listening...',
      typeAnswer: 'Type your answer...',
      sending: 'Sending...',
      send: 'Send',
      microphoneDenied: 'Microphone permission denied. Please enable it in your browser settings.',
      microphoneError: 'Could not access microphone. Please check your browser settings.',
      speechNotSupported:
        'Speech recognition is not supported in your browser. Please use Chrome or Edge.',
      speechError: 'Speech recognition error. Please try again.',
      rateLimitExceeded: 'API rate limit exceeded. Please wait a moment and try again.',
      serviceUnavailable: 'Service temporarily unavailable. Please try again in a few moments.',
      // Result & radar
      resultTitle: 'Interview Result',
      resultSubtitle: 'Overall performance and detailed breakdown',
      overallScore: 'Overall score',
      radarHint: 'Larger area means stronger overall performance',
      strengths: 'Strengths',
      noStrengths: 'No strengths identified yet.',
      improvements: 'What to improve',
      noImprovements: 'No improvement suggestions available.',
      detailedSummary: 'Detailed summary',
      perQuestionFeedback: 'Per-question feedback',
      yourAnswer: 'Your answer',
      // Analytics session
      sessionAnalytics: 'This session analytics',
      questionsAnalyzed: 'Questions analyzed',
      averageScore: 'Average score',
      confidenceScore: 'Confidence score',
      overallPerformance: 'Overall performance',
      startNew: 'Start new',
      history: 'Interview History',
      inProgress: 'In Progress',
    },
    jobs: {
      findDreamJob: 'Find your dream job',
      searchPlaceholder: 'Search by title, skill, or company',
      search: 'Search',
      filters: 'Filters:',
      all: 'All',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      remote: 'Remote',
      contract: 'Contract',
      internship: 'Internship',
      location: 'Location',
      loadingJobs: 'Loading jobs...',
      noJobsAvailable: 'No jobs available',
      noJobsMatch: 'No jobs match your search criteria. Try different keywords.',
      noJobsAtMoment: 'There are no job listings at the moment. Check back later!',
      clearSearch: 'Clear Search',
      applied: 'Applied',
      apply: 'Apply',
      pleaseLogin: 'Please login to apply for jobs',
      appliedSuccessfully: 'Applied successfully!',
      failedToApply: 'Failed to apply',
      jobSeekerGuidance: 'Job Seeker Guidance',
      recommendedBasedOn: 'Recommended based on your profile and search history',
      improveResume: 'I want to improve my resume',
      exploreBuilder: 'Explore our resume builder',
      salaryInsights: 'Salary insights',
      seeWhatWorth: 'See what you are worth',
      salaryRange: 'Salary Range',
      postJob: 'Post a Job',
      hideForm: 'Hide Form',
      showPostForm: 'Show Post Form',
      postSuccess: 'Job posted successfully!',
      postFailed: 'Failed to post job',
      posting: 'Posting...',
      minSalary: 'Min Salary',
      maxSalary: 'Max Salary',
      experienceLevel: 'Experience Level',
      entry: 'Entry',
      mid: 'Mid',
      senior: 'Senior',
      executive: 'Executive',
      companySize: 'Company Size',
      startup: 'Startup',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      enterprise: 'Enterprise',
      advancedFilters: 'Advanced Filters',
      clearFilters: 'Clear Filters',
      saveAlert: 'Save Alert',
      myAlerts: 'Job Alerts',
      alertName: 'Alert Name',
      alertSaved: 'Job alert saved',
      alertDeleted: 'Alert deleted',
      alertToggled: 'Alert updated',
      maxAlerts: 'Maximum 10 alerts',
      noAlerts: 'No job alerts yet',
      manageAlerts: 'Manage Alerts',
      activeAlerts: 'Active',
      matches: 'matches',
      practiceInterview: 'Practice Interview',
      aiInterview: 'AI Interview Simulator',
      connectCommunity: 'Connect with Community',
      getAdvice: 'Get Career Advice',
      jobTitlePlaceholder: 'Job Title (e.g., Frontend Engineer)',
      companyPlaceholder: 'Company Name',
      locationPlaceholder: 'Location (or Remote)',
      salaryPlaceholder: 'Salary (optional, e.g., $2000-$3000)',
      descriptionPlaceholder: 'Job Description',
      requirementsPlaceholder: 'Requirements (one per line)',
    },
    footer: {
      description:
        'AI-powered platform helping you create professional CVs, practice interviews, and grow your career. All in one place.',
      quickLinks: 'Quick Links',
      company: 'Company',
      legalSupport: 'Legal & Support',
      cvBuilder: 'CV Builder',
      interviewPractice: 'Interview Practice',
      jobSearch: 'Job Search',
      careerBlog: 'Career Blog',
      community: 'Community',
      pricing: 'Pricing',
      aboutUs: 'About Us',
      blog: 'Blog',
      contact: 'Contact',
      careers: 'Careers',
      partners: 'Partners',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      cookiePolicy: 'Cookie Policy',
      helpCenter: 'Help Center',
      allRightsReserved: 'All rights reserved.',
      sitemap: 'Sitemap',
      accessibility: 'Accessibility',
    },
    messaging: {
      title: 'Messaging',
      online: 'Online',
      writeMessage: 'Write a message...',
      selectConversation: 'Select a conversation to start messaging',
      noConversations: 'No conversations yet',
      noMessages: 'No messages',
      sendFailed: 'Failed to send message',
      typing: 'Typing...',
      imageTooLarge: 'Image must be less than 5MB',
      imageOnly: 'Only image files are allowed',
      uploadFailed: 'Failed to upload image',
    },
    export: {
      exportShare: 'Export & Share',
      exportAs: 'Export As',
      pdf: 'PDF',
      html: 'HTML',
      share: 'Share',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      email: 'Email',
      pdfExported: 'PDF exported successfully',
      pdfExportFailed: 'Failed to export PDF',
      htmlExported: 'HTML exported successfully',
      linkCopied: 'Link copied to clipboard',
      copyFailed: 'Failed to copy link',
      elementNotFound: 'Content element not found',
    },
    notifications: {
      title: 'Notifications',
      new: 'new',
      markAllRead: 'Mark all as read',
      searchPlaceholder: 'Search notifications...',
      all: 'All',
      unread: 'Unread',
      likes: 'Likes',
      comments: 'Comments',
      jobs: 'Jobs',
      noNotifications: 'No notifications yet',
      noNotificationsDesc:
        "We'll let you know when there's an update on your job applications or community activity.",
      noMatchingNotifications: 'No notifications match your filters.',
    },
    toast: {
      loginSuccess: 'Login successful!',
      loginFailed: 'Login failed. Please check your credentials.',
      registerSuccess: 'Registration successful!',
      registerFailed: 'Registration failed. Please try again.',
      postCreated: 'Post created successfully!',
      postFailed: 'Failed to create post. Please try again.',
      profileUpdated: 'Profile updated successfully!',
      profileUpdateFailed: 'Failed to update profile. Please try again.',
      articlePublished: 'Article published successfully!',
      articlePublishFailed: 'Failed to publish article. Please try again.',
      jobApplied: 'Applied successfully!',
      jobApplyFailed: 'Failed to apply. Please try again.',
      somethingWentWrong: 'Something went wrong. Please try again later.',
    },
    admin: {
      title: 'Admin Management Console',
      subtitle: 'Manage users, content, jobs, subscriptions, and moderation actions.',
      refresh: 'Refresh',
      accessDenied: 'Access denied',
      accessDeniedDesc: 'You need admin privileges to view this page.',
      backToDashboard: 'Back to dashboard',
      overview: 'Overview',
      users: 'Users',
      posts: 'Posts',
      articles: 'Articles',
      jobs: 'Jobs',
      bannedUsers: 'Banned Users',
      pendingPosts: 'Pending Posts',
      premiumUsers: 'Premium Users',
      totalRevenue: 'Total Revenue',
      monthlySubs: 'Monthly Subs',
      yearlySubs: 'Yearly Subs',
      searchPlaceholder: 'Search by name or email',
      search: 'Search',
      user: 'User',
      role: 'Role',
      subscription: 'Subscription',
      status: 'Status',
      actions: 'Actions',
      setUser: 'Set User',
      setAdmin: 'Set Admin',
      setFree: 'Set Free',
      setPremium: 'Set Premium',
      unban: 'Unban',
      ban: 'Ban',
      banned: 'Banned',
      active: 'Active',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      content: 'Content',
      created: 'Created',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      unknownUser: 'Unknown user',
      noContent: '(No content)',
      reason: 'Reason:',
      titleColumn: 'Title',
      author: 'Author',
      category: 'Category',
      published: 'Published',
      yes: 'Yes',
      no: 'No',
      unpublish: 'Unpublish',
      publish: 'Publish',
      company: 'Company',
      type: 'Type',
      postedBy: 'Posted by',
      applicants: 'Applicants',
      deletePostConfirm: 'Delete this post permanently? This action cannot be undone.',
      deletePostTitle: 'Delete Post',
      deleteArticleConfirm: 'Delete this article permanently? This action cannot be undone.',
      deleteArticleTitle: 'Delete Article',
      deleteJobConfirm: 'Delete this job permanently? This action cannot be undone.',
      deleteJobTitle: 'Delete Job',
      rejectPostTitle: 'Reject Post',
      rejectReason: 'Reason for rejection (optional):',
      rejectionReason: 'Rejection Reason',
      cancel: 'Cancel',
      dataRefreshed: 'Admin data refreshed',
      userBanned: 'User banned',
      userUnbanned: 'User unbanned',
      roleUpdated: 'User role updated',
      subscriptionUpdated: 'User subscription updated',
      postUpdated: 'Post updated',
      postDeleted: 'Post deleted',
      articlePublishUpdated: 'Article publish state updated',
      articleDeleted: 'Article deleted',
      jobDeleted: 'Job deleted',
      loadFailed: 'Failed to load data',
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
    // Default to English as primary language
    return saved || 'en';
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
