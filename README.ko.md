# 프리프로덕션 에이전트 · Preproduction Agent

광고·영화·뮤직비디오의 **프리프로덕션**을 정리하고 **PPM(Pre-Production Meeting) Book**을
만드는 로컬 우선 웹앱. 계정·서버 없이 브라우저 안에서 전부 돌아가고, 데이터는 기기 밖으로
나가지 않습니다.

[![CI](https://github.com/Gwani-28/preprod-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Gwani-28/preprod-agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![React](https://img.shields.io/badge/React-Vite-61DAFB.svg)

**▶ 라이브 데모: https://gwani-28.github.io/preprod-agent/**

[English](README.md) | **한국어**

## 무엇을 하나

단편영화·광고·뮤직비디오의 프리프로덕션은 기획서·체크리스트·예산·스태프 리스트·촬영 계획·
레퍼런스 이미지 같은 반쯤 완성된 문서 여러 개를 굴리다가, 결국 회의용 자료로 묶는 일입니다.
프리프로덕션 에이전트는 이걸 한곳에 모으고, 촬영 전에 빠진 항목을 짚어주고, 깔끔한 PPM Book으로
내보냅니다.

### 기능

- **대시보드** — 프로젝트 개요(포맷·장르·러닝타임·촬영일·규모)
- **체크리스트** — 카테고리별 프리프로덕션 할 일(상태·메모)
- **예산** — 항목별 예산 관리
- **크루** — 출연/스태프 명단(역할·연락처)
- **촬영 계획** — 일자별 촬영 스케줄 / 콜시트형 계획
- **문서** — 자유 메모·문서 기록
- **비주얼 보드** — 레퍼런스 이미지·무드
- **누락 체크** — 아직 안 채운 항목을 자동으로 드러냄
- **포맷 프리셋** — 클릭 한 번으로 포맷을 정하고 **단편영화 / 광고 / 뮤직비디오**에 맞춘
  체크리스트를 채움 (광고는 클라이언트 승인·매체/2차 사용, MV는 아티스트·플레이백 등 포맷별 우선순위 반영)
- **PPM 미리보기·내보내기** — 전부 묶어 PPM Book으로 만들고 HTML / Markdown / PDF로 내보내기
- **프로젝트 백업** — 프로젝트 전체를 JSON 파일로 내보내고 다시 불러오기(브라우저·기기 간 이동)
- **로컬 우선** — 모든 데이터는 브라우저(`localStorage`)에 저장. 오프라인·모바일에서도 동작
  (개발 서버의 Network 주소를 같은 Wi-Fi에서 열면 됨)

## 실행

호스팅된 **[라이브 데모](https://gwani-28.github.io/preprod-agent/)**를 쓰거나, 로컬에서:

```bash
git clone https://github.com/Gwani-28/preprod-agent.git
cd preprod-agent
npm install
npm run dev
```

macOS에서는 `프리프로덕션 에이전트 실행.command`를 더블클릭하면 의존성을 설치(필요 시)하고
브라우저로 앱을 엽니다.

## 기술

- **React + TypeScript + Vite**
- **Tailwind CSS**
- **백엔드 없음** — 상태는 `localStorage`에, 앱 전체가 정적 파일
- 런타임 의존성은 `react` / `react-dom`뿐

## 빌드

```bash
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 프로덕션 빌드 미리보기
```

## 동작 원리

전부 클라이언트 사이드입니다. 로그인도 네트워크 호출도 없어 프로젝트 데이터가 브라우저 밖으로
나가지 않습니다 — 미공개 작품에도 안전하고, 정적 파일이라 셀프 호스팅도 간단합니다. 내보내기는
현재 상태에서 브라우저가 즉석 생성합니다.

## 로드맵

[ROADMAP.md](ROADMAP.md) 참고 — 계획: 내보내기 레이아웃 개선, 일자별 콜시트 내보내기,
협업 공유, 영어 UI 다국어화.

## 커뮤니티

- [기여 가이드](CONTRIBUTING.md) · [행동 강령](CODE_OF_CONDUCT.md) · [보안 정책](SECURITY.md)
- [변경이력](CHANGELOG.md)
- 아이디어·버그 → [이슈 열기](https://github.com/Gwani-28/preprod-agent/issues/new/choose)

## 라이선스

[MIT](LICENSE) © 2026 Gwani-28
