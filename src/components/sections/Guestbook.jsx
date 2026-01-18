import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import content from '../../data/content.json';
import Button from '../ui/Button';

const Guestbook = () => {
    const { guestbook } = content;
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhgQA0EVN5nYpKdNmGax1cjd1WzNz6lHV4jASBOvLChGPghibhgipegRbesJBYxnFtEw/exec";

    const fetchMessages = async () => {
        try {
            const SPREADSHEET_ID = '1-xtZaFSMU8ecMEzsCiWyplELJS9XRpET3SB_cUje1T4';
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
            const response = await fetch(url);
            const dataText = await response.text();

            const jsonString = dataText.substring(dataText.indexOf('{'), dataText.lastIndexOf('}') + 1);
            const jsonData = JSON.parse(jsonString);

            const rows = jsonData.table.rows;
            // ✅ parsedNumHeaders가 1이면 첫 번째 줄부터 이미 데이터임
            // 만약 첫 줄이 From, Ment 같은 글자면 제외하고 아니면 포함하도록 유연하게 수정
            const firstRowIsHeader = rows[0]?.c[0]?.v === 'From' || rows[0]?.c[0]?.v === '성함';
            const dataRows = firstRowIsHeader ? rows.slice(1) : rows;

            const formattedMessages = dataRows.map(row => ({
                name: row.c[0]?.f || row.c[0]?.v || '익명',
                text: row.c[1]?.f || row.c[1]?.v || '',
                date: row.c[2]?.f || row.c[2]?.v || ''
            })).reverse();

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;

        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('name', name);
            formData.append('text', text);

            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            setName('');
            setText('');

            // Show success toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            // 전송 후 데이터가 바로 반영되지 않을 수 있으므로 짧은 간격으로 재시도
            setTimeout(async () => {
                await fetchMessages();
                setIsLoading(false);
            }, 1500);

        } catch (error) {
            console.error("Error submitting message:", error);
            alert("전송 중 오류가 발생했습니다.");
            setIsLoading(false);
        }
    };

    // 가로 흐르기 구성을 위한 메시지 복제 (무한 루프 효과)
    const marqueeMessages = [...messages, ...messages];

    return (
        <section className="py-20 bg-theme-bg overflow-hidden">
            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-theme-primary text-white px-6 py-4 rounded-full shadow-2xl font-bold"
                    >
                        ✓ 축하 메시지가 등록되었습니다!
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[430px] mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl md:text-3xl font-serif text-theme-primary mb-4">
                        {guestbook.title}
                    </h2>
                    <p className="text-white/80 text-base font-['Noto_Sans_KR']">
                        {guestbook.subtitle}
                    </p>
                </motion.div>

                {/* 입력 폼 */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-12"
                >
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <input
                            type="text"
                            placeholder="성함"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all bg-white placeholder:text-gray-600 text-black"
                            required
                        />
                        <textarea
                            placeholder="축하 메시지를 남겨주세요"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all bg-white h-24 resize-none placeholder:text-gray-600 text-black"
                            required
                        />
                        <Button
                            variant="primary"
                            className="w-full py-4 rounded-xl font-bold"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? '전송 중...' : '축하 한마디 남기기'}
                        </Button>
                    </form>
                </motion.div>
            </div>

            {/* 메시지 가로 흐르기 영역 */}
            <div className="relative w-full overflow-hidden py-4">
                {isFetching ? (
                    <div className="text-center py-10 text-white/50">불러오는 중...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-white/50 px-4">첫 번째 축하의 주인공이 되어주세요!</div>
                ) : messages.length <= 2 ? (
                    /* ✅ 메시지가 적을 때는 중복 없이 중앙 정렬로 표시 */
                    <div className="flex justify-center gap-4 px-4 overflow-x-auto pb-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl w-[280px] shrink-0 text-left"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-theme-primary text-sm">{msg.name}</span>
                                    <span className="text-[10px] text-white/40">{msg.date.split(' ')[0]}</span>
                                </div>
                                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                                    {msg.text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ✅ 메시지가 충분할 때만 무한 스크롤 마키(Marquee) 적용 */
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
                                    className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl w-[280px] shrink-0 text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-theme-primary text-sm">{msg.name}</span>
                                        <span className="text-[10px] text-white/40">{msg.date.split(' ')[0]}</span>
                                    </div>
                                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                                        {msg.text}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>

            {/* 스크롤 스타일 가이드 (CSS) */}
            <style jsx>{`
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
};

export default Guestbook;
