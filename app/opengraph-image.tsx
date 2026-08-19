import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Shivam Gupta — AI & Automation Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card people see when the site is shared in Slack, LinkedIn or X. */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* ambient glows, echoing the hero */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(124,58,237,0.34), rgba(124,58,237,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(37,99,235,0.28), rgba(37,99,235,0))",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 34 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            SG
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Shivam Gupta</div>
        </div>

        <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2.2 }}>
          AI &amp; Automation
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -2.2,
            background: "linear-gradient(90deg,#a78bfa,#60a5fa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Engineer
        </div>

        <div style={{ fontSize: 27, color: "#a3a3a3", marginTop: 26, maxWidth: 900 }}>
          Ten automations running in production, retrieval-grounded agents, and the
          platforms underneath them.
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["n8n", "RAG", "Next.js", "Supabase", "PostgreSQL"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "1px solid rgba(250,250,250,0.18)",
                borderRadius: 9999,
                padding: "9px 20px",
                fontSize: 20,
                color: "#d4d4d4",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 44, right: 80, fontSize: 22, color: "#7c7c7c" }}>
          shivamg.in
        </div>
      </div>
    ),
    size
  );
}
