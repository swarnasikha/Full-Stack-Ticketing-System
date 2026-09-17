# AI-Assisted Development History

This document records the AI-assisted development used while building the Full-Stack Ticketing System.

## 1. Project Planning

### Goal
Plan a full-stack ticketing system with authentication, ticket management, ticket history, and an AI chat feature.

### AI Assistance
AI was used to define:
- Technology stack
- Database models
- API structure
- Authentication approach
- Ticket status workflow
- Ticket history/event design
- AI chat architecture
- Development order
- Testing requirements

The resulting development plan was documented in `PLAN.md`.

## 2. Backend Setup

### AI Assistance
AI was used to help structure the Express backend and organize the project into:
- Controllers
- Models
- Routes
- Middleware
- Services

The backend was configured to connect to MongoDB Atlas using Mongoose.

## 3. Authentication

### AI Assistance
AI was used to implement:
- User registration
- Login
- Password hashing using bcrypt
- JWT authentication
- HTTP-only authentication cookies
- Authentication middleware
- Current-user endpoint
- Logout
- User and manager roles

Authentication was manually tested using the seeded test accounts.

## 4. Ticket Management

### AI Assistance
AI was used to implement:
- Ticket creation
- Ticket listing
- Ticket search
- Ticket filtering
- Ticket details
- Ticket assignment
- Ticket priority
- Ticket status updates
- Comments

The ticket data is stored in MongoDB.

## 5. Ticket History

### AI Assistance
AI was used to design the `TicketEvent` model and history functionality.

Ticket events record important actions such as:
- Ticket creation
- Status changes
- Assignment changes
- Comments

The ticket details page displays the ticket history.

## 6. Status Workflow

The following status transitions were implemented:

- Open → In Progress
- Open → Blocked
- In Progress → Blocked
- In Progress → Resolved
- Blocked → In Progress
- Resolved → Open

Invalid transitions are rejected by the backend.

## 7. Frontend

### AI Assistance
AI was used to help connect the existing React frontend with the backend APIs.

The existing dashboard UI was preserved while adding functionality for:
- Authentication
- Ticket data
- Ticket creation
- Ticket details
- Ticket history
- AI chat
- Logout

## 8. AI Ticket Assistant

### AI Assistance
AI was used to design and implement the ticket assistant.

The assistant queries actual ticket data stored in MongoDB instead of relying on hard-coded ticket information.

Examples tested:

- How many urgent tickets are there?
- Show me all blocked tickets
- Which tickets are assigned to Rahul?
- Which tickets are assigned to Priya?
- Show urgent tickets assigned to Rahul

Verified results included:
- 2 urgent tickets
- 3 blocked tickets
- 5 tickets assigned to Rahul
- 4 tickets assigned to Priya

The backend also contains an Anthropic API integration prepared for LLM-based responses. An Anthropic API key is required to activate the external LLM functionality.

## 9. Debugging and Corrections

### AI-Assisted Debugging
AI assistance was used during development to identify and correct issues including:
- Backend/frontend API integration
- Authentication and cookie handling
- Ticket filtering
- Assignee detection
- Status update handling
- Manager permissions
- Frontend API requests

Changes were tested manually after fixes.

## 10. Testing

The following features were manually tested:

- User login
- Manager login
- Logout
- Ticket creation
- Ticket listing
- Ticket search
- Ticket filtering
- Ticket assignment
- Priority changes
- Status changes
- Status workflow validation
- Comments
- Ticket history
- MongoDB data retrieval
- AI ticket queries

## 11. Human Review

AI-generated code and suggestions were reviewed and tested during implementation.

When generated code did not match the application's existing structure or requirements, it was adjusted manually.

The final implementation was verified by running the application locally and testing the main workflows.