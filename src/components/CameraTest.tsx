'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, AlertCircle, CheckCircle } from 'lucide-react'

export function CameraTest() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      
      // Get available cameras
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        console.log('Camera stream started successfully')
        
        // Ensure video element is properly configured
        const videoElement = videoRef.current
        videoElement.style.display = 'block'
        videoElement.style.width = '100%'
        videoElement.style.height = 'auto'
        videoElement.style.minHeight = '300px'
        
        // Wait for video to load and play
        videoElement.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoElement.play().catch(err => console.error('Error playing video:', err))
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(err instanceof Error ? err.message : 'Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Camera Test</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test if your camera is working properly
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {!isStreaming ? (
          <Button onClick={startCamera}>
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive">
            Stop Camera
          </Button>
        )}
      </div>

      {isStreaming && (
        <div className="space-y-2">
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Camera is working!
          </div>
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
            autoPlay
          />
        </div>
      )}

      {devices.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>Available cameras: {devices.length}</p>
          {devices.map((device, index) => (
            <p key={device.deviceId} className="text-xs">
              {index + 1}. {device.label || `Camera ${index + 1}`}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
