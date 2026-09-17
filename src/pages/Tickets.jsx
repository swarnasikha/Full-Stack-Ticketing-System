import { useMemo, useState } from "react";
import { useTickets } from "../hooks/useTickets";
import { useAgents } from "../hooks/useAgents";
import {
  HiOutlineTicket,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCheckCircle
} from "react-icons/hi";

const API_URL = "http://localhost:5000/api";

const STATUS_STYLES = {
  open: {
    label: "Open",
    bg: "#dbeafe",
    color: "#1d4ed8"
  },
  in_progress: {
    label: "In Progress",
    bg: "#e0e7ff",
    color: "#4338ca"
  },
  blocked: {
    label: "Blocked",
    bg: "#fef3c7",
    color: "#92400e"
  },
  resolved: {
    label: "Resolved",
    bg: "#dcfce7",
    color: "#166534"
  }
};

const PRIORITY_STYLES = {
  low: {
    bg: "#f1f5f9",
    color: "#475569"
  },
  medium: {
    bg: "#dbeafe",
    color: "#1d4ed8"
  },
  high: {
    bg: "#ffedd5",
    color: "#c2410c"
  },
  urgent: {
    bg: "#fee2e2",
    color: "#b91c1c"
  }
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.open;

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 10px",
        borderRadius: "7px",
        fontSize: "10px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}
    >
      {style.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 9px",
        borderRadius: "7px",
        fontSize: "10px",
        fontWeight: 800,
        textTransform: "uppercase"
      }}
    >
      {priority}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 800,
              color: "#1e3a8a"
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#eff6ff",
              color: "#2563eb",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            <HiOutlineX size={17} />
          </button>
        </div>

        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onView }) {
  const status = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dbeafe",
        borderRadius: "14px",
        padding: "1rem",
        boxShadow: "0 3px 12px rgba(37,99,235,0.08)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.7rem",
          flexWrap: "wrap"
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            background: "#dbeafe",
            color: "#1d4ed8",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: 800
          }}
        >
          #{ticket._id?.slice(-8).toUpperCase()}
        </span>

        <h3
          style={{
            margin: 0,
            flex: 1,
            minWidth: "180px",
            color: "#1e3a8a",
            fontSize: "15px",
            fontWeight: 800
          }}
        >
          {ticket.title}
        </h3>

        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <p
        style={{
          margin: "0 0 0.9rem",
          color: "#475569",
          fontSize: "13px",
          lineHeight: 1.5
        }}
      >
        {ticket.description}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.7rem",
          background: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: "10px",
          padding: "0.75rem"
        }}
      >
        <Info
          icon={<HiOutlineUser size={14} />}
          label="Created By"
          value={ticket.createdBy?.name || "—"}
        />

        <Info
          icon={<HiOutlineUser size={14} />}
          label="Assignee"
          value={ticket.assignee?.name || "Unassigned"}
        />

        <Info
          icon={<HiOutlineClock size={14} />}
          label="Created"
          value={formatDate(ticket.createdAt)}
        />

        <Info
          icon={<HiOutlineClock size={14} />}
          label="Updated"
          value={formatDate(ticket.updatedAt)}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "0.75rem"
        }}
      >
        <button
          onClick={() => onView(ticket)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "7px 13px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase"
          }}
        >
          <HiOutlineEye size={14} />
          View Details
        </button>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: "7px", minWidth: 0 }}>
      <span style={{ color: "#60a5fa" }}>{icon}</span>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#60a5fa",
            fontSize: "8px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em"
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontSize: "11px",
            fontWeight: 600,
            marginTop: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const { tickets, loading, error, loadMore, hasMore } = useTickets(search);

  const { agents } = useAgents();

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter && ticket.status !== statusFilter) {
        return false;
      }

      if (priorityFilter && ticket.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, statusFilter, priorityFilter]);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "in_progress"
  ).length;

  const blockedCount = tickets.filter(
    (ticket) => ticket.status === "blocked"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;

  const viewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setSelectedDetails(null);
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/tickets/${ticket._id}`,
        {
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ticket");
      }

      setSelectedDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #dbeafe",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto"
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #dbeafe",
          borderRadius: "14px",
          padding: "0.8rem 1rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: 900,
            textTransform: "uppercase"
          }}
        >
          <HiOutlineTicket size={17} />
          Tickets
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "220px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "9px",
            padding: "0 0.75rem"
          }}
        >
          <HiOutlineSearch color="#60a5fa" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "12px"
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            height: "36px",
            border: "1px solid #bfdbfe",
            borderRadius: "9px",
            padding: "0 0.7rem",
            color: "#1d4ed8",
            fontSize: "11px",
            fontWeight: 700
          }}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          style={{
            height: "36px",
            border: "1px solid #bfdbfe",
            borderRadius: "9px",
            padding: "0 0.7rem",
            color: "#1d4ed8",
            fontSize: "11px",
            fontWeight: 700
          }}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "1rem"
        }}
      >
        <Stat title="Open" value={openCount} />
        <Stat title="In Progress" value={progressCount} />
        <Stat title="Blocked" value={blockedCount} />
        <Stat title="Resolved" value={resolvedCount} />
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "10px",
            padding: "0.8rem",
            marginBottom: "1rem",
            fontSize: "12px"
          }}
        >
          {error}
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #dbeafe",
            borderRadius: "16px",
            padding: "4rem 1rem",
            textAlign: "center"
          }}
        >
          <HiOutlineTicket
            size={45}
            color="#bfdbfe"
            style={{ margin: "0 auto 1rem" }}
          />

          <p
            style={{
              margin: 0,
              color: "#475569",
              fontWeight: 700
            }}
          >
            No tickets found
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem"
          }}
        >
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              agents={agents}
              onView={viewTicket}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.8rem",
            border: "1px dashed #93c5fd",
            borderRadius: "12px",
            background: "#eff6ff",
            color: "#2563eb",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          {loading ? "Loading..." : "Load More Tickets"}
        </button>
      )}

      {selectedTicket && (
        <Modal
          title={`Ticket #${selectedTicket._id?.slice(-8).toUpperCase()}`}
          onClose={() => {
            setSelectedTicket(null);
            setSelectedDetails(null);
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "0.5rem",
              flexWrap: "wrap"
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#1e3a8a",
                fontSize: "18px"
              }}
            >
              {selectedTicket.title}
            </h3>

            <div
              style={{
                display: "flex",
                gap: "0.4rem"
              }}
            >
              <StatusBadge status={selectedTicket.status} />
              <PriorityBadge priority={selectedTicket.priority} />
            </div>
          </div>

          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem"
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#334155",
                lineHeight: 1.6,
                fontSize: "13px"
              }}
            >
              {selectedTicket.description}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem"
            }}
          >
            <Info
              icon={<HiOutlineUser />}
              label="Created By"
              value={selectedTicket.createdBy?.name || "—"}
            />

            <Info
              icon={<HiOutlineUser />}
              label="Assignee"
              value={selectedTicket.assignee?.name || "Unassigned"}
            />

            <Info
              icon={<HiOutlineClock />}
              label="Created"
              value={formatDate(selectedTicket.createdAt)}
            />

            <Info
              icon={<HiOutlineClock />}
              label="Updated"
              value={formatDate(selectedTicket.updatedAt)}
            />
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h4
              style={{
                margin: "0 0 0.7rem",
                color: "#1e3a8a",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Ticket History
            </h4>

            {detailsLoading ? (
              <p style={{ color: "#64748b", fontSize: "12px" }}>
                Loading history...
              </p>
            ) : selectedDetails?.events?.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem"
                }}
              >
                {selectedDetails.events.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      borderLeft: "3px solid #93c5fd",
                      background: "#f8fafc",
                      padding: "0.7rem 0.8rem",
                      borderRadius: "0 8px 8px 0"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5rem"
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "11px",
                          color: "#334155"
                        }}
                      >
                        {event.actor?.name || "User"}
                      </strong>

                      <span
                        style={{
                          fontSize: "9px",
                          color: "#94a3b8"
                        }}
                      >
                        {formatDate(event.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "11px",
                        color: "#64748b"
                      }}
                    >
                      {event.type === "status_changed"
                        ? `${event.field} changed from ${event.from || "—"} to ${event.to || "—"}`
                        : event.type === "assigned"
                        ? "Ticket assigned"
                        : event.body || "Ticket created"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "12px"
                }}
              >
                No history available.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dbeafe",
        borderRadius: "12px",
        padding: "0.8rem"
      }}
    >
      <div
        style={{
          color: "#60a5fa",
          fontSize: "9px",
          fontWeight: 800,
          textTransform: "uppercase"
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#1e3a8a",
          fontSize: "22px",
          fontWeight: 900,
          marginTop: "3px"
        }}
      >
        {value}
      </div>
    </div>
  );
}