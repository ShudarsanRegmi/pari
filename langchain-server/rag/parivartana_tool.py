# rag/parivartana_tool.py

from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from rag.parivartana_rag import load_parivartana_vectorstore
import os

def answer_from_parivartana_kb(question: str) -> str:
    """Answer questions about Parivartana and sustainable practices using the knowledge base."""
    try:
        vectorstore = load_parivartana_vectorstore()
        if vectorstore is None:
            return "Sorry, I couldn't load the Parivartana Knowledge Base. Please try again later."
        
        retriever = vectorstore.as_retriever(search_type="similarity", k=3)

        llm = ChatOpenAI(
            model="gpt-4o-mini", 
            temperature=0.2, 
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
        return qa.run(question)
    except Exception as e:
        return f"Sorry, I encountered an error while answering your question about Parivartana: {str(e)}" 