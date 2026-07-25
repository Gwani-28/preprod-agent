#!/bin/zsh

cd "$(dirname "$0")" || exit 1

clear
echo "프리프로덕션 에이전트를 시작합니다."
echo ""

if ! command -v npm >/dev/null 2>&1; then
  echo "npm을 찾을 수 없습니다. Node.js 설치를 확인해주세요."
  echo ""
  read "reply?Enter를 누르면 창을 닫습니다."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "node_modules가 없어 의존성을 먼저 설치합니다."
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "의존성 설치에 실패했습니다."
    read "reply?Enter를 누르면 창을 닫습니다."
    exit 1
  fi
fi

echo "브라우저가 자동으로 열립니다."
echo "모바일에서는 아래 Network 주소를 같은 Wi-Fi에서 열면 됩니다."
echo "서버를 끄려면 이 창에서 Control-C를 누르세요."
echo ""

npm run dev -- --host 0.0.0.0 --open

echo ""
echo "서버가 종료되었습니다."
read "reply?Enter를 누르면 창을 닫습니다."
