# Installation Guide

## Quick Start on Windows

### Step 1: Install Prerequisites

1. **Install Python 3.8+**
   - Download from https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"

2. **Install Node.js 16+**
   - Download from https://nodejs.org/
   - This includes npm automatically

3. **Verify installations**
   ```bash
   python --version
   node --version
   npm --version
   ```

### Step 2: Setup Backend

1. Open terminal in the `backend` folder
   ```bash
   cd backend
   ```

2. Create Python virtual environment
   ```bash
   python -m venv venv
   ```

3. Activate virtual environment
   ```bash
   # Windows Command Prompt
   venv\Scripts\activate

   # Windows PowerShell
   venv\Scripts\Activate.ps1

   # Linux/Mac
   source venv/bin/activate
   ```

4. Install Python dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Verify `.env` file exists (already created with correct settings for Windows)

### Step 3: Setup Frontend

1. Open NEW terminal in the `frontend` folder
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies
   ```bash
   npm install
   ```

   This will download all required packages (may take a few minutes)

### Step 4: Start the System

#### Option A: Use the Quick Start Script (Windows)

Simply double-click `START_WINDOWS.bat` in the project root folder. This will:
- Start the backend server
- Start the frontend development server
- Open your browser automatically

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Open Browser:**
Navigate to http://localhost:3000

### Step 5: Verify Everything Works

You should see:

1. **Backend Terminal**:
   ```
   IBC Wastewater Treatment Control System
   Hardware Mode: MOCK
   * Running on http://0.0.0.0:5000
   ```

2. **Frontend Terminal**:
   ```
   VITE v5.x.x ready in XXX ms
   ➜ Local: http://localhost:3000/
   ```

3. **Browser**:
   - IBC Wastewater Treatment System dashboard
   - Green "Connected" indicator in top-right
   - All components showing status

### Step 6: Test the System

1. Click "Start Cycle" button
2. Watch the phase change to "FILLING"
3. Observe the water level chart updating
4. See component status indicators light up
5. Check event log for system messages

## Common Issues

### "Python not found"
- Ensure Python is installed
- Restart terminal after installing Python
- Try `python3` instead of `python`

### "npm not found"
- Ensure Node.js is installed
- Restart terminal after installing Node.js
- Check PATH environment variable

### "Cannot activate virtual environment" (PowerShell)
Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Port 5000 already in use"
- Close other applications using port 5000
- Or change PORT in `backend/.env` file

### "Port 3000 already in use"
- The frontend will automatically try port 3001
- Or change port in `frontend/vite.config.js`

### Frontend shows "Disconnected"
- Ensure backend is running first
- Check backend terminal for errors
- Try refreshing the browser page

### "Module not found" errors
Backend:
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt --force-reinstall
```

Frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Backend
- Changes to Python files require restarting the server
- Check backend terminal for error messages
- Database file: `backend/ibc_treatment.db`
- Logs show in the terminal with `[CONTROLLER]`, `[MOCK GPIO]` prefixes

### Frontend
- Changes auto-reload (Hot Module Replacement)
- Check browser console (F12) for errors
- React DevTools browser extension helpful for debugging

### Configuration
- Backend settings: `backend/.env`
- Treatment process: `backend/config/treatment_config.yaml`
- Frontend proxy: `frontend/vite.config.js`

## Next Steps

1. **Explore the dashboard** - Try all buttons and features
2. **Read the documentation** - Check `README.md` for details
3. **Modify configuration** - Adjust treatment phases in YAML file
4. **Test error handling** - Try emergency stop, see what happens
5. **Check the data** - View logged data in SQLite database

## Preparing for Raspberry Pi

When ready to deploy to Raspberry Pi:

1. Test everything thoroughly on Windows first
2. Note any configuration changes you made
3. Follow deployment guide in main README.md
4. Ensure you have the hardware components
5. Plan the GPIO wiring carefully

## Getting Help

- Check the troubleshooting section in README.md
- Review backend/README.md for backend-specific issues
- Look at browser console and backend terminal for errors
- Verify all prerequisites are correctly installed

---

**Happy coding! 🚀**
