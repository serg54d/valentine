"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
    motion,
    AnimatePresence,
    useInView,
} from "framer-motion";
import styles from "./page.module.css";

/* ═══════════════════════════════════════════════
   SCROLL QUEST SCENES DATA
   (playful → warm → romantic)
   ═══════════════════════════════════════════════ */
const SCENES = [
    {
        id: "intro",
        text: "Привет, любимая 👋",
        sub: "тут кое-что для тебя",
        hint: "скролль вниз ↓",
        bg: "var(--cream)",
        color: "var(--text-primary)",
        accent: "var(--rose-mid)",
    },
    {
        id: "tease1",
        text: "Нет-нет, не так быстро",
        sub: " 😏",
        bg: "var(--rose-whisper)",
        color: "var(--text-primary)",
        accent: "var(--rose-soft)",
    },
    {
        id: "tease2",
        text: "Ещё чуть-чуть...",
        sub: " 🤭",
        bg: "var(--cream)",
        color: "var(--text-secondary)",
        accent: "var(--gold-light)",
    },
    {
        id: "warm1",
        text: "Знаешь, что я понял?",
        sub: "что самые прекрасные моменты — это когда ты рядом",
        bg: "var(--rose-whisper)",
        color: "var(--rose-deep)",
        accent: "var(--rose-light)",
    },
    {
        id: "warm2",
        text: "С тобой даже тишина звучит красиво",
        sub: "♡",
        bg: "linear-gradient(180deg, var(--rose-whisper), var(--cream))",
        color: "var(--rose-deep)",
        accent: "var(--rose-mid)",
    },
    {
        id: "prefinal",
        text: "Ладно, хватит интриг",
        sub: "...",
        bg: "var(--cream)",
        color: "var(--text-primary)",
        accent: "var(--gold)",
    },
];

/* ═══════════════════════════════════════════════
   SPARKLE CANVAS (ambient floating light)
   ═══════════════════════════════════════════════ */
function SparkleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        const dots: { x: number; y: number; vx: number; vy: number; r: number; a: number; d: number; c: string }[] = [];
        const palette = ["#f2a5b8", "#e07a94", "#fad4de", "#e0be5c", "#f5e2a8"];

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (Math.random() < 0.15 && dots.length < 60) {
                dots.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: Math.random() * 2 + 0.5,
                    a: Math.random() * 0.4 + 0.1,
                    d: 0.002 + Math.random() * 0.003,
                    c: palette[Math.floor(Math.random() * palette.length)],
                });
            }
            for (let i = dots.length - 1; i >= 0; i--) {
                const p = dots[i];
                p.x += p.vx; p.y += p.vy; p.a -= p.d;
                if (p.a <= 0) { dots.splice(i, 1); continue; }
                ctx.save();
                ctx.globalAlpha = p.a;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.c;
                ctx.shadowColor = p.c;
                ctx.shadowBlur = p.r * 4;
                ctx.fill();
                ctx.restore();
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={canvasRef} className={styles.canvas} />;
}

/* ═══════════════════════════════════════════════
   FLOATING HEARTS (ambient background)
   ═══════════════════════════════════════════════ */
function FloatingHearts() {
    const [hearts, setHearts] = useState<
        { id: number; x: number; size: number; delay: number; dur: number; drift: number; opacity: number }[]
    >([]);

    useEffect(() => {
        setHearts(
            Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                size: 8 + Math.random() * 14,
                delay: Math.random() * 14,
                dur: 12 + Math.random() * 10,
                drift: (Math.random() - 0.5) * 50,
                opacity: 0.06 + Math.random() * 0.12,
            }))
        );
    }, []);

    return (
        <>
            {hearts.map((h) => (
                <div
                    key={h.id}
                    className={styles.floatingHeart}
                    style={{
                        left: `${h.x}%`,
                        fontSize: h.size,
                        animationDelay: `${h.delay}s`,
                        animationDuration: `${h.dur}s`,
                        opacity: h.opacity,
                        ["--drift" as string]: `${h.drift}px`,
                    }}
                >
                    ♥
                </div>
            ))}
        </>
    );
}

/* ═══════════════════════════════════════════════
   SCROLL SCENE (single full-screen section)
   ═══════════════════════════════════════════════ */
