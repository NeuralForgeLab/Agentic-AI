# Phase II Testing Instructions - Quick Guide

**Last Updated**: 2026-01-19  
**Status**: ✅ Both servers running and ready for testing

---

## Current Server Status

### ✅ Backend Server - RUNNING
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Status**: Healthy (version 0.1.0)

### ✅ Frontend Server - RUNNING
- **URL**: http://localhost:3000
- **Framework**: Next.js 14.2.0
- **Status**: Ready

---

## Quick Manual Test (5 Minutes)

### 1. Open Browser
```
Navigate to: http://localhost:3000
```

### 2. Sign Up (New User)
- Click **"Sign Up"** button
- Email: `test@example.com`
- Password: `Test123!@#`
- Click Submit
- Should redirect to dashboard

### 3. Create a Task
- Click **"Add Task"**
- Title: `Buy groceries`
- Description: `Milk, bread, eggs`
- Click Submit
- ✅ Task should appear in the list

### 4. Toggle Completion
- Click the **checkbox** next to the task
- ✅ Status should change to complete
- Click again to toggle back

### 5. Update Task
- Click **Edit** button on task
- Change title to: `Buy groceries and fruits`
- Click Save
- ✅ Updated title should display

### 6. Delete Task
- Click **Delete** button
- Confirm deletion
- ✅ Task should disappear from list

### 7. Sign Out
- Click **Sign Out** button
- ✅ Should redirect to sign in page

---

## Expected Results

### ✅ Sign Up
- Form validates email format
- Password meets requirements
- Redirects to dashboard after successful signup
- User session created

### ✅ Create Task
- Task appears immediately in list
- Shows correct title and description
- Status is "incomplete" by default
- API call to backend successful (check browser DevTools Network tab)

### ✅ Toggle Completion
- Checkbox updates immediately
- Visual indicator changes (strikethrough, color, etc.)
- Status persists after page refresh

### ✅ Update Task
- Edit form pre-fills with current values
- Changes save successfully
- Updated data displays immediately

### ✅ Delete Task
- Confirmation dialog appears
- Task removed from list after confirmation
- Cannot undo deletion

### ✅ Sign Out
- Session cleared
- Redirects to sign in page
- Cannot access dashboard without re-authentication

---

## Troubleshooting

### Problem: "Cannot connect to backend"
**Solution**: 
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
cd backend
uvicorn app.main:app --reload --port 8000
```

### Problem: "Frontend not loading"
**Solution**:
```bash
# Check if frontend is running
curl http://localhost:3000

# If not running, start it:
cd frontend
npm run dev
```

### Problem: "Sign up fails"
**Possible Causes**:
1. Database not connected - check backend logs
2. Email already exists - use different email
3. Password too weak - ensure 8+ chars with numbers/symbols

### Problem: "Tasks not appearing"
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Check Network tab for failed API calls

### Problem: "401 Unauthorized error"
**Solution**:
- Sign out and sign in again
- JWT token may have expired
- Check that BETTER_AUTH_SECRET matches between frontend and backend

---

## API Testing (Optional - Advanced)

### Using Swagger UI

1. Open: http://localhost:8000/docs
2. Click on any endpoint
3. Click **"Try it out"**
4. Note: You'll need a valid JWT token for authenticated endpoints

### Using curl (After getting JWT token)

**Get JWT Token**:
- Sign in via browser
- Open DevTools > Application > Storage
- Copy JWT token from session storage

**Example API Calls**:

```bash
# List tasks (requires JWT)
curl -X GET "http://localhost:8000/api/users/{user_id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create task (requires JWT)
curl -X POST "http://localhost:8000/api/users/{user_id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"From curl"}'
```

---

## Browser DevTools Verification

### Check API Requests

1. Open browser (Chrome/Edge/Firefox)
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Perform any action (create task, etc.)
5. Look for requests to `localhost:8000`

**What to Check**:
- ✅ Request URL: `http://localhost:8000/api/users/{id}/tasks`
- ✅ Status Code: 200, 201, or 204
- ✅ Request Headers: `Authorization: Bearer ...`
- ✅ Response: JSON with task data

### Check for Errors

1. In DevTools, go to **Console** tab
2. Look for any red error messages
3. Common errors:
   - Network errors → Backend not running
   - 401 errors → Authentication issue
   - 500 errors → Backend/database issue

---

## Feature Checklist

Use this to verify all features work:

### Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Cannot access dashboard without auth
- [ ] JWT token stored in session

