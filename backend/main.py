from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os

# Fix for OpenMP runtime conflict (OMP Error #15)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from rag_engine import rag_engine

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    success = rag_engine.process_file(file_path)
    if success:
        return {"filename": file.filename, "status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Invalid file type. Supported types: PDF, DOCX, TXT.")

@app.post("/query")
async def query_ai(question: str = Form(...)):
    answer = rag_engine.query(question)
    return {"answer": answer}

@app.get("/files")
async def get_files():
    files = rag_engine.list_files(UPLOAD_DIR)
    return {"files": files}

# Frontend is served by Vercel, so we don't need to mount it here.

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
