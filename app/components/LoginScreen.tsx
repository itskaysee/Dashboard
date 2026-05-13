"use client";
import { signIn } from "next-auth/react";

export default function LoginScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: "#fdf8f4" }}
    >
      {/* Background orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-10%",
          left: "-5%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,116,138,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-15%",
          right: "-5%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,162,97,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        {/* Logo / title */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              color: "#292524",
            }}
          >
            Hey Casey{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #e8748a, #f4a261)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ✦
            </span>
          </h1>
          <p style={{ color: "#a8998f", fontSize: "0.95rem" }}>
            Your personal dashboard awaits.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "white",
            border: "1px solid #ede3d9",
            boxShadow: "0 4px 24px rgba(232,116,138,0.08)",
            minWidth: "320px",
          }}
        >
          <div className="text-center">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#292524" }}
            >
              Sign in to sync your data
            </p>
            <p className="text-xs" style={{ color: "#b8998a" }}>
              Your dashboard saves across all your devices
            </p>
          </div>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(232,116,138,0.15), rgba(244,162,97,0.12))",
              border: "1px solid rgba(232,116,138,0.3)",
              color: "#292524",
              boxShadow: "0 2px 8px rgba(232,116,138,0.12)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(232,116,138,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 8px rgba(232,116,138,0.12)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: "#292524" }}
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="text-xs" style={{ color: "#d4c4bb" }}>
          Built just for you ✦
        </p>
      </div>
    </div>
  );
}
