import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = "https://nova-backened.onrender.com";

const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;700&display=swap');`;

// =========================================
// FLOATING PARTICLES
// =========================================
function Particles() {
  const points = useMemo(() => {
    return Array.from({ length: 180 }, () => [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
    ]);
  }, []);
  return (
    <>
      {points.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#00f5ff" : i % 3 === 1 ? "#0891b2" : "#7ef7ff"}
            emissive={i % 3 === 0 ? "#00f5ff" : i % 3 === 1 ? "#0891b2" : "#7ef7ff"}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </>
  );
}

function NeuralLines() {
  const lines = useMemo(() => {
    return Array.from({ length: 30 }, () => [
      [(Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7],
      [(Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7],
    ]);
  }, []);
  return (
    <>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line}
          color={i % 2 === 0 ? "#00f5ff" : "#0891b2"}
          lineWidth={0.6}
          transparent
          opacity={0.2}
        />
      ))}
    </>
  );
}

// =========================================
// SPIRIT FLAME (small, top of chat)
// =========================================
function SpiritFlame({ thinking }) {
  const color = thinking ? "#f59e0b" : "#00f5ff";
  const glow  = thinking ? "rgba(245,158,11,0.8)" : "rgba(0,245,255,0.8)";

  return (
    <motion.div
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      animate={{
        filter: [
          `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 30px ${glow.replace("0.8","0.2")})`,
          `drop-shadow(0 0 22px ${glow}) drop-shadow(0 0 50px ${glow.replace("0.8","0.4")})`,
          `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 30px ${glow.replace("0.8","0.2")})`,
        ],
      }}
      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
    >
      <svg width="48" height="64" viewBox="-20 -20 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="fg1" cx="50%" cy="65%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="70%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fg2" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#c0f8ff" />
            <stop offset="100%" stopColor="#00d4e8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.path
          d="M80 215 C30 210,5 175,10 145 C14 118,25 108,22 88 C19 68,30 52,38 44 C32 60,36 72,45 70 C48 56,52 38,60 22 C65 42,60 58,68 65 C72 50,76 28,80 8 C84 28,88 50,92 65 C100 58,95 42,100 22 C108 38,112 56,115 70 C124 72,128 60,122 44 C130 52,141 68,138 88 C135 108,146 118,150 145 C155 175,130 210,80 215 Z"
          fill="url(#fg1)"
          animate={{ scaleX: [1, 1.04, 0.97, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ transformOrigin: "80px 215px" }}
        />
        <motion.ellipse cx="80" cy="148" rx={26} ry={30} fill="url(#fg2)"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ transformOrigin: "80px 148px" }}
        />
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.88, 0.92, 0.96, 1] }}
          style={{ transformOrigin: "80px 152px" }}
        >
          <circle cx="71" cy="148" r="3" fill="#0a1a20" />
          <circle cx="89" cy="148" r="3" fill="#0a1a20" />
          <path d="M73 157 Q80 163 87 157" stroke="#0a1a20" strokeWidth="2" strokeLinecap="round" fill="none" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

// =========================================
// TYPING INDICATOR
// =========================================
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#00f5ff" }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// =========================================
// SINGLE CHAT MESSAGE
// =========================================
function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 4,
      }}
    >
      <div style={{
        maxWidth: "78%",
        padding: "10px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
          : "rgba(0,20,30,0.85)",
        border: isUser ? "none" : "1px solid rgba(0,245,255,0.15)",
        boxShadow: isUser
          ? "0 4px 20px rgba(8,145,178,0.35)"
          : "0 4px 20px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        fontSize: 13,
        lineHeight: 1.65,
        color: isUser ? "#e0f8ff" : "rgba(200,240,255,0.9)",
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: 0.3,
        wordBreak: "break-word",
      }}>
        {msg.text}
      </div>
      <div style={{
        fontSize: 9,
        color: "rgba(0,245,255,0.25)",
        marginTop: 4,
        letterSpacing: 2,
        fontFamily: "'Share Tech Mono', monospace",
      }}>
        {isUser ? "YOU" : "NOVA"} · {msg.time}
      </div>
    </motion.div>
  );
}

