
# 🚀 DocuFlex – AI-Powered Document Management System

**DocuFlex** is a cutting-edge, self-hosted **Document Management System (DMS)** built with **Next.js** and **Firebase Studio**. Designed for modern teams and organizations, it provides secure, intuitive file management enhanced with powerful **AI capabilities**, including **semantic search** and **video generation**.

---

## 🔥 Key Features

- 📁 **File & Folder Management**  
  Upload, organize, rename, and delete files with a user-friendly interface.

- 🔐 **Advanced Access Control**  
  Granular permission control at user and department levels.

- 👥 **User Management**  
  Admin panel to manage user roles, credentials, and access levels.

- 🤖 **AI-Powered Semantic Search**  
  Search beyond keywords—get results based on meaning and intent.

- 🎬 **AI Video Generation**  
  Generate videos directly from text prompts using Google Gemini.

- 👀 **Instant File Previews**  
  Preview PDFs, Office docs, images, and more—no downloads needed.

- 🎨 **Customizable UI & Theming**  
  Built with **ShadCN UI** and **Tailwind CSS**. Light/Dark mode ready.

---

## 🧠 Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | [Next.js](https://nextjs.org/) (App Router)     |
| Frontend       | [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/) |
| AI Integration | [Google Gemini via Genkit](https://firebase.google.com/docs/genkit) |
| Icons          | [Lucide React](https://lucide.dev/)             |
| State Mgmt     | React Context API                                |

---

## 🛠️ Getting Started

Follow the steps below to set up **DocuFlex** locally for development and testing.

### ✅ Prerequisites

- **Node.js v18 or higher**  
  Download from [nodejs.org](https://nodejs.org/)

---

### ⚙️ Step 1: Configure Environment Variables

1. Get your **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a `.env` file in the root directory of the project.
3. Add the following line to the file:

   ```env
   GEMINI_API_KEY=<YOUR_API_KEY>
   ```

---

### 📦 Step 2: Install Dependencies

Open your terminal in the project root and run:

```bash
npm install
```

---

### 🚀 Step 3: Run the Development Server

Once installed, start the development server:

```bash
npm run dev
```

Visit the app in your browser at:

> [http://localhost:9002](http://localhost:9002)

#### Default Credentials (for testing only):

- **Username:** `administrator`  
- **Password:** `password`

---

## 📜 Available NPM Commands

| Script             | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start the development server             |
| `npm run build`    | Build for production                     |
| `npm run start`    | Start the production server (post-build) |
| `npm run lint`     | Run ESLint to catch code issues          |
| `npm run typecheck`| Run TypeScript type validation           |

---

## 🧩 Future Enhancements (Roadmap)

- 🔎 OCR and document text extraction  
- 📁 Drag-and-drop folder upload  
- 📈 Usage analytics dashboard  
- 🌐 Multilingual UI support (Urdu/English)

---

## 👨‍💻 Contributing

We welcome contributions! Please fork the repo, submit pull requests, and help improve **DocuFlex**.

---

## ⚖️ License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

**DocuFlex** – Your AI companion for modern document workflows.
