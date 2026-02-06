from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from config import COHERE_API_KEY, VECTORSTORE_DIR
import os
from transformers import CLIPProcessor, CLIPModel
import torch
from langchain_community.vectorstores import FAISS

clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def embed_image(pil_image):
    inputs = clip_processor(images=pil_image, return_tensors="pt")
    with torch.no_grad():
        embeddings = clip_model.get_image_features(**inputs)
    return embeddings.squeeze().numpy()
def create_vectorstore(documents):
    embeddings = CohereEmbeddings(
    cohere_api_key=COHERE_API_KEY,
    model="embed-english-v3.0"  # or "embed-multilingual-v3.0" if needed
)

    vectorstore = FAISS.from_documents(documents, embeddings)
    vectorstore.save_local(VECTORSTORE_DIR)
    
    return vectorstore

def load_vectorstore():
    if not os.path.exists(f"{VECTORSTORE_DIR}/index.faiss"):
        raise FileNotFoundError("Vectorstore not found. Please reindex first.")
    embeddings = CohereEmbeddings(
    cohere_api_key=COHERE_API_KEY,
    model="embed-english-v3.0"  # or "embed-multilingual-v3.0" if needed
)

    return FAISS.load_local(VECTORSTORE_DIR, embeddings, allow_dangerous_deserialization=True)
