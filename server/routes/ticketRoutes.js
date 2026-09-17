const express = require("express");

const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment
} = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTickets);

router.post("/", protect, createTicket);

router.get("/:id", protect, getTicketById);

router.patch("/:id", protect, updateTicket);

router.post("/:id/comments", protect, addComment);

module.exports = router;