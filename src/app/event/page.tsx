'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getBatchByBatchId, createTraceEvent, type Batch } from '@/lib/firebase'
import { formatDate } from '@/lib/utils'
import { generateEventHash } from '@/lib/blockchain'
import QrScanner from 'qr-scanner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import {
  QrCode,
  Camera,
  Truck,
  MapPin,
  Thermometer,
  Droplets,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface EventFormData {
  eventType: string
  location: string
  temperature: string
  humidity: string
  notes: string
}

export default function EventPage() {
  const { user } = useAuth()
  const [scannedBatchId, setScannedBatchId] = useState<string | null>(null)
  const [batch, setBatch] = useState<Batch | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    eventType: 'transport',
    location: '',
    temperature: '',
    humidity: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const eventTypes = [
    { value: 'transport', label: 'Transport', icon: '🚚' },
    { value: 'processing', label: 'Processing', icon: '🏭' },
    { value: 'storage', label: 'Storage', icon: '🏪' },
    { value: 'retail', label: 'Retail', icon: '🛒' }
  ]

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setError(null)

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      if (
        typeof window !== 'undefined' &&
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost'
      ) {
        throw new Error('Camera access requires HTTPS or localhost')
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      console.log("✅ Got stream:", newStream)

      setStream(newStream)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            console.log("🎥 Video started playing")
          } catch (err) {
            console.error("🚫 Video play failed:", err)
          }
        }
      }

      const qrScanner = new QrScanner(
        videoRef.current!,
        (result) => {
          console.log('QR Code detected:', result.data)
          let batchId: string | null = null
          try {
            const url = new URL(result.data)
            batchId = url.pathname.split('/').pop()
          } catch {
            batchId = result.data
          }

          if (batchId) {
            setScannedBatchId(batchId)
            fetchBatch(batchId)
            stopScanning()
          } else {
            setError('Invalid QR code format')
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )

      setScanner(qrScanner)
      await qrScanner.start()
      console.log('✅ QR scanner started')
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError(err instanceof Error ? err.message : 'Failed to start camera')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      setScanner(null)
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const fetchBatch = async (batchId: string) => {
    try {
      const result = await getBatchByBatchId(batchId)

      if (!result.success || !result.data) {
        throw new Error('Batch not found')
      }

      setBatch(result.data)
    } catch (err) {
      console.error('Error fetching batch:', err)
      setError('Batch not found. Please scan a valid QR code.')
      setBatch(null)
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batch || !scannedBatchId || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Build event data object, only include optional fields if they have values
      const eventData: any = {
        batch_id: scannedBatchId,
        event_type: formData.eventType as 'harvest' | 'transport' | 'processing' | 'storage' | 'retail',
        actor_id: user.id,
        actor_role: user.role,
        location: formData.location,
        timestamp: new Date().toISOString(),
        notes: formData.notes || ''
      }

      // Only add temperature if provided
      if (formData.temperature && formData.temperature.trim() !== '') {
        eventData.temperature = parseFloat(formData.temperature)
      }

      // Only add humidity if provided
      if (formData.humidity && formData.humidity.trim() !== '') {
        eventData.humidity = parseFloat(formData.humidity)
      }

      generateEventHash({
        batchId: scannedBatchId,
        eventType: formData.eventType,
        actorId: user.id,
        location: formData.location,
        timestamp: eventData.timestamp,
        temperature: eventData.temperature,
        humidity: eventData.humidity
      })

      const result = await createTraceEvent(eventData)

      if (!result.success) {
        throw new Error('Failed to create trace event')
      }

      toast.success('Trace event logged successfully! 🎉')
      setSuccess(true)
      setFormData({ eventType: 'transport', location: '', temperature: '', humidity: '', notes: '' })
    } catch (err) {
      console.error('Error creating event:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setScannedBatchId(null)
    setBatch(null)
    setSuccess(false)
    setError(null)
    setFormData({ eventType: 'transport', location: '', temperature: '', humidity: '', notes: '' })
  }

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [scanner, stream])

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Event Logged Successfully!</h1>
        <p className="text-lg text-gray-600">The trace event has been recorded and will be anchored to the blockchain.</p>
        <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
          Log Another Event
        </Button>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['aggregator', 'retailer']}>
      <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Truck className="w-16 h-16 text-blue-600 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Log Trace Event</h1>
        <p className="text-lg text-gray-600">Scan a batch QR code and log a new event in the supply chain</p>
      </div>

      {!scannedBatchId ? (
        <Card>
          <CardHeader>
            <CardTitle>Scan Batch QR Code</CardTitle>
            <CardDescription>Use your camera to scan the QR code on a product batch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isScanning ? (
              <div
                style={{
                  width: 448,
                  height: 320,
                  border: '2px solid #ccc',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '32px auto',
                  background: '#000' // background to confirm blank vs video
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 16,
                    backgroundColor: '#000'
                  }}
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto" />
                <Button onClick={startScanning} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scanner
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Batch Info */}
          <Card>
            <CardHeader>
              <CardTitle>Scanned Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {batch ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Batch ID</label>
                    <p className="text-lg font-mono bg-gray-100 p-2 rounded">{batch.batch_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Crop</label>
                    <p className="text-lg">{batch.crop_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-lg">{batch.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                    <p className="text-lg">{formatDate(batch.harvest_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="text-lg">{batch.quantity} {batch.unit}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Loading batch information...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Form */}
          <Card>
            <CardHeader>
              <CardTitle>Log New Event</CardTitle>
              <CardDescription>Record a new event for this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    required
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Processing Facility, City"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Thermometer className="w-4 h-4 inline mr-1" />
                      Temperature (°C)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="20.5"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Droplets className="w-4 h-4 inline mr-1" />
                      Humidity (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="65.0"
                      value={formData.humidity}
                      onChange={(e) => handleInputChange('humidity', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    className="w-full h-20 px-3 py-2 border border-input bg-background rounded-md text-sm resize-none"
                    placeholder="Additional notes about this event..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !batch}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging Event...
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        Log Event
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
