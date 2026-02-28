# Wedding Invitation

결혼식 초대장 웹사이트 v.3

## 🆕 Google Forms ↔ 방명록 연동

Google Form 제출 시 자동으로 방명록 스프레드시트에 업데이트되도록 설정할 수 있습니다.

자세한 설정 방법은 [`google-apps-script/`](./google-apps-script/) 폴더를 참고하세요:
- 📖 [한국어 가이드](./google-apps-script/README.md)
- 📖 [English Guide](./google-apps-script/README_EN.md)
- ✅ [빠른 설정 체크리스트](./google-apps-script/SETUP_CHECKLIST.md)

## 배포 방법

1. GitHub에서 새 저장소 생성 (예: `wedding-invitation`)
2. 아래 명령어로 코드 푸시:

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

3. GitHub Pages 배포:

```bash
npm run deploy
```

4. GitHub 저장소 Settings > Pages에서 Source를 `gh-pages` 브랜치로 설정

## 로컬 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```
