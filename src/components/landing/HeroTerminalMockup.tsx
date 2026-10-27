"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Store,
  Layers,
  Globe,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Package,
  Activity,
  Languages,
  DollarSign,
  Barcode,
  ChevronRight,
  Boxes,
  Zap,
  Check,
} from "lucide-react";

export const HeroTerminalMockup: React.FC = () => {
  const { t, locale, dir } = useLanguage();
  const isAr = locale === "ar";

  // Timeline state (0 to 30 seconds)
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-play 30-second loop timer (updates every 200ms)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = Math.round((prev + 0.2) * 10) / 10;
        if (next >= 30) {
          return 0; // Seamless loop back to Scene 1
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Determine active scene based on seconds
  // Scene 1: 0 - 3s
  // Scene 2: 3 - 6s
  // Scene 3: 6 - 10s
  // Scene 4: 10 - 14s
  // Scene 5: 14 - 18s
  // Scene 6: 18 - 22s
  // Scene 7: 22 - 25s
  // Scene 8: 25 - 30s
  const getActiveScene = () => {
    if (seconds < 3) return 1;
    if (seconds < 6) return 2;
    if (seconds < 10) return 3;
    if (seconds < 14) return 4;
    if (seconds < 18) return 5;
    if (seconds < 22) return 6;
    if (seconds < 25) return 7;
    return 8;
  };

  const activeScene = getActiveScene();

  const sceneLabels = [
    { num: 1, start: 0, title: isAr ? "إنشاء المتجر" : "Store Creation", range: "0-3s" },
    { num: 2, start: 3, title: isAr ? "إدارة المنتجات" : "Product Management", range: "3-6s" },
    { num: 3, start: 6, title: isAr ? "مزامنة نقاط البيع" : "Multi-POS Sync", range: "6-10s" },
    { num: 4, start: 10, title: isAr ? "لوحة الإدارة" : "Admin Dashboard", range: "10-14s" },
    { num: 5, start: 14, title: isAr ? "المدفوعات والضمان" : "Payment & Escrow", range: "14-18s" },
    { num: 6, start: 18, title: isAr ? "تكامل الشحن" : "Shipping & Carriers", range: "18-22s" },
    { num: 7, start: 22, title: isAr ? "التحويل ثنائي اللغة" : "Bilingual Mode", range: "22-25s" },
    { num: 8, start: 25, title: isAr ? "النظام الموحد" : "Unified Ecosystem", range: "25-30s" },
  ];

  const handleJumpToScene = (startSec: number) => {
    setSeconds(startSec);
  };

  // Progress percentage
  const progressPercent = Math.min(100, (seconds / 30) * 100);

  // Formatted timer
  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="relative w-full max-w-[1140px] mx-auto mt-10 sm:mt-14 font-ui select-none">
      {/* ─── Blue Atmospheric Wash Ambient Aura ─── */}
      <div
        className="absolute -top-16 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-full max-w-[900px] h-[340px] pointer-events-none blur-3xl opacity-35"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(4, 121, 232, 0.45) 0%, rgba(0, 131, 254, 0.22) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Terminal Window Enclosure ─── */}
      <div className="relative rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
        {/* Terminal Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-terminal-bar)]">
          {/* Left: Window Dots & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-[var(--color-status-red)]/80" />
              <span className="w-3 h-3 rounded-full bg-[var(--color-status-amber)]/80" />
              <span className="w-3 h-3 rounded-full bg-[var(--color-status-green)]/80" />
            </div>
            <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
              <span className="text-xs font-ui font-medium text-[var(--color-text-primary)]">
                {isAr ? "محاكاة النظام: منصة واحدة، إمكانيات لا محدودة" : "Live Simulation: One Platform, Infinite Possibilities"}
              </span>
            </div>
          </div>

          {/* Right: Controls & Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-2.5 py-1 rounded-[6px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-[11px] font-ui font-semibold text-[var(--color-text-secondary)]">
              {formatTime(seconds)} / 00:30.0
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setSeconds(0)}
              className="p-1.5 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Timeline Progress Playhead ─── */}
        <div className="w-full h-1 bg-[var(--color-border-subtle)] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-primary-light)] to-[var(--color-status-green)] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ─── Interactive Scene Selector Chips ─── */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 overflow-x-auto scrollbar-none border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/60 text-xs">
          {sceneLabels.map((sc) => {
            const isCurrent = activeScene === sc.num;
            return (
              <button
                key={sc.num}
                type="button"
                onClick={() => handleJumpToScene(sc.start)}
                className={`px-3 py-1 rounded-[8px] shrink-0 font-ui text-xs transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white font-semibold shadow-md shadow-[var(--color-primary-dark)]/30 scale-[1.02]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <span className="text-[10px] opacity-80 font-mono">[{sc.range}]</span>
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Main Animated Stage (Min-Height 420px) ─── */}
        <div className="relative min-h-[460px] sm:min-h-[500px] p-5 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-transparent to-[rgba(4,121,232,0.03)]">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════════════
                SCENE 1: STORE CREATION (0-3s)
                Split screen: Admin mobile on left, Desktop storefront appearing on right
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 1 && (
              <motion.div
                key="scene1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Scene Headline Overlay */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 1: إنشاء المتجر (0-3ث)" : "Scene 1: Store Creation (0-3s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "أطلق متجرك في ثوانٍ معدودة" : "Launch Your Store in Seconds"}
                    </h3>
                  </div>
                  <div className="status-pill-badge">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                    <span>{isAr ? "قالب فوري متزامن" : "Instant Materialization"}</span>
                  </div>
                </div>

                {/* Split Screen View */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                  {/* Left: Mobile Phone Mockup (Admin) */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="w-[220px] rounded-[24px] border-2 border-[var(--color-border)] bg-[var(--color-canvas)] p-3 shadow-xl relative overflow-hidden">
                      {/* Notch */}
                      <div className="w-20 h-3 rounded-full bg-[var(--color-border)] mx-auto mb-3" />
                      <div className="text-[10px] text-center text-[var(--color-text-muted)] mb-2 font-mono">
                        ADMIN MOBILE APP
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">Store Name:</span>
                          <div className="font-semibold text-white">Apex Luxury Store</div>
                        </div>
                        <div className="p-2 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">Theme:</span>
                          <div className="font-semibold text-[var(--color-primary-light)]">Dark Obsidian Terminal</div>
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-full py-2 rounded-[8px] bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-center font-bold text-xs shadow-md shadow-[var(--color-primary-dark)]/30"
                        >
                          ✓ Tapped: Create New Store
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden md:flex md:col-span-1 justify-center">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="text-[var(--color-primary-light)]"
                    >
                      <ArrowRight className="w-6 h-6 rtl:rotate-180" />
                    </motion.div>
                  </div>

                  {/* Right: Desktop Window Mockup (Storefront Appearing Live) */}
                  <div className="md:col-span-7">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="rounded-[16px] border border-[var(--color-primary-dark)]/40 bg-[var(--color-surface-elevated)] p-4 sm:p-5 shadow-2xl relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs pb-3 mb-3 border-b border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-mint)]" />
                          <span className="font-mono text-white font-bold">apex.matager.com</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] font-bold">
                          LIVE STOREFRONT
                        </span>
                      </div>

                      {/* Storefront Materializing Elements */}
                      <div className="space-y-3">
                        <div className="h-20 rounded-[10px] bg-gradient-to-r from-[var(--color-primary-dark)]/15 to-[var(--color-primary-light)]/10 border border-[var(--color-primary-dark)]/30 flex items-center justify-between px-4">
                          <div>
                            <div className="text-sm font-bold text-white">Apex Luxury Collection</div>
                            <div className="text-xs text-[var(--color-text-secondary)]">Spring / Summer Drops</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-white text-black text-[11px] font-bold">
                            Explore
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((item) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + item * 0.1 }}
                              className="p-2.5 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-center space-y-1"
                            >
                              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)]/15 mx-auto flex items-center justify-center text-[var(--color-primary-light)]">
                                <Store className="w-4 h-4" />
                              </div>
                              <div className="text-[11px] font-semibold text-white">Product {item}</div>
                              <div className="text-[10px] text-[var(--color-accent-mint)] font-mono">$120.00</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 2: PRODUCT MANAGEMENT (3-6s)
                Admin dashboard + 3 glowing channel toggle buttons + flow animation
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 2 && (
              <motion.div
                key="scene2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 2: إدارة المنتجات (3-6ث)" : "Scene 2: Product Management (3-6s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "منتج واحد، في كل قنوات البيع" : "One Product, Every Channel"}
                    </h3>
                  </div>
                  <div className="status-pill-badge">
                    <Layers className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                    <span>{isAr ? "نشر متزامن فوري" : "Multi-Channel Broadcast"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Product Form in Admin Dashboard */}
                  <div className="md:col-span-5 p-4 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border-subtle)]">
                      <span className="font-semibold text-white">Add New Product Form</span>
                      <span className="text-[10px] text-[var(--color-accent-mint)] font-bold">● Auto-filled</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">Product Title</span>
                        <div className="input-theme-gradient px-3 py-1.5 rounded-[8px] text-xs font-medium">
                          Pro ANC Wireless Headphones
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">Price</span>
                          <div className="input-theme-gradient px-3 py-1.5 rounded-[8px] text-xs font-mono font-bold text-[var(--color-status-green)]">
                            $189.00
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">Stock</span>
                          <div className="input-theme-gradient px-3 py-1.5 rounded-[8px] text-xs font-mono">
                            48 units
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Glowing Toggle Buttons Spotlight */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-white block mb-1.5">
                        {isAr ? "قنوات العرض المتزامنة:" : "Select Publishing Channels:"}
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-2 rounded-[8px] bg-gradient-to-b from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 border border-[var(--color-primary-dark)] text-white text-[11px] font-bold shadow-md shadow-[var(--color-primary-dark)]/20">
                          🌐 Website <span className="block text-[9px] text-[var(--color-status-green)]">ON ✓</span>
                        </div>
                        <div className="p-2 rounded-[8px] bg-gradient-to-b from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 border border-[var(--color-primary-dark)] text-white text-[11px] font-bold shadow-md shadow-[var(--color-primary-dark)]/20">
                          💳 POS <span className="block text-[9px] text-[var(--color-status-green)]">ON ✓</span>
                        </div>
                        <div className="p-2 rounded-[8px] bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-[11px] font-bold shadow-lg shadow-[var(--color-primary-dark)]/40 ring-2 ring-white/20">
                          📱 Both <span className="block text-[9px] text-white/90">SELECTED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden md:flex md:col-span-1 justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-[var(--color-primary-light)]"
                    >
                      <ArrowRight className="w-6 h-6 rtl:rotate-180" />
                    </motion.div>
                  </div>

                  {/* Right: Flowing to 3 Destinations */}
                  <div className="md:col-span-6 space-y-2.5">
                    {[
                      { icon: Globe, name: "Website Storefront", desc: "Live on apex.matager.com with instant checkout", badge: "Online" },
                      { icon: CreditCard, name: "POS Cashier Terminal", desc: "Synced to barcode scanners & thermal printers", badge: "Retail" },
                      { icon: Smartphone, name: "Mobile Shopping App", desc: "Push notification alert dispatched to VIP members", badge: "Mobile" },
                    ].map((dest, i) => {
                      const Icon = dest.icon;
                      return (
                        <motion.div
                          key={dest.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="p-3.5 rounded-[12px] bg-[var(--color-surface)] border border-[rgba(4,121,232,0.35)] flex items-center justify-between shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] flex items-center justify-center font-bold">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{dest.name}</div>
                              <div className="text-[11px] text-[var(--color-text-secondary)]">{dest.desc}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-accent-mint)]/15 text-[var(--color-accent-mint)] font-mono font-bold">
                            ✓ SYNCED
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 3: MULTI-POS SYNCHRONIZATION (6-10s)
                5 POS terminals sequence connected to Central Inventory + wave
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 3 && (
              <motion.div
                key="scene3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 3: مزامنة نقاط البيع (6-10ث)" : "Scene 3: Multi-POS Synchronization (6-10s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "جميع نقاط البيع. حقيقة واحدة متزامنة." : "All Terminals. One Truth."}
                    </h3>
                  </div>
                  <div className="status-pill-badge bg-[var(--color-accent-mint)]/10 text-[var(--color-accent-mint)] border-[var(--color-accent-mint)]/30">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-mint)] animate-ping" />
                    <span>Live Stock Drop: 48 → 47</span>
                  </div>
                </div>

                {/* 5 POS Terminals Diagram */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { id: "POS 1", name: "Flagship", soldHere: true },
                      { id: "POS 2", name: "Mall Branch", soldHere: false },
                      { id: "POS 3", name: "Express", soldHere: false },
                      { id: "POS 4", name: "Drive-Thru", soldHere: false },
                      { id: "POS 5", name: "Pop-Up", soldHere: false },
                    ].map((pos, idx) => (
                      <motion.div
                        key={pos.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-3 rounded-[12px] border relative overflow-hidden text-center transition-all ${
                          pos.soldHere
                            ? "bg-[rgba(4,121,232,0.18)] border-[var(--color-primary-light)] ring-2 ring-[var(--color-primary-light)]/40 shadow-lg shadow-[var(--color-primary-dark)]/30"
                            : "bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                        }`}
                      >
                        {pos.soldHere && (
                          <span className="absolute top-1 end-1 px-1.5 py-0.2 rounded text-[8px] bg-[var(--color-accent-mint)] text-black font-bold">
                            SALE!
                          </span>
                        )}
                        <div className="text-[11px] font-bold text-white">{pos.id}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">{pos.name}</div>

                        {/* Animated Counter */}
                        <div className="mt-2 py-1 px-2 rounded-[6px] bg-[var(--color-canvas)] border border-[var(--color-border-subtle)]">
                          <span className="text-[10px] text-[var(--color-text-muted)] block">Stock:</span>
                          <span className="text-sm font-mono font-bold text-[var(--color-accent-mint)]">
                            47 units
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Connecting Network Bus */}
                  <div className="relative py-2 text-center">
                    <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-status-green)] to-[var(--color-primary-dark)] opacity-60" />
                    <span className="relative -top-3 px-3 py-0.5 rounded-full bg-[var(--color-canvas)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-secondary)]">
                      ⚡ ZERO-LATENCY WEBSOCKET EVENT BUS (12ms)
                    </span>
                  </div>

                  {/* Central Inventory Node */}
                  <div className="p-4 rounded-[14px] bg-gradient-to-r from-[rgba(4,121,232,0.12)] to-[rgba(63,203,127,0.12)] border border-[var(--color-primary-dark)]/40 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white flex items-center justify-center font-bold shadow-md">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">CENTRAL INVENTORY ENGINE</div>
                        <div className="text-[11px] text-[var(--color-text-secondary)]">
                          Atomic lock applied instantly — Prevented 0 oversells across 5 physical branches
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-[11px] text-[var(--color-text-muted)]">Global Ledger:</div>
                      <div className="text-sm font-mono font-bold text-white">47 / 48 Reserved</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 4: ADMIN DASHBOARD CONTROL (10-14s)
                Multi-device view + sales graph + real-time alerts
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 4 && (
              <motion.div
                key="scene4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 4: لوحة الإدارة الذكية (10-14ث)" : "Scene 4: Admin Dashboard Control (10-14s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "مركز قيادة متكامل في جيبك" : "Command Center in Your Pocket"}
                    </h3>
                  </div>
                  <div className="status-pill-badge">
                    <Activity className="w-3.5 h-3.5 text-[var(--color-status-green)]" />
                    <span>Real-time Telemetry</span>
                  </div>
                </div>

                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Sales Today</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">$12,847.00 ↑</div>
                    <span className="text-[10px] text-[var(--color-accent-mint)] font-mono">+18.4% vs yesterday</span>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Active Orders</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">23 Live Orders</div>
                    <span className="text-[10px] text-[var(--color-primary-light)] font-mono">100% processed on time</span>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Low Stock Alerts</span>
                    <div className="text-xl font-bold font-mono text-[var(--color-status-amber)] mt-1">4 Items</div>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Auto PO drafted</span>
                  </div>
                </div>

                {/* Live Sales Graph Canvas */}
                <div className="p-4 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-dark)]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Live Revenue Velocity (Last 24 Hours)</span>
                    <span className="text-[10px] text-[var(--color-accent-mint)] font-mono">● Active Streaming</span>
                  </div>
                  <div className="w-full h-[90px] relative">
                    <svg viewBox="0 0 700 90" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sc4Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary-dark)" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="var(--color-primary-light)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon points="0,75 50,70 120,65 180,50 250,55 320,40 400,45 480,30 560,25 640,15 700,8 700,90 0,90" fill="url(#sc4Grad)" />
                      <polyline
                        points="0,75 50,70 120,65 180,50 250,55 320,40 400,45 480,30 560,25 640,15 700,8"
                        fill="none"
                        stroke="var(--color-primary-light)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="700" cy="8" r="5" fill="var(--color-status-green)" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 5: PAYMENT & ORDER FLOW (14-18s)
                Escrow protection + instant merchant payout notification
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 5 && (
              <motion.div
                key="scene5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 5: الدفع والضمان البنكي (14-18ث)" : "Scene 5: Payment & Escrow Flow (14-18s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "مدفوعات محمية. معاملات مضمونة." : "Protected Payments. Trusted Transactions."}
                    </h3>
                  </div>
                  <div className="status-pill-badge bg-[var(--color-accent-mint)]/10 text-[var(--color-accent-mint)] border-[var(--color-accent-mint)]/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-mint)]" />
                    <span>Zero Fraud Risk Guarantee</span>
                  </div>
                </div>

                {/* Flow Step Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {[
                    { step: "1. Options", desc: "Mada, Apple Pay, Visa selected by customer" },
                    { step: "2. Authorized", desc: "Biometric 3DS2 passed instantly" },
                    { step: "3. Escrow Held", desc: "Funds held securely in Matager Escrow" },
                    { step: "4. Released", desc: "Admin accepted -> 100% instant payout" },
                  ].map((st, i) => (
                    <div
                      key={st.step}
                      className="p-3 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-primary-dark)]/30 space-y-1"
                    >
                      <div className="text-[11px] font-bold text-[var(--color-primary-light)]">{st.step}</div>
                      <div className="text-[10px] text-[var(--color-text-secondary)]">{st.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Split Moment: Customer Screen vs Admin Screen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">
                      CUSTOMER CHECKOUT VIEW
                    </span>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-mint)]" />
                      <div>
                        <div className="text-xs font-bold">Order Confirmed #MTG-9421</div>
                        <div className="text-[11px] text-[var(--color-text-secondary)]">Payment Authorized via Apple Pay</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-primary-dark)]/40 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">
                      STORE OWNER VIEW
                    </span>
                    <div className="flex items-center gap-2.5 text-white">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] flex items-center justify-center text-xs font-bold">
                        $
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--color-accent-mint)]">Payment Released to Merchant</div>
                        <div className="text-[11px] text-[var(--color-text-secondary)]">Net $189.00 available in instant wallet</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 6: SHIPPING INTEGRATION (18-22s)
                Carrier selection + auto label print + live doorstep route
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 6 && (
              <motion.div
                key="scene6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 6: تكامل الشحن واللوجستيات (18-22ث)" : "Scene 6: Shipping Integration (18-22s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "من المتجر إلى باب العميل" : "From Store to Doorstep"}
                    </h3>
                  </div>
                  <div className="status-pill-badge">
                    <Truck className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                    <span>Auto-Waybill Generated</span>
                  </div>
                </div>

                {/* Carriers Badges */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold font-mono">
                  {[
                    { name: "DHL Express", color: "var(--color-status-amber)", active: false },
                    { name: "SMSA Express", color: "var(--color-status-orange)", active: true },
                    { name: "Aramex Global", color: "var(--color-status-red)", active: false },
                    { name: "FedEx Priority", color: "var(--color-status-purple)", active: false },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className={`p-2.5 rounded-[10px] border transition-all ${
                        c.active
                          ? "bg-[rgba(4,121,232,0.18)] border-[var(--color-primary-light)] text-white ring-1 ring-[var(--color-primary-light)]"
                          : "bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <span>{c.name}</span>
                      {c.active && <span className="block text-[9px] text-[var(--color-status-green)]">SELECTED ✓</span>}
                    </div>
                  ))}
                </div>

                {/* Animated Delivery Route Stepper */}
                <div className="p-4 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Tracking: #SMSA-9812-4412-KSA</span>
                    <span className="text-[var(--color-accent-mint)] font-mono font-bold">Status: Out for Delivery</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 relative text-center text-[11px]">
                    {[
                      { label: "Processing", done: true },
                      { label: "Shipped", done: true },
                      { label: "Out for Delivery", done: true, pulse: true },
                      { label: "Delivered", done: false },
                    ].map((step, idx) => (
                      <div key={step.label} className="space-y-1">
                        <div
                          className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.done
                              ? "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white"
                              : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                          } ${step.pulse ? "ring-4 ring-[var(--color-primary-light)]/30 animate-pulse" : ""}`}
                        >
                          {step.done ? "✓" : idx + 1}
                        </div>
                        <span className={step.done ? "text-white font-semibold" : "text-[var(--color-text-muted)]"}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCENE 7: BILINGUAL MODE TOGGLE (22-25s)
                Live flip EN ⇄ AR, RTL flip, currency morph $ ⇄ ر.س
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 7 && (
              <motion.div
                key="scene7"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                      {isAr ? "المشهد 7: التحويل ثنائي اللغة (22-25ث)" : "Scene 7: Bilingual Mode Toggle (22-25s)"}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mt-0.5">
                      {isAr ? "تحدث بلغة عملائك بضغطة واحدة" : "Speak Your Customer's Language"}
                    </h3>
                  </div>
                  <div className="status-pill-badge bg-gradient-to-r from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] border-[var(--color-primary-dark)]/40">
                    <Languages className="w-3.5 h-3.5" />
                    <span>🇺🇸 English ⇄ 🇸🇦 العربية</span>
                  </div>
                </div>

                {/* Animated Morph Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: English LTR */}
                  <div className="p-4 rounded-[14px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2 text-left" dir="ltr">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--color-border-subtle)]">
                      <span className="font-bold text-white">🇺🇸 ENGLISH (LTR)</span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)]">Josefin & Poiret</span>
                    </div>
                    <div className="text-sm font-bold text-white">Unified POS & Online Storefront</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Zero setup fees. Instant payouts.</div>
                    <div className="text-base font-bold font-mono text-[var(--color-accent-mint)]">$1,482.00 USD</div>
                  </div>

                  {/* Right: Arabic RTL */}
                  <div className="p-4 rounded-[14px] bg-gradient-to-br from-[rgba(4,121,232,0.15)] to-transparent border border-[var(--color-primary-dark)]/50 space-y-2 text-right" dir="rtl">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--color-border-subtle)]">
                      <span className="font-bold text-white">🇸🇦 العربية (RTL)</span>
                      <span className="font-mono text-[10px] text-[var(--color-primary-light)]">Reem Kufi & Fustat</span>
                    </div>
                    <div className="text-sm font-bold text-white">متجر إلكتروني ونقاط بيع موحدة</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">بدون عمولات خفية. تسوية فورية.</div>
                    <div className="text-base font-bold font-mono text-[var(--color-accent-mint)]">٥,٥٥٠.٠٠ ر.س</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                FINAL SCENE: UNIFIED ECOSYSTEM (25-30s)
                All modules converge into Matager Logo + Complete Ecosystem
                ══════════════════════════════════════════════════════════════════ */}
            {activeScene === 8 && (
              <motion.div
                key="scene8"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="py-4 text-center space-y-5"
              >
                {/* Converging Elements Icon Grid Flying Together */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[var(--color-primary-light)]/40"
                  />
                  <div className="w-20 h-20 rounded-[20px] bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] shadow-2xl shadow-[var(--color-primary-dark)]/50 flex items-center justify-center p-3 animate-pulse">
                    <img
                      src="/app-icon.png"
                      alt="Matager"
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-w-[680px] mx-auto">
                  <span className="text-xs font-ui uppercase tracking-wider text-gradient-primary font-bold">
                    {isAr ? "المنصة الشاملة المتكاملة" : "One Platform, Infinite Possibilities"}
                  </span>
                  <h3 className="font-heading text-3xl sm:text-4xl font-normal text-white">
                    {isAr ? "متاجر — منظومة التجارة الكاملة" : "Matager — Complete Commerce Ecosystem"}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
                    {isAr
                      ? "أنشئ. بِع. أدر. كل شيء في منصة سحابية واحدة."
                      : "Create. Sell. Manage. All in One."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[var(--color-text-muted)]">
                  <span>Store Creation</span> • <span>Multi-POS</span> • <span>Analytics</span> • <span>Escrow</span> • <span>Carriers</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Terminal Status Bar */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-light)]" />
              <span>Matager Engine v4.2.0 • Synchronized Worldwide</span>
            </div>
            <div className="font-mono text-[11px] text-[var(--color-accent-mint)]">
              99.99% Guaranteed SLA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
