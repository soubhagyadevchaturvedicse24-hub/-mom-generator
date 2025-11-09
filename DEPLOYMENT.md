# GitHub Pages Deployment Guide

Follow these steps to deploy your MOM Generator to GitHub Pages (FREE hosting):

## Prerequisites

1. **GitHub Account** - Sign up at https://github.com if you don't have one
2. **Git Installed** - Download from https://git-scm.com/downloads if not installed

## Step-by-Step Deployment

### 1. Initialize Git Repository

Open PowerShell in your project folder and run:

```powershell
cd D:\Softwares\MOMSsssssss
git init
git add .
git commit -m "Initial commit - MOM Generator"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mom-generator` (or any name you prefer)
3. Description: "CSE Notice and MOM Generator Tool"
4. Make it **Public**
5. **DO NOT** check "Add a README file" (we already have one)
6. Click **"Create repository"**

### 3. Push Code to GitHub

Copy the commands from GitHub's page, or use these (replace YOUR-USERNAME):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mom-generator.git
git push -u origin main
```

**Note:** You may need to authenticate with GitHub. Use a personal access token if prompted.

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click **Save**

### 5. Access Your Live Website

After a few minutes, your site will be live at:

```
https://YOUR-USERNAME.github.io/mom-generator/
```

GitHub will show the URL on the Pages settings page.

## Updating Your Site

Whenever you make changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically update your live site!

## Custom Domain (Optional)

If you have your own domain:

1. Add a `CNAME` file with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

### "Git not recognized"
- Install Git from https://git-scm.com/downloads
- Restart PowerShell after installation

### "Authentication failed"
- Create a Personal Access Token at https://github.com/settings/tokens
- Use the token instead of password when prompted

### "Repository already exists"
- Choose a different repository name
- Or delete the existing repository first

### "Page not loading"
- Wait 2-3 minutes for GitHub to build the site
- Clear browser cache
- Check if GitHub Pages is enabled correctly

## Alternative: Quick Deploy (No Git Required)

1. Zip your project folder
2. Go to https://netlify.com
3. Sign up and drag-drop the zip file
4. Get instant deployment!

---

Need help? Check GitHub's documentation: https://docs.github.com/pages
