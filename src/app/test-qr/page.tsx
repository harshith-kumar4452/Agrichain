'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import QrScanner from 'qr-scanner'

export default function TestQRPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setError(null)
      setLastResult(null)
      
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
        await qrScanner.start()
        console.log('QR scanner started successfully')
        
        // Ensure video element shows the stream
        const videoElement = videoRef.current
        videoElement.style.display = 'block'
        videoElement.style.width = '100%'
        videoElement.style.height = 'auto'
        videoElement.style.minHeight = '300px'
      }
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
            QR Code Scanner Test
          </h1>
          <p className="text-gray-600">
            Test the QR code scanning functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              QR Scanner
            </CardTitle>
            <CardDescription>
              Scan any QR code to test the functionality
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
                  QR Code Scanned Successfully!
                </div>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  {lastResult}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isScanning ? (
                <Button onClick={startScanning}>
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
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                    style={{ transform: 'scaleX(-1)' }}
                    playsInline
                    muted
                    autoPlay
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-green-500 rounded-lg opacity-50"></div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Point your camera at a QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Click "Start Scanner" to begin</p>
              <p>2. Allow camera permissions when prompted</p>
              <p>3. Point your camera at any QR code</p>
              <p>4. The scanner should detect and display the QR code content</p>
              <p>5. Try scanning QR codes from the generator on the test-scanner page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
