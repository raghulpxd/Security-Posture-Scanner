# SPScanner

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- FastAPI
- Python

### AI Fix Assistant
- Ollama
- Mistral


### Install these before running the project:

- Python 3.10+
- Node.js + npm
- Git
- Ollama

# Setup Instructions
### Quick Start
### First-time setup

After cloning the repo, run:

setup_spscanner.bat which is present in the root of the spscanner folder

This script will:

create the backend virtual environment (if it doesn’t exist)
install backend dependencies from requirements.txt
install frontend dependencies with npm install
pull the Mistral model in Ollama
Run the application

Make sure Ollama is running in the background, then run:

run_spscanner.bat

This will open:

a backend terminal running FastAPI
a frontend terminal running Vite
What must be running for the app to work
Required
Backend terminal
Frontend terminal
Ollama running in the background
Backend

Runs on:

http://127.0.0.1:8000
Frontend

Runs on something like:

http://localhost:5173

# Manual Run (without batch files)

If you want to run it manually instead of using the .bat files:

### Backend

Open a terminal in the project root and run:

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend

Open a second terminal and run:

cd frontend
npm install
npm run dev
Ollama

Run once to download the model:

ollama pull mistral

Then keep Ollama running in the background before using the Fix Assistant.
