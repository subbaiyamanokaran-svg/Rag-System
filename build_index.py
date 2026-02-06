from app.document_loader import load_and_split_documents 
from app.embed_and_store import create_vectorstore

docs = load_and_split_documents() 
create_vectorstore(docs)
print("✅ FAISS index created and saved!")
