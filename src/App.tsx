import { useState, useEffect } from 'react'
import { Toaster } from './components/ui/toaster'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Reservations from './pages/Reservations'
import Settings from './pages/Settings'
import blink from './blink/client'

// Placeholder components for other pages
const Orders = () => <div className="p-6"><h1 className="text-2xl font-bold">Orders Management</h1><p>Coming soon...</p></div>
const Menu = () => <div className="p-6"><h1 className="text-2xl font-bold">Menu Management</h1><p>Coming soon...</p></div>
const Tables = () => <div className="p-6"><h1 className="text-2xl font-bold">Table Management</h1><p>Coming soon...</p></div>
const Staff = () => <div className="p-6"><h1 className="text-2xl font-bold">Staff Management</h1><p>Coming soon...</p></div>
const Kitchen = () => <div className="p-6"><h1 className="text-2xl font-bold">Kitchen Display</h1><p>Coming soon...</p></div>
const Inventory = () => <div className="p-6"><h1 className="text-2xl font-bold">Inventory Management</h1><p>Coming soon...</p></div>
const Delivery = () => <div className="p-6"><h1 className="text-2xl font-bold">Delivery Partners</h1><p>Coming soon...</p></div>
const Campaigns = () => <div className="p-6"><h1 className="text-2xl font-bold">Marketing Campaigns</h1><p>Coming soon...</p></div>
const Analytics = () => <div className="p-6"><h1 className="text-2xl font-bold">Analytics & Reports</h1><p>Coming soon...</p></div>
const Billing = () => <div className="p-6"><h1 className="text-2xl font-bold">Billing & Payments</h1><p>Coming soon...</p></div>

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />
      case 'orders': return <Orders />
      case 'menu': return <Menu />
      case 'tables': return <Tables />
      case 'reservations': return <Reservations />
      case 'staff': return <Staff />
      case 'kitchen': return <Kitchen />
      case 'inventory': return <Inventory />
      case 'delivery': return <Delivery />
      case 'campaigns': return <Campaigns />
      case 'analytics': return <Analytics />
      case 'billing': return <Billing />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Restaurant CRM...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant CRM</h1>
            <p className="text-xl text-gray-600">Revolutionize your dine-in experience</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your restaurant dashboard</p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="lg:pl-64">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
        />
        
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App