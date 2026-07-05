import { motion } from 'framer-motion';
import content from '../../data/content.json';

// 예식 달 미니 달력 — RSVP의 흰 카드 안에 넣는 축소판.
// 카드가 항상 흰 배경이라(테마 무관) 텍스트는 블랙 계열 톤을 쓴다.
const Calendar = () => {
  const isoDate = content.hero.date.replace(/\./g, '-'); // "2026-09-20"
  const target = new Date(`${isoDate}T00:00:00`);
  const year = target.getFullYear();
  const month = target.getMonth();
  const weddingDay = target.getDate();

  const monthName = target.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const weekdayKo = target.toLocaleDateString('ko-KR', { weekday: 'long' });
  const [hh, mm] = content.hero.time.split(':').map(Number);
  const meridiem = hh < 12 ? '오전' : hh === 12 ? '낮' : '오후';
  const hour12 = hh > 12 ? hh - 12 : hh;
  const timeKo = `${meridiem} ${hour12}시${mm ? ` ${mm}분` : ''}`;

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h3 className="font-display text-base tracking-[0.3em] pl-[0.3em] text-brand">
        {monthName}
      </h3>
      <p className="mt-0.5 text-[10px] tracking-[0.25em] text-black/40">{year}</p>

      <div className="mt-4 grid grid-cols-7 gap-y-2 text-[11px] max-w-[230px] mx-auto">
        {weekdays.map((w, i) => (
          <div key={w} className={`text-[9px] tracking-wider ${i === 0 ? 'text-brand/70' : 'text-black/40'}`}>
            {w}
          </div>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <div key={`e${i}`} />
          ) : d === weddingDay ? (
            <div key={d} className="relative flex items-center justify-center h-6">
              {/* 예식일 하이라이트 — 스크롤 진입 시 링이 차오름 */}
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
                className="absolute w-6 h-6 rounded-full bg-brand shadow-[0_2px_8px_rgba(185,124,94,0.4)]"
              />
              <span className="relative text-white font-medium">{d}</span>
            </div>
          ) : (
            <div key={d} className={`flex items-center justify-center h-6 ${i % 7 === 0 ? 'text-brand/55' : 'text-black/60'}`}>
              {d}
            </div>
          )
        )}
      </div>

      <p className="mt-4 text-[11px] tracking-wide text-black/55">
        {year}년 {month + 1}월 {weddingDay}일 {weekdayKo} {timeKo}
      </p>
    </motion.div>
  );
};

export default Calendar;
