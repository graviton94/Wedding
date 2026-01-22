import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import content from '../../data/content.json';

const Share = () => {
  // gallery 데이터도 가져옵니다.
  const { gallery, share } = content;

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
          <h2 className="text-2xl text-theme-primary mb-3">
            {share.title}
          </h2>
          <p className="text-white font-light text-base mb-8">
            {share.subtitle}
          </p>

          <div>
            {/* 링크 복사 버튼만 유지 */}
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full py-3 text-sm !bg-gray-200 !text-black !border-gray-300 hover:!bg-gray-300"
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
