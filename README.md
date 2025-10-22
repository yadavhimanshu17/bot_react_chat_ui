[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yadavhimanshu17/bot_react_chat_ui/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yadavhimanshu17/bot_react_chat_ui)](https://github.com/yadavhimanshu17/bot_react_chat_ui/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yadavhimanshu17/bot_react_chat_ui)](https://github.com/yadavhimanshu17/bot_react_chat_ui/issues)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Tailwind-61DAFB)](https://reactjs.org/)

---

## 📖 Project Overview

This repository contains the **Core Frontend Chat Interface** designed to interact with a Conversational AI backend (e.g., **Rasa Core** server). It functions as an **embeddable chat widget**, responsible for all user interaction, message rendering, and session management.

## ✨ Key Features

* **Rasa Compatibility:** Built to send and receive messages compatible with the standard Rasa REST API webhook format.
* **Rich Messaging:** Supports rendering of advanced message payloads (buttons, quick replies, carousel) sent by the bot.
* **Session Management:** Manages the user session state for continuous conversation flow.
* **Handoff Logic:** Contains client-side logic and UI to request a transfer to a human live agent when needed.

---

## 🛠️ Technology Stack & Dependencies

This project is a modern React application. All dependencies are managed by **Node Package Manager (npm)** and listed in `package.json`.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | **React.js** | Primary library for component-based UI development. |
| **Styling** | **Tailwind CSS** | Used for utility-first styling and responsive design. |
| **API Handling** | **Axios** | HTTP client for reliable communication with the Bot Core. |
| **Runtime** | **Node.js** | Required for running the development and build environment. |

---

## ⚙️ Setup and Installation

### Prerequisites

You must have **Node.js** (LTS recommended) and **npm** (or **yarn**) installed.

### 1. Cloning the Repository

Start by cloning the project and navigating into the directory:

```bash
git clone [https://github.com/yadavhimanshu17/bot_react_chat_ui.git](https://github.com/yadavhimanshu17/bot_react_chat_ui.git)
cd bot_react_chat_ui
2. Install Dependencies
Install all necessary packages defined in package.json:

Bash

# Using npm (Recommended)
npm install

# OR using yarn
# yarn install
3. Environment Configuration
Create a file named .env in the root directory. Configure the URL of your backend AI service here:

# The Rasa webhook endpoint for sending user messages
REACT_APP_BOT_API_URL = <Replace with your Rasa Bot Endpoint URL> 

# Example:
# REACT_APP_BOT_API_URL = http://localhost:5005/webhooks/rest/webhook
4. Running the Application
Start the development server:

Bash

npm start
The Chatbot UI will be available for testing, typically at http://localhost:3000.

🤝 Integration with Bot Core
This component sends user messages to the configured endpoint using the standard format:

JSON

{
  "sender": "<user_id>",
  "message": "<user_text>"
}
🛑 Important Note on Dependencies
As a Frontend JavaScript (React) project, all dependencies are managed by npm/yarn and listed in package.json. 

©️ License
This project is licensed under the MIT License.

Project Maintained by <Your Name/Team Name>. Last Updated: 22-10-2025
