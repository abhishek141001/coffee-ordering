"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface TerminalStep {
  type: "type" | "instant" | "pause";
  text?: string;
  className?: string;
  delay: number;
}

const STEPS: TerminalStep[] = [
  { type: "type", text: "$ ssh caffeineoperator.online -p 2222", className: "text-white", delay: 35 },
  { type: "pause", delay: 800 },
  { type: "instant", text: "Connected to CaffeineOperator v2.0", className: "text-zinc-500 text-xs", delay: 0 },
  { type: "instant", text: "\u26a1 Welcome back, operator. +10 XP (login streak: 7)", className: "text-amber-400 text-xs", delay: 0 },
  { type: "pause", delay: 600 },
  { type: "instant", text: "\u2502 Shops near you:", className: "text-orange-400/80 text-xs", delay: 0 },
  { type: "pause", delay: 200 },
  { type: "instant", text: "  \u2713 Brew & Code \u2014 50m away", className: "text-white", delay: 0 },
  { type: "pause", delay: 200 },
  { type: "instant", text: "  \u25CB The Daily Grind \u2014 120m", className: "text-zinc-400", delay: 0 },
  { type: "pause", delay: 800 },
  { type: "instant", text: "\u2502 Select your drink:", className: "text-orange-400/80 text-xs", delay: 0 },
  { type: "pause", delay: 300 },
  { type: "instant", text: "  \u25B8 Cappuccino (L)  \u20B9180", className: "text-amber-300 bg-amber-400/10 rounded px-1 -mx-1", delay: 0 },
  { type: "instant", text: "    Espresso        \u20B9120", className: "text-zinc-500", delay: 0 },
  { type: "instant", text: "    Pour Over       \u20B9200", className: "text-zinc-500", delay: 0 },
  { type: "pause", delay: 1000 },
  { type: "instant", text: "\u2713 Payment complete. Order #42 confirmed!", className: "text-green-400 font-medium", delay: 0 },
  { type: "pause", delay: 300 },
  { type: "instant", text: "\u26a1 +50 XP earned! Rank: Espresso Elite \u2615", className: "text-amber-400 text-xs font-medium", delay: 0 },
];

export default function TypingTerminal() {
  const [lines, setLines] = useState<{ text: string; className: string }[]>([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [currentClassName, setCurrentClassName] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const cancelRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(resolve, ms);
      }),
    []
  );

  const typeText = useCallback(
    async (text: string, className: string, charDelay: number) => {
      setCurrentClassName(className);
      for (let i = 0; i <= text.length; i++) {
        if (cancelRef.current) return;
        setCurrentTyping(text.slice(0, i));
        await sleep(charDelay);
      }
      setLines((prev) => [...prev, { text, className }]);
      setCurrentTyping("");
      setCurrentClassName("");
    },
    [sleep]
  );

  const runSequence = useCallback(async () => {
    while (!cancelRef.current) {
      setLines([]);
      setCurrentTyping("");
      setShowCursor(true);

      for (const step of STEPS) {
        if (cancelRef.current) return;

        if (step.type === "type" && step.text) {
          await typeText(step.text, step.className || "text-white", step.delay);
        } else if (step.type === "instant" && step.text) {
          await sleep(150);
          setLines((prev) => [
            ...prev,
            { text: step.text!, className: step.className || "text-zinc-300" },
          ]);
        } else if (step.type === "pause") {
          await sleep(step.delay);
        }
      }

      await sleep(4000);
    }
  }, [typeText, sleep]);

  useEffect(() => {
    cancelRef.current = false;
    runSequence();
    return () => {
      cancelRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [runSequence]);

  return (
    <div className="terminal-window animate-pulse-glow">
      <div className="terminal-header">
        <div className="terminal-dot bg-[#ff5f57]" />
        <div className="terminal-dot bg-[#febc2e]" />
        <div className="terminal-dot bg-[#28c840]" />
        <span className="text-xs text-zinc-500 ml-2 font-mono">
          ~/ops
        </span>
      </div>
      <div className="p-4 md:p-5 font-mono text-xs md:text-sm leading-relaxed min-h-[280px] md:min-h-[320px]">
        <div className="space-y-1">
          {lines.map((line, i) => (
            <div key={i} className={line.className}>
              {line.text}
            </div>
          ))}
          {(currentTyping || showCursor) && (
            <div className={currentClassName || "text-white"}>
              {currentTyping}
              {showCursor && (
                <span className="inline-block w-[7px] h-[14px] bg-amber-400 ml-[1px] animate-blink align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
