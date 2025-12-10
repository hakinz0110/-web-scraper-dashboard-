from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI(title="Web Scraper Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated scraped data (in real app, this would be from actual scraping)
products = [
    {"id": "1", "name": "MacBook Pro 14\"", "site": "Amazon", "basePrice": 1999},
    {"id": "2", "name": "iPhone 15 Pro", "site": "BestBuy", "basePrice": 999},
    {"id": "3", "name": "Sony WH-1000XM5", "site": "Amazon", "basePrice": 349},
    {"id": "4", "name": "Samsung 65\" OLED TV", "site": "Walmart", "basePrice": 1499},
    {"id": "5", "name": "PS5 Console", "site": "Target", "basePrice": 499},
]

def generate_price_history(base_price: float, days: int = 30):
    """Generate simulated price history"""
    history = []
    current_price = base_price
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
        # Random price fluctuation
        change = random.uniform(-0.05, 0.05)
        current_price = base_price * (1 + change)
        history.append({"date": date, "price": round(current_price, 2)})
    return history

@app.get("/")
def root():
    return {"message": "Web Scraper Dashboard API", "endpoints": ["/products", "/products/{id}", "/alerts"]}

@app.get("/products")
def get_products():
    """Get all tracked products with current prices"""
    result = []
    for product in products:
        history = generate_price_history(product["basePrice"])
        current_price = history[-1]["price"]
        prev_price = history[-2]["price"]
        change = ((current_price - prev_price) / prev_price) * 100
        
        result.append({
            **product,
            "currentPrice": current_price,
            "previousPrice": prev_price,
            "change": round(change, 2),
            "lowestPrice": min(h["price"] for h in history),
            "highestPrice": max(h["price"] for h in history),
            "lastUpdated": datetime.now().isoformat(),
        })
    return result

@app.get("/products/{product_id}")
def get_product(product_id: str):
    """Get product details with price history"""
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        return {"error": "Product not found"}
    
    history = generate_price_history(product["basePrice"])
    return {
        **product,
        "currentPrice": history[-1]["price"],
        "priceHistory": history,
        "lowestPrice": min(h["price"] for h in history),
        "highestPrice": max(h["price"] for h in history),
    }

@app.get("/alerts")
def get_alerts():
    """Get price drop alerts"""
    alerts = []
    for product in products:
        history = generate_price_history(product["basePrice"])
        current = history[-1]["price"]
        lowest = min(h["price"] for h in history)
        
        if current <= lowest * 1.02:  # Within 2% of lowest
            alerts.append({
                "productId": product["id"],
                "productName": product["name"],
                "currentPrice": current,
                "lowestPrice": lowest,
                "message": f"Price near all-time low!",
                "timestamp": datetime.now().isoformat(),
            })
    return alerts

@app.post("/track")
def track_product(url: str):
    """Add a new product to track (simulated)"""
    return {
        "success": True,
        "message": f"Now tracking: {url}",
        "productId": str(len(products) + 1),
    }
