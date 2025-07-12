import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent
from langchain.agents.agent_types import AgentType
from langchain.tools import StructuredTool
from rag.reward_tool import answer_from_reward_guide

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not set. Please add it to your .env file.")

app = FastAPI(title="PariMitra - Your Intelligent Agentic Ally for Sustainable Change")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    user_input: str

# Tool Functions for WebNavigator Product System

def search_products(query: str) -> str:
    """Search products by name or description using a keyword."""
    try:
        res = requests.get(f"http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return "No products found matching your search."
        
        # Filter products based on query
        filtered_products = []
        query_lower = query.lower()
        for product in data:
            if (query_lower in product.get('title', '').lower() or 
                query_lower in product.get('description', '').lower()):
                filtered_products.append(product)
        
        if not filtered_products:
            return f"No products found matching '{query}'."
        
        result = []
        for product in filtered_products[:5]:  # Limit to 5 results
            price = product.get('price', 0)
            result.append(f"- {product['title']} ({product.get('category', 'Unknown')}): {price} tokens")
        
        return "\n".join(result)
    except Exception as e:
        return f"Error during search: {str(e)}"

def list_all_products() -> str:
    """List all available products in the marketplace."""
    try:
        res = requests.get("http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return "No products available right now."
        
        result = []
        for product in data[:10]:  # Limit to 10 results
            price = product.get('price', 0)
            result.append(f"- {product['title']} ({product.get('category', 'Unknown')}): {price} tokens")
        
        return "\n".join(result)
    except Exception as e:
        return f"Error listing products: {str(e)}"

def get_products_by_category(category: str) -> str:
    """Get products by category. Pass category name like 'books', 'electronics', 'clothes', etc."""
    try:
        res = requests.get(f"http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return f"No products found under category '{category}'."
        
        # Filter by category
        category_products = []
        category_lower = category.lower()
        for product in data:
            if product.get('category', '').lower() == category_lower:
                category_products.append(product)
        
        if not category_products:
            return f"No products found under category '{category}'."
        
        result = []
        for product in category_products:
            price = product.get('price', 0)
            result.append(f"- {product['title']}: {price} tokens")
        
        return "\n".join(result)
    except Exception as e:
        return f"Error filtering category: {str(e)}"

def get_product_detail(product_id: str) -> str:
    """Get detailed info about a product by its ID."""
    try:
        res = requests.get(f"http://localhost:5005/api/products/{product_id}")
        if res.status_code != 200:
            return f"Product with ID '{product_id}' not found."
        
        product = res.json()
        price = product.get('price', 0)
        category = product.get('category', 'Unknown')
        description = product.get('description', 'No description available')
        
        return f"Product: {product['title']}\nCategory: {category}\nPrice: {price} tokens\nDescription: {description}"
    except Exception as e:
        return f"Error getting product detail: {str(e)}"

def get_user_token_balance(user_id: str) -> str:
    """Get the token balance for a specific user."""
    try:
        res = requests.get(f"http://localhost:5005/api/tokens/balance/{user_id}")
        if res.status_code != 200:
            return f"Could not retrieve token balance for user {user_id}."
        
        data = res.json()
        balance = data.get('balance', 0)
        return f"User {user_id} has {balance} green tokens."
    except Exception as e:
        return f"Error getting token balance: {str(e)}"

def get_user_transactions(user_id: str) -> str:
    """Get transaction history for a specific user."""
    try:
        res = requests.get(f"http://localhost:5005/api/tokens/transactions/{user_id}")
        if res.status_code != 200:
            return f"Could not retrieve transactions for user {user_id}."
        
        data = res.json()
        if not data:
            return f"No transactions found for user {user_id}."
        
        result = []
        for transaction in data[:5]:  # Limit to 5 recent transactions
            amount = transaction.get('amount', 0)
            transaction_type = transaction.get('type', 'unknown')
            description = transaction.get('description', 'No description')
            result.append(f"- {transaction_type}: {amount} tokens ({description})")
        
        return "\n".join(result)
    except Exception as e:
        return f"Error getting transactions: {str(e)}"

def get_sustainable_tips() -> str:
    """Provide sustainable living tips and green practices."""
    tips = [
        "♻️ Recycle paper, plastic, and electronics properly",
        "🌱 Use reusable bags and water bottles",
        "💡 Switch to energy-efficient LED bulbs",
        "🚶 Walk or bike for short trips instead of driving",
        "🌿 Support local farmers and buy organic when possible",
        "📱 Use digital receipts instead of paper",
        "🏠 Compost food waste to reduce landfill contribution",
        "🛒 Buy second-hand items to reduce waste",
        "💧 Fix leaky faucets and use water-saving devices",
        "🌞 Use natural light when possible instead of artificial lighting"
    ]
    return "Here are some sustainable living tips:\n\n" + "\n".join(tips)

def get_green_rewards_info() -> str:
    """Provide information about green rewards and token system."""
    info = [
        "🌿 Green Token System:",
        "• Each user starts with 1000 green tokens",
        "• Earn tokens through sustainable practices",
        "• Use tokens to buy and sell products",
        "• Support circular economy and reduce waste",
        "",
        "💚 How to earn tokens:",
        "• Recycle items properly",
        "• Donate used products instead of throwing away",
        "• Participate in community clean-up events",
        "• Use sustainable transportation",
        "• Support local and eco-friendly businesses",
        "",
        "🔄 Circular Economy Benefits:",
        "• Reduce environmental impact",
        "• Save money through reuse",
        "• Support community sustainability",
        "• Build a greener future together"
    ]
    return "\n".join(info)

# Tools

tools = [
    StructuredTool.from_function(
        name="search_products",
        description="Search products by name or description using a keyword. Use this when users want to find specific items.",
        func=search_products
    ),
    StructuredTool.from_function(
        name="list_all_products",
        description="List all available products in the marketplace. Use this when users want to see what's available.",
        func=list_all_products
    ),
    StructuredTool.from_function(
        name="get_products_by_category",
        description="Get products by category. Categories include: books, electronics, clothes, stationery, misc. Use this when users want to browse by category.",
        func=get_products_by_category
    ),
    StructuredTool.from_function(
        name="get_product_detail",
        description="Get detailed info about a product by its ID. Use this when users want specific information about a product.",
        func=get_product_detail
    ),
    StructuredTool.from_function(
        name="get_user_token_balance",
        description="Get the token balance for a specific user. Use this when users ask about their token balance.",
        func=get_user_token_balance
    ),
    StructuredTool.from_function(
        name="get_user_transactions",
        description="Get transaction history for a specific user. Use this when users want to see their transaction history.",
        func=get_user_transactions
    ),
    StructuredTool.from_function(
        name="get_sustainable_tips",
        description="Provide sustainable living tips and green practices. Use this when users ask for eco-friendly advice.",
        func=get_sustainable_tips
    ),
    StructuredTool.from_function(
        name="get_green_rewards_info",
        description="Provide information about green rewards and token system. Use this when users ask about the reward system.",
        func=get_green_rewards_info
    ),
    StructuredTool.from_function(
        name="reward_system_qa",
        description="Answer questions about the reward system like how many tokens for recycling, tiers, etc. Use this when users ask about how the reward system works.",
        func=answer_from_reward_guide
    )
]

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.4,
    openai_api_key=OPENAI_API_KEY
)

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
    handle_parsing_errors=True
)

@app.get("/")
async def root():
    return {
        "message": "PariMitra - Your Intelligent Agentic Ally for Sustainable Change",
        "status": "running",
        "endpoints": {
            "chat": "/chat",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "PariMitra"}

@app.post("/chat")
async def chat(query: Query):
    try:
        response = agent.run(query.user_input)
        return {"response": response}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 