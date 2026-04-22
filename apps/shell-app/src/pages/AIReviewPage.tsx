import { useEffect, useState } from "react";

export default function AIReviewPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load saved code
  useEffect(() => {
    const saved = localStorage.getItem("ai_code");
    if (saved) setCode(saved);
  }, []);

  // ================= AI CALL =================
  const handleReview = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4003/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from backend");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);

      setError(err.message || "API Error");

      setResult({
        summary: "Backend error",
        issues: [],
        suggestions: [],
        citations: [],
        confidence: 0,
      });
    }

    setLoading(false);
  };

  // ================= SAFE GUARDS =================
  const safeResult = result || {};

  const issues = Array.isArray(safeResult.issues) ? safeResult.issues : [];
  const suggestions = Array.isArray(safeResult.suggestions) ? safeResult.suggestions : [];
  const citations = Array.isArray(safeResult.citations) ? safeResult.citations : [];

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Inter, Arial, sans-serif",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <h2 style={{ color: "#1f2937" }}>🧠 AI Code Review</h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* INPUT */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        placeholder="Paste your code here..."
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #d1d5db",
          fontFamily: "monospace",
          background: "#ffffff",
        }}
      />

      {/* BUTTON */}
      <button
        onClick={handleReview}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 10,
          background: loading ? "#9ca3af" : "#395287",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Analyzing..." : "Run AI Review"}
      </button>

      {/* RESULT PANEL */}
      {result && (
        <div style={{ marginTop: 25 }}>

          {/* SUMMARY */}
          <div
            style={{
              background: "#ffffff",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginBottom: 15,
            }}
          >
            <h3>📌 Summary</h3>
            <p>{safeResult.summary || "No summary"}</p>
          </div>

          {/* ISSUES */}
          <div
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginBottom: 15,
            }}
          >
            <h3>⚠️ Issues</h3>

            {issues.length > 0 ? (
              issues.map((i: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: "#fef2f2",
                    marginBottom: 10,
                  }}
                >
                  <p><b>{i.message || i.description || "Issue"}</b></p>

                  {/* SAFE OBJECT BREAKDOWN */}
                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    Rule: {i.rule || "N/A"}
                  </p>

                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    Source: {i.source || "N/A"}
                  </p>

                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    Line: {i.line ?? "N/A"} | Column: {i.column ?? "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <p>No issues</p>
            )}
          </div>

          {/* SUGGESTIONS */}
          <div
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginBottom: 15,
            }}
          >
            <h3>💡 Suggestions</h3>

            {suggestions.length > 0 ? (
              suggestions.map((s: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: "#eff6ff",
                    marginBottom: 10,
                  }}
                >
                  <p>{s.description || s.message || JSON.stringify(s)}</p>
                </div>
              ))
            ) : (
              <p>No suggestions</p>
            )}
          </div>

          {/* CONFIDENCE */}
          <div
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginBottom: 15,
            }}
          >
            <h3>📊 Confidence</h3>
            <p>{safeResult.confidence ?? 0}</p>
          </div>

          {/* CITATIONS */}
          <div
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
            }}
          >
            <h3>📚 Citations</h3>

            {citations.length > 0 ? (
              citations.map((c: any, idx: number) => (
                <p key={idx} style={{ fontSize: 12, color: "#6b7280" }}>
                  {typeof c === "string" ? c : JSON.stringify(c)}
                </p>
              ))
            ) : (
              <p>No citations</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}