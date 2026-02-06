from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.document_loader import load_and_split_documents
from app.embed_and_store import create_vectorstore, load_vectorstore
from app.rag_chain import get_qa_chain
from app.memory import ChatMemory
from app.config import DATA_DIR

app = FastAPI(title="DocuMind AI", description="Professional Document Intelligence Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for session management
qa_chain = None
retriever = None
chat_memory = ChatMemory()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    session_id: str

class UploadResponse(BaseModel):
    message: str
    file_count: int
    files: List[str]

class IndexResponse(BaseModel):
    message: str
    document_count: int

@app.on_event("startup")
async def startup_event():
    """Initialize the RAG system on startup"""
    global qa_chain, retriever
    try:
        qa_chain, retriever = get_qa_chain()
        print("✅ RAG system initialized successfully")
    except Exception as e:
        print(f"⚠️ RAG system not initialized: {e}")

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the main frontend page"""
    return FileResponse("static/index.html")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and store documents"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    os.makedirs(DATA_DIR, exist_ok=True)
    uploaded_files = []
    
    for file in files:
        if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.filename}")
        
        file_path = os.path.join(DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
    
    return UploadResponse(
        message=f"Successfully uploaded {len(uploaded_files)} file(s)",
        file_count=len(uploaded_files),
        files=uploaded_files
    )

@app.post("/api/index", response_model=IndexResponse)
async def index_documents():
    """Index all documents in the data directory"""
    try:
        documents = load_and_split_documents()
        if not documents:
            raise HTTPException(status_code=400, detail="No documents found to index")
        
        create_vectorstore(documents)
        
        # Reinitialize the RAG chain
        global qa_chain, retriever
        qa_chain, retriever = get_qa_chain()
        
        return IndexResponse(
            message="Documents indexed successfully",
            document_count=len(documents)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Process a chat message and return AI response"""
    if not qa_chain or not retriever:
        raise HTTPException(status_code=503, detail="RAG system not initialized. Please upload and index documents first.")
    
    try:
        # Generate response using RAG chain
        result = qa_chain.invoke(message.message)
        
        # Get relevant documents
        docs = retriever.invoke(message.message)
        sources = []
        
        for i, doc in enumerate(docs):
            sources.append({
                "id": i + 1,
                "source": doc.metadata.get('source', 'Unknown'),
                "content": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                "relevance_score": 0.9 - (i * 0.1)  # Mock relevance score
            })
        
        # Add to memory
        chat_memory.add_message("user", message.message)
        chat_memory.add_message("assistant", result.content)
        
        session_id = message.session_id or str(uuid.uuid4())
        
        return ChatResponse(
            answer=result.content,
            sources=sources,
            session_id=session_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.get("/api/chat/history")
async def get_chat_history():
    """Get chat history"""
    return {"history": chat_memory.to_dict()}

@app.delete("/api/chat/history")
async def clear_chat_history():
    """Clear chat history"""
    chat_memory.clear()
    return {"message": "Chat history cleared successfully"}

@app.get("/api/documents")
async def list_documents():
    """List all uploaded documents"""
    try:
        files = []
        if os.path.exists(DATA_DIR):
            for filename in os.listdir(DATA_DIR):
                if filename.lower().endswith(('.pdf', '.docx', '.txt')):
                    file_path = os.path.join(DATA_DIR, filename)
                    file_size = os.path.getsize(file_path)
                    files.append({
                        "name": filename,
                        "size": file_size,
                        "type": filename.split('.')[-1].upper()
                    })
        return {"documents": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
