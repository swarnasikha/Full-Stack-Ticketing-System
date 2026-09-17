const mongoose = require("mongoose");

const ticketEventSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["created", "status_changed", "assigned", "commented"],
      required: true
    },

    field: String,

    from: String,

    to: String,

    body: String
  },
  {
    timestamps: true
  }
);

ticketEventSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model("TicketEvent", ticketEventSchema);