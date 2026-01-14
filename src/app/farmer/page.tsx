'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createBatch, getSampleFarmer, createTraceEvent, type Batch } from '@/lib/firebase'
import { generateBatchId, formatDate } from '@/lib/utils'
import { generateBatchHash } from '@/lib/blockchain'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Wheat,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  Loader2,
  Download,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { createCropBatch } from './create-crop'
import { logTraceEvent } from '@/app/event/log-trace'
import jsQR from 'jsqr'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface BatchFormData {
  cropName: string
  location: string
  harvestDate: string
  quantity: string
  unit: string
}

export default function FarmerPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<BatchFormData>({
    cropName: '',
    location: '',
    harvestDate: '',
    quantity: '',
    unit: 'kg'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdBatch, setCreatedBatch] = useState<Batch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleCopy = () => {
    if (createdBatch) {
      navigator.clipboard.writeText(createdBatch.qr_code)
      setCopied(true)
      toast.success('QR Code URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (createdBatch && navigator.share) {
      try {
        await navigator.share({
          title: `Batch ${createdBatch.batch_id}`,
          text: `Check out my crop batch: ${createdBatch.crop_name}`,
          url: createdBatch.qr_code
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  const handleInputChange = (field: keyof BatchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Generate unique batch ID
      const batchId = generateBatchId()

      // Create batch data
      const batchData = {
        batch_id: batchId,
        farmer_id: user.id,
        crop_name: formData.cropName,
        location: formData.location,
        harvest_date: formData.harvestDate,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        qr_code: `${window.location.origin}/consumer/${batchId}`,
        status: 'active' as const
      }

      // Generate blockchain hash (for future blockchain integration)
      generateBatchHash({
        batchId,
        cropName: formData.cropName,
        location: formData.location,
        harvestDate: formData.harvestDate,
        quantity: parseFloat(formData.quantity),
        farmerId: user.id
      })

      // Insert into Firebase
      const result = await createBatch(batchData)

      if (!result.success) throw new Error('Failed to create batch')

      // Create initial harvest event
      const eventResult = await createTraceEvent({
        batch_id: batchId,
        event_type: 'harvest',
        actor_id: user.id,
        actor_role: 'farmer',
        location: formData.location,
        timestamp: new Date().toISOString(),
        notes: 'Initial harvest event'
      })

      if (!eventResult.success) {
        console.error('Error creating harvest event:', eventResult.error)
      }

      setCreatedBatch({ ...batchData, id: result.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })

      // Reset form
      setFormData({
        cropName: '',
        location: '',
        harvestDate: '',
        quantity: '',
        unit: 'kg'
      })

      toast.success('Batch created successfully! 🎉')
    } catch (err) {
      console.error('Error creating batch:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create batch'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadQR = () => {
    if (!createdBatch) return
    
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `batch-${createdBatch.batch_id}-qr.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleScan = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, canvas.width, canvas.height)

    if (code) {
      console.log('✅ Scanned QR value:', code.data)

      try {
        await logTraceEvent(code.data, { 
          event_type: 'Harvested', 
          location: 'Farm A' 
        })
        console.log('Trace event logged successfully')
      } catch (err) {
        console.error('Error logging trace event:', err)
      }
    } else {
      console.log('⚠️ No QR code detected in frame')
    }
  }

  if (createdBatch) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg glow-green mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Batch Created Successfully!
              </h1>
              <p className="text-xl text-gray-600">
                Your crop batch is now registered and ready for blockchain tracking
              </p>
              <Badge variant="success" className="mt-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Batch ID: {createdBatch.batch_id}
              </Badge>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Batch Details */}
            <Card className="glass border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Batch Details
                </CardTitle>
                <CardDescription>Complete information about your batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Name</label>
                    <p className="text-lg font-semibold text-gray-900">{createdBatch.crop_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                    <p className="text-lg font-semibold text-gray-900">{createdBatch.quantity} {createdBatch.unit}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </label>
                  <p className="text-base text-gray-700">{createdBatch.location}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Harvest Date
                  </label>
                  <p className="text-base text-gray-700">{formatDate(createdBatch.harvest_date)}</p>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch ID</label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-800">
                      {createdBatch.batch_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="glass border-0 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  QR Code
                </CardTitle>
                <CardDescription>
                  Share with partners or print for product labeling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-emerald-100">
                    <QRCodeCanvas
                      id="qr-code"
                      value={createdBatch.qr_code}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={downloadQR} className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {navigator.share && (
                    <Button onClick={handleShare} variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500 text-center">
                  QR code encodes: <span className="font-mono text-gray-700">{createdBatch.qr_code}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={() => setCreatedBatch(null)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Wheat className="w-5 h-5 mr-2" />
              Create Another Batch
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/dashboard'}>
              View Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg mx-auto">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Create New <span className="gradient-text">Crop Batch</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Register your agricultural produce for blockchain-verified tracking
              </p>
            </div>
            <Badge variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              Blockchain Secured
            </Badge>
          </div>

          {/* Form Card */}
          <Card className="glass border-0 shadow-strong">
            <CardHeader>
              <CardTitle className="text-2xl">Batch Information</CardTitle>
              <CardDescription className="text-base">
                Fill in the details of your crop batch to start tracking its journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Crop Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Wheat className="w-4 h-4 text-emerald-600" />
                    Crop Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Organic Tomatoes"
                    value={formData.cropName}
                    onChange={(e) => handleInputChange('cropName', e.target.value)}
                    required
                    className="h-12 text-base focus-ring"
                  />
                </div>

                {/* Farm Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Farm Location *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Green Valley Farm, California"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    className="h-12 text-base focus-ring"
                  />
                </div>

                {/* Harvest Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Harvest Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                    required
                    className="h-12 text-base focus-ring"
                  />
                </div>

                {/* Quantity and Unit */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4 text-orange-600" />
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="100"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                      className="h-12 text-base focus-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Unit
                    </label>
                    <select
                      className="w-full h-12 px-4 py-2 border border-input bg-background rounded-lg text-base focus-ring transition-all"
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="tons">Tons</option>
                      <option value="boxes">Boxes</option>
                      <option value="crates">Crates</option>
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
                  >
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Batch...
                    </>
                  ) : (
                    <>
                      <Wheat className="w-5 h-5 mr-2" />
                      Create Batch & Generate QR Code
                    </>
                  )}
                </Button>

                {/* Info Text */}
                <p className="text-sm text-gray-500 text-center">
                  By creating a batch, you agree to store this information on the blockchain for transparency
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
