{
  /*import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="p-2 font-body flex flex-col items-center bg-background-muted h-screen gap-2 ">
      <Header />

      <div className="flex-1 text-foreground  min-h-0">
        <Link to="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}*/
}
import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import DarkModeToggle from "@/components/DarkModeToggle";

/* ── THEME ─────────────────────────────────────────────────────────── */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --background: hsl(300 0% 92%);
  --foreground: hsl(330 0% 4%);
  --background-highlight: hsl(300 0% 95%);
  --background-muted: hsl(300 0% 90%);
  --foreground-highlighted: hsl(330 0% 1%);
  --foreground-muted: hsl(0 0% 28%);
  --border: hsl(300 0% 30%);
  --border-muted: hsl(340 0% 62%);
  --primary: hsl(219 51% 32%);
  --primary-hover: hsl(219 51% 42%);
  --secondary: hsl(43 100% 40%);
  --secondary-hover: hsl(43 100% 25%);
  --danger: hsl(9 21% 41%);
  --warning: hsl(52 23% 34%);
  --success: hsl(147 19% 36%);
  --info: hsl(217 22% 41%);
  --gradient: linear-gradient(0deg, var(--background) 95%, var(--background-highlight));
  --gradient-hover: linear-gradient(0deg, var(--background), var(--background-highlight));
}

body.dark {
  --background: hsl(330 0% 6%);
  --foreground: hsl(0 0% 93%);
  --background-muted: hsl(336 0% 1%);
  --background-highlight: hsl(0 0% 7%);
  --foreground-highlighted: hsl(330 0% 100%);
  --foreground-muted: hsl(300 0% 69%);
  --border: hsl(0 0% 28%);
  --border-muted: hsl(300 0% 18%);
  --primary: hsl(219 78% 75%);
  --primary-hover: hsl(219 78% 81%);
  --secondary: hsl(39 54% 61%);
  --secondary-hover: hsl(39 54% 71%);
  --danger: hsl(9 26% 64%);
  --warning: hsl(52 19% 57%);
  --success: hsl(146 17% 59%);
  --info: hsl(217 28% 65%);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--background);
  color: var(--foreground);
  overflow-x: hidden;
  transition: background 0.3s ease, color 0.3s ease;
}

h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--background-muted); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.noise-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.grid-bg {
  background-image:
    linear-gradient(var(--border-muted) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-muted) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.25;
}

/* canvas mock */
.canvas-dot-grid {
  background-image: radial-gradient(circle, var(--border-muted) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* scrollbar hidden */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ── ICONS ─────────────────────────────────────────────────────────── */
const Icon = ({
  d,
  size = 20,
  stroke = "currentColor",
  fill = "none",
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const icons = {
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  menu: "M3 12h18M3 6h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  pen: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  sparkles: [
    "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
    "M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z",
    "M5 13l.75 2.25L8 16l-2.25.75L5 19l-.75-2.25L2 16l2.25-.75L5 13z",
  ],
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  lasso:
    "M7 22a5 5 0 0 1-2-4m0 0a5 5 0 0 1 4.583-4.975M5 18a5.006 5.006 0 0 0 5 5M11 6.003a9 9 0 1 1 2 17.9",
  check: "M20 6L9 17l-5-5",
  chevronDown: "M6 9l6 6 6-6",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  twitter:
    "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  eraser: "M20 20H7L3 16l10-10 7 7-3.5 3.5M6.5 17.5l6-6",
  shapes:
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

/* ── HELPERS ────────────────────────────────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const SectionLabel = ({ children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      border: "1px solid var(--border-muted)",
      background: "var(--background-highlight)",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--primary)",
      marginBottom: 20,
    }}
  >
    {children}
  </div>
);

/* ── NAVBAR ─────────────────────────────────────────────────────────── */
function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "How it works", "FAQ"];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        background: scrolled ? "var(--background)" : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--border-muted)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--foreground)",
          }}
        >
          <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>
            Colloard<span>.</span>
          </span>
        </a>

        {/* Desktop links */}
        <div
          style={{ display: "flex", gap: 32, alignItems: "center" }}
          className="desktop-nav"
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{
                textDecoration: "none",
                color: "var(--foreground-muted)",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--foreground)")}
              onMouseLeave={(e) =>
                (e.target.style.color = "var(--foreground-muted)")
              }
            >
              {l}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <DarkModeToggle />
          <a
            href="/home"
            style={{
              padding: "11px 20px",
              borderRadius: 10,
              background: "var(--primary)",
              color: "var(--background)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              transition: "background 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--primary)")
            }
          >
            Get Started
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "1px solid var(--border-muted)",
              background: "var(--background-highlight)",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--foreground)",
            }}
            className="mobile-menu-btn"
          >
            <Icon d={mobileOpen ? icons.x : icons.menu} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: "1px solid var(--border-muted)",
              paddingBottom: 16,
            }}
          >
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 0",
                  textDecoration: "none",
                  color: "var(--foreground-muted)",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {l}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
}

