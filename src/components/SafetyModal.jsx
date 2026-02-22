import React, { useState, useEffect } from "react";

/**
 * SafetyModal — A premium, high-visibility crisis intervention component.
 * Provides immediate access to help hotlines and grounding tools.
 */
export default function SafetyModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("hotlines"); // 'hotlines' | 'grounding'
    const [breathtingState, setBreathingState] = useState("Inhale");
    const [breathingProgress, setBreathingProgress] = useState(0);

    // Breathing exercise logic
    useEffect(() => {
        if (activeTab !== "grounding" || !isOpen) return;

        let startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) % 8000;
            if (elapsed < 4000) {
                setBreathingState("Inhale...");
                setBreathingProgress(elapsed / 4000);
            } else {
                setBreathingState("Exhale...");
                setBreathingProgress((elapsed - 4000) / 4000);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [activeTab, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/10">
                {/* Header */}
                <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🆘</span>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-none">Get Help Now</h2>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Safety Escalation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab("hotlines")}
                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "hotlines" ? "text-red-400 border-b-2 border-red-400 bg-red-400/5" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Hotlines
                    </button>
                    <button
                        onClick={() => setActiveTab("grounding")}
                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "grounding" ? "text-blue-400 border-b-2 border-blue-400 bg-blue-400/5" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Grounding
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === "hotlines" ? (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400 mb-2">
                                If you are in immediate danger, call <strong className="text-white">911</strong> (US) or your local emergency services.
                            </p>

                            <a
                                href="tel:988"
                                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 hover:border-red-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">988</div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Suicide & Crisis Lifeline</h3>
                                        <p className="text-xs text-zinc-500">Call or text 24/7</p>
                                    </div>
                                </div>
                                <span className="text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all">→</span>
                            </a>

                            <a
                                href="sms:741741"
                                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 hover:border-red-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold">💬</div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Crisis Text Line</h3>
                                        <p className="text-xs text-zinc-500">Text HOME to 741741</p>
                                    </div>
                                </div>
                                <span className="text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all">→</span>
                            </a>

                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 mt-6">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Remember</h4>
                                <p className="text-xs text-zinc-400 italic">
                                    "You are not alone. There are people who want to support you through this moment."
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 flex flex-col items-center">
                            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                                {/* Breathing Circle */}
                                <div className="absolute inset-0 rounded-full bg-blue-500/10 border-2 border-blue-500/20" />
                                <div
                                    className="absolute rounded-full bg-blue-500/30"
                                    style={{
                                        width: `${40 + (breathingProgress * 60)}%`,
                                        height: `${40 + (breathingProgress * 60)}%`,
                                        transition: 'all 50ms linear'
                                    }}
                                />
                                <span className="relative z-10 text-lg font-bold text-white">{breathtingState}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 text-center">Box Breathing</h3>
                            <p className="text-xs text-zinc-500 text-center max-w-[240px]">
                                Follow the circle. Inhale deep into your belly for 4 seconds, then exhale slowly for 4 seconds.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
