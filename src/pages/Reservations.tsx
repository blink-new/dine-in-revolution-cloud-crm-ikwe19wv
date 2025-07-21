import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Calendar, Plus, Users, Phone, Mail, Clock, RefreshCw } from 'lucide-react'
import blink from '../blink/client'

interface Reservation {
  id: string
  tableId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  partySize: number
  reservationDate: string
  reservationTime: string
  status: string
  specialRequests: string
  source: string
  createdAt: string
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false)
  const [newReservation, setNewReservation] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: '2',
    reservationDate: '',
    reservationTime: '',
    specialRequests: '',
    tableId: ''
  })

  const loadReservations = async () => {
    try {
      const user = await blink.auth.me()
      const reservationsData = await blink.db.reservations.list({
        where: { user_id: user.id },
        orderBy: { reservationDate: 'desc' }
      })

      setReservations(reservationsData.map(reservation => ({
        id: reservation.id,
        tableId: reservation.tableId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail || '',
        partySize: reservation.partySize || 2,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status || 'confirmed',
        specialRequests: reservation.specialRequests || '',
        source: reservation.source || 'direct',
        createdAt: reservation.createdAt
      })))
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const addReservation = async () => {
    try {
      const user = await blink.auth.me()
      await blink.db.reservations.create({
        id: `res_${Date.now()}`,
        user_id: user.id,
        tableId: newReservation.tableId,
        customerName: newReservation.customerName,
        customerPhone: newReservation.customerPhone,
        customerEmail: newReservation.customerEmail,
        partySize: parseInt(newReservation.partySize),
        reservationDate: newReservation.reservationDate,
        reservationTime: newReservation.reservationTime,
        status: 'confirmed',
        specialRequests: newReservation.specialRequests,
        source: 'direct',
        createdAt: new Date().toISOString()
      })
      
      setNewReservation({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        partySize: '2',
        reservationDate: '',
        reservationTime: '',
        specialRequests: '',
        tableId: ''
      })
      setIsAddReservationOpen(false)
      await loadReservations()
    } catch (error) {
      console.error('Error adding reservation:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'no_show': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'direct': return 'bg-blue-100 text-blue-800'
      case 'zomato': return 'bg-red-100 text-red-800'
      case 'dineout': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage table reservations and bookings</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadReservations} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddReservationOpen} onOpenChange={setIsAddReservationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Reservation</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Customer name"
                  value={newReservation.customerName}
                  onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
                />
                <Input
                  placeholder="Phone number"
                  value={newReservation.customerPhone}
                  onChange={(e) => setNewReservation({...newReservation, customerPhone: e.target.value})}
                />
                <Input
                  placeholder="Email address"
                  type="email"
                  value={newReservation.customerEmail}
                  onChange={(e) => setNewReservation({...newReservation, customerEmail: e.target.value})}
                />
                <Input
                  placeholder="Party size"
                  type="number"
                  value={newReservation.partySize}
                  onChange={(e) => setNewReservation({...newReservation, partySize: e.target.value})}
                />
                <Input
                  placeholder="Reservation date"
                  type="date"
                  value={newReservation.reservationDate}
                  onChange={(e) => setNewReservation({...newReservation, reservationDate: e.target.value})}
                />
                <Input
                  placeholder="Reservation time"
                  type="time"
                  value={newReservation.reservationTime}
                  onChange={(e) => setNewReservation({...newReservation, reservationTime: e.target.value})}
                />
                <Input
                  placeholder="Table ID"
                  value={newReservation.tableId}
                  onChange={(e) => setNewReservation({...newReservation, tableId: e.target.value})}
                />
                <div className="col-span-1"></div>
                <div className="col-span-2">
                  <Input
                    placeholder="Special requests"
                    value={newReservation.specialRequests}
                    onChange={(e) => setNewReservation({...newReservation, specialRequests: e.target.value})}
                  />
                </div>
                <Button onClick={addReservation} className="col-span-2">
                  Add Reservation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-600">Start by adding your first reservation.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          reservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{reservation.customerName}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                    <Badge className={getSourceColor(reservation.source)}>
                      {reservation.source}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{reservation.customerPhone}</span>
                  </div>
                  
                  {reservation.customerEmail && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{reservation.customerEmail}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">Party of {reservation.partySize}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {new Date(reservation.reservationDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{reservation.reservationTime}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Table: </span>
                    <span className="font-medium">{reservation.tableId}</span>
                  </div>

                  {reservation.specialRequests && (
                    <div className="p-2 bg-yellow-50 rounded text-sm">
                      <span className="text-gray-600">Special requests: </span>
                      <span>{reservation.specialRequests}</span>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}