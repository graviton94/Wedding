import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import content from '../../data/content.json';

const Share = () => {
  // gallery 데이터도 가져옵니다.
  const { hero, gallery, share } = content;

  useEffect(() => {
    // 1. 카카오 SDK 초기화
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY;

    if (!KAKAO_KEY) {
      console.error('Kakao API Key is missing in .env file');
      return;
    }

    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(KAKAO_KEY);
          console.log('Kakao SDK Initialized successfully');
        } catch (e) {
          console.error('Kakao SDK Init Error:', e);
        }
      }
    } else {
      console.error('Kakao SDK script not loaded');
    }
  }, []);

  const handleKakaoShare = () => {
    if (!window.Kakao) {
      alert('카카오 SDK 스크립트가 로드되지 않았습니다.');
      return;
    }
    if (!window.Kakao.isInitialized()) {
      alert('카카오 SDK 초기화에 실패했습니다. 다음을 확인해주세요:\n1. .env 파일의 VITE_KAKAO_API_KEY가 정확한지\n2. 카카오 개발자 콘솔에 현재 도메인이 등록되어 있는지');
      return;
    }

    // 2. 카카오톡 공유 메시지 보내기
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        // ✅ 요청하신 문구 적용
        title: "최준영🩷민수영 결혼합니다!",
        description: "2026.09.20(일) 12:30 더화이트베일 홀",
        // ✅ 갤러리 첫 번째 사진 자동 연동
        imageUrl: gallery.images[0].url,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '모바일 청첩장 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        {
          title: '위치 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('청첩장 주소가 복사되었습니다!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('주소 복사에 실패했습니다.');
    }
  };

  return (
    <section className="py-20 px-4 bg-theme-bg text-center">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-serif text-theme-primary mb-4">
            {share.title}
          </h2>
          <p className="text-white font-light text-lg font-['Noto_Sans_KR'] mb-10">
            {share.subtitle}
          </p>

          <div className="space-y-4">
            {/* 카카오톡 공유 버튼 */}
            <Button
              onClick={handleKakaoShare}
              className="w-full bg-[#FAE100] text-[#371D1E] border-[#FAE100] hover:bg-[#F9E000] font-bold flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.76C2 13.62 3.93 16.14 6.86 17.54C6.67 18.23 6.27 19.69 6.22 19.89C6.16 20.15 6.44 20.3 6.64 20.16C6.73 20.1 9.38 18.28 10.63 17.41C11.08 17.46 11.53 17.49 12 17.49C17.52 17.49 22 14.01 22 9.73C22 5.45 17.52 3 12 3Z" />
              </svg>
              카카오톡으로 공유하기
            </Button>

            {/* 링크 복사 버튼 */}
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full border-theme-primary/30 text-theme-primary hover:bg-white/5"
            >
              링크 주소 복사하기
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Share;
