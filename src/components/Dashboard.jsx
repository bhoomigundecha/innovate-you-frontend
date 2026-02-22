import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import SafetyModal from "./SafetyModal";

const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("innovateYou_user");
    if (stored) return JSON.parse(stored);
  } catch (_) { }
  return { name: "Friend" };
};

const MOOD_POINTS = [35, 30, 45, 60, 78, 65, 50];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const SIDE_MENU_BARS = [
  { label: "Depressive Disorder", value: 48, color: "bg-blue-500" },
  { label: "Trauma Markers", value: 33, color: "bg-blue-500/80" },
  { label: "Eating Disorders", value: 27, color: "bg-blue-500/60" },
  { label: "Drug Abuse", value: 40, color: "bg-blue-500/90" },
];

// Default data constants
const DEFAULT_REPORT = {
  phq9: { score: 12, maxScore: 27, level: "MOD", change: "+2%" },
  gad7: { score: 8, maxScore: 21, level: "MILD", change: "-5%" },
  moodPoints: MOOD_POINTS,
  moodLabel: "Neutral",
  wellnessScore: 78,
  wellnessChange: "+5%",
  diagnosticBars: SIDE_MENU_BARS,
  lastActivity: new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }),
  earlyIntervention: {
    summary: "Based on today's assessment, we've curated prioritized support for you.",
    resources: [
      { label: "Crisis Support Plan", url: "#" },
      { label: "Specialized Resources", url: "#" }
    ],
    cta: { label: "Book a Specialist", url: "#" }
  },
  interventions: [
    { title: "Guided Deep Breathing", description: "5-minute calm session", icon: "🌬" },
    { title: "Log Your Mood", description: "Daily journal entry", icon: "📝" }
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser);
  const [reportData, setReportData] = useState(DEFAULT_REPORT);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Read report passed from WorldScene via navigation state and transform it
  useEffect(() => {
    const report = location.state?.report;
    console.log("[Dashboard] 📥 Received report state:", report);
    if (!report) return;

    // Map backend structure → dashboard structure
    const transformed = {};

    // User name override
    if (report.user?.name) {
      try {
        const existing = JSON.parse(localStorage.getItem("innovateYou_user") || "{}");
        localStorage.setItem("innovateYou_user", JSON.stringify({ ...existing, name: report.user.name }));
      } catch (_) { }
    }

    // PHQ-9
    if (report.assessments?.phq9) {
      const p = report.assessments.phq9;
      transformed.phq9 = {
        score: p.score ?? 0,
        maxScore: 27,
        level: (p.severity || "None").toUpperCase().slice(0, 4),
        change: p.change_percentage != null ? `${p.change_percentage > 0 ? "+" : ""}${p.change_percentage}%` : "0%",
      };
    }

    // GAD-7
    if (report.assessments?.gad7) {
      const g = report.assessments.gad7;
      transformed.gad7 = {
        score: g.score ?? 0,
        maxScore: 21,
        level: (g.severity || "None").toUpperCase().slice(0, 4),
        change: g.change_percentage != null ? `${g.change_percentage > 0 ? "+" : ""}${g.change_percentage}%` : "0%",
      };
    }

    // Mood trajectory → moodPoints (array of numbers 0-100)
    if (report.mood_trajectory) {
      if (report.mood_trajectory.data) {
        transformed.moodPoints = report.mood_trajectory.data.map((d) =>
          typeof d === "number" ? d : (d?.value ?? 50)
        );
      }
      if (report.mood_trajectory.average_label) {
        transformed.moodLabel = report.mood_trajectory.average_label.charAt(0).toUpperCase() + report.mood_trajectory.average_label.slice(1);
      }
    }

    // Early Intervention
    if (report.early_intervention) {
      transformed.earlyIntervention = {
        summary: report.early_intervention.summary,
        resources: report.early_intervention.resources?.map(r => ({
          label: r.label || r.title || "Resource",
          url: r.url || r.action_url || "#"
        })) || [],
        cta: {
          label: report.early_intervention.cta?.label || "Get Help",
          url: report.early_intervention.cta?.url || "#"
        }
      };
    }

    // Interventions
    if (report.interventions && Array.isArray(report.interventions)) {
      transformed.interventions = report.interventions.map(i => ({
        title: i.title || i.name || "Intervention",
        description: i.description || "Personalized wellness activity",
        icon: i.icon || "✨",
        url: i.action_url || "#"
      }));
    }

    // Diagnostic markers → diagnosticBars
    if (report.diagnostic_markers) {
      const COLORS = ["bg-blue-500", "bg-blue-500/80", "bg-blue-500/60", "bg-blue-500/90"];
      transformed.diagnosticBars = report.diagnostic_markers.map((m, i) => ({
        label: m.label || m.name || m.type || `Marker ${i + 1}`,
        value: m.value ?? m.score ?? 0,
        color: COLORS[i % COLORS.length],
      }));
    }

    // Session last activity
    if (report.session?.last_activity) {
      try {
        transformed.lastActivity = new Date(report.session.last_activity).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      } catch (_) { }
    }

    console.log("[Dashboard] 🛠 Transformed data:", transformed);
    setReportData((prev) => ({ ...prev, ...transformed }));
  }, [location.state]);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const displayName = user?.name || "Friend";
  const firstName = displayName.split(" ")[0] || displayName;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header — dark, Soulbot style */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold">
            {firstName[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Soulbot Intelligence
            </p>
            <p className="text-base font-semibold text-white">Hi, {firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Safety SOS Button */}
          <button
            onClick={() => setIsSafetyModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all active:scale-95 mr-2"
          >
            <span className="text-[10px] font-black uppercase tracking-tighter">SOS</span>
          </button>

          <button
            type="button"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/")}
            className="ml-2 text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Back to home
          </button>
        </div>
      </header>

      {/* Severe Alert Banner */}
      {(reportData.phq9.score > 20 || reportData.gad7.score > 15) && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center justify-center gap-3 animate-pulse">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-bold text-red-400">
            Your scores indicate severe distress. Please consider reaching out for support via the SOS button.
          </p>
        </div>
      )}

      <div className="flex gap-6 p-6 max-w-6xl mx-auto justify-center">
        <main className="flex-1 min-w-0 max-w-2xl">
          {/* Greeting + Session status */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Great conversation, Proud of you {firstName}!
              </h2>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                SESSION COMPLETE
              </span>
              <p className="text-sm text-zinc-500">
                Last activity: Today,{" "}
                {reportData.lastActivity}
              </p>
              <p className="text-sm text-blue-400 font-medium">
                Status: Making Progress
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {firstName[0].toUpperCase()}
            </div>
          </div>

          {/* PHQ-9 & GAD-7 — dark cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-zinc-400">PHQ-9</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {reportData.phq9.level}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mt-2">
                {reportData.phq9.score}<span className="text-lg font-normal text-zinc-500">/{reportData.phq9.maxScore}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">Depression index</p>
              <p className="text-xs text-emerald-400 mt-1">{reportData.phq9.change} from last week</p>
            </div>
            <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-zinc-400">GAD-7</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {reportData.gad7.level}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mt-2">
                {reportData.gad7.score}<span className="text-lg font-normal text-zinc-500">/{reportData.gad7.maxScore}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">Anxiety index</p>
              <p className="text-xs text-emerald-400 mt-1">{reportData.gad7.change} from last week</p>
            </div>
          </div>

          {/* 7-Day Mood Trajectory — dark card */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Mood Trends
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-zinc-500 uppercase">{reportData.moodLabel || "AVERAGE MOOD"}</span>
              </div>
            </div>
            <div className="h-44">
              <svg
                viewBox="0 0 400 100"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#moodFill)"
                  d={`M 0,${100 - reportData.moodPoints[0]} ${reportData.moodPoints.map(
                    (v, i) =>
                      `L ${(i / (DAYS.length - 1)) * 400},${100 - v}`
                  ).join(" ")} L 400,100 L 0,100 Z`}
                />
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={reportData.moodPoints.map(
                    (v, i) =>
                      `${(i / (DAYS.length - 1)) * 400},${100 - v}`
                  ).join(" ")}
                />
                {reportData.moodPoints.map((v, i) => (
                  <circle
                    key={i}
                    cx={(i / (DAYS.length - 1)) * 400}
                    cy={100 - v}
                    r="4"
                    fill="#3b82f6"
                  />
                ))}
              </svg>
            </div>
            <div className="flex justify-between mt-2">
              {DAYS.map((day) => (
                <span
                  key={day}
                  className="text-[10px] text-zinc-500 flex-1 text-center"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Intervention & Early Intervention — dark cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Intervention & Wellness
              </h3>
              <div className="space-y-3">
                {reportData.interventions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => item.url && window.open(item.url, '_blank')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 text-left transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                    </span>
                    <span className="text-zinc-500">→</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-2">
                Early Intervention
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                {reportData.earlyIntervention.summary}
              </p>
              <div className="space-y-2 mb-4">
                {reportData.earlyIntervention.resources.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => res.url && window.open(res.url, '_blank')}
                    className="w-full flex items-center justify-between py-2.5 px-3 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {idx === 0 ? '❄' : '✚'} {res.label}
                    </span>
                    <span className="text-zinc-500">↗</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => reportData.earlyIntervention.cta.url && window.open(reportData.earlyIntervention.cta.url, '_blank')}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
              >
                {reportData.earlyIntervention.cta.label}
              </button>
            </div>
          </div>
        </main>

        {/* Side menu — circular score + bar chart */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-6 sticky top-20 self-start">
          {/* Emotional Wellness Score — hero circular */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{reportData.wellnessScore}</span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Wellness
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-emerald-400 text-xs">↑</span>
                <span className="text-emerald-400 text-xs font-medium">{reportData.wellnessChange}</span>
              </div>
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(59,130,246,0.4)"
                  strokeWidth="4"
                  strokeDasharray={`${reportData.wellnessScore * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white mt-4 text-center">
              Emotional Wellness Score
            </p>
            <p className="text-xs text-zinc-500 mt-1 text-center">
              Your mental clarity and emotional stability are trending positively this week.
            </p>
          </div>

          {/* Bar chart */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 flex-1">
            <h4 className="text-xs font-semibold text-blue-400 mb-4 uppercase tracking-wider">
              Diagnostic Overview
            </h4>
            <div className="flex gap-3">
              {reportData.diagnosticBars.map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center min-w-0"
                >
                  <div className="w-full h-28 flex flex-col justify-end">
                    <div
                      className={`w-full max-w-12 mx-auto rounded-t ${color}`}
                      style={{
                        height: `${(value / 48) * 100}%`,
                        minHeight: value > 0 ? "1.5rem" : 0,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 mt-1.5">
                    {value}%
                  </span>
                  <span className="text-[9px] text-zinc-500 text-center leading-tight mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
    </div>
  );
}
