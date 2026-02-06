import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
import os
from document_loader import load_and_split_documents
from embed_and_store import create_vectorstore
from rag_chain import get_qa_chain
from memory import ChatMemory
from config import DATA_DIR
st.session_state.setdefault("qa_chain", None)
st.session_state.setdefault("retriever", None)

st.set_page_config(page_title="Cohere RAG App", layout="wide")

st.title(" Cohere RAG System")
st.markdown("Upload documents, ask questions, and see answers with sources.")

# Session State Setup
if "chat_memory" not in st.session_state:
    st.session_state.chat_memory = ChatMemory()

if "qa_chain" not in st.session_state:
    st.session_state.qa_chain, st.session_state.retriever = get_qa_chain()

# File Upload
st.sidebar.header(" Upload Files")
uploaded_files = st.sidebar.file_uploader(
    "Upload .txt, .pdf, or .docx", type=["txt", "pdf", "docx"], accept_multiple_files=True
)

if uploaded_files:
    os.makedirs(DATA_DIR, exist_ok=True)
    for file in uploaded_files:
        with open(os.path.join(DATA_DIR, file.name), "wb") as f:
            f.write(file.read())
    st.sidebar.success(f"{len(uploaded_files)} file(s) uploaded!")

# Reindex button
if st.sidebar.button("Reindex Documents"):
    with st.spinner("Reindexing..."):
        documents = load_and_split_documents()
        create_vectorstore(documents)
        st.session_state.qa_chain, st.session_state.retriever = get_qa_chain()
    st.sidebar.success("Reindexing complete!")

# Clear chat
if st.sidebar.button("Clear Chat"):
    st.session_state.chat_memory.clear()
    st.success("Chat history cleared.")

# Main chat input

if st.session_state.qa_chain is not None:
    user_query = st.text_input("Ask a question:", key="user_input")

    if user_query:
        with st.spinner("Thinking..."):
            result = st.session_state.qa_chain.invoke(user_query)

            st.markdown("### Answer:")
            st.write(result.content if hasattr(result, "content") else result)

            # Show retrieved documents
            st.markdown("### Retrieved Sources:")
            docs = st.session_state.retriever.invoke(user_query)
            for i, doc in enumerate(docs):
                st.markdown(f"**{i+1}. {doc.metadata['source']}**")
                st.code(doc.page_content[:500])

else:
    st.warning("Please upload documents and click 'Reindex Documents' first.")
# Chat history
with st.expander("Chat History"):
    st.markdown(st.session_state.chat_memory.to_markdown())
