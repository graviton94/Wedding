import React from 'react';
import { motion } from 'framer-motion';
import content from '../../data/content.json';
import backup from '../../data/guestbook.json';

// 방명록은 저장소에 커밋된 백업(src/data/guestbook.json)만 읽는다.
// 백업 갱신: npm run guestbook:backup (또는 Actions → Backup Guestbook)
const messages = backup.map((row) => ({
    name: row.name || '익명',
    text: row.message || '',
    date: (row.created_at || '').split('T')[0],
}));

const Guestbook = () => {
    const { guestbook } = content;

    return (
        <section className="py-10 bg-theme-bg overflow-hidden">
            <div className="max-w-[430px] mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-4"
                >
                    <h2 className="text-2xl text-theme-primary mb-2">
                        {guestbook.title}
                    </h2>
                    <p className="text-fg-muted text-xs">
                        {guestbook.subtitle}
                    </p>
                </motion.div>
            </div>

            {/* 메시지 가로 흐르기 영역 */}
            <div className="relative w-full overflow-hidden py-4">
                {messages.length === 0 ? (
                    <div className="text-center py-10 text-fg-subtle px-4">아직 남겨진 축하 메시지가 없습니다.</div>
                ) : (
                    /* ✅ 메시지가 오른쪽 → 왼쪽으로 흐르는 무한 마키(Marquee). 1개만 있어도 흐름 */
                    <div className="flex whitespace-nowrap">
                        <motion.div
                            className="flex gap-4 px-4"
                            animate={{
                                x: ["0%", "-50%"]
                            }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: Math.max(messages.length * 8, 20),
                                    ease: "linear",
                                },
                            }}
                            style={{ width: 'fit-content' }}
                        >
                            {[...messages, ...messages].map((msg, idx) => (
                                <div
                                    key={idx}
                                    className="inline-block bg-glass backdrop-blur-sm border border-white/10 p-5 rounded-2xl w-[280px] shrink-0 text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-theme-primary text-sm">{msg.name}</span>
                                        <span className="text-[10px] text-fg-subtle">{msg.date.split(' ')[0]}</span>
                                    </div>
                                    <p className="text-fg text-[13px] leading-relaxed whitespace-pre-wrap line-clamp-3">
                                        {msg.text}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Guestbook;
