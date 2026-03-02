import React, { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// CONFIG — cambia estos valores en tu .env
// VITE_WORKER_URL=https://damp-star-99ba.miguelcamilok.workers.dev
// VITE_STATUS_PASSWORD=clave_para_tu_amigo
// ─────────────────────────────────────────────
const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const STATUS_PASSWORD = import.meta.env.VITE_STATUS_PASSWORD;

const API_BASE = WORKER_URL ? WORKER_URL.replace(/\/$/, "") : "";

// ─── Helpers ───────────────────────────────
function timeAgo(dateStr: string | number | Date) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `hace ${days}d`;
    if (hrs > 0) return `hace ${hrs}h`;
    if (mins > 0) return `hace ${mins}m`;
    return "justo ahora";
}

function statusColor(stage?: string) {
    if (stage === "success") return "#22c55e";
    if (stage === "failure") return "#ef4444";
    if (stage === "active") return "#f59e0b";
    return "#6b7280";
}

function statusLabel(stage?: string) {
    if (stage === "success") return "✓ Exitoso";
    if (stage === "failure") return "✗ Fallido";
    if (stage === "active") return "⟳ En progreso";
    return stage || "Desconocido";
}

// ─── Login Screen ──────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [pw, setPw] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = () => {
        if (pw === STATUS_PASSWORD) {
            sessionStorage.setItem("status_auth", "1");
            onLogin();
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div style={styles.loginWrap}>
            <div style={{ ...styles.loginCard, animation: shake ? "shake 0.4s ease" : "none" }}>
                <div style={styles.logoArea}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect width="36" height="36" rx="10" fill="#16a34a" />
                        <path d="M10 22 L18 10 L26 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <path d="M14 26 H22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <span style={styles.logoText}>AgroFinanzas</span>
                </div>
                <p style={styles.loginSub}>Panel de Deployments</p>
                <input
                    style={{ ...styles.input, borderColor: error ? "#ef4444" : "#2d2d2d" }}
                    type="password"
                    placeholder="Contraseña de acceso"
                    value={pw}
                    onChange={(e: any) => { setPw(e.target.value); setError(false); }}
                    onKeyDown={(e: any) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                />
                {error && <p style={styles.errorMsg}>Contraseña incorrecta</p>}
                <button style={styles.loginBtn} onClick={handleSubmit}>
                    Entrar
                </button>
            </div>
            <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        @keyframes fadeIn {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>
        </div>
    );
}

// ─── Build Log Modal ───────────────────────
function LogModal({ deployment, onClose }: { deployment: any; onClose: () => void }) {
    const [log, setLog] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/deployments/${deployment.id}/history/logs`)
            .then((r) => r.json())
            .then((d: any) => {
                const entries = d.result?.data || [];
                setLog(entries.map((e: any) => `${e.ts}  ${e.line}`).join("\n"));
            })
            .catch(() => setLog("No se pudo cargar el log."))
            .finally(() => setLoading(false));
    }, [deployment.id]);

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div>
                        <span style={styles.modalTitle}>Registro de compilación</span>
                        <span style={{ ...styles.badge, background: statusColor(deployment.latest_stage?.status) + "22", color: statusColor(deployment.latest_stage?.status), marginLeft: 10 }}>
                            {statusLabel(deployment.latest_stage?.status)}
                        </span>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div style={styles.stagesRow}>
                    {(deployment.stages || []).map((s: any) => (
                        <div key={s.name} style={styles.stageChip}>
                            <span style={{ color: statusColor(s.status), marginRight: 4 }}>
                                {s.status === "success" ? "✓" : s.status === "failure" ? "✗" : "·"}
                            </span>
                            <span style={{ color: "#d1d5db", fontSize: 12 }}>{s.name}</span>
                        </div>
                    ))}
                </div>
                <div style={styles.logBox}>
                    {loading ? (
                        <span style={{ color: "#6b7280" }}>Cargando logs...</span>
                    ) : (
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{log}</pre>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
    const [deployments, setDeployments] = useState<any[]>([]);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<any>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [projRes, depRes] = await Promise.all([
                fetch(API_BASE),
                fetch(`${API_BASE}/deployments?per_page=10`),
            ]);
            const [projData, depData] = await Promise.all([projRes.json(), depRes.json()]);
            if (!projData.success) throw new Error(projData.errors?.[0]?.message || "Error API");
            setProject(projData.result);
            setDeployments(depData.result || []);
            setLastRefresh(new Date());
        } catch (e: any) {
            setError(e.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // auto-refresh cada 1 min
        return () => clearInterval(interval);
    }, [fetchData]);

    const latest = deployments[0];

    return (
        <div style={styles.dashWrap}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                        <rect width="36" height="36" rx="10" fill="#16a34a" />
                        <path d="M10 22 L18 10 L26 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <path d="M14 26 H22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <div>
                        <div style={styles.headerTitle}>{project?.name || "Deployments"}</div>
                        {project && (
                            <div style={styles.headerSub}>
                                {project.domains?.slice(0, 2).join(" · ")}
                            </div>
                        )}
                    </div>
                </div>
                <div style={styles.headerRight}>
                    {lastRefresh && (
                        <span style={styles.refreshNote}>
                            Actualizado {timeAgo(lastRefresh.toISOString())}
                        </span>
                    )}
                    <button style={styles.iconBtn} onClick={fetchData} title="Refrescar">
                        ↻
                    </button>
                    <button style={styles.iconBtn} onClick={onLogout} title="Salir">
                        ⎋
                    </button>
                </div>
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    ⚠ {error} — revisa que el token y el account ID sean correctos.
                </div>
            )}

            {/* Latest deploy card */}
            {latest && !loading && (
                <div style={styles.latestCard}>
                    <div style={styles.latestLabel}>Último deployment</div>
                    <div style={styles.latestRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                            <div style={{ ...styles.statusDot, background: statusColor(latest.latest_stage?.status) }} />
                            <div>
                                <div style={styles.commitHash}>{latest.short_id}</div>
                                <div style={styles.commitMsg}>{latest.deployment_trigger?.metadata?.commit_message || "Sin mensaje"}</div>
                            </div>
                        </div>
                        <div style={styles.latestMeta}>
                            <span style={{ color: statusColor(latest.latest_stage?.status), fontWeight: 600 }}>
                                {statusLabel(latest.latest_stage?.status)}
                            </span>
                            <span style={styles.timeTag}>{timeAgo(latest.created_on)}</span>
                        </div>
                        <button style={styles.viewBtn} onClick={() => setSelected(latest)}>
                            Ver log
                        </button>
                    </div>
                    {latest.url && (
                        <a href={latest.url} target="_blank" rel="noreferrer" style={styles.previewLink}>
                            ↗ {latest.url}
                        </a>
                    )}
                </div>
            )}

            {/* All deployments */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Todas las implementaciones</div>
                {loading ? (
                    <div style={styles.loadingRows}>
                        {[0, 1, 2].map((i: number) => (
                            <div key={i} style={{ ...styles.skeletonRow, opacity: 1 - i * 0.2 }} />
                        ))}
                    </div>
                ) : deployments.length === 0 ? (
                    <div style={styles.empty}>No hay deployments aún.</div>
                ) : (
                    <div style={styles.table}>
                        <div style={styles.tableHead}>
                            <span>Commit</span>
                            <span>Estado</span>
                            <span>Entorno</span>
                            <span>Hora</span>
                            <span></span>
                        </div>
                        {deployments.map((d: any) => (
                            <div key={d.id} style={styles.tableRow}>
                                <div>
                                    <span style={styles.hashSmall}>{d.short_id}</span>
                                    <span style={styles.msgSmall}>
                                        {(d.deployment_trigger?.metadata?.commit_message || "").slice(0, 50)}
                                    </span>
                                </div>
                                <div>
                                    <span style={{
                                        ...styles.statusPill,
                                        background: statusColor(d.latest_stage?.status) + "22",
                                        color: statusColor(d.latest_stage?.status),
                                    }}>
                                        {statusLabel(d.latest_stage?.status)}
                                    </span>
                                </div>
                                <div style={{ color: "#9ca3af", fontSize: 13 }}>
                                    {d.environment || "production"}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: 13 }}>
                                    {timeAgo(d.created_on)}
                                </div>
                                <div>
                                    <button style={styles.smallBtn} onClick={() => setSelected(d)}>
                                        Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && <LogModal deployment={selected} onClose={() => setSelected(null)} />}

            <style>{`
        @keyframes fadeIn {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulse {
          0%,100%{opacity:1} 50%{opacity:0.4}
        }
      `}</style>
        </div>
    );
}

// ─── Root Export ───────────────────────────
export default function DeploymentStatus() {
    if (!WORKER_URL || !STATUS_PASSWORD) {
        return (
            <div style={styles.errorScreen}>
                <div style={styles.errorBox}>
                    <h2 style={{ margin: "0 0 10px", color: "#ef4444" }}>Error de Configuración</h2>
                    <p style={{ margin: "0 0 15px", color: "#e5e7eb" }}>Faltan variables de entorno requeridas:</p>
                    <ul style={{ color: "#9ca3af", textAlign: "left", margin: 0 }}>
                        {!WORKER_URL && <li>VITE_WORKER_URL</li>}
                        {!STATUS_PASSWORD && <li>VITE_STATUS_PASSWORD</li>}
                    </ul>
                </div>
            </div>
        );
    }

    const [authed, setAuthed] = useState(
        () => sessionStorage.getItem("status_auth") === "1"
    );

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
    return <Dashboard onLogout={() => { sessionStorage.removeItem("status_auth"); setAuthed(false); }} />;
}

// ─── Styles ────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    errorScreen: {
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        padding: 20,
    },
    errorBox: {
        background: "#111",
        border: "1px solid #7f1d1d",
        borderRadius: 16,
        padding: "30px",
        maxWidth: 400,
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    },
    loginWrap: {
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
    },
    loginCard: {
        background: "#111",
        border: "1px solid #1f1f1f",
        borderRadius: 16,
        padding: "40px 36px",
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.4s ease",
    },
    logoArea: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
    },
    logoText: {
        color: "#f0fdf4",
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: "-0.5px",
        fontFamily: "'DM Mono', monospace",
    },
    loginSub: {
        color: "#4b5563",
        fontSize: 13,
        margin: "0 0 8px",
        fontFamily: "system-ui, sans-serif",
    },
    input: {
        background: "#0d0d0d",
        border: "1px solid #2d2d2d",
        borderRadius: 8,
        padding: "10px 14px",
        color: "#e5e7eb",
        fontSize: 14,
        fontFamily: "'DM Mono', monospace",
        outline: "none",
        transition: "border-color 0.2s",
    },
    errorMsg: {
        color: "#ef4444",
        fontSize: 12,
        margin: "0 0 4px",
        fontFamily: "system-ui, sans-serif",
    },
    loginBtn: {
        background: "#16a34a",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "11px",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
        marginTop: 4,
        transition: "background 0.2s",
    },
    dashWrap: {
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e5e7eb",
        padding: "0 0 60px",
    },
    header: {
        borderBottom: "1px solid #1a1a1a",
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d0d0d",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {
        fontWeight: 700,
        fontSize: 16,
        color: "#f9fafb",
        letterSpacing: "-0.3px",
    },
    headerSub: {
        color: "#4b5563",
        fontSize: 12,
        marginTop: 2,
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    refreshNote: {
        color: "#374151",
        fontSize: 12,
        marginRight: 4,
    },
    iconBtn: {
        background: "#161616",
        border: "1px solid #1f1f1f",
        color: "#9ca3af",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 16,
        cursor: "pointer",
        lineHeight: 1,
    },
    errorBanner: {
        background: "#1c0a0a",
        border: "1px solid #7f1d1d",
        color: "#fca5a5",
        borderRadius: 8,
        padding: "12px 16px",
        margin: "20px 32px 0",
        fontSize: 13,
    },
    latestCard: {
        background: "#111",
        border: "1px solid #16a34a44",
        borderRadius: 12,
        margin: "24px 32px 0",
        padding: "20px 24px",
        animation: "fadeIn 0.4s ease",
    },
    latestLabel: {
        color: "#16a34a",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 12,
    },
    latestRow: {
        display: "flex",
        alignItems: "center",
        gap: 16,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        flexShrink: 0,
        boxShadow: "0 0 6px currentColor",
    },
    commitHash: {
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontSize: 13,
        color: "#60a5fa",
        letterSpacing: "0.05em",
    },
    commitMsg: {
        color: "#9ca3af",
        fontSize: 13,
        marginTop: 2,
    },
    latestMeta: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        flexShrink: 0,
    },
    timeTag: {
        color: "#4b5563",
        fontSize: 12,
    },
    previewLink: {
        color: "#4b5563",
        fontSize: 12,
        textDecoration: "none",
        marginTop: 12,
        display: "block",
    },
    viewBtn: {
        background: "#16a34a22",
        border: "1px solid #16a34a55",
        color: "#22c55e",
        borderRadius: 6,
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
        flexShrink: 0,
    },
    section: {
        margin: "28px 32px 0",
    },
    sectionTitle: {
        color: "#6b7280",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 12,
    },
    table: {
        background: "#0f0f0f",
        border: "1px solid #1a1a1a",
        borderRadius: 10,
        overflow: "hidden",
    },
    tableHead: {
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1fr 1fr 80px",
        padding: "10px 20px",
        borderBottom: "1px solid #1a1a1a",
        color: "#4b5563",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
    },
    tableRow: {
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1fr 1fr 80px",
        padding: "14px 20px",
        borderBottom: "1px solid #111",
        alignItems: "center",
        transition: "background 0.15s",
    },
    hashSmall: {
        fontFamily: "'DM Mono', monospace",
        color: "#60a5fa",
        fontSize: 12,
        marginRight: 8,
        letterSpacing: "0.05em",
    },
    msgSmall: {
        color: "#6b7280",
        fontSize: 13,
    },
    statusPill: {
        borderRadius: 99,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
    },
    smallBtn: {
        background: "transparent",
        border: "1px solid #1f1f1f",
        color: "#9ca3af",
        borderRadius: 6,
        padding: "5px 10px",
        fontSize: 12,
        cursor: "pointer",
    },
    loadingRows: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    skeletonRow: {
        height: 52,
        background: "#111",
        borderRadius: 8,
        animation: "pulse 1.5s ease infinite",
    },
    empty: {
        color: "#374151",
        padding: "32px 0",
        textAlign: "center",
        fontSize: 14,
    },
    badge: {
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
    },
    modalBox: {
        background: "#0f0f0f",
        border: "1px solid #1f1f1f",
        borderRadius: 14,
        width: "min(860px, 92vw)",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeIn 0.25s ease",
    },
    modalHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid #1a1a1a",
    },
    modalTitle: {
        fontWeight: 700,
        fontSize: 15,
        color: "#f9fafb",
    },
    closeBtn: {
        background: "transparent",
        border: "none",
        color: "#6b7280",
        fontSize: 18,
        cursor: "pointer",
        lineHeight: 1,
        padding: 4,
    },
    stagesRow: {
        display: "flex",
        gap: 6,
        padding: "12px 20px",
        borderBottom: "1px solid #1a1a1a",
        flexWrap: "wrap",
    },
    stageChip: {
        background: "#151515",
        border: "1px solid #1f1f1f",
        borderRadius: 6,
        padding: "4px 10px",
        display: "flex",
        alignItems: "center",
        fontSize: 12,
    },
    logBox: {
        flex: 1,
        overflow: "auto",
        padding: "16px 20px",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontSize: 12,
        lineHeight: 1.7,
        color: "#6b7280",
        background: "#080808",
    },
};