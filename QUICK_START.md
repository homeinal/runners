# 매달 개선 문서 - 빠른 시작 가이드

## 문서 파일 위치
```
/f/runners_high/runner/
├── IMPROVEMENTS.md              # 📘 상세 구현 가이드 (3,041줄, 102KB)
├── IMPROVEMENTS_SUMMARY.md      # 📋 개요 및 요약 (260줄, 7.2KB)
└── QUICK_START.md              # 📍 이 파일
```

---

## 5분 만에 이해하기

### 개선 항목 (13개)

#### 🔴 Critical - 즉시 구현 (2주)
| # | 기능 | 파일 | 난이도 | 시간 |
|---|------|------|--------|------|
| 1 | 크루 찾기 백엔드 | `/crew/*` + API | ⭐⭐⭐ | 12h |
| 2 | 마크다운 렌더링 | `/posts/[id]` | ⭐⭐ | 4h |

#### 🟠 High - 우선 개선 (3주)
| # | 기능 | 파일 | 난이도 | 시간 |
|---|------|------|--------|------|
| 3 | 데이터 편집 | `/ranking/upload` | ⭐⭐ | 6h |
| 4 | 수동 입력 | `/ranking/upload` | ⭐⭐ | 6h |
| 5 | 캘린더 추가 | `/races/[id]` | ⭐⭐ | 4h |
| 6 | 빈 상태 UI | `/ranking` | ⭐ | 2h |
| 7 | localStorage | `/shoe-tier` | ⭐⭐ | 3h |
| 8 | 드래그 드롭 | `/shoe-tier` | ⭐⭐⭐ | 8h |

#### 🟡 Medium - 일반 개선 (4주)
| # | 기능 | 파일 | 난이도 | 시간 |
|---|------|------|--------|------|
| 9 | 스켈레톤 | `components/ui` | ⭐⭐ | 4h |
| 10 | Error Boundary | `components/*` | ⭐⭐ | 3h |
| 11 | 공유 기능 | `components/ui` | ⭐⭐ | 5h |
| 12 | 순위 강조 | `/ranking` | ⭐ | 2h |

#### 🟢 Low - 향후 개선 (5주)
| # | 기능 | 파일 | 난이도 | 시간 |
|---|------|------|--------|------|
| 13 | OAuth 에러 | `/login` | ⭐ | 2h |

---

## 구현 순서 추천

### Week 1-2: Critical (Critical)
```bash
# 병렬 진행 가능
Task A: 크루 찾기 백엔드 (12h)
  - Prisma 스키마
  - API 라우트 (GET, POST, PATCH, DELETE)
  - Frontend 연동

Task B: 마크다운 렌더링 (4h)
  - 패키지 설치
  - MarkdownRenderer 컴포넌트
  - 페이지 연동
```

### Week 2-3: High - Part 1
```bash
# 연속 진행 추천 (같은 페이지)
1. 데이터 편집 UI (6h)
2. 수동 입력 폼 (6h)
```

### Week 3-4: High - Part 2
```bash
# 병렬 가능
Task A: 캘린더 + 빈 상태 (6h)
Task B: localStorage + 드래그 (11h)
```

### Week 4-5: Medium
```bash
1. 스켈레톤 (4h)
2. Error Boundary (3h)
3. 공유 기능 (5h)
4. 순위 강조 (2h)
```

### Week 5: Low
```bash
1. OAuth 에러 (2h)
```

---

## 패키지 설치 (우선순위)

