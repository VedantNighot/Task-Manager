# 🚀 How to Start Your Task Manager Project

![How to Start Project](C:/Users/vedan/.gemini/antigravity/brain/fe63ae0b-eefd-4477-837d-a3bf919cef16/project_start_guide_1769860976373.png)


## 📁 Project Structure

Your project has this structure:
```
Task Manager/
├── backend/           (Backend code)
├── frontend/
│   └── Task-Manager/  ← Your React app is HERE!
└── ...
```

---

## ▶️ Start the Frontend (Development Mode)

### Option 1: Using Terminal Commands

**Step 1: Navigate to the frontend directory**
```bash
cd "c:\Users\vedan\Desktop\projects\Task Manager\frontend\Task-Manager"
```

**Step 2: Install dependencies (first time only)**
```bash
npm install
```

**Step 3: Start the development server**
```bash
npm run dev
```

**Step 4: Open in browser**
The terminal will show something like:
```
  ➜  Local:   http://localhost:5173/
```
Open that URL in your browser!

---

### Option 2: Quick One-Liner

Open PowerShell and run:
```powershell
cd "c:\Users\vedan\Desktop\projects\Task Manager\frontend\Task-Manager" && npm run dev
```

---

## 🛑 Stop the Development Server

Press **`Ctrl + C`** in the terminal where the server is running.

---

## 🔧 Available Commands

Once you're in the `frontend/Task-Manager` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check code for errors |

---

## ⚠️ Common Mistakes

❌ **DON'T** run `npm` commands from `Task Manager/` root directory  
✅ **DO** run them from `Task Manager/frontend/Task-Manager/`

---

## 🌐 Backend Connection

Your frontend is configured to connect to:
- **Backend URL**: `https://task-manager-luy3.onrender.com`
- **Configured in**: `.env` file

The backend is already deployed and running, so you don't need to start it locally!

---

## 🐛 Troubleshooting

### "Cannot find package.json"
- You're in the wrong directory
- Navigate to `frontend/Task-Manager` first

### "Port already in use"
- Another app is using port 5173
- Stop the other app or Vite will suggest a different port

### "Module not found"
- Run `npm install` first
- Make sure you're in `frontend/Task-Manager` directory

---

## 🎯 Quick Start Checklist

1. ✅ Open terminal/PowerShell
2. ✅ Navigate to `frontend/Task-Manager` directory
3. ✅ Run `npm install` (first time only)
4. ✅ Run `npm run dev`
5. ✅ Open browser to the URL shown
6. ✅ Start coding! 🎉

---

**Ready to start? Open your terminal and run:**
```bash
cd "c:\Users\vedan\Desktop\projects\Task Manager\frontend\Task-Manager"
npm run dev
```