### Task Management
- [ ] Create task with title only
- [ ] Create task with title + description
- [ ] View all tasks in list
- [ ] Task displays correct information
- [ ] Mark task as complete
- [ ] Mark complete task as incomplete
- [ ] Edit task title
- [ ] Edit task description
- [ ] Delete task
- [ ] Confirmation before delete

### Filtering (If implemented)
- [ ] Filter by "All"
- [ ] Filter by "Active" (incomplete)
- [ ] Filter by "Completed"
- [ ] Task count updates correctly

### UI/UX
- [ ] Responsive on desktop
- [ ] Responsive on mobile
- [ ] Loading states show during operations
- [ ] Error messages display clearly
- [ ] Success messages confirm actions

---

## Performance Verification

### Expected Response Times

| Operation | Expected Time | Status |
|-----------|---------------|--------|
| Page Load | < 3 seconds | Check |
| Sign In | < 2 seconds | Check |
| Create Task | < 1 second | Check |
| Load Tasks | < 2 seconds | Check |
| Update Task | < 1 second | Check |
| Delete Task | < 1 second | Check |

**How to Check**:
- Network tab shows request duration
- Should feel instant to user
- No noticeable lag

---

## Security Verification

### Check These Security Features

1. **JWT Authentication**:
   - [ ] Cannot access API without token
   - [ ] Token required for all task operations
   - [ ] Invalid token returns 401 error

2. **User Isolation**:
   - [ ] Users only see their own tasks
   - [ ] Cannot access other user's tasks
   - [ ] User ID validated against JWT

3. **Input Validation**:
   - [ ] Empty task title rejected
   - [ ] SQL injection attempts blocked
   - [ ] XSS attempts sanitized

4. **HTTPS** (Production Only):
   - Note: Local dev uses HTTP
   - Production should use HTTPS

---

## Test Results Template

Copy this to document your test results:

```
# Phase II Manual Test Results

Date: _______________
Tester: _______________

## Authentication
- Sign Up: [ ] PASS [ ] FAIL - Notes: _______________
- Sign In: [ ] PASS [ ] FAIL - Notes: _______________
- Sign Out: [ ] PASS [ ] FAIL - Notes: _______________

## Task Operations
- Create Task: [ ] PASS [ ] FAIL - Notes: _______________
- View Tasks: [ ] PASS [ ] FAIL - Notes: _______________
- Toggle Complete: [ ] PASS [ ] FAIL - Notes: _______________
- Update Task: [ ] PASS [ ] FAIL - Notes: _______________
- Delete Task: [ ] PASS [ ] FAIL - Notes: _______________

## Integration
- Frontend → Backend: [ ] PASS [ ] FAIL - Notes: _______________
- Backend → Database: [ ] PASS [ ] FAIL - Notes: _______________
- JWT Authentication: [ ] PASS [ ] FAIL - Notes: _______________

## Overall Result: [ ] PASS [ ] FAIL

Issues Found:
1. _______________
2. _______________

Recommendations:
1. _______________
2. _______________
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Mark Phase II as complete
2. Begin Phase III (AI Chatbot)
3. Follow `specs/phase3-ai-chatbot/tasks.md`

### If Tests Fail ❌
1. Document specific failures
2. Check backend logs for errors
3. Check frontend console for errors
4. Review relevant code files
5. Fix issues and retest

---

## Support Resources

### Documentation
- Full Test Report: `PHASE2_TEST_REPORT.md`
- Phase II Spec: `specs/phase2-web/spec.md`
- Phase II Plan: `specs/phase2-web/plan.md`
- README: `README.md`

### Logs
- Backend Logs: Check terminal where backend is running
- Frontend Logs: Check browser DevTools Console
- Database Logs: Check Neon dashboard

### Common Files to Check
- Backend Config: `backend/app/config.py`
- Backend Routes: `backend/app/routes/tasks.py`
- Frontend API Client: `frontend/lib/api.ts`
- Frontend Dashboard: `frontend/app/dashboard/page.tsx`

---

## Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Check logs
# (watch terminal where backend is running)

# Test health
curl http://localhost:8000/health
```

### Frontend
```bash
# Start frontend
cd frontend
npm run dev

# Build for production (optional)
npm run build

# Start production build (optional)
npm start
```

### Database
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# List tables
psql $DATABASE_URL -c "\dt"
```

---

## Screenshots (Optional)

Take screenshots of:
1. Sign up page
2. Sign in page
3. Dashboard with tasks
4. Task creation form
5. Task edit form
6. API response in DevTools

Save in: `docs/screenshots/phase2/`

---

**Ready to test?** Open http://localhost:3000 and follow the steps above! 🚀

**Questions?** Check `PHASE2_TEST_REPORT.md` for detailed information.