### 🔴 필수 (Week 1)
```bash
npm install react-markdown remark-gfm remark-breaks
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 🟡 선택 (필요시)
```bash
# Kakao SDK는 HTML script 태그로 로드 (자동)
# Twitter는 window.open (설치 불필요)
```

---

## 기술 스택 체크리스트

### 필수 알아야 할 것
- [ ] Next.js 15 App Router
- [ ] React 19 hooks
- [ ] Tailwind CSS v4 (canonical syntax)
- [ ] Prisma ORM + PostgreSQL
- [ ] NextAuth.js 인증

### 구현하며 배울 것
- [ ] Prisma 마이그레이션
- [ ] File uploads (이미지)
- [ ] 드래그 드롭 (@dnd-kit)
- [ ] 마크다운 렌더링
- [ ] OAuth 에러 처리

---

## 주요 파일 수정 목록

### 새로 생성할 파일 (8개)
```
src/components/ui/MarkdownRenderer.tsx
src/components/ui/CalendarButtons.tsx
src/components/ui/ShareButtons.tsx
src/components/ui/Skeleton.tsx
src/components/ErrorBoundary.tsx
src/app/api/crew/profiles/route.ts
src/app/api/crew/profiles/[id]/route.ts
src/lib/calendar.ts
```

### 수정할 파일 (8개)
```
prisma/schema.prisma
src/app/crew/CrewFinderClient.tsx
src/app/ranking/upload/UploadClient.tsx
src/app/posts/[slug]/page.tsx
src/app/races/[id]/page.tsx
src/app/shoe-tier/ShoeTierClient.tsx
src/app/login/page.tsx
src/components/features/ranking/RankingBoard.tsx
```

---

## 각 항목별 체크리스트

### 1. 크루 찾기 백엔드
- [ ] Prisma 스키마에 CrewProfile 모델 추가
- [ ] `npx prisma migrate dev` 실행
- [ ] GET `/api/crew/profiles` 구현
- [ ] POST `/api/crew/profiles` 구현
- [ ] PATCH `/api/crew/profiles/[id]` 구현
- [ ] DELETE `/api/crew/profiles/[id]` 구현
- [ ] CrewFinderClient에서 API 호출
- [ ] 프로필 생성/수정/삭제 테스트

### 2. 마크다운 렌더링
- [ ] `npm install react-markdown remark-gfm remark-breaks`
- [ ] MarkdownRenderer.tsx 생성
- [ ] posts/[slug]/page.tsx에서 사용
- [ ] 마크다운 포맷 테스트

### 3-4. 랭킹 편집 + 수동 입력
- [ ] EditableData 상태 추가
- [ ] 편집 UI 작성
- [ ] manualMode 상태 추가
- [ ] 수동 입력 폼 UI
- [ ] 두 모드 모두 테스트

### 5. 캘린더
- [ ] calendar.ts 유틸리티 생성
- [ ] CalendarButtons.tsx 생성
- [ ] races/[id]에서 사용
- [ ] Google/iCal 링크 테스트

### 6. 빈 상태
- [ ] RankingBoard 컴포넌트 수정
- [ ] Empty state 디자인
- [ ] CTA 버튼 추가

### 7. localStorage
- [ ] useEffect로 로드 구현
- [ ] useEffect로 저장 구현
- [ ] 새로고침 후 데이터 유지 확인

### 8. 드래그 드롭
- [ ] `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] DndContext 구현
- [ ] Sortable 컴포넌트들
- [ ] TouchSensor 설정
- [ ] 모바일 드래그 테스트

### 9. 스켈레톤
- [ ] Skeleton.tsx 생성
- [ ] 각 페이지별 Skeleton 컴포넌트
- [ ] Suspense로 감싸기

### 10. Error Boundary
- [ ] ErrorBoundary.tsx 생성
- [ ] error.tsx 생성
- [ ] 에러 시나리오 테스트

### 11. 공유
- [ ] ShareButtons.tsx 생성
- [ ] Kakao 초기화
- [ ] 각 플랫폼 테스트

### 12. 순위 강조
- [ ] RankingBoard에서 currentUser 체크
- [ ] 강조 스타일 적용
- [ ] 로그인/로그아웃 테스트

### 13. OAuth 에러
- [ ] searchParams 처리
- [ ] 에러 메시지 표시
- [ ] 각 에러 타입별 테스트

---

## 자주하는 질문

### Q: 어디서 시작해야 하나요?
**A**: IMPROVEMENTS.md 열고 Critical 섹션부터 읽으세요. 크루 찾기와 마크다운은 병렬로 진행 가능합니다.

### Q: 얼마나 걸리나요?
**A**: 
- Critical (2개): 2주
- High (6개): 3주
- Medium (4개): 2주
- Low (1개): 1일
- **총**: ~5주 (풀타임 기준)

### Q: 반드시 순서대로 해야 하나요?
**A**: 아니요. 각 항목은 대부분 독립적입니다. 우선순위에 따라 자유롭게 선택하세요.

### Q: 모바일 테스트는?
**A**: 각 항목마다 테스트 섹션이 있습니다. 특히 드래그(#8)와 터치(#7) 기능은 물리 기기에서 테스트하세요.

### Q: 코드를 어디에서 복사하나요?
**A**: IMPROVEMENTS.md의 각 Step 섹션에 전체 코드가 있습니다. 복사 후 자신의 파일에 맞게 조정하세요.

---

## 문제 해결

### Prisma 마이그레이션 실패
```bash
npx prisma db push --force-reset
npx prisma generate
```

### 타입 에러
```bash
npx tsc --noEmit
```

### 패키지 충돌
```bash
npm ls
npm install --legacy-peer-deps
```

### 드래그 안 됨 (모바일)
- TouchSensor 설정 확인
- activationConstraint 값 조정 (delay: 250ms)

---

## 추가 리소스

### 공식 문서
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Next.js 15](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [dnd-kit](https://docs.dndkit.com)

### 프로젝트 문서
- 상세 가이드: `IMPROVEMENTS.md`
- 개요: `IMPROVEMENTS_SUMMARY.md`
- 프로젝트 규칙: `.claude/CLAUDE.md`

---

## 체크인 포인트

매 2주마다 확인하세요:

### Week 2 체크
- [ ] Prisma 마이그레이션 완료
- [ ] 크루 API 작동
- [ ] 마크다운 렌더링 작동

### Week 4 체크
- [ ] 랭킹 편집/수동 입력 작동
- [ ] 드래그 드롭 기본 기능 작동
- [ ] localStorage 저장됨

### Week 5 체크
- [ ] 모든 Medium 항목 완료
- [ ] 성능 테스트 (Lighthouse >90)
- [ ] 크로스 브라우저 테스트

---

**시작하려면**: `IMPROVEMENTS.md` 파일을 열고 첫 번째 Critical 항목부터 시작하세요!

행운을 빕니다! 🏃‍♂️✨
