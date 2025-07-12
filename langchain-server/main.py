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
from typing import Optional
import re
from datetime import datetime

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
    user_id: Optional[str] = None

# Global variable to store current user ID
current_user_id = None

# Tool Functions for WebNavigator Product System

def search_products(query: str) -> str:
    """Search products by name or description using a keyword."""
    try:
        res = requests.get(f"http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return "No products found matching your search."
        
        # Filter products based on query with fuzzy matching
        filtered_products = []
        query_lower = query.lower()
        for product in data:
            title_lower = product.get('title', '').lower()
            desc_lower = product.get('description', '').lower()
            
            # Check for exact match or partial match
            if (query_lower in title_lower or 
                query_lower in desc_lower or
                title_lower in query_lower or  # Handle typos like "bootle" vs "bottle"
                any(word in title_lower for word in query_lower.split()) or
                any(word in desc_lower for word in query_lower.split())):
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
        condition = product.get('condition', 'Unknown')
        seller = product.get('sellerName', 'Unknown')
        created_at = product.get('createdAt', 'Unknown')
        
        return f"""Product Details:
- Title: {product['title']}
- Category: {category}
- Price: {price} tokens
- Condition: {condition}
- Seller: {seller}
- Description: {description}
- Listed: {created_at}"""
    except Exception as e:
        return f"Error getting product detail: {str(e)}"

def get_product_by_name(product_name: str) -> str:
    """Get detailed information about a product by searching for its name."""
    try:
        res = requests.get("http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return f"Product '{product_name}' not found."
        
        # Find product by name with fuzzy matching
        product = None
        product_name_lower = product_name.lower()
        
        # First try exact match
        for p in data:
            if p.get('title', '').lower() == product_name_lower:
                product = p
                break
        
        # If no exact match, try partial match
        if not product:
            for p in data:
                title_lower = p.get('title', '').lower()
                if (product_name_lower in title_lower or 
                    title_lower in product_name_lower or
                    any(word in title_lower for word in product_name_lower.split())):
                    product = p
                    break
        
        if not product:
            return f"Product '{product_name}' not found."
        
        price = product.get('price', 0)
        category = product.get('category', 'Unknown')
        description = product.get('description', 'No description available')
        condition = product.get('condition', 'Unknown')
        seller = product.get('sellerName', 'Unknown')
        created_at = product.get('createdAt', 'Unknown')
        
        return f"""Product Details:
- Title: {product['title']}
- Category: {category}
- Price: {price} tokens
- Condition: {condition}
- Seller: {seller}
- Description: {description}
- Listed: {created_at}"""
    except Exception as e:
        return f"Error getting product detail: {str(e)}"

def get_marketplace_stats() -> str:
    """Get statistics about the marketplace including total products, categories, etc."""
    try:
        res = requests.get("http://localhost:5005/api/products")
        data = res.json()
        if not data:
            return "No products in marketplace."
        
        total_products = len(data)
        categories = {}
        total_value = 0
        
        for product in data:
            category = product.get('category', 'Unknown')
            categories[category] = categories.get(category, 0) + 1
            total_value += product.get('price', 0)
        
        result = f"""Marketplace Statistics:
- Total Products: {total_products}
- Total Value: {total_value} tokens
- Categories: {', '.join(categories.keys())}
- Products by Category:"""
        
        for category, count in categories.items():
            result += f"\n  - {category}: {count} products"
        
        return result
    except Exception as e:
        return f"Error getting marketplace stats: {str(e)}"

def get_pricing_guidance() -> str:
    """Provide guidance on how to price products in the marketplace."""
    return """Pricing Guidance for WebNavigator Marketplace:

**General Guidelines:**
- New items: 80-100% of original price
- Like new: 60-80% of original price  
- Good condition: 40-60% of original price
- Fair condition: 20-40% of original price
- Poor condition: 10-20% of original price

**Category-Specific Tips:**
- **Books**: 500-5000 tokens (textbooks higher)
- **Electronics**: 1000-50000 tokens (based on age/condition)
- **Clothes**: 500-3000 tokens (brand matters)
- **Stationery**: 100-1000 tokens
- **Misc**: 100-2000 tokens

**Factors to Consider:**
- Original price and age
- Current condition
- Brand reputation
- Market demand
- Seasonal factors

**Tips for Better Sales:**
- Take clear photos
- Write detailed descriptions
- Be honest about condition
- Respond quickly to inquiries
- Price competitively"""

def get_selling_tips() -> str:
    """Provide tips for selling products effectively."""
    return """Tips for Successful Selling on WebNavigator:

**Before Listing:**
- Clean and prepare your item
- Take high-quality photos from multiple angles
- Research similar items' prices
- Write a detailed, honest description

**Writing Your Listing:**
- Use clear, descriptive titles
- Include all relevant details (size, brand, condition)
- Mention any defects honestly
- Add keywords people might search for
- Set a fair, competitive price

**Customer Service:**
- Respond to messages quickly
- Be polite and professional
- Provide accurate information
- Handle issues promptly

**Pricing Strategy:**
- Start with a competitive price
- Consider offering slight discounts
- Be open to reasonable offers
- Don't overprice - better to sell than sit

**Building Trust:**
- Complete your profile
- Add profile picture
- Respond to reviews
- Be consistent with your listings"""

def get_buying_tips() -> str:
    """Provide tips for buying products safely and effectively."""
    return """Tips for Smart Buying on WebNavigator:

**Before Buying:**
- Check seller's profile and reviews
- Read the full product description
- Look at all photos carefully
- Ask questions if needed
- Compare prices with similar items

**Communication:**
- Ask about item condition
- Request additional photos if needed
- Clarify any unclear details
- Discuss meeting arrangements
- Confirm price and payment method

**Safety Tips:**
- Meet in public, well-lit locations
- Bring a friend if possible
- Inspect items before paying
- Use the platform's messaging system
- Trust your instincts

**Payment:**
- Use tokens for secure transactions
- Don't pay before seeing the item
- Keep records of transactions
- Report any issues immediately

**After Purchase:**
- Leave honest reviews
- Contact support for problems
- Build relationships with good sellers"""

def get_platform_help() -> str:
    """Provide general help and information about the WebNavigator platform."""
    return """WebNavigator Platform Help:

**What is WebNavigator?**
WebNavigator is a sustainable marketplace where users can buy and sell items using green tokens, promoting eco-friendly consumption and reducing waste.

**Key Features:**
- Token-based transactions
- Category-based browsing
- User reviews and ratings
- Contact seller functionality
- Sustainable living rewards

**How to Get Started:**
1. Create an account
2. Browse available products
3. Earn tokens through sustainable activities
4. Start buying and selling

**Token System:**
- New users get 1000 tokens
- Earn tokens for sustainable actions
- Use tokens to buy products
- Sell items to earn more tokens

**Categories Available:**
- Books (textbooks, novels, etc.)
- Electronics (phones, laptops, etc.)
- Clothes (shirts, dresses, etc.)
- Stationery (pens, notebooks, etc.)
- Misc (various other items)

**Support:**
- Use the chat for questions
- Check the help section
- Contact support for issues
- Read community guidelines

**Safety:**
- Meet in public places
- Inspect items before buying
- Use platform messaging
- Report suspicious activity"""

def get_user_profile_info() -> str:
    """Get information about user profile and account."""
    global current_user_id
    if not current_user_id:
        return "Please provide your user ID to check your profile information."
    
    try:
        # Get user info
        res = requests.get(f"http://localhost:5005/api/users/{current_user_id}")
        if res.status_code != 200:
            return "User profile not found."
        
        user = res.json()
        
        # Get token balance
        balance_res = requests.get(f"http://localhost:5005/api/tokens/balance/{current_user_id}")
        balance = balance_res.json() if balance_res.status_code == 200 else {"balance": "Unknown"}
        
        # Get user's products
        products_res = requests.get(f"http://localhost:5005/api/products")
        products = products_res.json() if products_res.status_code == 200 else []
        user_products = [p for p in products if p.get('sellerId') == current_user_id]
        
        return f"""User Profile Information:
- Username: {user.get('username', 'Unknown')}
- Display Name: {user.get('displayName', 'Unknown')}
- Email: {user.get('email', 'Unknown')}
- Token Balance: {balance.get('balance', 'Unknown')} tokens
- Products Listed: {len(user_products)} items
- Member Since: {user.get('createdAt', 'Unknown')}"""
    except Exception as e:
        return f"Error getting profile info: {str(e)}"

def get_user_selling_history() -> str:
    """Get the user's selling history and statistics."""
    global current_user_id
    if not current_user_id:
        return "Please provide your user ID to check your selling history."
    
    try:
        # Get user's products
        res = requests.get("http://localhost:5005/api/products")
        data = res.json() if res.status_code == 200 else []
        
        user_products = [p for p in data if p.get('sellerId') == current_user_id]
        
        if not user_products:
            return "You haven't listed any products yet."
        
        active_listings = [p for p in user_products if not p.get('isSold', False)]
        sold_items = [p for p in user_products if p.get('isSold', False)]
        
        total_value = sum(p.get('price', 0) for p in sold_items)
        
        result = f"""Your Selling History:
- Total Items Listed: {len(user_products)}
- Active Listings: {len(active_listings)}
- Sold Items: {len(sold_items)}
- Total Sales Value: {total_value} tokens

Active Listings:"""
        
        for product in active_listings[:5]:  # Show first 5
            result += f"\n- {product['title']}: {product.get('price', 0)} tokens"
        
        if sold_items:
            result += "\n\nRecently Sold:"
            for product in sold_items[:3]:  # Show first 3
                result += f"\n- {product['title']}: {product.get('price', 0)} tokens"
        
        return result
    except Exception as e:
        return f"Error getting selling history: {str(e)}"

def get_user_buying_history() -> str:
    """Get the user's buying history and statistics."""
    global current_user_id
    if not current_user_id:
        return "Please provide your user ID to check your buying history."
    
    try:
        # Get user's transactions
        res = requests.get(f"http://localhost:5005/api/tokens/transactions/{current_user_id}")
        data = res.json() if res.status_code == 200 else []
        
        purchases = [t for t in data if t.get('type') == 'purchase']
        
        if not purchases:
            return "You haven't made any purchases yet."
        
        total_spent = sum(abs(t.get('amount', 0)) for t in purchases)
        unique_products = len(set(t.get('productId') for t in purchases if t.get('productId')))
        
        result = f"""Your Buying History:
- Total Purchases: {len(purchases)}
- Unique Products: {unique_products}
- Total Spent: {total_spent} tokens

Recent Purchases:"""
        
        for transaction in purchases[:5]:  # Show first 5
            result += f"\n- {transaction.get('description', 'Unknown item')}: {abs(transaction.get('amount', 0))} tokens"
        
        return result
    except Exception as e:
        return f"Error getting buying history: {str(e)}"

def get_category_explanation(category: str) -> str:
    """Explain what items belong to a specific category."""
    category_info = {
        'books': """Books Category includes:
- Textbooks and academic books
- Novels and fiction
- Non-fiction books
- Magazines and journals
- Reference materials
- Children's books
- Comic books and graphic novels

Tips for books: Check edition, condition, and whether it's current for textbooks.""",
        
        'electronics': """Electronics Category includes:
- Mobile phones and smartphones
- Laptops and computers
- Tablets and e-readers
- Cameras and photography equipment
- Audio devices (headphones, speakers)
- Gaming consoles and accessories
- Small appliances
- Chargers and cables

Tips for electronics: Check functionality, age, and included accessories.""",
        
        'clothes': """Clothes Category includes:
- Shirts, t-shirts, and tops
- Dresses and skirts
- Pants, jeans, and trousers
- Jackets and coats
- Sweaters and hoodies
- Shoes and footwear
- Accessories (bags, jewelry)
- Sportswear and activewear

Tips for clothes: Check size, brand, and condition carefully.""",
        
        'stationery': """Stationery Category includes:
- Pens, pencils, and markers
- Notebooks and journals
- Paper and folders
- Office supplies
- Art supplies
- Backpacks and bags
- Calculators and organizers
- Stamps and stickers

Tips for stationery: Check if items are new or gently used.""",
        
        'misc': """Miscellaneous Category includes:
- Home and garden items
- Sports equipment
- Toys and games
- Kitchen and dining items
- Beauty and personal care
- Tools and hardware
- Musical instruments
- Collectibles and antiques

Tips for misc items: Be specific about condition and functionality."""
    }
    
    category_lower = category.lower()
    if category_lower in category_info:
        return category_info[category_lower]
    else:
        return f"Category '{category}' not found. Available categories: books, electronics, clothes, stationery, misc"

def get_condition_guide() -> str:
    """Provide a guide for understanding product conditions."""
    return """Product Condition Guide:

**New:**
- Never used, in original packaging
- Perfect condition
- May have minor shelf wear
- 80-100% of original value

**Like New:**
- Used very little, looks new
- No visible wear or damage
- May have been tried on/tested
- 60-80% of original value

**Good:**
- Used but well-maintained
- Minor wear and tear
- Fully functional
- 40-60% of original value

**Fair:**
- Used with visible wear
- May have minor damage
- Still functional
- 20-40% of original value

**Poor:**
- Significant wear or damage
- May have functional issues
- Parts may be missing
- 10-20% of original value

**Tips for Assessing Condition:**
- Ask for detailed photos
- Request specific information about wear
- Check for missing parts or damage
- Consider age and usage
- Compare with similar items"""

def enlist_product(product_description: str) -> str:
    """
    Enlist a product for sale using natural language description.
    Intelligently extracts product details from user's natural language input.
    """
    try:
        # Enhanced intelligent parsing of natural language input
        description_lower = product_description.lower()
        
        # Extract title - look for the main product name
        # Common patterns for product titles
        title_patterns = [
            r'^(.*?)\s+(?:for|around|about|costs?|priced?)\s+\d+',  # "watch for 200"
            r'^(.*?)\s+\d+\s+tokens?',  # "watch 200 tokens"
            r'^(.*?)\s+price\s+\d+',  # "watch price 200"
            r'^(.*?)\s+(?:is|was|costs?)\s+\d+',  # "watch is 200"
        ]
        
        title = None
        for pattern in title_patterns:
            match = re.search(pattern, product_description, re.IGNORECASE)
            if match:
                title = match.group(1).strip()
                break
        
        # If no pattern matched, try to extract the first meaningful word/phrase
        if not title:
            words = product_description.split()
            # Skip common words and focus on product names
            skip_words = {'i', 'want', 'to', 'sell', 'a', 'an', 'the', 'for', 'around', 'about', 'tokens', 'price', 'is', 'was', 'costs', 'priced'}
            product_words = [word for word in words if word.lower() not in skip_words and not word.isdigit()]
            if product_words:
                title = ' '.join(product_words[:3])  # Take first 3 words as title
        
        # Extract price - look for numbers followed by "tokens" or just numbers
        price_match = re.search(r'(\d+)\s*tokens?', product_description, re.IGNORECASE)
        if not price_match:
            # Look for just numbers that might be prices
            numbers = re.findall(r'\b(\d+)\b', product_description)
            if numbers:
                # Assume the first number is the price
                price = int(numbers[0])
            else:
                return "Please specify the price in tokens (e.g., '200 tokens' or just '200')."
        else:
            price = int(price_match.group(1))
        
        # Enhanced category detection with more keywords
        category_keywords = {
            'books': ['book', 'textbook', 'novel', 'magazine', 'journal', 'textbook', 'dictionary', 'encyclopedia'],
            'electronics': ['phone', 'laptop', 'computer', 'electronic', 'device', 'gadget', 'camera', 'headphone', 'tablet', 'smartphone', 'mobile', 'watch', 'smartwatch', 'fitness', 'tracker'],
            'clothes': ['shirt', 'dress', 'pants', 'jeans', 'jacket', 'sweater', 'clothing', 'apparel', 'shoes', 'boots', 'sneakers', 'hat', 'cap', 'scarf', 'belt'],
            'stationery': ['pen', 'pencil', 'notebook', 'paper', 'folder', 'stationery', 'office', 'binder', 'calculator', 'ruler', 'eraser'],
            'misc': ['misc', 'other', 'various', 'assorted', 'accessory', 'tool', 'toy', 'game', 'sport', 'furniture', 'kitchen', 'home', 'garden']
        }
        
        category = 'misc'  # default
        for cat, keywords in category_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                category = cat
                break
        
        # Enhanced condition detection with more context
        condition_keywords = {
            'new': ['new', 'brand new', 'unused', 'unopened', 'sealed'],
            'like_new': ['like new', 'excellent', 'perfect', 'barely used', 'almost new', 'mint', 'pristine'],
            'good': ['good', 'well maintained', 'decent', 'working', 'functional', 'in good condition', 'good condition'],
            'fair': ['fair', 'acceptable', 'used', 'worn', 'some wear', 'minor damage'],
            'poor': ['poor', 'worn out', 'damaged', 'broken', 'needs repair', 'heavily used']
        }
        
        condition = 'good'  # default
        for cond, keywords in condition_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                condition = cond
                break
        
        # Special handling for time-based condition clues
        if any(phrase in description_lower for phrase in ['not used', 'only used', 'barely used', 'hardly used']):
            if any(phrase in description_lower for phrase in ['days', 'weeks', 'months']):
                condition = 'like_new'
            else:
                condition = 'good'
        
        # Extract description - use the original input but clean it up
        description = product_description.strip()
        
        # Extract image URL if provided
        image_url_match = re.search(r'image[:\s]+(https?://[^\s]+)', product_description, re.IGNORECASE)
        image_url = image_url_match.group(1) if image_url_match else ""
        
        # Validate required fields
        if not title or len(title.strip()) < 2:
            return "I couldn't identify a clear product title. Please provide a more specific product name."
        
        if price <= 0:
            return "Please provide a valid price greater than 0 tokens."
        
        # Prepare product data
        product_data = {
            "title": title,
            "description": description,
            "price": price,
            "category": category,
            "condition": condition,
            "sellerId": current_user_id if current_user_id else "default_user",
            "imageUrl": image_url
        }
        
        # Create the product
        res = requests.post("http://localhost:5005/api/products", json=product_data)
        
        if res.status_code == 201:
            product = res.json()
            return f"✅ Product successfully enlisted!\n\n**{product['title']}**\nCategory: {product['category']}\nPrice: {product['price']} tokens\nCondition: {product['condition']}\n\nYour product is now available in the marketplace!"
        else:
            error_data = res.json()
            return f"❌ Failed to enlist product: {error_data.get('message', 'Unknown error')}"
            
    except Exception as e:
        return f"Error enlisting product: {str(e)}"

def get_user_token_balance(user_id: str) -> str:
    """Get the token balance for a specific user."""
    try:
        res = requests.get(f"http://localhost:5005/api/tokens/balance/{user_id}")
        if res.status_code != 200:
            return f"Could not retrieve token balance for user {user_id}."
        
        data = res.json()
        balance = data.get('balance', 0)
        return f"You have {balance} green tokens."
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
            return "You have no transactions yet."
        
        result = ["Your recent transactions:"]
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

def answer_from_reward_guide(question: str) -> str:
    """Answer questions about the reward system."""
    if "tiers" in question.lower():
        return "WebNavigator has a tiered token system. New users start with 1000 tokens. Earn tokens by recycling, donating, and participating in sustainable activities. Higher tiers offer more rewards."
    elif "recycling" in question.lower():
        return "To earn tokens for recycling, ensure you recycle paper, plastic, and electronics properly. This includes sorting, cleaning, and disposing of hazardous materials. You can also donate used products to local charities or recycling centers."
    elif "donate" in question.lower():
        return "You can donate used products to local charities, recycling centers, or community initiatives. This not only helps reduce waste but also earns you tokens. Items should be clean, functional, and in good condition."
    elif "community" in question.lower():
        return "Participate in community clean-up events, plant trees, or join local sustainability groups. These activities not only help the environment but also earn you tokens. WebNavigator rewards community engagement."
    elif "sustainable" in question.lower():
        return "WebNavigator encourages sustainable living. Use reusable bags, water bottles, energy-efficient bulbs, and digital receipts. Walk or bike for short trips. Support local farmers and buy organic when possible."
    elif "circular" in question.lower():
        return "WebNavigator promotes a circular economy. By buying and selling second-hand items, you reduce waste and support community sustainability. Compost food waste and fix leaky faucets to contribute to a greener future."
    else:
        return "I can help you understand the token system and how to earn tokens. How can I assist you further?"

# Global variable to store current user ID for the session
current_user_id = None

def set_current_user_id(user_id: str):
    """Set the current user ID for the session."""
    global current_user_id
    current_user_id = user_id

def get_user_token_balance_wrapped() -> str:
    """Get the token balance for the current user (no parameters needed)."""
    global current_user_id
    if not current_user_id:
        return "Please log in to check your token balance."
    return get_user_token_balance(current_user_id)

def get_user_transactions_wrapped() -> str:
    """Get transaction history for the current user (no parameters needed)."""
    global current_user_id
    if not current_user_id:
        return "Please log in to view your transaction history."
    return get_user_transactions(current_user_id)

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
        name="get_product_by_name",
        description="Get detailed information about a product by searching for its name. Use this when users want to find a specific product by its name.",
        func=get_product_by_name
    ),
    StructuredTool.from_function(
        name="get_marketplace_stats",
        description="Get statistics about the marketplace including total products, categories, etc. Use this when users want to know about the overall marketplace.",
        func=get_marketplace_stats
    ),
    StructuredTool.from_function(
        name="get_pricing_guidance",
        description="Provide guidance on how to price products in the marketplace. Use this when users want to know how to set a fair price for their products.",
        func=get_pricing_guidance
    ),
    StructuredTool.from_function(
        name="get_selling_tips",
        description="Provide tips for selling products effectively. Use this when users want to learn how to sell their products successfully.",
        func=get_selling_tips
    ),
    StructuredTool.from_function(
        name="get_buying_tips",
        description="Provide tips for buying products safely and effectively. Use this when users want to learn how to buy products safely.",
        func=get_buying_tips
    ),
    StructuredTool.from_function(
        name="get_platform_help",
        description="Provide general help and information about the WebNavigator platform. Use this when users want to learn about the platform's features and how to get started.",
        func=get_platform_help
    ),
    StructuredTool.from_function(
        name="get_user_profile_info",
        description="Get information about user profile and account. Use this when users want to check their profile details and token balance.",
        func=get_user_profile_info
    ),
    StructuredTool.from_function(
        name="get_user_selling_history",
        description="Get the user's selling history and statistics. Use this when users want to see their product listings and sales value.",
        func=get_user_selling_history
    ),
    StructuredTool.from_function(
        name="get_user_buying_history",
        description="Get the user's buying history and statistics. Use this when users want to see their purchase history and total spent.",
        func=get_user_buying_history
    ),
    StructuredTool.from_function(
        name="get_category_explanation",
        description="Explain what items belong to a specific category. Use this when users want to know what types of items are available in a particular category.",
        func=get_category_explanation
    ),
    StructuredTool.from_function(
        name="get_condition_guide",
        description="Provide a guide for understanding product conditions. Use this when users want to know how to assess the condition of a product.",
        func=get_condition_guide
    ),
    StructuredTool.from_function(
        name="enlist_product",
        description="Enlist a product for sale using natural language description. The user should provide: title, description, price in tokens, category, condition, and optionally image URL. Categories: books, electronics, clothes, stationery, misc. Conditions: new, like_new, good, fair, poor. Use this when users want to sell a product.",
        func=enlist_product
    ),
    StructuredTool.from_function(
        name="get_user_token_balance",
        description="Get the token balance for the current user. Use this when users ask about their token balance. No user ID needed - it's automatically provided.",
        func=get_user_token_balance_wrapped
    ),
    StructuredTool.from_function(
        name="get_user_transactions",
        description="Get transaction history for the current user. Use this when users want to see their transaction history. No user ID needed - it's automatically provided.",
        func=get_user_transactions_wrapped
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

# Create agent with custom system prompt to be smarter about product enlistment
system_message = """You are PariMitra, an intelligent AI assistant for WebNavigator - a sustainable marketplace platform.

IMPORTANT: When users want to sell or enlist a product, ALWAYS use the `enlist_product` tool with their natural language description. Do NOT ask for individual details like title, price, category, etc. The `enlist_product` tool is designed to intelligently parse natural language input and extract all required information automatically.

For example:
- User says: "I want to sell a watch for around 200 tokens, it's only used for 10 days"
- You should call: `enlist_product("I want to sell a watch for around 200 tokens, it's only used for 10 days")`
- Do NOT ask: "What's the title? What's the price? What's the category?"

The `enlist_product` tool can intelligently extract:
- Product title from the description
- Price from numbers and "tokens" mentions
- Category from product type keywords
- Condition from usage descriptions
- Description from the full input

You have access to various tools to help users with:
1. Product search and browsing
2. Token balance and transactions
3. Sustainable living tips
4. Platform help and guidance
5. Product enlistment (use enlist_product tool for this)

Always be helpful, friendly, and focus on sustainability and community building."""

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
    handle_parsing_errors=True,
    agent_kwargs={
        "system_message": system_message
    }
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
        # Set the current user ID for this request
        if query.user_id:
            set_current_user_id(query.user_id)
        
        response = agent.run(query.user_input)
        return {"response": response}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 