// =========================================
// MAIN APP
// =========================================
export default function App() {
  const [messages,  setMessages]  = useState([
    {
      id: 0,
      role: "nova",
      text: "Hello! I'm NOVA — your Neural Operations Voice Agent. How can I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input,     setInput]     = useState("");
  const [thinking,  setThinking]  = useState(false);
  const [time,      setTime]      = useState("");
  const [error,     setError]     = useState("");

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const msgIdRef    = useRef(1);

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    setMessages(prev => [...prev, {
      id: msgIdRef.current++,
      role: "user",
      text,
      time: now,
    }]);
    setInput("");
    setThinking(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data  = await res.json();
      const reply = data.response || "No response received.";

      setMessages(prev => [...prev, {
        id: msgIdRef.current++,
        role: "nova",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      console.error(err);
      setError("Could not reach NOVA backend. Check your connection.");
      setMessages(prev => [...prev, {
        id: msgIdRef.current++,
        role: "nova",
        text: "⚠️ I couldn't connect to my backend. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, thinking]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <>
      <style>{fontStyle}</style>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.3); }

        textarea {
          resize: none;
          outline: none;
          border: none;
          background: transparent;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          color: rgba(200,240,255,0.9);
          letter-spacing: 0.4px;
          line-height: 1.6;
          width: 100%;
        }
        textarea::placeholder { color: rgba(0,245,255,0.25); letter-spacing: 1px; }

        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        background: "#04080f",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Share Tech Mono', monospace",
      }}>

        {/* Scanlines */}
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none", zIndex: 10,
        }} />

        {/* 3D Background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 55 }} onCreated={({ gl }) => { gl.debug = { checkShaderErrors: false }; }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[8, 8, 8]}  intensity={3} color="#00d4e8" />
            <pointLight position={[-8,-8, 4]}  intensity={1.5} color="#0891b2" />
            <Particles />
            <NeuralLines />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} enablePan={false} />
          </Canvas>
        </div>

        {/* Corner brackets */}
        {[
          { top: 20, left: 20,   borderTop: "1px solid rgba(0,245,255,0.25)", borderLeft:  "1px solid rgba(0,245,255,0.25)" },
          { top: 20, right: 20,  borderTop: "1px solid rgba(0,245,255,0.25)", borderRight: "1px solid rgba(0,245,255,0.25)" },
          { bottom: 20, left: 20,  borderBottom: "1px solid rgba(0,245,255,0.25)", borderLeft:  "1px solid rgba(0,245,255,0.25)" },
          { bottom: 20, right: 20, borderBottom: "1px solid rgba(0,245,255,0.25)", borderRight: "1px solid rgba(0,245,255,0.25)" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 28, height: 28, zIndex: 20, ...s }} />
        ))}

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 44,
          borderBottom: "1px solid rgba(0,245,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 52px", zIndex: 30,
          background: "rgba(4,8,15,0.85)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SpiritFlame thinking={thinking} />
            <div>
              <div style={{ fontSize: 14, letterSpacing: 6, color: "#ffffff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, lineHeight: 1 }}>NOVA</div>
              <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(0,245,255,0.4)", marginTop: 1 }}>NEURAL OPERATIONS</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <AnimatePresence mode="wait">
              {thinking ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <motion.div
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }}
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                  />
                  <span style={{ fontSize: 9, letterSpacing: 3, color: "#f59e0b" }}>THINKING</span>
                </motion.div>
              ) : (
                <motion.div
                  key="online"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <motion.div
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 8px #00f5ff" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <span style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,245,255,0.5)" }}>ONLINE</span>
                </motion.div>
              )}
            </AnimatePresence>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(0,245,255,0.3)" }}>{time}</span>
          </div>
        </div>

        {/* ── MAIN CHAT AREA ── */}
        <div style={{
          position: "absolute",
          top: 44, bottom: 0, left: 0, right: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 16px 16px",
        }}>
          <div style={{
            width: "100%",
            maxWidth: 720,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}>

            {/* Messages scroll area */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 4px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              {messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{
                      padding: "10px 16px",
                      borderRadius: "18px 18px 18px 4px",
                      background: "rgba(0,20,30,0.85)",
                      border: "1px solid rgba(0,245,255,0.15)",
                      backdropFilter: "blur(12px)",
                    }}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              background: "rgba(0,12,20,0.88)",
              border: `1px solid ${error ? "rgba(255,100,80,0.4)" : "rgba(0,245,255,0.18)"}`,
              borderRadius: 16,
              backdropFilter: "blur(16px)",
              boxShadow: error
                ? "0 0 24px rgba(255,80,50,0.1)"
                : "0 0 24px rgba(0,245,255,0.06), inset 0 1px 0 rgba(0,245,255,0.05)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // auto-grow up to 5 rows
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="SEND A MESSAGE TO NOVA..."
                autoFocus
                style={{ height: 22 }}
              />

              {/* Send button */}
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  flexShrink: 0,
                  width: 38, height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: (!input.trim() || thinking)
                    ? "rgba(0,245,255,0.08)"
                    : "linear-gradient(135deg, #0891b2, #06b6d4)",
                  cursor: (!input.trim() || thinking) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: (!input.trim() || thinking) ? "none" : "0 0 18px rgba(6,182,212,0.5)",
                  transition: "background 0.25s, box-shadow 0.25s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke={(!input.trim() || thinking) ? "rgba(0,245,255,0.25)" : "#ffffff"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Error toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 8,
                    fontSize: 10, letterSpacing: 1.5,
                    color: "rgba(255,160,140,0.8)",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            <div style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 9, letterSpacing: 2.5,
              color: "rgba(0,245,255,0.18)",
            }}>
              ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
