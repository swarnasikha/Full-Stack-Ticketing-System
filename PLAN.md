# PLAN.md

## Project
AI-Assisted Ticketing System

## Goal
Build a ticketing application where users can create and manage tickets,
and an AI chat can answer questions using the actual ticket data stored
in MongoDB.

## Tech Stack
- React + Vite
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT for authentication
- Anthropic API for AI chat
- Tailwind CSS

I am using MERN because I have worked with this stack before and it will
allow me to complete the assignment within the available time.

## Main Features

### Authentication
- Register and login
- JWT authentication
- User and manager roles

### Tickets
- Create tickets
- View ticket list
- Search and filter tickets
- View ticket details
- Assign tickets
- Change priority
- Change status
- Add comments

### Ticket Status
- Open
- In Progress
- Blocked
- Resolved

Allowed transitions:
- Open → In Progress
- Open → Blocked
- In Progress → Blocked
- In Progress → Resolved
- Blocked → In Progress
- Resolved → Open

### Ticket History
Every important ticket change will be recorded as an event.
The ticket details page will show these events as a history/timeline.

## AI Chat

The AI should answer questions from the real ticket data and should not
use hard-coded answers.

I will use the LLM to understand the user's question and select from
predefined backend tools.

Planned tools:
- Search tickets
- Get a ticket
- Count tickets

The backend will execute the MongoDB query and send the result back to
the LLM, which will then generate the response.

I will not allow the LLM to create arbitrary MongoDB queries.

Example questions to test:
- How many high-priority tickets are still open?
- What is the status of ticket #104?
- What is pending?
- Which tickets are assigned to Rahul?

## Database

Collections:
- User
- Ticket
- TicketEvent

I will seed test data with multiple users and tickets having different
statuses, priorities and assignees.

## Frontend

Pages/components:
- Login
- Dashboard
- Create Ticket
- Ticket Details
- Ticket History
- AI Chat

## Development Order

1. Set up backend
2. Connect MongoDB
3. Create models
4. Add seed data
5. Add authentication
6. Add ticket APIs
7. Add ticket history
8. Build frontend
9. Add AI chat
10. Test and debug
11. Deploy and update README

## Git

I will make separate commits for major features instead of committing
everything at the end.

## Testing

I will test authentication, ticket creation, ticket updates, status
transitions, history, and the example AI questions.

## Out of Scope

To keep the project achievable within the assignment time, I will not
implement:
- File attachments
- Email notifications
- WebSockets
- Password reset
- Persistent chat history

## Final Verification

Before submission I will verify that:
- The application runs correctly
- Tickets are stored and retrieved from MongoDB
- Status changes are recorded
- Ticket history works
- AI responses use actual database data
- README contains setup instructions
- No API keys or secrets are committed