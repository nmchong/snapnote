# SnapNote: One-Time Note Generator
A Snapchat-inspired, one-time link generator that self-destructs after viewing. 

Write text and attach an optional file to be read once. A note expires after the specified time after being opened or when the note's tab is deleted. All text and files are secure and are deleted immediately after viewing. 

Full-stack project using the MERN tech stack.

---

## Technologies
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (note schema), Supabase (file storage)
- **Deployment**: Vercel (frontend), Railway (backend)

---

## Live Link & Demo
[https://create-snapnote.vercel.app/](https://create-snapnote.vercel.app/)

![Create Note Page](./createImage.png)
![View Note Page](./viewImage.png)

---

## Features
- **One-time viewable notes**: text and file entries are deleted after viewing
- **Auto-expiring notes**: notes expire after a countdown (time set by note creator) or when the user closes the tab
- **File attachments**: file uploads with smart image/PDF previews
- **Modern UX**: intuitive UI, copy-to-clipboard, easy navigation

---

## Setup Instructions
```bash
# clone repo
git clone https://github.com/nmchong/snapnote.git
cd snapnote

# frontend setup
cd frontend
npm install
npm start

# backend setup (in a new terminal)
cd ../backend
npm install
npm start
```
### Environment Variables

Frontend (frontend/.env)
```bash
REACT_APP_API_URL=https://your-backend-url.up.railway.app
```

Backend (backend/.env)
```bash
PORT=5001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
MONGO_URI=your_mongodb_uri
```
