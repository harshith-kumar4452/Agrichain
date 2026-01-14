'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, QrCode, AlertCircle, CheckCircle } from 'lucide-react'
import QrScanner from 'qr-scanner'
import { CameraTest } from '@/components/CameraTest'
import { CameraDebug } from '@/components/CameraDebug'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'
import { SimpleQRGenerator } from '@/components/SimpleQRGenerator'

export default function TestScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null)
  const [isSecure, setIsSecure] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraSupported(true)
    } else {
      setCameraSupported(false)
    }
    
    // Check if we're on HTTPS or localhost
    if (typeof window !== 'undefined') {
      const isSecureProtocol = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      setIsSecure(isSecureProtocol)
    }
  }, [])

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setError(null)
      setLastResult(null)
      
      // Check if we're on HTTPS or localhost
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS or localhost')
      }
      
      if (videoRef.current) {
        console.log('Starting QR scanner...')
        
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data)
            setLastResult(result.data)
            stopScanning()
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
            returnDetailedScanResult: true,
          }
        )
        
        setScanner(qrScanner)
        
        // Start the scanner
        await qrScanner.start()
        console.log('QR scanner started successfully')
        
        // Ensure video element is visible and has proper dimensions
        const videoElement = videoRef.current
        videoElement.style.display = 'block'
        videoElement.style.width = '100%'
        videoElement.style.height = 'auto'
        videoElement.style.minHeight = '300px'
        
        // Wait a moment for the stream to initialize
        setTimeout(() => {
          if (videoElement.srcObject) {
            console.log('Video stream is connected')
          } else {
            console.warn('Video stream not connected')
          }
        }, 1000)
      }
    } catch (err) {
      console.error('Error starting scanner:', err)
      let errorMessage = 'Failed to start camera. '
      
      if (err instanceof Error) {
        if (err.message.includes('Permission denied')) {
          errorMessage += 'Please allow camera access and try again.'
        } else if (err.message.includes('not supported')) {
          errorMessage += 'Camera not supported on this device.'
        } else if (err.message.includes('HTTPS')) {
          errorMessage += 'Camera access requires HTTPS or localhost.'
        } else {
          errorMessage += err.message
        }
      }
      
      setError(errorMessage)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      setScanner(null)
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
    }
  }, [scanner])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Scanner Test
          </h1>
          <p className="text-gray-600">
            Test the QR code scanner functionality
          </p>
        </div>

        {/* Camera Support Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cameraSupported === null ? (
              <p>Checking camera support...</p>
            ) : cameraSupported ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Camera is supported on this device
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Camera is not supported on this device
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protocol Check */}
        <Card>
          <CardHeader>
            <CardTitle>HTTPS Check</CardTitle>
          </CardHeader>
          <CardContent>
            {isSecure === null ? (
              <p>Checking protocol...</p>
            ) : isSecure ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Protocol is secure (HTTPS or localhost)
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Camera access requires HTTPS or localhost
              </div>
            )}
          </CardContent>
        </Card>

        {/* Camera Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera Debug
            </CardTitle>
            <CardDescription>
              Detailed debugging for camera issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraDebug />
          </CardContent>
        </Card>

        {/* Camera Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera Test
            </CardTitle>
            <CardDescription>
              Simple camera test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraTest />
          </CardContent>
        </Card>

        {/* Scanner Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              QR Scanner Test
            </CardTitle>
            <CardDescription>
              Test the QR code scanner functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {lastResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  QR Code Detected!
                </div>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  {lastResult}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {!isScanning ? (
                <Button onClick={startScanning} disabled={!cameraSupported}>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanner
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive">
                  Stop Scanner
                </Button>
              )}
            </div>

            {isScanning && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                  autoPlay
                />
                <p className="text-center text-sm text-gray-600">
                  Point your camera at a QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              QR Code Generator
            </CardTitle>
            <CardDescription>
              Generate QR codes for testing the scanner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRCodeGenerator />
          </CardContent>
        </Card>

        {/* Simple QR Generator (Fallback) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Simple QR Generator
            </CardTitle>
            <CardDescription>
              Alternative QR generator if the main one has issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleQRGenerator />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
