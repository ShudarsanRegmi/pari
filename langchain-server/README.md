# PariMitra - Your Intelligent Agentic Ally for Sustainable Change

PariMitra is an AI-powered chatbot designed to help users navigate the WebNavigator marketplace and learn about sustainable practices. It provides intelligent assistance for product discovery, token management, and sustainable living tips.

## Features

- **Product Discovery**: Search and browse products by category, name, or description
- **Token Management**: Check token balances and transaction history
- **Sustainable Tips**: Get eco-friendly living advice and green practices
- **Reward System**: Learn about the green token system and how to earn tokens
- **RAG-powered Q&A**: Answer questions about sustainability using the reward system guide

## Setup

1. **Activate the virtual environment**:
   ```bash
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Initialize the reward system**:
   ```bash
   python rag/reward_rag.py
   ```

5. **Start the server**:
   ```bash
   python main.py
   ```

The server will run on `http://localhost:8000`

## API Endpoints

- `GET /` - Server information
- `GET /health` - Health check
- `POST /chat` - Chat with PariMitra

### Chat Endpoint

Send a POST request to `/chat` with:
```json
{
  "user_input": "What products do you have in the electronics category?"
}
```

## Tools Available

- **search_products**: Search products by keyword
- **list_all_products**: List all available products
- **get_products_by_category**: Get products by category
- **get_product_detail**: Get detailed product information
- **get_user_token_balance**: Check user token balance
- **get_user_transactions**: Get user transaction history
- **get_sustainable_tips**: Get eco-friendly living tips
- **get_green_rewards_info**: Learn about the token system
- **reward_system_qa**: Answer questions about the reward system

## Integration with WebNavigator

PariMitra connects to the WebNavigator backend running on `http://localhost:5005` to:
- Fetch product information
- Access token balances and transactions
- Provide real-time marketplace data

## Development

The chatbot uses:
- **FastAPI** for the web server
- **LangChain** for AI agent capabilities
- **OpenAI GPT-4o-mini** for natural language processing
- **FAISS** for vector storage
- **HuggingFace** embeddings for semantic search

## Directory Structure

```
langchain-server/
├── main.py              # Main FastAPI server
├── rag/
│   ├── reward_rag.py    # Vector store management
│   └── reward_tool.py   # RAG tool for Q&A
├── data/
│   └── Reward System.pdf # Reward system documentation
├── vectorstore/         # FAISS vector store files
├── requirements.txt     # Python dependencies
└── README.md           # This file
``` 