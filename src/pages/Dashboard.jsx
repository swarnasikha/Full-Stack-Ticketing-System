import AIChat from "../components/AIChat";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../context/AuthContext";
import { RefreshCw, ArrowUpRight, Search } from "lucide-react";

const COLORS = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#14181F",
  muted: "#6B7280",
  faint: "#9AA1AC",
  line: "#E4E7EC",
  border: "#DADEE5",
  accent: "#3454D1"
};

const STATUS = {
  open: { label: "Open", color: "#3454D1" },
  in_progress: { label: "In progress", color: "#B8860B" },
  blocked: { label: "Blocked", color: "#C0392B" },
  resolved: { label: "Resolved", color: "#1F8A5F" }
};

const PRIORITY = {
  low: { label: "Low priority", color: "#C7CCD6" },
  medium: { label: "Medium priority", color: "#3454D1" },
  high: { label: "High priority", color: "#B8860B" },
  urgent: { label: "Urgent", color: "#C0392B" }
};

function StatBlock({ label, value, last }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px 24px",
        borderRight: last ? "none" : `1px solid ${COLORS.line}`
      }}
    >
      <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
        {label}
      </p>

      <p
        style={{
          marginTop: 4,
          marginBottom: 0,
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 600,
          color: COLORS.ink,
          fontVariantNumeric: "tabular-nums"
        }}
      >
        {value}
      </p>
    </div>
  );
}

function TicketRow({ ticket, onClick }) {
  const status = STATUS[ticket.status] || STATUS.open;
  const priority =
    PRIORITY[ticket.priority] || PRIORITY.medium;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        textAlign: "left",
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C7CCD6";
        e.currentTarget.style.boxShadow =
          "0 1px 8px rgba(20,24,31,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.line;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        style={{
          width: 4,
          flexShrink: 0,
          background: priority.color
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 20px"
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            <span
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                color: COLORS.faint
              }}
            >
              #{String(ticket._id).slice(-8).toUpperCase()}
            </span>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 500
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: status.color,
                  display: "inline-block"
                }}
              />

              <span style={{ color: status.color }}>
                {status.label}
              </span>
            </span>

            <span
              style={{
                fontSize: 12.5,
                color: COLORS.muted
              }}
            >
              {priority.label}
            </span>
          </div>

          <h3
            style={{
              margin: "6px 0 0",
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.ink
            }}
          >
            {ticket.title}
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13.5,
              color: COLORS.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {ticket.description}
          </p>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 20px",
              fontSize: 12.5,
              color: COLORS.faint
            }}
          >
            <span>
              {ticket.createdBy?.name || "Unknown"} opened this
            </span>

            <span>
              {ticket.assignee?.name
                ? `Assigned to ${ticket.assignee.name}`
                : "Unassigned"}
            </span>

            <span>
              {ticket.createdAt
                ? new Date(
                    ticket.createdAt
                  ).toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>

        <ArrowUpRight
          size={16}
          strokeWidth={2}
          color={COLORS.faint}
          style={{
            marginTop: 4,
            flexShrink: 0
          }}
        />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");

  const {
    tickets,
    loading,
    error,
    loadMore,
    hasMore,
    refresh
  } = useTickets(search);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(
        (t) => t.status === "open"
      ).length,
      inProgress: tickets.filter(
        (t) => t.status === "in_progress"
      ).length,
      blocked: tickets.filter(
        (t) => t.status === "blocked"
      ).length,
      resolved: tickets.filter(
        (t) => t.status === "resolved"
      ).length
    };
  }, [tickets]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 24px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 32
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: COLORS.ink
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                color: COLORS.muted
              }}
            >
              Welcome back, {user?.name || "User"}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10
            }}
          >
            {/* Logout button */}
            <button
              onClick={logout}
              style={{
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#3B4250",
                cursor: "pointer"
              }}
            >
              Logout
            </button>

            {/* Existing Refresh button */}
            <button
              onClick={refresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#3B4250",
                cursor: "pointer"
              }}
            >
              <RefreshCw
                size={14}
                strokeWidth={2}
              />
              Refresh
            </button>

            {/* Existing View tickets button */}
            <button
              onClick={() => navigate("/tickets")}
              style={{
                borderRadius: 8,
                border: "none",
                background: COLORS.ink,
                padding: "8px 16px",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#fff",
                cursor: "pointer"
              }}
            >
              View tickets
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: 24,
            borderRadius: 10,
            border: `1px solid ${COLORS.line}`,
            background: COLORS.surface,
            overflow: "hidden"
          }}
        >
          <StatBlock
            label="Total tickets"
            value={stats.total}
          />

          <StatBlock
            label="Open"
            value={stats.open}
          />

          <StatBlock
            label="In progress"
            value={stats.inProgress}
          />

          <StatBlock
            label="Blocked"
            value={stats.blocked}
          />

          <StatBlock
            label="Resolved"
            value={stats.resolved}
            last
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 32
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1
            }}
          >
            <Search
              size={16}
              strokeWidth={2}
              color={COLORS.faint}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)"
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tickets"
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                padding: "10px 16px 10px 40px",
                fontSize: 14,
                color: COLORS.ink,
                outline: "none"
              }}
            />
          </div>

          <button
            onClick={refresh}
            style={{
              borderRadius: 8,
              border: "none",
              background: COLORS.ink,
              padding: "10px 20px",
              fontSize: 13.5,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.ink
            }}
          >
            Recent tickets
          </h2>

          <span
            style={{
              fontSize: 13,
              color: COLORS.faint
            }}
          >
            {tickets.length} ticket
            {tickets.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && tickets.length === 0 && (
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.surface,
              padding: 40,
              textAlign: "center",
              fontSize: 14,
              color: COLORS.muted
            }}
          >
            Loading tickets…
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 10,
              border: "1px solid #F1C7C2",
              background: "#FCF1F0",
              padding: 16,
              fontSize: 13.5,
              color: "#C0392B"
            }}
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          tickets.length === 0 && (
            <div
              style={{
                borderRadius: 10,
                border: `1px solid ${COLORS.line}`,
                background: COLORS.surface,
                padding: 40,
                textAlign: "center"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: COLORS.ink
                }}
              >
                No tickets found
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13.5,
                  color: COLORS.muted
                }}
              >
                Create your first ticket to see it here.
              </p>
            </div>
          )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket._id}
              ticket={ticket}
              onClick={() =>
                navigate(`/tickets/${ticket._id}`)
              }
            />
          ))}
        </div>

        {hasMore && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "center"
            }}
          >
            <button
              onClick={loadMore}
              disabled={loading}
              style={{
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                padding: "8px 24px",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#3B4250",
                cursor: loading
                  ? "default"
                  : "pointer",
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading
                ? "Loading…"
                : "Load more"}
            </button>
          </div>
        )}
      </div>

      <AIChat />
    </div>
  );
}