/* ── CANVAS MOCK ─────────────────────────────────────────────────────── */
function CanvasMock() {
  const [activeTool, setActiveTool] = useState(0);
  const [shapeVisible, setShapeVisible] = useState(false);
  const [newStickyVisible, setNewStickyVisible] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [onlineCount, setOnlineCount] = useState(3);

  const fullText = "Ideas for Q2 launch...";

  // Cycle active tool every 3s
  useEffect(() => {
    const t = setInterval(() => setActiveTool((p) => (p + 1) % 5), 3000);
    return () => clearInterval(t);
  }, []);

  // Show AI shape badge after 2s, hide after 5s, repeat
  useEffect(() => {
    const show = setTimeout(() => setShapeVisible(true), 2000);
    const hide = setTimeout(() => setShapeVisible(false), 5000);
    const rep = setInterval(() => {
      setShapeVisible(true);
      setTimeout(() => setShapeVisible(false), 3000);
    }, 8000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearInterval(rep);
    };
  }, []);

  // New sticky appears after 4s
  useEffect(() => {
    const t = setTimeout(() => setNewStickyVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Typing animation
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i <= fullText.length) {
        setTypingText(fullText.slice(0, i));
        i++;
      } else {
        setTimeout(() => {
          i = 0;
          setTypingText("");
        }, 2000);
      }
    }, 90);
    return () => clearInterval(t);
  }, []);

  // 4th user joins after 6s
  useEffect(() => {
    const t = setTimeout(() => setOnlineCount(4), 6000);
    return () => clearTimeout(t);
  }, []);

  const cursors = [
    {
      name: "Priya",
      color: "#3B82F6",
      ax: [0, 14, -6, 8, 0],
      ay: [0, -8, 5, -3, 0],
      dur: 5,
      left: "28%",
      top: "38%",
    },
    {
      name: "James",
      color: "#10B981",
      ax: [0, -10, 6, -4, 0],
      ay: [0, 6, -9, 4, 0],
      dur: 6,
      left: "60%",
      top: "52%",
    },
    {
      name: "Sofia",
      color: "#F59E0B",
      ax: [0, 5, -12, 3, 0],
      ay: [0, -4, 8, -6, 0],
      dur: 4.5,
      left: "44%",
      top: "68%",
    },
  ];

  const stickyColors = ["#FEF3C7", "#D1FAE5", "#DBEAFE"];
  const stickyTexts = ["Brainstorm ideas 💡", "Sprint goals Q1", "Ship it! 🚀"];

  // Animated SVG stroke path
  const strokePath =
    "M70,120 C90,80 130,60 170,90 C210,120 220,160 190,180 C160,200 110,185 90,160 C70,135 60,150 70,120";

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        border: "1px solid var(--border-muted)",
        overflow: "hidden",
        background: "var(--background-highlight)",
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.25)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 52,
          right: 0,
          height: 44,
          borderBottom: "1px solid var(--border-muted)",
          background: "var(--background)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground-muted)",
          }}
        >
          Room: <span style={{ color: "var(--primary)" }}>ABC-1234</span>
        </div>
        {/* Pulsing live dot */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--success)",
          }}
        />
        <div style={{ flex: 1 }} />
        {/* Avatars with join animation */}
        <AnimatePresence>
          {cursors.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ scale: 0, x: 10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: c.color,
                border: "2px solid var(--background)",
                marginLeft: i > 0 ? -8 : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: 700,
              }}
            >
              {c.name[0]}
            </motion.div>
          ))}
          {onlineCount === 4 && (
            <motion.div
              key="extra"
              initial={{ scale: 0, x: 10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 260 }}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#8B5CF6",
                border: "2px solid var(--background)",
                marginLeft: -8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: 700,
              }}
            >
              R
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 11, color: "var(--foreground-muted)" }}
        >
          {onlineCount} online
        </motion.div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 52,
          background: "var(--background)",
          borderRight: "1px solid var(--border-muted)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          paddingTop: 60,
          zIndex: 5,
        }}
      >
        {[icons.pen, icons.eraser, icons.shapes, icons.text, icons.lasso].map(
          (ic, i) => (
            <motion.div
              key={i}
              animate={{
                background: activeTool === i ? "var(--primary)" : "transparent",
                scale: activeTool === i ? 1.08 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: activeTool === i ? "white" : "var(--foreground-muted)",
              }}
            >
              <Icon d={ic} size={16} />
            </motion.div>
          ),
        )}
        <div style={{ flex: 1 }} />
        {/* Color swatches */}
        {["#1e3a5f", "#10B981", "#F59E0B"].map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.15 }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: c,
              marginBottom: 4,
              border:
                i === 0 ? "2px solid var(--border)" : "1px solid transparent",
              cursor: "pointer",
            }}
          />
        ))}
        <div style={{ marginBottom: 12 }} />
      </div>

      {/* Canvas area */}
      <div
        className="canvas-dot-grid"
        style={{
          marginLeft: 52,
          marginTop: 44,
          minHeight: 420,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated drawing stroke — draws itself in */}
        <svg
          style={{ position: "absolute", top: 20, left: 40 }}
          width="280"
          height="220"
          viewBox="0 0 280 220"
        >
          {/* rough scribble that fades out */}
          <motion.path
            d="M70,120 C85,95 105,75 140,80 C175,85 200,110 195,140 C190,170 160,190 130,182 C100,174 75,155 70,120"
            stroke="var(--border-muted)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.5, 0.5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatDelay: 3,
              times: [0, 0.4, 0.7, 1],
            }}
          />
          {/* clean circle that snaps in */}
          <motion.circle
            cx="135"
            cy="130"
            r="58"
            stroke="var(--primary)"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatDelay: 3,
              times: [0, 0.5, 0.85, 1],
            }}
          />
          {/* Arrow line */}
          <motion.line
            x1="200"
            y1="60"
            x2="240"
            y2="90"
            stroke="var(--secondary)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          />
          <motion.polygon
            points="240,90 228,84 234,100"
            fill="var(--secondary)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />
        </svg>

        {/* Dashed connector line */}
        <svg
          style={{ position: "absolute", top: 170, left: 70 }}
          width="220"
          height="10"
        >
          <motion.line
            x1="0"
            y1="5"
            x2="220"
            y2="5"
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          />
        </svg>

        {/* Triangle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ delay: 1.4, type: "spring" }}
          style={{
            position: "absolute",
            top: 155,
            left: 310,
            width: 0,
            height: 0,
            borderLeft: "38px solid transparent",
            borderRight: "38px solid transparent",
            borderBottom: "65px solid var(--success)",
          }}
        />

        {/* Sticky notes */}
        {stickyTexts.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7, rotate: i % 2 === 0 ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -2 : 2 }}
            transition={{
              delay: 0.4 + i * 0.25,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{ scale: 1.07, rotate: 0, zIndex: 10 }}
            style={{
              position: "absolute",
              top: [210, 75, 255][i],
              left: [130, 330, 305][i],
              width: 120,
              height: 90,
              background: stickyColors[i],
              borderRadius: 4,
              padding: 10,
              fontSize: 11,
              fontWeight: 500,
              color: "#333",
              boxShadow: "3px 5px 14px rgba(0,0,0,0.12)",
              cursor: "default",
              zIndex: 2,
            }}
          >
            {text}
          </motion.div>
        ))}

        {/* 4th sticky that appears dynamically */}
        <AnimatePresence>
          {newStickyVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 3 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 220 }}
              style={{
                position: "absolute",
                top: 80,
                left: 180,
                width: 120,
                height: 90,
                background: "#FCE7F3",
                borderRadius: 4,
                padding: 10,
                fontSize: 11,
                fontWeight: 500,
                color: "#333",
                boxShadow: "3px 5px 14px rgba(0,0,0,0.12)",
                zIndex: 3,
              }}
            >
              New idea! ✨{/* typing indicator inside */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: "#666",
                  borderBottom: "1px solid #e9a0c0",
                  paddingBottom: 2,
                }}
              >
                {typingText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  |
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live cursors with smoother independent paths */}
        {cursors.map((c, i) => (
          <motion.div
            key={i}
            animate={{ x: c.ax, y: c.ay }}
            transition={{
              duration: c.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              zIndex: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M0 0 L0 14 L4 10 L8 18 L10 17 L6 9 L11 9 Z"
                fill={c.color}
                stroke="white"
                strokeWidth="0.8"
              />
            </svg>
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: c.color,
                color: "white",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 999,
                marginTop: 2,
                whiteSpace: "nowrap",
                boxShadow: `0 2px 8px ${c.color}55`,
              }}
            >
              {c.name}
            </motion.div>
          </motion.div>
        ))}

        {/* "Riya is typing..." indicator */}
        <AnimatePresence>
          {newStickyVisible && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                bottom: 56,
                left: 20,
                background: "var(--background)",
                border: "1px solid var(--border-muted)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 11,
                color: "var(--foreground-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 0.2, 0.4].map((d) => (
                  <motion.div
                    key={d}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#8B5CF6",
                    }}
                  />
                ))}
              </div>
              Riya is typing...
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI badge — shape recognized */}
        <AnimatePresence>
          {shapeVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: "spring", stiffness: 280 }}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "var(--primary)",
                color: "var(--background)",
                fontSize: 11,
                padding: "7px 13px",
                borderRadius: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Icon d={icons.sparkles[0]} size={13} stroke="white" />
              </motion.span>
              Circle recognized ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom indicator bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 70,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--background)",
            border: "1px solid var(--border-muted)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            color: "var(--foreground-muted)",
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🔍
          </motion.span>{" "}
          100%
        </div>
      </div>
    </div>
  );
}

