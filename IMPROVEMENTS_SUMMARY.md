# 매달 (Maedal) 개선 문서 요약

## 문서 정보
- **파일**: `IMPROVEMENTS.md`
- **총 라인**: 3,041줄
- **작성일**: 2025-02-04
- **대상 프로젝트**: Runners High (매달)

## 개선 항목 분류

### Critical Priority (2개)
1. **크루 찾기 - 백엔드 구현** (`/crew`)
   - Prisma 스키마 추가
   - API 라우트 구현 (CRUD)
   - 프론트엔드 데이터 연동
   
2. **포스트 마크다운 렌더링** (`/posts/[id]`)
   - `react-markdown` + `remark-gfm` 설치
   - MarkdownRenderer 컴포넌트 생성
   - 포스트 상세 페이지 수정

### High Priority (6개)
3. **랭킹 업로드 데이터 편집** (`/ranking/upload`)
   - 추출된 데이터 편집 가능하도록 UI 개선
   - 거리, 페이스, 시간, 칼로리 필드 수정

4. **랭킹 업로드 수동 입력** (`/ranking/upload`)
   - AI 분석 실패 시 대안 제공
   - 수동 입력 폼 UI

5. **대회 상세 캘린더 추가** (`/races/[id]`)
   - Google 캘린더 연동
   - iCal 파일 다운로드

6. **랭킹 빈 상태 메시지** (`/ranking`)
   - Empty state UI 추가
   - 기록 없을 때 친절한 안내

7. **러닝화 티어 localStorage** (`/shoe-tier`)
   - 브라우저 저장소 활용
   - 새로고침 후 데이터 유지

8. **러닝화 티어 터치 드래그** (`/shoe-tier`)
   - `@dnd-kit` 라이브러리 도입
   - 모바일 터치 드래그 지원

### Medium Priority (4개)
9. **전체 페이지 로딩 스켈레톤**
   - Skeleton UI 컴포넌트
   - Suspense 통합

10. **Error Boundary 추가**
    - 에러 캡처 및 표시
    - 사용자 친화적 에러 화면

11. **공유 기능** (`/races/[id]`, `/posts/[id]`)
    - 카카오톡, 카카오스토리, Twitter 공유
    - 링크 복사 기능

12. **내 순위 하이라이트** (`/ranking`)
    - 현재 사용자 순위 강조
    - 시각적 차이 표현

### Low Priority (1개)
13. **OAuth 에러 처리** (`/login`)
    - OAuth 에러 메시지 표시
    - 사용자 가이드 제공

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프론트엔드** | Next.js 15, React 19, TypeScript |
| **스타일** | Tailwind CSS v4 (Neobrutalism) |
| **데이터** | Prisma ORM, PostgreSQL |
| **인증** | NextAuth.js |
| **마크다운** | react-markdown, remark-gfm |
| **드래그** | @dnd-kit (core, sortable) |
| **공유** | Kakao SDK, Twitter API |

---

## 구현 우선순위 가이드

### 첫 주 (Critical)
```
Week 1: 크루 찾기 백엔드 + 마크다운 렌더링
- 약 16-20시간
- 두 개 항목은 독립적이므로 병렬 진행 가능
```

### 둘째 주 (High Priority - Part 1)
```
Week 2: 랭킹 업로드 개선 (편집 + 수동 입력)
- 약 12-16시간
- 같은 페이지 내 기능이므로 연속 작업 추천
```

### 셋째 주 (High Priority - Part 2)
```
Week 3: 대회/러닝화 개선
- 약 16-20시간
- 캘린더(4시간) + 빈 상태(2시간) + localStorage(3시간) + 드래그(8시간)
```

### 넷째 주 (Medium Priority)
```
Week 4: UI/UX 개선
- 약 14-18시간
- 스켈레톤(4시간) + Error(3시간) + 공유(5시간) + 하이라이트(2시간)
```

### 다섯째 주 (Low Priority)
```
Week 5: 마이너 개선
- 약 2-3시간
- OAuth 에러 처리만
```

---

## 파일 구조

