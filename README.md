# ⚡ GIT-DASH Setup Guide

Follow these steps to set up and run GIT-DASH on your machine.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- A GitHub **Personal Access Token (PAT)**

---

## 🛠️ Step-by-Step Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/git-dash.git
cd git-dash
```

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Get Your GitHub Personal Access Token (Classic)

1. Go to **[GitHub Settings → Personal Access Tokens (classic)](https://github.com/settings/tokens)**.
2. Click **Generate new token** → **Generate new token (classic)**.
3. Give it a descriptive note (e.g. `GIT-DASH`).
4. Select the **`repo`** scope (Full control of private repositories, issues, pull requests, and commits).
   - *(Optional)* If you also want user profile metrics across private details, check **`read:user`**.
5. Click **Generate token** at the bottom.
6. Copy the token string (starts with `ghp_...`).

---

### Step 4: Configure Environment Variables

Create a file named `.env.local` in the root of the project:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and paste your token:

```env
GITHUB_TOKEN=your_token_here
```

---

### Step 5: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Step 6: (Optional) Build for Production

To test or run the production build locally:

```bash
npm run build
npm start
```
