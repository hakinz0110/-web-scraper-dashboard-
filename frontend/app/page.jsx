'use client'
import { useState, useEffect } from 'react'
import { Search, Bell, TrendingUp, TrendingDown, Moon, Sun, Plus, ExternalLink, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Simulated data (in real app, fetch from backend)
const generateHistory = (basePrice) => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: basePrice * (1 + (Math.random() - 0.5) * 0.1),
  }))
}

const initialProducts = [
  { id: '1', name: 'MacBook Pro 14"', site: 'Amazon', basePrice: 1999, image: '💻' },
  { id: '2', name: 'iPhone 15 Pro', site: 'BestBuy', basePrice: 999, image: '📱' },
  { id: '3', name: 'Sony WH-1000XM5', site: 'Amazon', basePrice: 349, image: '🎧' },
  { id: '4', name: 'Samsung 65" OLED TV', site: 'Walmart', basePrice: 1499, image: '📺' },
  { id: '5', name: 'PS5 Console', site: 'Target', basePrice: 499, image: '🎮' },
].map(p => {
  const history = generateHistory(p.basePrice)
  const current = history[history.length - 1].price
  const prev = history[history.length - 2].price
  return {
    ...p,
    currentPrice: current,
    change: ((current - prev) / prev) * 100,
    lowestPrice: Math.min(...history.map(h => h.price)),
    highestPrice: Math.max(...history.map(h => h.price)),
    history,
  }
})

export default function Home() {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [search, setSearch] = useState('')
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    // Check for price alerts
    const newAlerts = products.filter(p => p.currentPrice <= p.lowestPrice * 1.02)
      .map(p => ({ id: p.id, name: p.name, price: p.currentPrice, lowest: p.lowestPrice }))
    setAlerts(newAlerts)
  }, [products])

  const refreshPrices = () => {
    setProducts(products.map(p => {
      const history = generateHistory(p.basePrice)
      const current = history[history.length - 1].price
      const prev = history[history.length - 2].price
      return {
        ...p,
        currentPrice: current,
        change: ((current - prev) / prev) * 100,
        lowestPrice: Math.min(...history.map(h => h.price)),
        highestPrice: Math.max(...history.map(h => h.price)),
        history,
      }
    }))
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="text-indigo-600" size={28} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Price Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="text-gray-600 dark:text-gray-300 cursor-pointer" size={20} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </div>
              <button onClick={refreshPrices} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {darkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">🔔 Price Alerts</h3>
              {alerts.map(alert => (
                <p key={alert.id} className="text-sm text-green-700 dark:text-green-300">
                  {alert.name} is near its lowest price! Current: ${alert.price.toFixed(2)}
                </p>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{product.image}</div>
                  <span className={`flex items-center gap-1 text-sm ${product.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {product.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(product.change).toFixed(1)}%
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.site}</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  ${product.currentPrice.toFixed(2)}
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Low: ${product.lowestPrice.toFixed(2)}</span>
                  <span>High: ${product.highestPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Price History Chart */}
          {selectedProduct && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">30-day price history</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedProduct.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
