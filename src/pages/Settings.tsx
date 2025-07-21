import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { 
  Settings as SettingsIcon, 
  Store, 
  Bell, 
  CreditCard, 
  Users, 
  Shield,
  Save
} from 'lucide-react'
import blink from '../blink/client'

interface RestaurantSettings {
  name: string
  address: string
  phone: string
  email: string
  cuisineType: string
  totalTables: number
}

export default function Settings() {
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    cuisineType: '',
    totalTables: 0
  })
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    reservations: true,
    payments: true
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load restaurant settings
      const restaurants = await blink.db.restaurants.list({
        where: { user_id: user.id },
        limit: 1
      })

      if (restaurants.length > 0) {
        const restaurant = restaurants[0]
        setRestaurantSettings({
          name: restaurant.name || '',
          address: restaurant.address || '',
          phone: restaurant.phone || '',
          email: restaurant.email || '',
          cuisineType: restaurant.cuisineType || '',
          totalTables: restaurant.totalTables || 0
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const saveRestaurantSettings = async () => {
    try {
      const user = await blink.auth.me()
      
      // Check if restaurant exists
      const restaurants = await blink.db.restaurants.list({
        where: { user_id: user.id },
        limit: 1
      })

      if (restaurants.length > 0) {
        // Update existing restaurant
        await blink.db.restaurants.update(restaurants[0].id, {
          name: restaurantSettings.name,
          address: restaurantSettings.address,
          phone: restaurantSettings.phone,
          email: restaurantSettings.email,
          cuisineType: restaurantSettings.cuisineType,
          totalTables: restaurantSettings.totalTables,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new restaurant
        await blink.db.restaurants.create({
          id: `restaurant_${Date.now()}`,
          user_id: user.id,
          name: restaurantSettings.name,
          address: restaurantSettings.address,
          phone: restaurantSettings.phone,
          email: restaurantSettings.email,
          cuisineType: restaurantSettings.cuisineType,
          totalTables: restaurantSettings.totalTables,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your restaurant settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input
                    id="name"
                    value={restaurantSettings.name}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, name: e.target.value})}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input
                    id="cuisineType"
                    value={restaurantSettings.cuisineType}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, cuisineType: e.target.value})}
                    placeholder="e.g., Indian, Italian, Chinese"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={restaurantSettings.address}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, address: e.target.value})}
                  placeholder="Enter complete address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={restaurantSettings.phone}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={restaurantSettings.email}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="totalTables">Total Tables</Label>
                <Input
                  id="totalTables"
                  type="number"
                  value={restaurantSettings.totalTables}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, totalTables: parseInt(e.target.value) || 0})}
                  placeholder="Enter total number of tables"
                />
              </div>
              
              <Button onClick={saveRestaurantSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Restaurant Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newOrders">New Orders</Label>
                  <p className="text-sm text-gray-600">Get notified when new orders are placed</p>
                </div>
                <Switch
                  id="newOrders"
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) => setNotifications({...notifications, newOrders: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowStock">Low Stock Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified when inventory is running low</p>
                </div>
                <Switch
                  id="lowStock"
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reservations">Reservation Updates</Label>
                  <p className="text-sm text-gray-600">Get notified about new reservations and changes</p>
                </div>
                <Switch
                  id="reservations"
                  checked={notifications.reservations}
                  onCheckedChange={(checked) => setNotifications({...notifications, reservations: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payments">Payment Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified about payment confirmations and failures</p>
                </div>
                <Switch
                  id="payments"
                  checked={notifications.payments}
                  onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Configure Payment Methods
              </Button>
              <Button variant="outline" className="w-full">
                Tax Settings
              </Button>
              <Button variant="outline" className="w-full">
                Receipt Templates
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Staff Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                User Roles & Permissions
              </Button>
              <Button variant="outline" className="w-full">
                Staff Access Control
              </Button>
              <Button variant="outline" className="w-full">
                Shift Management
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full">
                Data Export
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}