import React, { useState, useEffect, useRef, FormEvent } from "react";
import { 
  Mail, 
  MailOpen, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Printer, 
  Heart, 
  CheckCircle2, 
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  ClipboardCheck,
  Music,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Synthetically play chime sounds using Web Audio API
const playChimeSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 1.2); // C6
    
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 1.2);
    
    // Harmony note
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      gain2.gain.setValueAtTime(0.06, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.8);
    }, 180);
  } catch (e) {
    console.warn("Audio context not supported or warm:", e);
  }
};

// Generative ambient music synth class using Web Audio API
class AmbientSynth {
  private ctx: AudioContext | null = null;
  private nodes: { oscillator: OscillatorNode; gain: GainNode }[] = [];
  private intervals: any[] = [];
  private isPlaying = false;

  constructor() {}

  start() {
    if (this.isPlaying) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isPlaying = true;

      const scheduleChord = () => {
        if (!this.ctx || this.ctx.state === 'suspended') return;
        
        // Soothing warm chord notes (C, E, G, B, D in warm sine configurations)
        const root = 130.81; // C3
        const notes = [1, 1.25, 1.5, 1.875, 2.25]; // Major 9th harmonics
        
        notes.forEach((ratio, index) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = "sine";
          // Add organic microscopic de-tuning
          osc.frequency.setValueAtTime(root * ratio + (Math.random() * 2 - 1), this.ctx.currentTime);
          
          gain.gain.setValueAtTime(0, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + 2 + Math.random() * 2);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 7 + Math.random() * 3);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 10);
        });
      };

      // Play initially and schedule on a loop
      scheduleChord();
      const intervalId = setInterval(scheduleChord, 8000);
      this.intervals.push(intervalId);
    } catch (e) {
      console.warn("Ambient synth failed to initialize:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    try {
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch (e) {}
  }
}

// Confetti Particle Class for in-app celebratory explosion
interface ConfettiParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export default function App() {
  // Parsing parameters from URL
  const queryParams = new URLSearchParams(window.location.search);
  const initialToName = queryParams.get("to") || "Friends & Family";

  // State managers
  const [toName, setToName] = useState(initialToName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(toName);
  const [isCopied, setIsCopied] = useState(false);
  
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isCardSlidUp, setIsCardSlidUp] = useState(false);
  
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const synthRef = useRef<AmbientSynth | null>(null);
  const hasUserMuted = useRef(false);

  // RSVP Modal States
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [formName, setFormName] = useState(() => {
    const cleaned = (initialToName || "").replace(/^Dear\s+/i, "").trim();
    return cleaned === "Friends & Family" || cleaned === "Friends and Family" ? "" : cleaned;
  });
  const [attendance, setAttendance] = useState("Yes, I will attend");
  const [guestCount, setGuestCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpCompleted, setRsvpCompleted] = useState(false);

  // Keep formName synchronized when the personalized invitation To-name gets modified
  useEffect(() => {
    if (toName) {
      const cleaned = toName.replace(/^Dear\s+/i, "").trim();
      if (cleaned !== "Friends & Family" && cleaned !== "Friends and Family") {
        setFormName(cleaned);
      }
    }
  }, [toName]);

  const getGoogleFormUrl = () => {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLScsZI_sWPw_uJXBFos-NXk9zxGhEzaup50DixjAtaWctG6Ukg/viewform";
    if (formName) {
      return `${baseUrl}?entry.121437012=${encodeURIComponent(formName)}`;
    }
    return baseUrl;
  };

  // Countdown States
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const countdownDate = new Date("2026-06-27T14:00:00+03:00").getTime(); // East Africa Time/Standard timezone representation

  // Confetti particles state + reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particles = useRef<ConfettiParticle[]>([]);

