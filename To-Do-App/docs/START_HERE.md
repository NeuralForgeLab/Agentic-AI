# 🚀 START HERE - Quick Setup Guide

## Problem Identified
The servers need to run in separate command windows to stay active and accessible.

---

## ✅ Solution: Use the Startup Script

### Step 1: Run the Startup Script

**Option A: Double-click** 
- Find file: `start-servers.bat`
- Double-click it
- Two new command windows will open (Backend and Frontend)

**Option B: From Command Prompt**
```cmd
cd "D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2"
start-servers.bat
```

### Step 2: Wait for Servers to Start
- **Backend window**: Wait for "Application startup complete"
- **Frontend window**: Wait for "✓ Ready in X.Xs"
- **Time needed**: ~10-15 seconds

### Step 3: Open Browser
- The script will prompt: "Press any key to open browser..."
- Press any key
- Browser should open to http://localhost:3000

---

## 🔍 What You Should See

### Backend Window (Black/Blue)
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend Window (Black/Blue)
```
> next dev

  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 3.4s
```

### Browser (Chrome/Edge/Firefox)
- Sign Up page OR
- Sign In page OR
- Dashboard (if already logged in)

---

## ❌ Troubleshooting

### "Port 8000 is already in use"
**Solution:**
```cmd
# Find the process using port 8000
netstat -ano | findstr ":8000"

# Kill it using Task Manager:
# 1. Open Task Manager (Ctrl+Shift+Esc)
# 2. Find the PID from netstat output
# 3. Right-click → End Task
# 4. Run start-servers.bat again
```

### "Port 3000 is already in use"
**Solution:**
```cmd
# Find the process using port 3000
netstat -ano | findstr ":3000"

# Kill it using Task Manager (same as above)
# Then run start-servers.bat again
```

### Browser Shows "Site can't be reached"
**Check 1:** Are both windows still open?
- Backend window must stay open
- Frontend window must stay open
- Don't close them!

**Check 2:** Did you wait long enough?
- Wait for "Application startup complete" in backend
- Wait for "Ready in X.Xs" in frontend

**Check 3:** Try typing manually
- Open browser
- Type: `http://localhost:3000`
- Press Enter

---

## 🛑 How to Stop Servers

### Method 1: Close Windows
- Simply close the Backend window
- Close the Frontend window

### Method 2: Ctrl+C
- Click in Backend window
- Press Ctrl+C
- Click in Frontend window
- Press Ctrl+C

---

## 🎯 Manual Method (If Script Doesn't Work)

### Terminal 1: Start Backend
```cmd
cd "D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\backend"
uvicorn app.main:app --reload --port 8000
```
Wait for: `Application startup complete`

### Terminal 2: Start Frontend
Open a NEW command prompt window:
```cmd
cd "D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\frontend"
npm run dev
```
Wait for: `✓ Ready in X.Xs`

### Then Open Browser
```cmd
start http://localhost:3000
```

---

## ✅ Quick Health Check

After starting servers, verify they're working:

### Test Backend
```cmd
curl http://localhost:8000/health
```
Expected: `{"status":"healthy","version":"0.1.0"}`

### Test Frontend
Open browser to: `http://localhost:3000`
Expected: Page loads (Sign in/Sign up page)

---

## 📖 Once It's Working

Follow the testing guide:
1. Sign up for an account
2. Create a task
3. Test all features

See: `TESTING_INSTRUCTIONS.md` for detailed steps

---

## 💡 Pro Tips

### Keep Windows Visible
- Arrange backend and frontend windows side-by-side
- You can see logs in real-time
- Easier to spot errors

### Check Logs for Errors
- **Backend errors**: Red text in backend window
- **Frontend errors**: Check browser console (F12)
- **Database errors**: Usually in backend window

### Restart if Needed
- If something breaks, close both windows
- Run `start-servers.bat` again
- Fresh start often fixes issues

---

## 🆘 Still Not Working?

### Check Prerequisites

**1. Python installed?**
```cmd
python --version
```
Should show: Python 3.11+ or 3.13+

**2. Node.js installed?**
```cmd
node --version
```
Should show: v18+ or v22+

**3. Dependencies installed?**

Backend:
```cmd
cd backend
pip list | findstr "fastapi\|sqlmodel\|uvicorn"
```

Frontend:
```cmd
cd frontend
npm list next react
```

### Reinstall Dependencies

**Backend:**
```cmd
cd backend
pip install -r requirements.txt
```

**Frontend:**
```cmd
cd frontend
npm install
```

---

## 📝 Summary

1. **Double-click** `start-servers.bat`
2. **Wait** for both servers to start (~15 seconds)
3. **Press any key** when prompted
4. **Browser opens** to http://localhost:3000
5. **Test** the application!

**If script doesn't work:** Use the manual method above

**If still issues:** Check the troubleshooting section

---

## 🎉 Success!

When you see the Todo App in your browser:
- ✅ Phase II servers are working
- ✅ Ready to test all features
- ✅ Ready for Phase III development

---

**Next:** Follow `TESTING_INSTRUCTIONS.md` to test all features! 🚀
