# 🚀 Vercel Deployment Guide - Task Manager

## ✅ What's Been Configured

1. **Created `vercel.json`** - Vercel configuration file
2. **Updated `vite.config.js`** - Removed GitHub Pages base path (Vercel uses root domain)
3. **Environment variables** - Backend URL already configured in `.env`

---

## 📋 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**:
   - Search for: `VedantNighot/Task-Manager`
   - Click "Import"

5. **Configure Project Settings**:
   ```
   Framework Preset: Vite
   Root Directory: frontend/Task-Manager
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://task-manager-luy3.onrender.com`

7. **Click "Deploy"**

That's it! Vercel will build and deploy your app in 1-2 minutes.

---

### Option 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd "c:\Users\vedan\Desktop\projects\Task Manager"
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: task-manager (or your choice)
- **Directory**: `./frontend/Task-Manager`
- **Override settings**: No

#### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## 🌐 Your Deployment URL

After deployment, Vercel will provide you with:
- **Production URL**: `https://task-manager-[random].vercel.app`
- You can also add a **custom domain** in Vercel dashboard

---

## 🔧 Environment Variables

Make sure these are set in Vercel:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://task-manager-luy3.onrender.com` |

**To add/edit environment variables:**
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add or update variables
4. Redeploy for changes to take effect

---

## 🔄 Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy every push to `main` branch (Production)
- ✅ Create preview deployments for pull requests
- ✅ Provide deployment previews for each commit

---

## 🎯 Advantages of Vercel

- ⚡ **Faster deployments** (usually under 1 minute)
- 🌍 **Global CDN** for better performance
- 🔄 **Automatic HTTPS** and SSL certificates
- 📊 **Analytics** and performance monitoring
- 🔍 **Preview deployments** for every branch
- 🎨 **Better developer experience**

---

## 🐛 Troubleshooting

### Build fails?
- Check that `frontend/Task-Manager` is set as root directory
- Verify `npm run build` works locally
- Check build logs in Vercel dashboard

### API calls not working?
- Verify `VITE_API_BASE_URL` environment variable is set
- Check browser console for CORS errors
- Ensure backend allows requests from Vercel domain

### 404 on page refresh?
- The `vercel.json` file handles this with rewrites
- Make sure `vercel.json` is in the root of your repository

---

## 📝 Next Steps After Deployment

1. **Test your deployed app** thoroughly
2. **Add custom domain** (optional) in Vercel settings
3. **Enable Vercel Analytics** for insights
4. **Set up monitoring** for your backend

---

## 🎉 You're All Set!

Your Task Manager frontend is ready to deploy to Vercel. Choose either the Dashboard or CLI method above and you'll be live in minutes!

**Backend**: https://task-manager-luy3.onrender.com ✅  
**Frontend**: Will be at `https://[your-project].vercel.app` 🚀