/* ── HERO ───────────────────────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll();
  // Only parallax — NO opacity fade so content stays visible while scrolling
  const y = useTransform(scrollY, [0, 800], [0, -60]);

  const words = ["Draw.", "Collaborate.", "Create."];

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid bg */}
      <div className="grid-bg" style={{ position: "absolute", inset: 0 }} />

      {/* Glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "var(--primary)",
          opacity: 0.06,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "var(--secondary)",
          opacity: 0.07,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          y,
          maxWidth: 900,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>✦ Now in public beta</SectionLabel>
        </motion.div>

        <div style={{ overflow: "hidden" }}>
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.2 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "inline-block",
                marginRight: 16,
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: "clamp(42px, 7vw, 88px)",
                color:
                  i === 2 ? "var(--primary)" : "var(--foreground-highlighted)",
                lineHeight: 1.1,
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "var(--foreground-muted)",
            marginTop: 24,
            maxWidth: 560,
            margin: "24px auto 0",
            lineHeight: 1.6,
            fontWeight: 300,
          }}
        >
          A real-time collaborative whiteboard with AI-powered shape
          recognition, handwriting OCR, and smart canvas tools — built for teams
          who think visually.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          <motion.a
            href="/home"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "var(--primary)",
              color: "var(--background)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Start Drawing{" "}
            <Icon d={icons.arrowRight} size={16} stroke="var(--background)" />
          </motion.a>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--background-highlight)",
              color: "var(--foreground)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            See how it works
          </motion.a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 40,
          }}
        ></motion.div>

        {/* Canvas mock */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 64 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <CanvasMock />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── FEATURES ───────────────────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: icons.users,
      title: "Real-time Collaboration",
      desc: "See teammates' cursors live. Draw, annotate, and brainstorm together with zero lag, from anywhere in the world.",
    },
    {
      icon: icons.sparkles[0],
      title: "AI Shape Recognition",
      desc: "Draw rough shapes and watch them snap to perfect geometry. Circles, rectangles, arrows — all auto-corrected.",
    },
    {
      icon: icons.text,
      title: "Handwriting to Text",
      desc: "Scribble notes naturally, then convert them to clean, editable, searchable text with one tap.",
    },
    {
      icon: icons.expand,
      title: "Infinite Canvas",
      desc: "Your ideas have no boundaries. Pan, zoom, and expand your workspace as your project grows.",
    },
    {
      icon: icons.download,
      title: "Export Anywhere",
      desc: "Export your boards as PNG, PDF, or JSON. Share a link or embed in Notion, Slack, or your own site.",
    },
    {
      icon: icons.lasso,
      title: "Smart Lasso Selection",
      desc: "Draw a loop to intelligently select, move, copy, or delete any group of elements on the canvas.",
    },
  ];

  return (
    <section
      id="features"
      style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}
    >
      <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
        <SectionLabel>Features</SectionLabel>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            marginTop: 8,
            lineHeight: 1.15,
          }}
        >
          Everything your team needs
        </h2>
        <p
          style={{
            color: "var(--foreground-muted)",
            marginTop: 16,
            fontSize: 17,
            fontWeight: 300,
          }}
        >
          Powerful tools, thoughtfully designed for visual thinkers.
        </p>
      </FadeUp>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f, i) => (
          <FadeUp key={f.title} delay={i * 0.07}>
            <motion.div
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
              }}
              style={{
                padding: 28,
                borderRadius: 16,
                border: "1px solid var(--border-muted)",
                background: "var(--background-highlight)",
                transition: "box-shadow 0.3s",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--primary)",
                  opacity: 0.12,
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  marginBottom: 16,
                  position: "relative",
                }}
              >
                <Icon d={f.icon} size={22} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--foreground-muted)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  fontWeight: 300,
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: icons.link,
      title: "Create or join a room",
      desc: "Spin up a new whiteboard in seconds. Share the link or room code with your team — no sign-up required.",
    },
    {
      num: "02",
      icon: icons.pen,
      title: "Draw & collaborate live",
      desc: "Every stroke syncs instantly. See each other's cursors, use AI tools, and build ideas together in real time.",
    },
    {
      num: "03",
      icon: icons.download,
      title: "Export & share your work",
      desc: "When you're done, export as PNG, PDF, or JSON. Or just copy the link to share the live board.",
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 24px",
        background: "var(--background-muted)",
        borderTop: "1px solid var(--border-muted)",
        borderBottom: "1px solid var(--border-muted)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeUp style={{ textAlign: "center", marginBottom: 72 }}>
          <SectionLabel>How it works</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Up and running in 30 seconds
          </h2>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 40,
          }}
        >
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.1}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontSize: 96,
                    fontWeight: 800,
                    color: "var(--primary)",
                    opacity: 0.07,
                    position: "absolute",
                    top: -30,
                    left: -10,
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    border: "1px solid var(--border-muted)",
                    background: "var(--background-highlight)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    marginBottom: 20,
                    position: "relative",
                  }}
                >
                  <Icon d={s.icon} size={22} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--foreground-muted)",
                    lineHeight: 1.65,
                    fontSize: 14,
                    fontWeight: 300,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── AI SPOTLIGHT ────────────────────────────────────────────────────── */