  // Calculate countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic scaling for narrow screen mobile phones to fit everything perfectly on 100% of screens
  const [mobileScale, setMobileScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 450) {
        // Leave a safety margin of 24px (12px on each side)
        const computed = (width - 24) / 420;
        setMobileScale(Math.max(0.65, Math.min(1, computed)));
      } else {
        setMobileScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-start ambient synthesis on any first screen touch/tap/click to bypass browser limitations
  useEffect(() => {
    // If music is already playing or user explicitly muted, don't auto-start
    if (musicPlaying || hasUserMuted.current) return;

    const startAmbientOnInteraction = () => {
      if (hasUserMuted.current) return;
      if (!synthRef.current) {
        synthRef.current = new AmbientSynth();
      }
      synthRef.current.start();
      setMusicPlaying(true);
    };

    document.addEventListener("click", startAmbientOnInteraction);
    document.addEventListener("touchstart", startAmbientOnInteraction, { passive: true });
    document.addEventListener("keydown", startAmbientOnInteraction);

    return () => {
      document.removeEventListener("click", startAmbientOnInteraction);
      document.removeEventListener("touchstart", startAmbientOnInteraction);
      document.removeEventListener("keydown", startAmbientOnInteraction);
    };
  }, [musicPlaying]);

  // Resume audio context if window gets focused or visibility states change
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (musicPlaying && synthRef.current) {
        // Resume if suspended
        const ctx = (synthRef.current as any).ctx;
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch((e: any) => console.log("Failed to resume audio on focus:", e));
        }
      }
    };
    
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    
    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [musicPlaying]);

  // Check if the current environment is a Host (acting with sharing/personalization toolkit)
  const isHostEnvironment = () => {
    const hostname = window.location.hostname;
    // Localhost, 127.0.0.1, or development runtime represents the owner's environment
    const isDevelopment = hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname.includes("ais-dev-");
    const hasHostParam = window.location.search.includes("host=true");
    const hasAdminParam = window.location.search.includes("admin=true");
    return isDevelopment || hasHostParam || hasAdminParam;
  };

  // Update URL if query parameter changes
  const applyPersonalizedName = () => {
    if (!newNameInput.trim()) return;
    setToName(newNameInput);
    setIsEditingName(false);
    
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("to", newNameInput);
    window.history.pushState({}, "", newUrl.toString());
  };

  const copyShareLink = async () => {
    try {
      const shareUrl = new URL(window.location.href);
      // Strip administration controls completely from the shared visitor links
      shareUrl.searchParams.delete("host");
      shareUrl.searchParams.delete("admin");
      
      // Map dev hostname to clean shared pre-production guest hosting if sharing from workspace
      if (shareUrl.hostname.includes("ais-dev-")) {
        shareUrl.hostname = shareUrl.hostname.replace("ais-dev-", "ais-pre-");
      }
      
      await navigator.clipboard.writeText(shareUrl.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  // Set up Ambient Synth controller
  const toggleMusic = (e?: React.MouseEvent) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!synthRef.current) {
      synthRef.current = new AmbientSynth();
    }
    
    if (musicPlaying) {
      synthRef.current.stop();
      setMusicPlaying(false);
      hasUserMuted.current = true;
    } else {
      synthRef.current.start();
      setMusicPlaying(true);
      hasUserMuted.current = false;
    }
  };

  // Clean ambient synth on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Envelope sequence trigger
  const handleOpenEnvelope = () => {
    if (isEnvelopeOpened) return;
    setIsEnvelopeOpened(true);
    playChimeSound();
    
    // Auto-start ambient synthesis as well
    if (!synthRef.current) {
      synthRef.current = new AmbientSynth();
    }
    synthRef.current.start();
    setMusicPlaying(true);
    hasUserMuted.current = false;
    
    // Step 1: Fold back the top flap
    setTimeout(() => {
      setIsFlapOpen(true);
      
      // Step 2: Slide up the card
      setTimeout(() => {
        setIsCardSlidUp(true);
      }, 700);
    }, 500);
  };

  // Confetti emission logic
  const colors = ["#C39A54", "#427F82", "#E76873", "#F4DC9D", "#BFD5D4", "#FAD8D6"];
  const triggerConfetti = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    particles.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height - 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 6 - 3,
      speedY: Math.random() * 5 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.1 - 0.05
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillRunning = false;

      particles.current.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) {
          stillRunning = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (stillRunning) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };
    render();
  };

  // Clean animation frame on cancel
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Form submission handler to submit directly into Google Forms via Hidden Iframe method
  const handleRsvpSubmit = (e: FormEvent) => {
    setIsSubmitting(true);
    setStatusMessage("Sending your RSVP...");

    // The form submits to the invisible target iframe automatically.
    // We handle custom transitions and play a delightful celebration.
    setTimeout(() => {
      setIsSubmitting(false);
      setRsvpCompleted(true);
      setStatusMessage("");
      triggerConfetti();
    }, 1500);
  };

  // Custom function to add event to Google Calendar
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent("Vinnie's 60th Birthday Soirée");
    const dates = encodeURIComponent("20260627T110000Z/20260627T210000Z"); // Zulu/Universal converter representation
    const details = encodeURIComponent("You are invited to join us as Vinnie celebrates her 60th Birthday Milestone in Kiwatule!\n\nWebsite RSVP and digital invite portal: " + window.location.href);
    const location = encodeURIComponent("Kiwatule, Kampala, Uganda");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 selection:bg-[#C39A54]/30 selection:text-[#1d1b1a] overflow-hidden bg-gradient-to-tr from-[#FCFAF5] via-[#F4EFE6] to-[#EDE5D8]">
      
      {/* Absolute Ambient Background Layers */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-cover bg-center" 
        style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 80%), radial-gradient(circle at 90% 80%, rgba(195,154,84,0.15) 0%, transparent 80%)' }}
      />
      
      {/* Ambient Rising balloons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute left-[5%] animate-float-slow-1 w-10 h-14 bg-[#C39A54]/20 rounded-full shadow-inner before:content-[''] before:absolute before:bottom-[-20px] before:left-1/2 before:w-[0.5px] before:height-[20px] before:bg-stone-400" />
        <div className="absolute left-[30%] animate-float-slow-2 w-12 h-16 bg-[#427F82]/15 rounded-full shadow-inner before:content-[''] before:absolute before:bottom-[-25px] before:left-1/2 before:w-[0.5px] before:height-[25px] before:bg-stone-300" style={{ animationDelay: "2s" }} />
        <div className="absolute left-[65%] animate-float-slow-3 w-11 h-15 bg-[#E76873]/12 rounded-full shadow-inner before:content-[''] before:absolute before:bottom-[-22px] before:left-1/2 before:w-[0.5px] before:height-[22px] before:bg-stone-400" style={{ animationDelay: "4s" }} />
        <div className="absolute left-[85%] animate-float-slow-1 w-9 h-12 bg-white/40 rounded-full shadow-inner before:content-[''] before:absolute before:bottom-[-18px] before:left-1/2 before:w-[0.5px] before:height-[18px] before:bg-stone-400" style={{ animationDelay: "1s" }} />
      </div>

      {/* Floating Canvas for Confetti */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-50" />

      {/* Music Controller Fixed Button */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button 
          onClick={toggleMusic}
          className="flex items-center justify-center p-3.5 bg-neutral-900 hover:bg-stone-800 text-stone-200 hover:text-white rounded-full shadow-xl border border-stone-800 transition-all duration-300 hover:scale-110 active:scale-95 group"
          id="music-toggle"
          title={musicPlaying ? "Mute ambient celebration chords" : "Unmute ambient celebration chords"}
        >
          {musicPlaying ? (
            <>
              <Volume2 className="w-5 h-5 animate-pulse-slow" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-36 transition-all duration-500 ease-out whitespace-nowrap text-xs font-medium pl-0 group-hover:pl-2">Mute Ambient Chords</span>
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5 text-stone-400" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-36 transition-all duration-500 ease-out whitespace-nowrap text-xs font-medium pl-0 group-hover:pl-2">Play Ambient Chords</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container Wrapper */}
      <div className="relative mt-2 flex flex-col items-center justify-center w-full max-w-lg z-10">
        
        {/* Helper Instructions Banner */}
        <AnimatePresence>
          {!isEnvelopeOpened && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6 bg-white/70 backdrop-blur-md px-5 py-3 rounded-full text-center shadow-md border border-amber-200/50 flex items-center gap-2 text-stone-700 max-w-sm"
            >
              <Sparkles className="w-4 h-4 text-[#C39A54] animate-spin" style={{ animationDuration: '6s' }} />
              <p className="text-xs font-medium tracking-wide">
                You have received an invitation to <strong className="text-stone-900 font-semibold font-serif">Auntie Vinnie's surprise party </strong>! Tap below to open.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Personalization Controller (Only visible when hosts wants to customize are send shares) */}
        {isHostEnvironment() && (
          <div className="w-full bg-white/50 backdrop-blur-sm shadow-sm rounded-xl p-4 mb-6 border border-stone-200 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-3 group max-w-md">
            <div className="flex items-center gap-2 text-stone-600">
              <Share2 className="w-4 h-4 text-[#C39A54]" />
              <span>Personalize invitation for your guests:</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input 
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    placeholder="e.g. Grandma & Family"
                    className="bg-white border border-stone-300 rounded px-2.5 py-1 text-xs text-stone-900 font-medium focus:ring-1 focus:ring-[#C39A54] focus:outline-none w-full"
                  />
                  <button 
                    onClick={applyPersonalizedName}
                    className="bg-[#C39A54] hover:bg-amber-600 text-white font-medium px-2.5 py-1 rounded transition-colors text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-semibold text-stone-800">
                    {toName}
                  </span>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-[#C39A54] hover:underline font-medium text-xs ml-1"
                  >
                    Edit Name
                  </button>
                  <div className="h-3 w-[1px] bg-stone-300"></div>
                  <button 
                    onClick={copyShareLink}
                    className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium transition-colors"
                    title="Copy this custom link for this auntie/guest"
                  >
                    {isCopied ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Copied!" : "Share Link"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* 3D Envelope & Presentation Scene */}
        <div 
          className="relative w-full flex items-center justify-center transition-all duration-300"
          style={{ height: `${595 * mobileScale}px` }}
        >
          <div 
            className="relative flex items-center justify-center origin-center select-none"
            style={{ 
              transform: `scale(${mobileScale})`, 
              width: '420px',
              height: '595px'
            }}
          >
            
            {/* Card Presentation Stage */}
            <AnimatePresence>
              {!isEnvelopeOpened ? (
                // SEALED ENVELOPE (Interactive Click-To-Open)
                <motion.div 
                  whileHover={{ scale: 1.02, rotate: -0.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenEnvelope}
                  className="absolute w-[420px] h-[320px] bg-gradient-to-br from-[#ECE7E1] to-[#DDD7D0] rounded-lg shadow-2xl border border-stone-200 cursor-pointer flex flex-col justify-between p-6 overflow-hidden z-20 group"
                >
                  {/* Simulated Envelope Back Flaps & Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_50%,rgba(0,0,0,0.05)_100%)] pointer-events-none" />
                  <div className="absolute left-0 bottom-0 top-1/2 right-1/2 bg-[#DDD7D0]/60 scale-y-110 skew-y-[32deg] origin-bottom-left border-t border-stone-300/40" />
                  <div className="absolute right-0 bottom-0 top-1/2 left-1/2 bg-[#DDD7D0]/60 scale-y-110 skew-y-[-32deg] origin-bottom-right border-t border-stone-300/40" />
                  
                  {/* Bottom flap edge */}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-[#CCC5BE]/30 border-t border-stone-400/20" />

                  {/* Top triangular sealed flap representation */}
                  <div className="absolute inset-x-0 top-0 border-l-[210px] border-l-transparent border-r-[210px] border-r-transparent border-t-[160px] border-t-[#D4CEC8] group-hover:border-t-[#C5BEB7] transition-all duration-300 origin-top shadow-md z-30 flex justify-center">
                    {/* Decorative luxury gold sticker seal */}
                    <div className="absolute top-[-44px] flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 rounded-full shadow-[0px_3px_10px_rgba(180,130,40,0.4)] border border-amber-300 transform -translate-y-1/2 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                      <Heart className="w-5 h-5 text-[#1d1b1a] fill-amber-950/10 animate-pulse" />
                    </div>
                  </div>

                  {/* Recipient custom tag label */}
                  <div className="mt-28 self-center bg-[#FAF8F5]/90 border border-[#C39A54]/30 px-6 py-2.5 rounded-md text-stone-800 text-center shadow-lg w-[85%] z-10 transition-colors group-hover:border-[#C39A54]/60">
                    <p className="text-[10px] uppercase font-semibold letter tracking-[2px] text-stone-500 mb-0.5">Invitation For</p>
                    <p className="font-cursive text-2xl text-[#C39A54] leading-tight font-bold">{toName}</p>
                  </div>

                  {/* Bottom luxury instructions message of envelope */}
                  <div className="text-[9px] text-[#A69E96] font-medium tracking-[2.5px] uppercase text-center mb-1 z-10 group-hover:text-stone-600 transition-colors">
                    Tap to unseal
                  </div>
                </motion.div>
              ) : (
                // OPENED ENVELOPE BACKGROUND + ACTIVE CARD SCENE
                <div className="absolute w-full h-full flex flex-col items-center justify-center pt-10">
                  {/* Back flap flipped up */}
                  <div className="absolute bottom-[240px] w-[420px] h-[140px] bg-[#CBBFB6] rounded-t-lg z-0 origin-bottom transform rotate-180 shadow-inner overflow-hidden border-b border-stone-300/40">
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-400/20 to-transparent" />
                  </div>
                  
                  {/* Lower Envelope Body pocket (background pocket) */}
                  <div className="absolute bottom-5 w-[420px] h-[220px] bg-gradient-to-b from-[#CCC5BE] to-[#DDD7D0] rounded-b-lg shadow-xl z-20 pointer-events-none overflow-hidden">
                    <div className="absolute left-0 bottom-0 top-0 right-1/2 bg-[#DDD7D0]/80 scale-y-110 skew-y-[32deg] origin-bottom-left border-t border-stone-300/40" />
                    <div className="absolute right-0 bottom-0 top-0 left-1/2 bg-[#DDD7D0]/80 scale-y-110 skew-y-[-32deg] origin-bottom-right border-t border-stone-300/40" />
                    
                    {/* Recipient Label left side peeking inside envelope */}
                    <div className="absolute bottom-10 left-10 opacity-30">
                      <p className="font-serif text-3xl font-extrabold italic text-stone-400">Vinnie</p>
                    </div>
                  </div>

                  {/* SLIDEOUT INVITATION CARD */}
                  <motion.div 
                    initial={{ translateY: 150, scale: 0.9, zIndex: 10 }}
                    animate={isCardSlidUp ? { translateY: -40, scale: 1, zIndex: 30 } : { translateY: 120, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="w-[390px] h-[550px] bg-white bg-gradient-to-b from-[#FFF] to-[#FDFBF7] shadow-2xl rounded-sm p-7 text-center border border-stone-200/60 flex flex-col justify-between select-text animate-card-wiggle relative"
                  >
                    {/* Outer border visual strip */}
                    <div className="absolute inset-3 border border-[#C39A54]/20 pointer-events-none rounded-sm" />
                    <div className="absolute inset-4 border border-[#C39A54]/5 pointer-events-none rounded-sm" />

                    {/* Top celebration illustration banner */}
                    <div className="w-full relative py-0.5 z-10 flex flex-col items-center">
                      {/* Artistic birthday illustration in vector */}
                      <svg viewBox="0 0 400 110" className="w-full h-auto mt-2 max-h-[82px]" aria-hidden="true">
                        {/* Floating shiny balloons */}
                        <g fill="none">
                          <ellipse cx="140" cy="38" rx="14" ry="19" fill="#C39A54" opacity="0.8" />
                          <path d="M140 57 L138 62 L142 62 Z" fill="#C39A54" />
                          <path d="M140 57 Q 143 70, 139 80" stroke="#C39A54" strokeWidth="1" />

                          <ellipse cx="260" cy="42" rx="13" ry="18" fill="#427F82" opacity="0.8" />
                          <path d="M260 60 L258 65 L262 65 Z" fill="#427F82" />
                          <path d="M260 60 Q 257 72, 261 82" stroke="#427F82" strokeWidth="1" />

                          <ellipse cx="200" cy="30" rx="16" ry="21" fill="#E76873" opacity="0.75" />
                          <path d="M200 51 L198 56 L202 56 Z" fill="#E76873" />
                          <path d="M200 51 Q 204 65, 198 75" stroke="#E76873" strokeWidth="1" />
                        </g>

                        {/* Golden stars glitter */}
                        <path d="M80,30 L83,35 L88,36 L83,39 L80,44 L77,39 L72,36 L77,35 Z" fill="#C39A54" opacity="0.7" />
                        <path d="M310,25 L312,29 L316,30 L312,32 L310,36 L308,32 L304,30 L308,29 Z" fill="#C39A54" opacity="0.7" />
                        <circle cx="110" cy="22" r="2.5" fill="#427F82" />
                        <circle cx="290" cy="50" r="2.5" fill="#E76873" />

                        {/* Birthday Cake Vector Icon */}
                        <g transform="translate(182, 60)">
                          <rect x="0" y="10" width="36" height="24" rx="3" fill="#FAF6EF" stroke="#DDD1BE" strokeWidth="1.5" />
                          <rect x="3" y="10" width="30" height="4" fill="#C39A54" opacity="0.3" />
                          {/* Candles */}
                          <line x1="8" y1="10" x2="8" y2="2" stroke="#C39A54" strokeWidth="2.5" />
                          <circle cx="8" cy="0" r="1.5" fill="#E76873" />

                          <line x1="18" y1="10" x2="18" y2="0" stroke="#427F82" strokeWidth="2.5" />
                          <circle cx="18" cy="-2" r="1.5" fill="#C39A54" />

                          <line x1="28" y1="10" x2="28" y2="2" stroke="#C39A54" strokeWidth="2.5" />
                          <circle cx="28" cy="0" r="1.5" fill="#E76873" />
                        </g>
                      </svg>
                    </div>

                    {/* Core Content Body of Invitation */}
                    <div className="flex-1 flex flex-col items-center justify-start mt-2">
                      
                      {/* Addressee Personalized Label */}
                      <div className="mb-2.5">
                        <p className="font-cursive text-3xl text-[#C39A54] leading-none mb-0.5 font-bold">To: {toName}</p>
                      </div>

                      <p className="font-sans text-[9px] uppercase tracking-[4px] text-stone-600 mb-1 font-semibold">You are cordially invited to</p>
                      <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 leading-tight">The Birthday<br />Soirée</h1>
                      
                      <p className="font-serif italic text-xs text-[#C39A54] font-medium my-2">
                        Celebrating Vinnie's 60th Birthday Milestone
                      </p>

                      {/* Date/Location Highlights */}
                      <div className="w-full border-y border-stone-200/70 py-3.5 my-3 flex flex-col gap-2.5">
                        <div className="flex items-center justify-center gap-3 text-stone-800">
                          <Calendar className="w-4 h-4 text-[#C39A54] shrink-0" />
                          <span className="text-xs font-semibold tracking-wide uppercase text-stone-950">Saturday, June 27th • 2:00 PM</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-stone-800">
                          <MapPin className="w-4 h-4 text-[#427F82] shrink-0" />
                          <span className="text-xs font-semibold tracking-wide uppercase text-stone-955">Kiwatule</span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-medium tracking-wider uppercase mb-0">
                          Kindly respond by <strong className="text-stone-900 font-semibold">June 24th</strong> to secure reservation
                        </p>
                      </div>

                      {/* Styled Countdown Section */}
                      <div className="w-full bg-[#FCFAF6] border border-stone-200/50 rounded p-2 text-center mb-1">
                        <p className="text-[9px] uppercase tracking-widest text-[#C39A54] font-semibold mb-1.5 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-[#C39A54]" />
                          Time Remaining until celebration
                        </p>
                        
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-stone-900 font-serif tabular-nums leading-none">{timeLeft.days}</span>
                            <span className="text-[8px] uppercase text-stone-500 font-medium mt-0.5">Days</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-stone-900 font-serif tabular-nums leading-none">{timeLeft.hours}</span>
                            <span className="text-[8px] uppercase text-stone-500 font-medium mt-0.5">Hrs</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-stone-900 font-serif tabular-nums leading-none">{timeLeft.minutes}</span>
                            <span className="text-[8px] uppercase text-stone-500 font-medium mt-0.5">Mins</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-stone-900 font-serif tabular-nums leading-none">{timeLeft.seconds}</span>
                            <span className="text-[8px] uppercase text-stone-500 font-medium mt-0.5">Secs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer Actions inside the invitation card */}
                    <div className="mt-auto pt-2 flex flex-col items-center gap-3.5">
                      
                      {/* Primary Engagement CTA RSVP */}
                      <a 
                        href={getGoogleFormUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full select-none text-center block bg-neutral-900 hover:bg-[#d1ab69] hover:text-white text-stone-50 px-6 py-3.5 text-xs font-semibold tracking-[2px] uppercase transition-all duration-300 rounded shadow-[0_6px_15px_rgba(29,27,26,0.15)] hover:shadow-[0_8px_20px_rgba(195,154,84,0.22)] active:scale-[0.98] cursor-pointer"
                        id="open-rsvp-form"
                      >
                        {formName ? `RSVP as ${formName}` : "Confirm RSVP"}
                      </a>

                      {/* Secondary Actions Row */}
                      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-stone-700">
                        <a 
                          href={getGoogleCalendarUrl()}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-[#C39A54] transition-colors flex items-center gap-1 hover:underline"
                          title="Add this milestone to your calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Add To Calendar</span>
                        </a>
                        
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>

                        <a 
                          href="https://maps.app.goo.gl/Z1vJGYsBXSEdnZWX8"
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-[#427F82] transition-colors flex items-center gap-1 hover:underline"
                          title="Get driving directions on Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Get Directions</span>
                        </a>
                      </div>

                      <p className="text-[9px] text-stone-400 font-medium italic mt-1">
                        Your presence is the greatest gift we could hope to receive.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Footer Credits and Print Option */}
        <div className="mt-8 text-center text-[10px] tracking-wider text-stone-500 font-semibold uppercase flex flex-col gap-2">
          <div className="flex items-center justify-center gap-4 text-stone-600">            
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
            <span>Designed by sitelabs</span>
          </div>        
        </div>

      </div>

      {/* Embedded Hidden Print Layout Frame purely for PDF layout and desktop printer */}
      <div className="hidden print:block print:w-[155mm] print:h-[215mm] print:m-0 print:p-8 print:bg-white print:border print:border-stone-400 font-sans text-center text-[#1d1b1a]">
        <div className="border border-[#C39A54] h-full p-6 flex flex-col justify-between items-center bg-white">
          <div className="py-2">
            <p className="font-cursive text-4xl text-[#C39A54] leading-tight font-extrabold my-2">To: {toName}</p>
          </div>
          
          <div className="my-3">
            <h2 className="font-sans text-[10px] uppercase tracking-[5px] text-stone-600 font-bold mb-1">You are cordially invited to</h2>
            <h1 className="font-serif text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">The Birthday<br />Soirée</h1>
            <p className="font-serif italic text-sm text-[#C39A54] font-semibold my-2">
              Celebrating Vinnie's 60th Birthday Milestone
            </p>
          </div>

          <div className="w-full border-y border-stone-300 py-4 my-4">
            <p className="text-sm font-bold uppercase text-stone-900 my-1">Saturday, June 27th • 2:00 PM</p>
            <p className="text-sm font-bold uppercase text-stone-900 my-1">Kiwatule</p>
            <p className="text-xs text-stone-600 italic mt-3">
              RSVP by June 24th
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-stone-500 italic max-w-sm">
              "Your presence is the greatest gift we could hope to receive. Please join us for an evening of joy."
            </p>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest mt-6">
              Vinnie's 60th Celebrations Org
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
