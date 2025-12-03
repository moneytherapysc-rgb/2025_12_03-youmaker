# YouMaker - AI-Powered YouTube Content Creation Platform

<div align="center">
  <h3>AI Studio에서 YouTube 콘텐츠 생성 및 분석을 위한 통합 플랫폼</h3>
</div>

## 📋 개요

**YouMaker**는 AI 기술을 활용하여 YouTube 콘텐츠 제작자들을 위한 포괄적인 도구 모음을 제공합니다. 키워드 분석, 트렌드 분석, 썸네일 생성, 스크립트 작성 등 다양한 기능을 통해 콘텐츠 제작 과정을 간소화합니다.

## 🚀 주요 기능

- **키워드 분석**: YouTube 키워드의 트렌드 및 경쟁 상황 분석
- **트렌드 분석**: 실시간 YouTube 트렌드 추적
- **썸네일 생성**: AI를 활용한 자동 썸네일 생성 및 최적화
- **스크립트 생성**: AI 기반 영상 스크립트 자동 작성
- **댓글 분석**: 영상 댓글 감정 분석 및 인사이트
- **채널 분석**: 채널 성장 분석 및 경쟁 채널 비교
- **구독 관리**: 구독 플랜 및 결제 관리

## 🛠️ 기술 스택

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 5.1.6
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.4.1
- **Charts**: Recharts 2.12.2
- **AI API**: Google Gemini API

## 📦 프로젝트 구조

```
youmaker-project/
├── src/
│   ├── components/        # React 컴포넌트
│   ├── contexts/          # React Context (상태 관리)
│   ├── services/          # API 및 비즈니스 로직
│   ├── pages/             # 페이지 컴포넌트
│   ├── hooks/             # Custom React Hooks
│   ├── utils/             # 유틸리티 함수
│   ├── types/             # TypeScript 타입 정의
│   ├── assets/            # 이미지, 폰트 등
│   ├── styles/            # 글로벌 스타일
│   ├── App.tsx            # 메인 App 컴포넌트
│   └── index.tsx          # 엔트리 포인트
├── index.html             # HTML 템플릿
├── package.json           # 프로젝트 의존성
├── tsconfig.json          # TypeScript 설정
├── vite.config.ts         # Vite 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── vercel.json            # Vercel 배포 설정
└── README.md              # 프로젝트 문서
```

## 🔧 설치 및 실행

### 사전 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/youmaker.git
cd youmaker
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정합니다:

```bash
cp .env.example .env.local
```

그 후 `.env.local` 파일을 편집하여 API 키를 입력합니다:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 5. 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 6. 프리뷰
```bash
npm run preview
```

## 🌐 Vercel 배포

### 자동 배포 설정

1. **GitHub 저장소 연결**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정 완료

2. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 "Environment Variables" 선택
   - 다음 변수들을 추가합니다:
     - `VITE_GEMINI_API_KEY`: Google Gemini API 키
     - `VITE_YOUTUBE_API_KEY`: YouTube API 키 (선택사항)

3. **자동 배포**
   - `main` 브랜치에 푸시하면 자동으로 배포됩니다

## 💳 결제 기능 (향후 업데이트)

### 토스페이먼츠 통합 준비

현재 프로젝트는 토스페이먼츠 결제 기능을 위한 기반 구조를 포함하고 있습니다. 토스페이먼츠 승인 후 다음 단계를 진행합니다:

1. **필요한 패키지 설치**
   ```bash
   npm install @tosspayments/payment-sdk
   ```

2. **환경 변수 추가**
   ```
   VITE_TOSS_CLIENT_KEY=your_toss_client_key
   VITE_TOSS_SECRET_KEY=your_toss_secret_key
   ```

3. **결제 서비스 구현**
   - `src/services/paymentService.ts` 파일 생성
   - 토스페이먼츠 API 통합
   - 결제 컴포넌트 개발

4. **구독 관리 업데이트**
   - `src/components/PricingModal.tsx` 업데이트
   - 결제 처리 로직 추가

## 📝 주요 파일 설명

### src/services/
- **youtubeService.ts**: YouTube API 통합
- **subscriptionService.ts**: 구독 관리 로직
- **instructionService.ts**: 사용자 가이드 데이터
- **storageService.ts**: 로컬 스토리지 관리
- **paymentService.ts** (예정): 토스페이먼츠 결제 처리

### src/contexts/
- **AuthContext.tsx**: 사용자 인증 상태 관리

### src/components/
- **AdminDashboard.tsx**: 관리자 대시보드
- **PricingModal.tsx**: 가격 및 구독 플랜
- **ImageGenView.tsx**: AI 이미지 생성
- **ScriptGenerator.tsx**: AI 스크립트 생성
- 기타 분석 및 관리 컴포넌트

## 🔐 보안 주의사항

- API 키는 절대 코드에 직접 입력하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- 환경 변수는 Vercel 대시보드에서 안전하게 관리하세요

## 🤝 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

문제가 발생하거나 기능 요청이 있으시면 [Issues](https://github.com/yourusername/youmaker/issues)를 통해 알려주세요.

## 🎯 향후 계획

- [ ] 토스페이먼츠 결제 통합
- [ ] 다국어 지원 (영어, 중국어 등)
- [ ] 모바일 앱 개발
- [ ] 실시간 협업 기능
- [ ] 고급 분석 대시보드
- [ ] API 문서 공개

---

**Made with ❤️ by YouMaker Team**
