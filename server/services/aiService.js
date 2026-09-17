const Anthropic = require("@anthropic-ai/sdk");

const Ticket = require("../models/Ticket");

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  : null;

const searchTickets = async ({
  status,
  priority,
  assignee,
  q
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (assignee) {
    filter.assignee = assignee;
  }

  if (q) {
    filter.$or = [
      {
        title: {
          $regex: q,
          $options: "i"
        }
      },
      {
        description: {
          $regex: q,
          $options: "i"
        }
      }
    ];
  }

  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role")
    .sort({ createdAt: -1 })
    .limit(20);

  return tickets;
};

const getTicket = async (id) => {
  const ticket = await Ticket.findById(id)
    .populate("createdBy", "name email role")
    .populate("assignee", "name email role");

  return ticket;
};

const countTickets = async ({
  status,
  priority,
  assignee
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (assignee) {
    filter.assignee = assignee;
  }

  const count = await Ticket.countDocuments(filter);

  return count;
};

const askClaude = async (message, ticketData) => {
  if (!anthropic) {
    return null;
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 500,
    system:
      "You are an AI ticket assistant. Answer questions using only the ticket data provided. Do not invent ticket information.",
    messages: [
      {
        role: "user",
        content: `User question:
${message}

Ticket data:
${JSON.stringify(ticketData)}

Answer the user's question using the ticket data above.`
      }
    ]
  });

  return response.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
};

module.exports = {
  searchTickets,
  getTicket,
  countTickets,
  anthropic,
  askClaude
};