```
/f/runners_high/runner/
├── IMPROVEMENTS.md                    # 상세 개선 문서
├── IMPROVEMENTS_SUMMARY.md            # 이 파일
├── prisma/
│   └── schema.prisma                  # CrewProfile 모델 추가
├── src/
│   ├── app/
│   │   ├── api/crew/profiles/         # 새 API 라우트
│   │   ├── api/crew/profiles/[id]/    # 새 API 라우트
│   │   ├── crew/CrewFinderClient.tsx  # 수정
│   │   ├── ranking/upload/UploadClient.tsx  # 수정
│   │   ├── posts/[slug]/page.tsx      # 수정 (마크다운)
│   │   ├── races/[id]/page.tsx        # 수정 (캘린더)
│   │   ├── shoe-tier/ShoeTierClient.tsx    # 수정
│   │   └── login/page.tsx             # 수정 (에러)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── MarkdownRenderer.tsx   # 새로 생성
│   │   │   ├── CalendarButtons.tsx    # 새로 생성
│   │   │   ├── ShareButtons.tsx       # 새로 생성
│   │   │   └── Skeleton.tsx           # 새로 생성
│   │   ├── features/
│   │   │   └── ranking/RankingBoard.tsx    # 수정
│   │   └── ErrorBoundary.tsx          # 새로 생성
│   └── lib/
│       └── calendar.ts                # 새로 생성
└── package.json                       # 패키지 추가 필요
```

---

## 패키지 설치 목록

### 즉시 필요
```bash
npm install react-markdown remark-gfm remark-breaks
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 필요시 (공유 기능)
```bash
# Kakao SDK는 HTML에 script 태그로 로드
# Twitter API는 window.open 사용으로 별도 설치 불필요
```

---

## 테스트 전략

### 단위 테스트
- CrewProfile API 엔드포인트
- 마크다운 렌더링 컴포넌트
- Calendar 유틸리티 함수

### 통합 테스트
- 크루 찾기 전체 플로우
- 랭킹 업로드 데이터 편집
- 드래그 드롭 기능

### E2E 테스트
- 사용자 가입 → 크루 등록 → 순위 확인
- 기록 업로드 → 편집 → 제출
- 모바일 터치 드래그

### 크로스 브라우저
- Desktop: Chrome, Safari, Firefox
- Mobile: Chrome (Android), Safari (iOS)

---

## 성능 고려사항

### 번들 크기
- `react-markdown`: ~20KB
- `@dnd-kit` (all): ~30KB
- 총 추가: ~50KB (gzip: ~15KB)

### 렌더링 성능
- 마크다운: 대용량 문서(>10,000줄) 주의
- 드래그: 100+ 항목 시 성능 저하 가능
- 랭킹: 1,000+ 기록 시 pagination 고려

### 메모리 관리
- localStorage: 개당 ~5-10KB (10개 프로필 = ~100KB)
- 이미지 캐싱: SharedArrayBuffer 고려

---

## 이전 버전 호환성

### 마이그레이션 필요
- Prisma: `npx prisma migrate dev --name add_crew_profiles`
- 데이터베이스: 새 테이블 자동 생성

### 하위 호환성
- 모든 변경사항은 기존 기능과 독립적
- Breaking changes 없음

---

## 문서 사용법

1. **전체 읽기**: IMPROVEMENTS.md 처음부터 끝까지
2. **특정 항목**: 목차에서 찾아 해당 섹션으로 이동
3. **코드 복사**: 각 단계의 코드 블록을 복사 붙여넣기
4. **체크리스트**: 각 항목의 구현 체크리스트 활용
5. **기술 노트**: 마지막 섹션에서 프로젝트 특성 확인

---

## 지원 및 참고

### 관련 문서
- 프로젝트 CLAUDE.md: `/f/runners_high/runner/.claude/CLAUDE.md`
- Tailwind v4: https://tailwindcss.com/docs (canonical syntax)
- Next.js 15: https://nextjs.org/docs (App Router)
- Prisma: https://www.prisma.io/docs

### 문제 해결
1. 패키지 충돌: `npm ls` 확인
2. Prisma 마이그레이션 실패: `npx prisma db push --force-reset`
3. 빌드 에러: TypeScript 타입 확인 (`npx tsc --noEmit`)

---

## 업데이트 히스토리

| 날짜 | 버전 | 변경사항 |
|------|------|---------|
| 2025-02-04 | 1.0 | 초기 문서 작성 |

---

**다음 단계**: IMPROVEMENTS.md를 열어서 Critical 항목부터 시작하세요!
