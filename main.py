from app.document_loader import load_and_split_documents
from app.embed_and_store import create_vectorstore, load_vectorstore
from app.rag_chain import get_qa_chain
from app.memory import ChatMemory

def run_cli_chat():
    print("🔄 Loading and indexing documents...")
    docs = load_and_split_documents()
    create_vectorstore(docs)

    print("✅ Vectorstore created. Ready to chat!")
    qa_chain, retriever = get_qa_chain()
    memory = ChatMemory()

    while True:
        query = input("\n🤔 Ask a question (or type 'exit'): ")
        if query.strip().lower() in ["exit", "quit"]:
            break

        result = qa_chain.invoke(query)
        memory.add_message("user", query)
        memory.add_message("assistant", result.content)

        print(f"\n💡 Answer: {result.content}")

        print("\n📚 Source documents:")
        docs = retriever.get_relevant_documents(query)
        for i, doc in enumerate(docs):
            print(f"\nSource #{i+1} ({doc.metadata['source']}):\n{doc.page_content[:300]}")

    print("\n📁 Session ended. Saving chat history...")
    path = memory.save_to_file()
    print(f"✅ Chat log saved to {path}")

if __name__ == "__main__":
    run_cli_chat()
