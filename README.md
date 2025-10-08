# WhatsApp Webhook & Management Dashboard

This project provides a comprehensive solution for interacting with WhatsApp. It features a backend service that connects to WhatsApp via `whatsapp-web.js`, exposes a webhook API, and can be run as a standalone desktop application using Electron. It also includes a modern web dashboard built with Next.js for managing the service.

## ✨ Features

- **WhatsApp Integration:** Send and receive messages, manage contacts, and more.
- **Webhook API:** Receive real-time events from WhatsApp (new messages, status changes, etc.).
- **Multi-Account Ready:** Designed to handle multiple WhatsApp instances.
- **Web Dashboard:** A user-friendly interface (built with Next.js and TypeScript) to monitor status, send messages, and manage settings.
- **Desktop Application:** Can be run as a desktop app using Electron.
- **Secure:** Uses JWT for authentication and bcrypt for password hashing.

## 🛠️ Tech Stack & Architecture

- **Backend:**
  - **Framework:** Node.js, Express.js
  - **WhatsApp Integration:** `whatsapp-web.js`
  - **Database ORM:** Prisma
  - **Database:** SQLite (default)
  - **Desktop App:** Electron
- **Frontend (Dashboard):**
  - **Framework:** Next.js, React
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
- **Monorepo Tools:**
  - `concurrently` to run multiple services.
  - `npm` for the root project and legacy dashboard.
  - `pnpm` for the main Next.js dashboard.

### Project Structure

```
.
├── api/                # Express API server logic
├── dashboard1/         # Main Next.js web dashboard
├── prisma/             # Prisma schema and migrations
├── services/           # Business logic (WhatsApp, DB, Auth)
├── .gitignore          # Files ignored by Git
├── electron.js         # Main file for the Electron application
├── index.js            # Main entry point for the backend service
└── package.json        # Project dependencies and scripts
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/installation) (for the Next.js dashboard)

```bash
npm install -g pnpm
```

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ronaldobonifacio/whatsapp-webhook.git
    cd whatsapp-webhook
    ```

2.  **Install root dependencies:**
    This will install dependencies for the backend, Electron, and also trigger the `postinstall` script for the legacy dashboard.
    ```bash
    npm install
    ```

3.  **Install Next.js dashboard dependencies:**
    Navigate to the `dashboard1` directory and use `pnpm`.
    ```bash
    cd dashboard1
    pnpm install
    cd ..
    ```

4.  **Set up the database:**
    This command will apply any pending database migrations.
    ```bash
    npx prisma migrate deploy
    ```

5.  **Configure Environment Variables:**
    Create a file named `.env` in the root of the project. It should contain the following variables. For security, `JWT_SECRET` should be a long, random string.
    ```env
    # .env

    # A secret key for signing JSON Web Tokens
    JWT_SECRET=your-super-secret-and-long-jwt-key

    # Optional: You can override the default database path
    # DATABASE_URL="file:./prisma/dev.db"
    ```

### Running the Application

The project is configured to run all services concurrently with a single command.

-   **To run the backend service AND the Next.js dashboard together:**
    ```bash
    npm start
    ```
    This will:
    - Start the backend bot on `http://localhost:3000` (or as configured).
    - Start the Next.js dashboard on `http://localhost:3002`.

-   **To run only the backend:**
    ```bash
    npm run start:bot
    ```

-   **To run only the Next.js dashboard:**
    ```bash
    npm run start:dashboard1
    ```

-   **To run the desktop application:**
    ```bash
    npm run start:electron
    ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ronaldobonifacio/whatsapp-webhook/issues).

## 📄 License

This project is licensed under the MIT License.
