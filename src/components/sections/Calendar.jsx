import { motion } from 'framer-motion';
import content from '../../data/content.json';

// 예식 달 미니 달력 — content.json의 날짜를 단일 소스로 사용, 예식일을 브랜드 링으로 하이라이트
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
    <section className="py-10 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-2xl tracking-[0.3em] pl-[0.3em] text-theme-primary">
            {monthName}
          </h2>
          <p className="mt-1 text-xs tracking-[0.25em] text-fg-subtle">{year}</p>

          <div className="mt-7 grid grid-cols-7 gap-y-3 text-[13px] max-w-[300px] mx-auto">
            {weekdays.map((w, i) => (
              <div key={w} className={`text-[11px] tracking-wider ${i === 0 ? 'text-brand/70' : 'text-fg-subtle'}`}>
                {w}
              </div>
            ))}
            {cells.map((d, i) =>
              d === null ? (
                <div key={`e${i}`} />
              ) : d === weddingDay ? (
                <div key={d} className="relative flex items-center justify-center h-8">
                  {/* 예식일 하이라이트 — 스크롤 진입 시 링이 차오름 */}
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
                    className="absolute w-8 h-8 rounded-full bg-brand shadow-[0_2px_10px_rgba(185,124,94,0.4)]"
                  />
                  <span className="relative text-white font-medium">{d}</span>
                </div>
              ) : (
                <div key={d} className={`flex items-center justify-center h-8 ${i % 7 === 0 ? 'text-brand/60' : 'text-fg-muted'}`}>
                  {d}
                </div>
              )
            )}
          </div>

          <p className="mt-7 text-[13px] tracking-wide text-fg-muted">
            {year}년 {month + 1}월 {weddingDay}일 {weekdayKo} {timeKo}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Calendar;
