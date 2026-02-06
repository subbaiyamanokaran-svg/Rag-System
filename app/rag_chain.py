
from langchain_cohere import ChatCohere
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from embed_and_store import load_vectorstore

def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])

def get_qa_chain():
    try:
        vectorstore = load_vectorstore()
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        # Use proper ChatPromptTemplate for ChatCohere
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Use the context to answer the question. If the answer is not in the context, say 'I don't know'."),
            ("human", "Context:\n{context}\n\nQuestion:\n{question}")
        ])

        # Use Lambda to format retriever output
        rag_chain = (
            RunnableLambda(lambda q: {"context": format_docs(retriever.invoke(q)), "question": q})
            | prompt
            | ChatCohere(model="command-r-plus", temperature=0.3)
        )

        return rag_chain, retriever

    except FileNotFoundError:
        print("Vectorstore not found. Please reindex documents first.")
        return None, None
