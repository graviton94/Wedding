import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // 방명록 저장소: Supabase (구글 미사용). anon 공개키는 클라이언트 노출이 정상.
    const SUPABASE_URL = guestbook.supabaseUrl;
    const SUPABASE_ANON_KEY = guestbook.supabaseAnonKey;
    const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
    const REST_ENDPOINT = `${SUPABASE_URL}/rest/v1/guestbook`;
    const authHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const fetchMessages = async () => {
        if (!isConfigured) {
            setIsFetching(false);
            return;
        }
        try {
            const url = `${REST_ENDPOINT}?select=name,message,created_at&order=created_at.desc`;
            const response = await fetch(url, { headers: authHeaders });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const rows = await response.json();

            const formattedMessages = rows.map((row) => ({
                name: row.name || '익명',
                text: row.message || '',
                date: (row.created_at || '').split('T')[0],
            }));

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

        if (!isConfigured) {
            alert("방명록 저장소(Supabase) 설정이 아직 완료되지 않았습니다.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(REST_ENDPOINT, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify({ name: name.trim(), message: text.trim() }),
            });

            // no-cors와 달리 실제 성공/실패를 확인할 수 있다.
            if (!response.ok) {
                const detail = await response.text();
                throw new Error(`HTTP ${response.status} ${detail}`);
            }

            setName('');
            setText('');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            await fetchMessages();
        } catch (error) {
            console.error("Error submitting message:", error);
            alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-10 bg-theme-bg overflow-hidden">
            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm whitespace-nowrap border border-white/20"
                        style={{ backgroundColor: 'rgb(var(--color-brand) / 0.8)' }}
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
                    <h2 className="text-2xl text-theme-primary mb-3">
                        {guestbook.title}
                    </h2>
                    <p className="text-white/80 text-sm">
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
                            maxLength={30}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all bg-white placeholder:text-gray-600 text-black"
                            required
                        />
                        <textarea
                            placeholder="축하 메시지를 남겨주세요"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={300}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all bg-white h-24 resize-none placeholder:text-gray-600 text-black"
                            required
                        />
                        <Button
                            variant="primary"
                            className="w-full py-4 rounded-xl font-bold !bg-brand hover:!bg-brand-hover"
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
        </section>
    );
};

export default Guestbook;
