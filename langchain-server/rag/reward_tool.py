# rag/reward_tool.py

from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from rag.reward_rag import load_reward_vectorstore
import os

def answer_from_reward_guide(question: str) -> str:
    """Answer questions about the reward system using RAG."""
    try:
        vectorstore = load_reward_vectorstore()
        if vectorstore is None:
            return "Sorry, I couldn't load the reward system information. Please try again later."
        
        retriever = vectorstore.as_retriever(search_type="similarity", k=3)

        llm = ChatOpenAI(
            model="gpt-4o-mini", 
            temperature=0.2, 
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
        return qa.run(question)
    except Exception as e:
        return f"Sorry, I encountered an error while answering your question about the reward system: {str(e)}" 