# AI Knowledge Base Chatbot

A dual-interface AI system built with FastAPI and OpenAI.

## 🚀 How to Run

### 1. Start the Backend
```bash
cd backend
python main.py
```
The backend will run at `http://localhost:8000`.

### 2. Open the Frontend
- **CEO Dashboard**: Open `frontend/ceo.html` in your browser. (Upload docs here)
- **User Dashboard**: Open `frontend/index.html` in your browser. (Query docs here)

## 📁 Key Files
- `backend/rag_engine.py`: Handles PDF processing and RAG (Vector Store).
- `backend/main.py`: FastAPI implementation.
- `frontend/ceo.html`: Admin interface for uploading documents.
- `frontend/index.html`: Public interface for questioning.

## 🛠️ Requirements
- Python 3.8+
- OpenAI API Key (pre-configured in `backend/.env`)
