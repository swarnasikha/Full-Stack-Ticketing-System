import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to get response"
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer
        }
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            error.message ||
            "Something went wrong."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: "#14181F",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            zIndex: 1000
          }}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 360,
            height: 500,
            background: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 12,
            boxShadow:
              "0 10px 30px rgba(20,24,31,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #E4E7EC"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#14181F"
                }}
              >
                AI Ticket Assistant
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 11.5,
                  color: "#9AA1AC"
                }}
              >
                Ask about your tickets
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#6B7280",
                padding: 4
              }}
            >
              <X size={17} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              background: "#F8F9FA"
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 100,
                  padding: "0 20px",
                  color: "#6B7280"
                }}
              >
                <MessageCircle
                  size={28}
                  style={{
                    marginBottom: 10
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: 13
                  }}
                >
                  Ask me about your tickets.
                </p>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11.5,
                    color: "#9AA1AC"
                  }}
                >
                  Example: How many urgent tickets
                  are open?
                </p>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    item.role === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: 10
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "9px 11px",
                    borderRadius: 9,
                    background:
                      item.role === "user"
                        ? "#14181F"
                        : "#FFFFFF",
                    color:
                      item.role === "user"
                        ? "#FFFFFF"
                        : "#3B4250",
                    border:
                      item.role === "user"
                        ? "none"
                        : "1px solid #E4E7EC",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  fontSize: 12,
                  color: "#9AA1AC"
                }}
              >
                Thinking...
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              gap: 8,
              padding: 10,
              borderTop: "1px solid #E4E7EC",
              background: "#FFFFFF"
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ask about tickets..."
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #DADEE5",
                borderRadius: 7,
                padding: "9px 10px",
                fontSize: 12.5,
                outline: "none",
                color: "#14181F"
              }}
            />

            <button
              type="submit"
              disabled={
                loading || !message.trim()
              }
              style={{
                width: 38,
                border: "none",
                borderRadius: 7,
                background: "#14181F",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  loading || !message.trim()
                    ? "default"
                    : "pointer",
                opacity:
                  loading || !message.trim()
                    ? 0.45
                    : 1
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}