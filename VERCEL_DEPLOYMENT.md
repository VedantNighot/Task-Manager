# 🚀 Deploy Your Task Manager to Vercel - Visual Guide

![Vercel Deployment Steps](C:/Users/vedan/.gemini/antigravity/brain/fe63ae0b-eefd-4477-837d-a3bf919cef16/vercel_deployment_steps_1769860683297.png)

---

## ✅ Everything is Ready!

Your code has been configured and pushed to GitHub. Now just follow these simple steps:

### Step 1: Visit Vercel
Go to **https://vercel.com**

### Step 2: Sign In
Click **"Sign in with GitHub"** and authorize Vercel

### Step 3: Add New Project
Click the **"Add New Project"** button

### Step 4: Import Repository
- Search for: **VedantNighot/Task-Manager**
- Click **"Import"**

### Step 5: Configure Settings

**IMPORTANT**: Set these values:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend/Task-Manager` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**Environment Variables** (click "Add" to create):
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://task-manager-luy3.onrender.com`

### Step 6: Deploy!
Click the **"Deploy"** button and wait 1-2 minutes ⏱️

---

## 🎉 That's It!

Once deployment completes, Vercel will give you:
- ✅ A live URL: `https://[your-project].vercel.app`
- ✅ Automatic deployments on every push to `main`
- ✅ Preview deployments for pull requests
- ✅ Free SSL certificate
- ✅ Global CDN

---

## � What Happens Next?

Every time you push code to GitHub:
1. Vercel automatically detects the change
2. Builds your app
3. Deploys it globally
4. Updates your live site

**No manual work needed!** 🎊

---

## � Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your GitHub Repo**: https://github.com/VedantNighot/Task-Manager
- **Backend API**: https://task-manager-luy3.onrender.com

---

## 💡 Pro Tips

1. **Custom Domain**: You can add your own domain in Vercel settings
2. **Analytics**: Enable Vercel Analytics for free insights
3. **Preview URLs**: Every branch gets its own preview URL
4. **Rollback**: Easy one-click rollback to previous deployments

---

## 🐛 Troubleshooting

### Build Fails?
- Make sure **Root Directory** is set to `frontend/Task-Manager`
- Check that environment variable is added correctly

### Can't See Environment Variables?
- Go to Project Settings → Environment Variables
- Add `VITE_API_BASE_URL` with your backend URL
- Redeploy the project

### API Not Working?
- Check browser console for errors
- Verify backend is running at https://task-manager-luy3.onrender.com
- Make sure environment variable starts with `VITE_`

---

## � Files Configured

✅ `vercel.json` - Vercel configuration  
✅ `vite.config.js` - Removed GitHub Pages base path  
✅ `.env` - Backend API URL  
✅ All changes pushed to GitHub  

---

**Ready to deploy? Go to https://vercel.com and follow the steps above!** 🚀