function ScrollScene({ scene, index }: { scene: (typeof SCENES)[number]; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.5, once: false });

    // Alternate text directions for visual interest
    const fromX = index % 2 === 0 ? -60 : 60;

    return (
        <section
            ref={ref}
            className={styles.scene}
            style={{ background: scene.bg }}
        >
            <motion.div
                className={styles.sceneContent}
                initial={{ opacity: 0, x: fromX, filter: "blur(8px)" }}
                animate={
                    isInView
                        ? { opacity: 1, x: 0, filter: "blur(0px)" }
                        : { opacity: 0, x: fromX, filter: "blur(8px)" }
                }
                transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                <motion.h2
                    className={styles.sceneText}
                    style={{ color: scene.color }}
                    initial={{ y: 30 }}
                    animate={isInView ? { y: 0 } : { y: 30 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    {scene.text}
                </motion.h2>

                <motion.p
                    className={styles.sceneSub}
                    style={{ color: scene.accent }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                    {scene.sub}
                </motion.p>

                {scene.hint && (
                    <motion.p
                        className={styles.sceneHint}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1, y: [0, -6, 0] } : { opacity: 0 }}
                        transition={{
                            opacity: { duration: 0.5, delay: 0.8 },
                            y: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 },
                        }}
                    >
                        {scene.hint}
                    </motion.p>
                )}
            </motion.div>

            {/* Decorative side element */}
            <motion.div
                className={styles.sceneDecor}
                style={{ color: scene.accent }}
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={isInView ? { scale: 1, opacity: 0.08, rotate: 0 } : { scale: 0, opacity: 0, rotate: -20 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
                ♥
            </motion.div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   PROGRESS INDICATOR (scroll progress dots)
   ═══════════════════════════════════════════════ */
function ProgressDots({ total, current }: { total: number; current: number }) {
    return (
        <div className={styles.progressDots}>
            {Array.from({ length: total }).map((_, i) => (
                <motion.div
                    key={i}
                    className={styles.dot}
                    animate={{
                        scale: i === current ? 1.4 : 1,
                        backgroundColor: i === current ? "var(--rose-mid)" : i < current ? "var(--rose-light)" : "var(--rose-pale)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   PAPER VALENTINE CARD (the grand finale)
   Folds open like a real paper card
   ═══════════════════════════════════════════════ */
function PaperValentine() {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.4, once: true });
    const [isOpen, setIsOpen] = useState(false);
    const [showInside, setShowInside] = useState(false);
    const [burstKey, setBurstKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setShowInside(true), 600);
            return () => clearTimeout(t);
        } else {
            setShowInside(false);
        }
    }, [isOpen]);

    const toggleCard = useCallback(() => {
        if (!isOpen) setBurstKey((k) => k + 1);
        setIsOpen((prev) => !prev);
    }, [isOpen]);

    return (
        <section ref={ref} className={styles.valentineSection}>
            <motion.p
                className={styles.arrivalText}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                а вот и она...
            </motion.p>

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 80, rotate: -3 }}
                animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                {/*
          Simple book: two layers stacked.
          - Back page (inside) — always stationary
          - Front cover — folds left from left edge (like opening a book)
        */}
                <div className={styles.cardBody} onClick={toggleCard}>
                    {/* ── INSIDE PAGE (stationary, behind cover) ── */}
                    <div className={styles.cardInside}>
                        <motion.div
                            className={styles.cardInsideContent}
                            initial={{ opacity: 0 }}
                            animate={showInside ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.7, delay: showInside ? 0.15 : 0 }}
                        >
                            <p className={styles.insideDate}>14 февраля 2026</p>
                            <div className={styles.insideDivider} />
                            <h2 className={styles.insideGreeting}>люблю тебя ❤</h2>
                            <div className={styles.insideDivider} />


                            <p className={styles.insideMessage}>
                                Любимая, с днем святого Валентина! Достижения всех высот, ведь ты у меня самая умница и я в тебя очень верю.
                                Желаю тебе быть окрыленной от любви до старости, быть самой счастливой, оставаться таким же самым потрясающим, добрым и невероятным человеком.
                                <br />
                                спасибо тебе, с тобой я познал счастье ведь ты и есть счастье и мечта всей моей жизни :)


                            </p>



                            <motion.span
                                className={styles.insideHeart}
                                animate={showInside ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                transition={{ repeat: showInside ? Infinity : 0, duration: 1.4, ease: "easeInOut" }}
                            >
                                ♥
                            </motion.span>

                        </motion.div>
                    </div>

                    {/* ── FRONT COVER — folds open to the left ── */}
                    <motion.div
                        className={styles.cardFront}
                        animate={isOpen ? { rotateY: -180 } : { rotateY: 0 }}
                        transition={{ duration: 1.1, ease: [0.45, 0.05, 0.15, 1] }}
                    >
                        <div className={styles.cardFrontFace}>
                            <div className={styles.cardFrontInner}>
                                <motion.div
                                    className={styles.cardHeart}
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    ♥
                                </motion.div>
                                <p className={styles.cardFrontTitle}>Для тебя</p>
                                <br/>
                                <p className={styles.cardFrontTo}>Будякиной Ире</p>
                                <div className={styles.cardFrontDivider} />
                                <p className={styles.cardFrontFrom}>от Дунаева Серёжи</p>
                                <div className={styles.cardFrontDivider} />

                            </div>
                        </div>
                        <div className={styles.cardFrontBack} />
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isOpen && <HeartBurst key={burstKey} />}
            </AnimatePresence>

            <AnimatePresence>
                {!isOpen && isInView && (
                    <motion.p
                        className={styles.tapHint}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, -5, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { duration: 0.5, delay: 1.2 },
                            y: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.5 },
                        }}
                    >
                        ✦ нажми на открытку ✦
                    </motion.p>
                )}
            </AnimatePresence>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   HEART BURST (explosion on card open)
   ═══════════════════════════════════════════════ */
