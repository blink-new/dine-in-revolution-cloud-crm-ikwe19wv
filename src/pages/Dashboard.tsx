import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  Clock,
  ChefHat,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import blink from '../blink/client'

interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  activeReservations: number
  availableTables: number
  pendingOrders: number
  lowStockItems: number
}

interface RecentOrder {
  id: string
  tableId: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    activeReservations: 0,
    availableTables: 0,
    pendingOrders: 0,
    lowStockItems: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      // First, get the user's restaurant
      const restaurants = await blink.db.restaurants.list({
        where: { user_id: user.id }
      })
      
      if (restaurants.length === 0) {
        console.log('No restaurant found for user')
        // Set empty stats for new users
        setStats({
          todayRevenue: 0,
          todayOrders: 0,
          activeReservations: 0,
          availableTables: 0,
          pendingOrders: 0,
          lowStockItems: 0
        })
        setRecentOrders([])
        setLoading(false)
        return
      }
      
      const restaurant = restaurants[0]
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

      // Load today's orders for revenue calculation
      const todayOrders = await blink.db.orders.list({
        where: { 
          restaurant_id: restaurant.id
        }
      })
      
      // Filter today's orders manually since we need date range
      const todayOrdersFiltered = todayOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= new Date(todayStart) && orderDate < new Date(todayEnd)
      })

      // Calculate today's revenue
      const todayRevenue = todayOrdersFiltered.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0)

      // Load active reservations
      const activeReservations = await blink.db.reservations.list({
        where: { 
          restaurant_id: restaurant.id,
          status: 'confirmed'
        }
      })

      // Load tables from restaurant_tables
      const tables = await blink.db.restaurantTables.list({
        where: { restaurant_id: restaurant.id }
      })
      const availableTables = tables.filter(table => table.status === 'available').length

      // Load pending orders
      const pendingOrders = await blink.db.orders.list({
        where: { 
          restaurant_id: restaurant.id,
          status: 'pending'
        }
      })

      // Load low stock items
      const inventory = await blink.db.inventory.list({
        where: { user_id: user.id }
      })
      const lowStockItems = inventory.filter(item => 
        Number(item.current_stock) <= Number(item.minimum_stock)
      ).length

      // Load recent orders
      const recent = await blink.db.orders.list({
        where: { restaurant_id: restaurant.id },
        orderBy: { created_at: 'desc' },
        limit: 5
      })

      setStats({
        todayRevenue,
        todayOrders: todayOrdersFiltered.length,
        activeReservations: activeReservations.length,
        availableTables,
        pendingOrders: pendingOrders.length,
        lowStockItems
      })

      setRecentOrders(recent.map(order => ({
        id: order.id,
        tableId: order.table_id || 'N/A',
        customerName: order.customer_name || 'Walk-in',
        totalAmount: Number(order.total_amount) || 0,
        status: order.status || 'pending',
        createdAt: order.created_at
      })))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'served': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReservations}</div>
            <p className="text-xs text-muted-foreground">
              For today and upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableTables}</div>
            <p className="text-xs text-muted-foreground">
              Ready for customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Add Reservation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Tables
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen Display
            </Button>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.pendingOrders > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.pendingOrders} pending orders
                  </p>
                  <p className="text-xs text-yellow-600">
                    Orders waiting for confirmation
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View Orders
                </Button>
              </div>
            )}

            {stats.lowStockItems > 0 && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {stats.lowStockItems} items low in stock
                  </p>
                  <p className="text-xs text-red-600">
                    Restock required soon
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View Inventory
                </Button>
              </div>
            )}

            {stats.pendingOrders === 0 && stats.lowStockItems === 0 && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    All systems running smoothly
                  </p>
                  <p className="text-xs text-green-600">
                    No urgent actions required
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-600">Table {order.tableId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}