import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Default / demo user; replace with real auth or localStorage when wired
const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("innovateYou_user");
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return { name: "Friend" };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const displayName = user?.name || "Friend";
  const firstName = displayName.split(" ")[0] || displayName;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="overflow-auto">
        {/* Top bar: notifications + avatar + End Conversation area */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <span className="text-lg">🔔</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {firstName[0].toUpperCase()}
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Back to home
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {/* Greeting — personalized */}
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Great conversation, Proud of you {firstName}!
              </h2>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-2">
                SESSION COMPLETE
              </span>
              <p className="text-sm text-gray-500">
                Last activity: Today, {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
              <p className="text-sm text-blue-600 font-medium">Status: Making Progress</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {firstName[0].toUpperCase()}
            </div>
          </div>

          {/* PHQ-9 & GAD-7 row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">PHQ-9 (Depression)</span>
                <span className="text-gray-400">📊</span>
              </div>
              <p className="text-3xl font-bold text-orange-500 mt-2">12</p>
              <p className="text-sm font-medium text-orange-500">Moderate Severity</p>
              <p className="text-xs text-gray-500 mt-1">+2% from last week</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">GAD-7 (Anxiety)</span>
                <span className="text-gray-400">?</span>
              </div>
              <p className="text-3xl font-bold text-blue-500 mt-2">8</p>
              <p className="text-sm font-medium text-blue-500">Mild Severity</p>
              <p className="text-xs text-gray-500 mt-1">-5% from last week</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <span className="text-sm font-medium text-gray-500">Diagnostic Markers</span>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Depressive Disorder 45%</li>
                <li>Trauma Markers 12%</li>
                <li>Eating Patterns 28%</li>
                <li>Substance Use 5%</li>
              </ul>
              <p className="text-xs text-gray-400 mt-2">
                Markers based on cognitive and behavioral session analysis.
              </p>
            </div>
          </div>

          {/* 7-Day Mood Trajectory */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">7-Day Mood Trajectory</h3>
            <div className="h-40 flex items-end gap-2">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t bg-blue-100 min-h-[20px]"
                    style={{
                      height: `${30 + Math.sin(i * 0.8) * 25 + (i * 4)}%`,
                    }}
                  />
                  <span className="text-[10px] text-gray-500 mt-2">{day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">● Average mood</p>
          </div>

          {/* Intervention & Early Intervention row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Intervention & Wellness</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-left shadow-sm">
                  <span className="flex items-center gap-3">
                    <span className="text-xl">🌬</span>
                    <div>
                      <p className="font-medium text-gray-900">Guided Deep Breathing</p>
                      <p className="text-xs text-gray-500">5-minute calm session</p>
                    </div>
                  </span>
                  <span className="text-gray-400">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-left shadow-sm">
                  <span className="flex items-center gap-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <p className="font-medium text-gray-900">Log Your Mood</p>
                      <p className="text-xs text-gray-500">Daily journal entry</p>
                    </div>
                  </span>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Early Intervention</h3>
              <p className="text-xs text-gray-500 mb-4">
                Based on today&apos;s PHQ-9 score, we&apos;ve curated prioritized support for you.
              </p>
              <div className="space-y-2 mb-4">
                <button className="w-full flex items-center justify-between py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-3">
                  <span className="flex items-center gap-2">❄ Crisis Support Plan</span>
                  <span className="text-gray-400">↗</span>
                </button>
                <button className="w-full flex items-center justify-between py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-3">
                  <span className="flex items-center gap-2">✚ Specialized Resources</span>
                  <span className="text-gray-400">↗</span>
                </button>
              </div>
              <button className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600">
                Book a Specialist
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
