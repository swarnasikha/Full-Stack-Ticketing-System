const {
  searchTickets,
  countTickets,
  anthropic,
  askClaude
} = require("../services/aiService");

const User = require("../models/User");

const findAssignee = async (text) => {
  const users = await User.find({
    role: { $in: ["user", "manager"] }
  }).select("_id name");

  return users.find((user) => {
    const nameParts = user.name.toLowerCase().split(" ");

    return nameParts.some((part) => {
      return part.length > 2 && text.includes(part);
    });
  });
};

const getFiltersFromMessage = async (message) => {
  const text = message.toLowerCase();

  const filter = {};

  if (text.includes("open")) {
    filter.status = "open";
  } else if (
    text.includes("in progress") ||
    text.includes("in_progress")
  ) {
    filter.status = "in_progress";
  } else if (text.includes("blocked")) {
    filter.status = "blocked";
  } else if (text.includes("resolved")) {
    filter.status = "resolved";
  }

  if (text.includes("urgent")) {
    filter.priority = "urgent";
  } else if (
    text.includes("high priority") ||
    text.includes("high")
  ) {
    filter.priority = "high";
  } else if (
    text.includes("medium priority") ||
    text.includes("medium")
  ) {
    filter.priority = "medium";
  } else if (
    text.includes("low priority") ||
    text.includes("low")
  ) {
    filter.priority = "low";
  }

  const matchedUser = await findAssignee(text);

  if (matchedUser) {
    filter.assignee = matchedUser._id;
  }

  return filter;
};

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const filter = await getFiltersFromMessage(message);

    let data = null;
    let answer = "";

    if (
      message.toLowerCase().includes("how many") ||
      message.toLowerCase().includes("count") ||
      message.toLowerCase().includes("number of")
    ) {
      data = await countTickets(filter);

      answer = `There are ${data} matching ticket${
        data !== 1 ? "s" : ""
      }.`;
    } else if (
      message.toLowerCase().includes("which tickets") ||
      message.toLowerCase().includes("show tickets") ||
      message.toLowerCase().includes("show me") ||
      message.toLowerCase().includes("list")
    ) {
      data = await searchTickets(filter);

      if (data.length === 0) {
        answer = "No matching tickets were found.";
      } else {
        answer = data
          .map(
            (ticket) =>
              `#${String(ticket._id)
                .slice(-8)
                .toUpperCase()} - ${
                ticket.title
              } (${ticket.status}, ${
                ticket.priority
              })`
          )
          .join("\n");
      }
    } else {
      data = await searchTickets({
        q: message.trim()
      });

      if (data.length === 0) {
        answer =
          "I could not find any tickets matching your question.";
      } else {
        answer = data
          .slice(0, 5)
          .map(
            (ticket) =>
              `#${String(ticket._id)
                .slice(-8)
                .toUpperCase()} - ${
                ticket.title
              } (${ticket.status}, ${
                ticket.priority
              })`
          )
          .join("\n");
      }
    }

    if (anthropic && data) {
      try {
        const claudeAnswer = await askClaude(
          message.trim(),
          data
        );

        if (claudeAnswer) {
          answer = claudeAnswer;
        }
      } catch (error) {
        console.error(
          "Claude request failed:",
          error.message
        );
      }
    }

    res.json({
      answer,
      data
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      message: "Failed to process chat request"
    });
  }
};

module.exports = {
  chat
};