const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Ticket = require("./models/Ticket");
const TicketEvent = require("./models/TicketEvent");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await TicketEvent.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("Password123", 10);

    const users = await User.create([
      {
        name: "Swarna Sikha",
        email: "swarna@example.com",
        passwordHash,
        role: "user"
      },
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        passwordHash,
        role: "user"
      },
      {
        name: "Priya Singh",
        email: "priya@example.com",
        passwordHash,
        role: "user"
      },
      {
        name: "Admin Manager",
        email: "manager@example.com",
        passwordHash,
        role: "manager"
      }
    ]);

    const swarna = users[0];
    const rahul = users[1];
    const priya = users[2];

    const tickets = await Ticket.create([
      {
        title: "Login page not working",
        description: "Users are unable to log in after entering valid credentials.",
        priority: "high",
        status: "open",
        createdBy: swarna._id,
        assignee: rahul._id
      },
      {
        title: "Payment failure during checkout",
        description: "Payment fails when customers try to complete checkout.",
        priority: "urgent",
        status: "in_progress",
        createdBy: rahul._id,
        assignee: priya._id
      },
      {
        title: "Dashboard loading slowly",
        description: "Dashboard takes more than ten seconds to load.",
        priority: "medium",
        status: "blocked",
        createdBy: priya._id,
        assignee: rahul._id
      },
      {
        title: "Profile update issue",
        description: "Users cannot save changes to their profile information.",
        priority: "medium",
        status: "resolved",
        createdBy: swarna._id,
        assignee: priya._id
      },
      {
        title: "Email notification missing",
        description: "Users do not receive email notifications after ticket creation.",
        priority: "high",
        status: "open",
        createdBy: rahul._id,
        assignee: priya._id
      },
      {
        title: "Search results incorrect",
        description: "Ticket search sometimes returns unrelated results.",
        priority: "low",
        status: "in_progress",
        createdBy: priya._id,
        assignee: rahul._id
      },
      {
        title: "Mobile layout issue",
        description: "Some dashboard elements overlap on smaller screens.",
        priority: "medium",
        status: "open",
        createdBy: swarna._id,
        assignee: null
      },
      {
        title: "Password reset error",
        description: "Password reset request returns an unexpected error.",
        priority: "high",
        status: "blocked",
        createdBy: rahul._id,
        assignee: swarna._id
      },
      {
        title: "Ticket filtering issue",
        description: "Filtering by priority does not always return the expected tickets.",
        priority: "medium",
        status: "resolved",
        createdBy: priya._id,
        assignee: rahul._id
      },
      {
        title: "API timeout problem",
        description: "Some API requests are timing out under heavy usage.",
        priority: "urgent",
        status: "open",
        createdBy: swarna._id,
        assignee: rahul._id
      },
      {
        title: "User registration validation",
        description: "Registration accepts some invalid input values.",
        priority: "low",
        status: "resolved",
        createdBy: rahul._id,
        assignee: priya._id
      },
      {
        title: "Notification preferences not saved",
        description: "Changes to notification preferences disappear after refreshing the page.",
        priority: "medium",
        status: "open",
        createdBy: priya._id,
        assignee: null
      }
    ]);

    const events = tickets.map((ticket) => ({
      ticket: ticket._id,
      actor: ticket.createdBy,
      type: "created",
      body: "Ticket created"
    }));

    await TicketEvent.create(events);

    console.log("Seed data inserted successfully");
    console.log(`Users created: ${users.length}`);
    console.log(`Tickets created: ${tickets.length}`);

    console.log("\nTest accounts:");
    console.log("User: swarna@example.com / Password123");
    console.log("Manager: manager@example.com / Password123");

    await mongoose.disconnect();

    console.log("\nMongoDB connection closed");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();