function HeartBurst() {
    const items = useMemo(
        () =>
            Array.from({ length: 16 }, (_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const dist = 90 + Math.random() * 130;
                return {
                    id: i,
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    emoji: ["♥", "♡", "❤", "💗", "✿", "💕"][i % 6],
                    size: 12 + Math.random() * 16,
                    delay: i * 0.035,
                };
            }),
        []
    );

    return (
        <div className={styles.burst}>
            {items.map((h) => (
                <motion.span
                    key={h.id}
                    className={styles.burstItem}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: h.x, y: h.y, scale: [0, 1.3, 0], opacity: [1, 1, 0] }}
                    transition={{ duration: 1.3, delay: h.delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: h.size }}
                >
                    {h.emoji}
                </motion.span>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE — orchestrates everything
   ═══════════════════════════════════════════════ */
export default function ValentinePage() {
    const [currentScene, setCurrentScene] = useState(0);

    // Track which scene is in view
    const handleSceneInView = useCallback((index: number) => {
        setCurrentScene(index);
    }, []);

    return (
        <main className={styles.main}>
            <SparkleCanvas />
            <FloatingHearts />
            <ProgressDots total={SCENES.length + 1} current={currentScene} />

            {/* Scroll quest scenes */}
            {SCENES.map((scene, i) => (
                <ScrollSceneTracked key={scene.id} scene={scene} index={i} onInView={handleSceneInView} />
            ))}

            {/* The grand finale — paper valentine */}
            <PaperValentineTracked index={SCENES.length} onInView={handleSceneInView} />

            {/* Footer */}
            <motion.footer
                className={styles.footer}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <span>♥</span> made with love <span>♥</span>
            </motion.footer>
        </main>
    );
}

/* Wrappers to track current scene for progress dots */
function ScrollSceneTracked({
                                scene,
                                index,
                                onInView,
                            }: {
    scene: (typeof SCENES)[number];
    index: number;
    onInView: (i: number) => void;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.5 });

    useEffect(() => {
        if (isInView) onInView(index);
    }, [isInView, index, onInView]);

    return (
        <div ref={ref}>
            <ScrollScene scene={scene} index={index} />
        </div>
    );
}

function PaperValentineTracked({
                                   index,
                                   onInView,
                               }: {
    index: number;
    onInView: (i: number) => void;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.3 });

    useEffect(() => {
        if (isInView) onInView(index);
    }, [isInView, index, onInView]);

    return (
        <div ref={ref}>
            <PaperValentine />
        </div>
    );
}