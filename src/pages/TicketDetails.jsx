import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, MessageSquare, User, Circle } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const COLORS = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#14181F",
  muted: "#6B7280",
  faint: "#9AA1AC",
  line: "#E4E7EC",
  hairline: "#F0F1F3",
  border: "#DADEE5"
};

const STATUS = {
  open: { label: "Open", color: "#3454D1" },
  in_progress: { label: "In progress", color: "#B8860B" },
  blocked: { label: "Blocked", color: "#C0392B" },
  resolved: { label: "Resolved", color: "#1F8A5F" }
};

const PRIORITY = {
  low: { label: "Low", color: "#9AA1AC" },
  medium: { label: "Medium", color: "#3454D1" },
  high: { label: "High", color: "#B8860B" },
  urgent: { label: "Urgent", color: "#C0392B" }
};

const EVENT_DOT = {
  created: "#1F8A5F",
  status_changed: "#B8860B",
  assigned: "#3454D1",
  commented: "#9AA1AC"
};

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [events, setEvents] = useState([]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const [error, setError] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tickets/${id}`, {
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load ticket");
      }

      setTicket(data.ticket);
      setEvents(data.events || []);
      setStatus(data.ticket.status);
    } catch (error) {
      setError(error.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async () => {
    if (!status || status === ticket.status) return;

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      await fetchTicket();
    } catch (error) {
      setError(error.message || "Failed to update status");
      setStatus(ticket.status);
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    try {
      setCommenting(true);
      setError("");

      const response = await fetch(`${API_URL}/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: comment.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      setComment("");
      await fetchTicket();
    } catch (error) {
      setError(error.message || "Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.muted,
          fontSize: 14
        }}
      >
        Loading ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <BackButton onClick={() => navigate("/dashboard")} />
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: COLORS.surface,
              border: "1px solid #F1C7C2",
              borderRadius: 10,
              color: "#C0392B",
              fontSize: 14
            }}
          >
            {error || "Ticket not found"}
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS[ticket.status] || STATUS.open;
  const priorityInfo = PRIORITY[ticket.priority] || PRIORITY.medium;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24
          }}
        >
          <BackButton onClick={() => navigate("/dashboard")} />

          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              color: COLORS.faint
            }}
          >
            #{String(ticket._id).slice(-8).toUpperCase()}
          </span>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              border: "1px solid #F1C7C2",
              background: "#FCF1F0",
              borderRadius: 8,
              color: "#C0392B",
              fontSize: 13
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1.15fr",
            gap: 16,
            alignItems: "start"
          }}
        >
          {/* Ticket summary */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Dot color={priorityInfo.color} />
              <span style={{ fontSize: 12.5, color: priorityInfo.color, fontWeight: 500 }}>
                {priorityInfo.label} priority
              </span>
            </div>

            <h1
              style={{
                margin: "14px 0 0",
                fontSize: 21,
                lineHeight: 1.35,
                fontWeight: 600,
                color: COLORS.ink,
                letterSpacing: "-0.01em"
              }}
            >
              {ticket.title}
            </h1>

            <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.7, color: COLORS.muted }}>
              {ticket.description}
            </p>

            <Divider top={24} />

            <InfoRow label="Created by" value={ticket.createdBy?.name || "Unknown"} />
            <InfoRow
              label="Created"
              value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—"}
            />
            <InfoRow
              label="Ticket ID"
              value={"#" + String(ticket._id).slice(-8).toUpperCase()}
              mono
              last
            />
          </Card>

          {/* Status + details */}
          <Card>
            <SectionTitle>Ticket details</SectionTitle>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 7 }}>
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={updating}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 7,
                  background: COLORS.surface,
                  padding: "9px 10px",
                  fontSize: 13,
                  color: COLORS.ink,
                  outline: "none",
                  cursor: updating ? "default" : "pointer"
                }}
              >
                {Object.entries(STATUS).map(([value, item]) => (
                  <option key={value} value={value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <button
                onClick={updateStatus}
                disabled={updating || status === ticket.status}
                style={{
                  width: "100%",
                  marginTop: 9,
                  border: "none",
                  borderRadius: 7,
                  background: COLORS.ink,
                  color: "#FFFFFF",
                  padding: "9px 12px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: updating || status === ticket.status ? "default" : "pointer",
                  opacity: updating || status === ticket.status ? 0.35 : 1,
                  transition: "opacity 0.15s"
                }}
              >
                {updating ? "Updating…" : "Update status"}
              </button>
            </div>

            <Divider top={24} />

            <InfoRow label="Current status" value={statusInfo.label} valueColor={statusInfo.color} />
            <InfoRow label="Priority" value={priorityInfo.label} valueColor={priorityInfo.color} />
            <InfoRow label="Assignee" value={ticket.assignee?.name || "Unassigned"} />
            <InfoRow label="Role" value={ticket.assignee?.role || "—"} last />
          </Card>

          {/* Activity */}
          <Card>
            <SectionTitle>Activity</SectionTitle>

            <div style={{ marginTop: 18, maxHeight: 300, overflowY: "auto" }}>
              {events.length === 0 ? (
                <p style={{ fontSize: 13, color: COLORS.faint, margin: 0 }}>No activity yet.</p>
              ) : (
                events.map((event) => {
                  let title = "Activity";
                  if (event.type === "created") title = "Ticket created";
                  if (event.type === "status_changed") title = "Status changed";
                  if (event.type === "assigned") title = "Ticket assigned";
                  if (event.type === "commented") title = "Comment added";

                  return (
                    <div
                      key={event._id}
                      style={{
                        display: "flex",
                        gap: 10,
                        paddingBottom: 16,
                        marginBottom: 16,
                        borderBottom: `1px solid ${COLORS.hairline}`
                      }}
                    >
                      <Circle
                        size={8}
                        fill={EVENT_DOT[event.type] || COLORS.faint}
                        color={EVENT_DOT[event.type] || COLORS.faint}
                        style={{ marginTop: 5, flexShrink: 0 }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.ink }}>
                          {title}
                        </p>

                        {event.field === "status" && (
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.muted }}>
                            {STATUS[event.from]?.label || event.from}
                            {" → "}
                            {STATUS[event.to]?.label || event.to}
                          </p>
                        )}

                        {event.body && (
                          <p style={{ margin: "3px 0 0", fontSize: 12.5, lineHeight: 1.5, color: COLORS.muted }}>
                            {event.body}
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 5,
                            fontSize: 11.5,
                            color: COLORS.faint
                          }}
                        >
                          <User size={11} />
                          <span>{event.actor?.name || "Unknown"}</span>
                          <span>·</span>
                          <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Divider top={4} />

            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <MessageSquare size={14} color={COLORS.muted} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#3B4250" }}>Add comment</span>
            </div>

            <form onSubmit={addComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment…"
                rows={4}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 7,
                  padding: "9px 10px",
                  fontSize: 12.5,
                  color: COLORS.ink,
                  outline: "none",
                  background: "#FAFAFB"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3454D1";
                  e.target.style.background = COLORS.surface;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.background = "#FAFAFB";
                }}
              />

              <button
                type="submit"
                disabled={commenting || !comment.trim()}
                style={{
                  width: "100%",
                  marginTop: 8,
                  border: "none",
                  borderRadius: 7,
                  background: COLORS.ink,
                  color: "#FFFFFF",
                  padding: "9px 12px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: commenting || !comment.trim() ? "default" : "pointer",
                  opacity: commenting || !comment.trim() ? 0.35 : 1,
                  transition: "opacity 0.15s"
                }}
              >
                {commenting ? "Adding…" : "Add comment"}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E7EC",
        borderRadius: 10,
        padding: 22
      }}
    >
      {children}
    </div>
  );
}

function Dot({ color }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        background: color,
        display: "inline-block"
      }}
    />
  );
}

function Divider({ top }) {
  return <div style={{ marginTop: top, paddingTop: 18, borderTop: "1px solid #E4E7EC" }} />;
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        border: "none",
        background: "transparent",
        color: "#6B7280",
        cursor: "pointer",
        fontSize: 13.5,
        padding: 0
      }}
    >
      <ArrowLeft size={15} />
      Back to Dashboard
    </button>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#14181F" }}>{children}</h2>;
}

function InfoRow({ label, value, valueColor, mono, last }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: last ? 0 : 13,
        marginBottom: last ? 0 : 13,
        borderBottom: last ? "none" : "1px solid #F0F1F3"
      }}
    >
      <span style={{ fontSize: 12, color: "#9AA1AC" }}>{label}</span>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: valueColor || "#3B4250",
          textAlign: "right",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit"
        }}
      >
        {value}
      </span>
    </div>
  );
}