function AiSpotlight() {
  const rows = [
    {
      title: "Shape Recognition",
      label: "AI-Powered",
      desc: "Draw a rough circle or rectangle and Colloard's AI snaps it into a perfect shape. Supports circles, rectangles, triangles, lines, arrows, and stars with 90%+ accuracy.",
      mock: (
        <div
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--foreground-muted)",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Before
              </div>
              <svg width="100" height="80" viewBox="0 0 100 80">
                <path
                  d="M20,60 C18,40 15,25 30,15 C45,5 65,8 72,25 C80,42 75,62 58,68 C40,75 22,75 20,60"
                  stroke="var(--foreground)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: "var(--primary)", fontSize: 20 }}
            >
              →
            </motion.div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--foreground-muted)",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                After
              </div>
              <svg width="100" height="80" viewBox="0 0 100 80">
                <circle
                  cx="50"
                  cy="40"
                  r="32"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: "var(--primary)",
              color: "var(--background)",
              fontSize: 11,
              padding: "5px 14px",
              borderRadius: 999,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon d={icons.sparkles[0]} size={11} stroke="white" /> Circle
            detected
          </motion.div>
        </div>
      ),
      reverse: false,
    },
    {
      title: "Handwriting to Text",
      label: "OCR Engine",
      desc: "Write naturally on the canvas. Select any handwritten content and convert it to clean, editable, searchable typed text in one tap.",
      mock: (
        <div style={{ padding: 32 }}>
          <div
            style={{
              border: "1px solid var(--border-muted)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--border-muted)",
                background: "var(--background-muted)",
                fontSize: 11,
                color: "var(--foreground-muted)",
                fontWeight: 600,
              }}
            >
              Handwriting detected
            </div>
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "cursive",
                  fontSize: 20,
                  color: "var(--foreground)",
                  opacity: 0.5,
                  textDecoration: "line-through",
                }}
              >
                Meeting notes for Q1...
              </div>
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: 15,
                  color: "var(--foreground)",
                  background: "var(--background-highlight)",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--primary)",
                  borderLeft: "3px solid var(--primary)",
                }}
              >
                Meeting notes for Q1 review — discuss roadmap priorities and
                assign owners.
              </motion.div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--success)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon d={icons.check} size={12} stroke="var(--success)" />{" "}
                Converted with 94% confidence
              </div>
            </div>
          </div>
        </div>
      ),
      reverse: true,
    },
  ];

  return (
    <section
      style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}
    >
      <FadeUp style={{ textAlign: "center", marginBottom: 72 }}>
        <SectionLabel>✦ AI Features</SectionLabel>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          Intelligence built in
        </h2>
        <p
          style={{
            color: "var(--foreground-muted)",
            marginTop: 16,
            fontSize: 17,
            fontWeight: 300,
          }}
        >
          Not just a canvas — a thinking tool.
        </p>
      </FadeUp>

      <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
        {rows.map((row, i) => (
          <FadeUp key={row.title} delay={0.1}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 40,
                alignItems: "center",
                direction: row.reverse ? "rtl" : "ltr",
              }}
            >
              <div style={{ direction: "ltr" }}>
                <SectionLabel>{row.label}</SectionLabel>
                <h3
                  style={{
                    fontSize: "clamp(22px, 3vw, 34px)",
                    fontWeight: 800,
                    marginBottom: 16,
                  }}
                >
                  {row.title}
                </h3>
                <p
                  style={{
                    color: "var(--foreground-muted)",
                    lineHeight: 1.7,
                    fontSize: 15,
                    fontWeight: 300,
                  }}
                >
                  {row.desc}
                </p>
                <motion.a
                  href="#"
                  whileHover={{ gap: 12 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 24,
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Try it free{" "}
                  <Icon
                    d={icons.arrowRight}
                    size={15}
                    stroke="var(--primary)"
                  />
                </motion.a>
              </div>
              <div
                style={{
                  direction: "ltr",
                  borderRadius: 16,
                  border: "1px solid var(--border-muted)",
                  background: "var(--background-highlight)",
                }}
              >
                {row.mock}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Do I need an account to use Colloard?",
      a: "No account needed to view or explore a whiteboard. However, to collaborate — meaning to draw, edit, or make any changes — you need to be authenticated and authorized. This ensures only permitted team members can modify the board's data.",
    },
    {
      q: "How does collaboration access work?",
      a: "The room owner controls who can edit. Collaborators must sign in and be granted edit permission by the owner. Viewers can join without an account, but write access requires authorization.",
    },
    {
      q: "How many people can collaborate at once?",
      a: "There is no hard cap — rooms support many concurrent collaborators. Performance is optimized for teams of up to 50 active editors at once.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. All data is transmitted over WSS (secure WebSockets). Rooms have unique UUIDs and optional password protection. Room data is retained for 30 days by default.",
    },
    {
      q: "Does it work on mobile and tablets?",
      a: "Yes. Colloard is fully responsive and touch-optimized. It works great on iPads and Android tablets for sketching and annotation.",
    },
    {
      q: "Can I export my boards?",
      a: "Yes — export your board as PNG, PDF, or JSON at any time from the canvas toolbar.",
    },
  ];

  return (
    <section
      id="faq"
      style={{
        padding: "100px 24px",
        background: "var(--background-muted)",
        borderTop: "1px solid var(--border-muted)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeUp style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel>FAQ</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Common questions
          </h2>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, i) => (
            <FadeUp key={faq.q} delay={i * 0.05}>
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid var(--border-muted)",
                  background: "var(--background-highlight)",
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--foreground)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ color: "var(--foreground-muted)", flexShrink: 0 }}
                  >
                    <Icon d={icons.chevronDown} size={18} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div
                        style={{
                          padding: "0 22px 18px",
                          color: "var(--foreground-muted)",
                          fontSize: 14,
                          lineHeight: 1.7,
                          fontWeight: 300,
                        }}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA BANNER ──────────────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{ padding: "100px 24px" }}>
      <FadeUp>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: 24,
            background: "var(--primary)",
            padding: "72px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* bg decoration */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "white",
              opacity: 0.04,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "white",
              opacity: 0.04,
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.12)",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "white",
                letterSpacing: "0.07em",
                marginBottom: 24,
              }}
            >
              <Icon d={icons.zap} size={12} stroke="white" fill="white" /> FREE
              TO START
            </div>
            <h2
              style={{
                fontFamily: "Syne",
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Start drawing together
              <br />
              right now.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 17,
                marginBottom: 36,
                fontWeight: 300,
              }}
            >
              No sign-up required. Create a board and invite your team in
              seconds.
            </p>
            <motion.a
              href="/home"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "15px 32px",
                borderRadius: 14,
                background: "var(--secondary)",
                color: "var(--background)",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Create your first board{" "}
              <Icon d={icons.arrowRight} size={18} stroke="var(--background)" />
            </motion.a>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-muted)",
        padding: "64px 24px 32px",
        background: "var(--background-muted)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(3, 1fr)",
            gap: 48,
            marginBottom: 56,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon d={icons.pen} size={14} stroke="white" />
              </div>
              <span
                style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 17 }}
              >
                Colloard
              </span>
            </div>
            <p
              style={{
                color: "var(--foreground-muted)",
                fontSize: 13,
                lineHeight: 1.65,
                maxWidth: 220,
                fontWeight: 300,
              }}
            >
              A real-time collaborative whiteboard for teams who think visually.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--foreground-muted)",
                  marginBottom: 16,
                }}
              >
                {col.title}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      color: "var(--foreground-muted)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--foreground)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--foreground-muted)")
                    }
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-muted)",
            paddingTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ color: "var(--foreground-muted)", fontSize: 13 }}>
            © 2026 Colloard. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[icons.github].map((ic, i) => (
              <motion.a
                key={i}
                href="https://github.com/Amarjeet0538 "
                whileHover={{ scale: 1.15, color: "var(--primary)" }}
                style={{
                  color: "var(--foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid var(--border-muted)",
                  background: "var(--background-highlight)",
                  textDecoration: "none",
                }}
              >
                <Icon d={ic} size={15} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── APP ─────────────────────────────────────────────────────────────── */
export default function WhiteboardLanding() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.style.margin = "0";
    return () => {
      document.body.classList.remove("dark");
    };
  }, []);

  return (
    <>
      <style>{STYLE}</style>
      <div className="noise-overlay" />
      <Navbar dark={dark} setDark={setDark} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AiSpotlight />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
