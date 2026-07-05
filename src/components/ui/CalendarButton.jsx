import Button from './Button';
import content from '../../data/content.json';

// 플랫폼 감지형 "일정 추가":
//  - iOS/맥: .ics 파일(애플 캘린더 추가 화면)
//  - 그 외(안드로이드/삼성 등): Google 캘린더 추가 페이지(대부분 삼성 캘린더와 동기화)
const CalendarButton = ({ className = '' }) => {
  const { hero, location } = content;

  const ymd = hero.date.replace(/\./g, ''); // 20260920
  const [h, m] = hero.time.split(':').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  const start = `${ymd}T${pad(h)}${pad(m)}00`;
  const end = `${ymd}T${pad((h + 2) % 24)}${pad(m)}00`; // 2시간 예상

  const title = `${hero.groomName} ♥ ${hero.brideName} 결혼식`;
  const place = [location.venueName, location.floor, location.address].filter(Boolean).join(' ');
  const details = '모바일 청첩장에서 초대합니다.';

  const isApple = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const addToCalendar = () => {
    if (isApple()) {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//KO',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${start}@wedding`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `LOCATION:${place}`,
        `DESCRIPTION:${details}`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${title}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const g =
        'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${start}/${end}` +
        '&ctz=Asia/Seoul' +
        `&location=${encodeURIComponent(place)}` +
        `&details=${encodeURIComponent(details)}`;
      window.open(g, '_blank', 'noopener');
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={addToCalendar}
      className={`w-full ${className}`}
    >
      📅 캘린더에 일정 추가
    </Button>
  );
};

export default CalendarButton;
