import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Calendar, 
  ShoppingCart, 
  Users, 
  Package, 
  Truck, 
  Megaphone, 
  Settings, 
  BarChart3,
  CreditCard,
  QrCode,
  ChefHat,
  UserCheck,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Orders', icon: ShoppingCart, id: 'orders' },
  { name: 'Menu Management', icon: UtensilsCrossed, id: 'menu' },
  { name: 'Table Management', icon: QrCode, id: 'tables' },
  { name: 'Reservations', icon: Calendar, id: 'reservations' },
  { name: 'Staff Management', icon: Users, id: 'staff' },
  { name: 'Kitchen Display', icon: ChefHat, id: 'kitchen' },
  { name: 'Inventory', icon: Package, id: 'inventory' },
  { name: 'Delivery Partners', icon: Truck, id: 'delivery' },
  { name: 'Campaigns', icon: Megaphone, id: 'campaigns' },
  { name: 'Analytics', icon: BarChart3, id: 'analytics' },
  { name: 'Billing & Payments', icon: CreditCard, id: 'billing' },
  { name: 'Settings', icon: Settings, id: 'settings' }
]

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RestaurantCRM</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    currentPage === item.id && "bg-orange-50 text-orange-700 border-orange-200"
                  )}
                  onClick={() => {
                    onPageChange(item.id)
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </>
  )
}