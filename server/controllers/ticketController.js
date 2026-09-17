const Ticket = require("../models/Ticket");
const TicketEvent = require("../models/TicketEvent");
const User = require("../models/User");

const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    const validPriorities = ["low", "medium", "high", "urgent"];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      priority: priority || "medium",
      createdBy: req.user._id,
      assignee: null
    });

    await TicketEvent.create({
      ticket: ticket._id,
      actor: req.user._id,
      type: "created",
      body: "Ticket created"
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignee,
      q,
      page = 1
    } = req.query;

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

    const limit = 10;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const skip = (pageNumber - 1) * limit;

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      page: pageNumber,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const events = await TicketEvent.find({
      ticket: ticket._id
    })
      .populate("actor", "name email role")
      .sort({ createdAt: 1 });

    res.json({
      ticket,
      events
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch ticket",
      error: error.message
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignee
    } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const isManager = req.user.role === "manager";

    if (priority !== undefined) {
      if (!isManager) {
        return res.status(403).json({
          message: "Only managers can change ticket priority"
        });
      }

      const validPriorities = [
        "low",
        "medium",
        "high",
        "urgent"
      ];

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          message: "Invalid priority"
        });
      }

      if (priority !== ticket.priority) {
        const oldPriority = ticket.priority;

        ticket.priority = priority;

        await TicketEvent.create({
          ticket: ticket._id,
          actor: req.user._id,
          type: "status_changed",
          field: "priority",
          from: oldPriority,
          to: priority
        });
      }
    }

    if (assignee !== undefined) {
      if (!isManager) {
        return res.status(403).json({
          message: "Only managers can assign tickets"
        });
      }

      if (assignee !== null && assignee !== "") {
        const assigneeUser = await User.findById(assignee);

        if (!assigneeUser) {
          return res.status(404).json({
            message: "Assignee not found"
          });
        }
      }

      const oldAssignee = ticket.assignee
        ? String(ticket.assignee)
        : "";

      const newAssignee = assignee || null;

      if (oldAssignee !== String(newAssignee || "")) {
        ticket.assignee = newAssignee;

        await TicketEvent.create({
          ticket: ticket._id,
          actor: req.user._id,
          type: "assigned",
          field: "assignee",
          from: oldAssignee,
          to: newAssignee ? String(newAssignee) : ""
        });
      }
    }

    if (status !== undefined && status !== ticket.status) {
      const allowedTransitions = {
        open: ["in_progress", "blocked"],
        in_progress: ["blocked", "resolved"],
        blocked: ["in_progress"],
        resolved: ["open"]
      };

      if (
        !allowedTransitions[ticket.status] ||
        !allowedTransitions[ticket.status].includes(status)
      ) {
        return res.status(400).json({
          message: `Cannot change status from ${ticket.status} to ${status}`
        });
      }

      const isOwner =
        String(ticket.createdBy) === String(req.user._id);

      if (!isManager && !isOwner) {
        return res.status(403).json({
          message: "You can only change status on your own tickets"
        });
      }

      const oldStatus = ticket.status;

      ticket.status = status;

      await TicketEvent.create({
        ticket: ticket._id,
        actor: req.user._id,
        type: "status_changed",
        field: "status",
        from: oldStatus,
        to: status
      });
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignee", "name email role");

    res.json({
      message: "Ticket updated successfully",
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update ticket",
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        message: "Comment is required"
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const event = await TicketEvent.create({
      ticket: ticket._id,
      actor: req.user._id,
      type: "commented",
      body: body.trim()
    });

    const populatedEvent = await TicketEvent.findById(event._id)
      .populate("actor", "name email role");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedEvent
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment
};