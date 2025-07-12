from pathlib import Path
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings

# Load .env from parent of current file
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

# Use Hugging Face embeddings (free, local)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
try:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
except Exception as e:
    print("⚠️ Failed to load Hugging Face embeddings:", e)
    raise

def create_parivartana_vectorstore(pdf_path: str):
    """Create vectorstore from Parivartana Knowledge Base PDF."""
    try:
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()

        splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = splitter.split_documents(pages)

        vectorstore = FAISS.from_documents(docs, embedding=embeddings)
        vectorstore.save_local("vectorstore/parivartana_kb")
        return "✅ Parivartana Knowledge Base vectorstore created successfully."
    
    except Exception as e:
        return f"❌ Failed to create Parivartana vectorstore: {str(e)}"

def load_parivartana_vectorstore():
    """Load the Parivartana Knowledge Base vectorstore."""
    try:
        return FAISS.load_local(
            "vectorstore/parivartana_kb",
            embeddings,
            allow_dangerous_deserialization=True
        )
    except Exception as e:
        print("❌ Error loading Parivartana vectorstore:", e)
        return None

def initialize_parivartana_system():
    """Initialize the Parivartana Knowledge Base by creating vectorstore if it doesn't exist."""
    pdf_path = "data/Parivartana Knowledge Base.pdf"
    vectorstore_path = "vectorstore/parivartana_kb"
    
    if not os.path.exists(vectorstore_path):
        print("Creating Parivartana Knowledge Base vectorstore...")
        result = create_parivartana_vectorstore(pdf_path)
        print(result)
    else:
        print("✅ Parivartana Knowledge Base vectorstore already exists.")

if __name__ == "__main__":
    initialize_parivartana_system() 