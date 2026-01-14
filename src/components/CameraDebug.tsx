'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, AlertCircle, CheckCircle, Info } from 'lucide-react'

export function CameraDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const addDebugInfo = (info: string) => {
    console.log('DEBUG:', info)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const startCamera = async () => {
    try {
      setError(null)
      setDebugInfo([])
      addDebugInfo('Starting camera test...')
      
      // Check browser support
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices not available')
      }
      addDebugInfo('navigator.mediaDevices available')
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not available')
      }
      addDebugInfo('getUserMedia available')
      
      // Check protocol
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      addDebugInfo(`Protocol: ${protocol}, Hostname: ${hostname}`)
      
      if (protocol !== 'https:' && hostname !== 'localhost') {
        throw new Error('HTTPS or localhost required')
      }
      addDebugInfo('Protocol check passed')
      
      // Request camera
      addDebugInfo('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      addDebugInfo('Camera access granted')
      
      // Check if video element exists in DOM
      const videoElements = document.querySelectorAll('video')
      addDebugInfo(`Found ${videoElements.length} video elements in DOM`)
      
      // Wait for video element to be available
      if (!videoRef.current) {
        addDebugInfo('Video element ref not found, waiting...')
        // Try again after a short delay
        setTimeout(async () => {
          if (videoRef.current) {
            addDebugInfo('Video element found on retry')
            await setupVideoElement(stream)
          } else {
            addDebugInfo('Video element still not found after retry')
            setError('Video element not available')
          }
        }, 100)
        return
      }
      
      await setupVideoElement(stream)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      addDebugInfo(`Error: ${errorMsg}`)
      setError(errorMsg)
    }
  }

  const setupVideoElement = async (stream: MediaStream) => {
    try {
      addDebugInfo('Video element found')
      
      // Set up video element
      const videoElement = videoRef.current!
      videoElement.srcObject = stream
      streamRef.current = stream
      setIsStreaming(true)
        
      // Configure video element
      videoElement.style.display = 'block'
      videoElement.style.width = '100%'
      videoElement.style.height = 'auto'
      videoElement.style.minHeight = '300px'
      videoElement.style.backgroundColor = '#f0f0f0'
      addDebugInfo('Video element configured')
      
      // Event listeners
      videoElement.onloadedmetadata = () => {
        addDebugInfo('Video metadata loaded')
        addDebugInfo(`Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`)
      }
      
      videoElement.oncanplay = () => {
        addDebugInfo('Video can play')
      }
      
      videoElement.onplay = () => {
        addDebugInfo('Video started playing')
      }
      
      videoElement.onerror = (e) => {
        addDebugInfo(`Video error: ${e}`)
      }
      
      // Try to play
      try {
        videoElement.play().then(() => {
          addDebugInfo('Video play() called successfully')
        }).catch((playError) => {
          addDebugInfo(`Video play() error: ${playError}`)
        })
      } catch (playError) {
        addDebugInfo(`Video play() error: ${playError}`)
      }
      
      // Check stream properties
      const tracks = stream.getTracks()
      addDebugInfo(`Stream has ${tracks.length} tracks`)
      tracks.forEach((track, index) => {
        addDebugInfo(`Track ${index}: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`)
      })
      
      // Check video element properties
      setTimeout(() => {
        addDebugInfo(`Video element srcObject: ${!!videoElement.srcObject}`)
        addDebugInfo(`Video element readyState: ${videoElement.readyState}`)
        addDebugInfo(`Video element paused: ${videoElement.paused}`)
        addDebugInfo(`Video element currentTime: ${videoElement.currentTime}`)
      }, 1000)
    } catch (err) {
      addDebugInfo(`Error setting up video element: ${err}`)
      setError(`Video setup error: ${err}`)
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
    addDebugInfo('Camera stopped')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Camera Debug</h3>
        <p className="text-sm text-gray-600 mb-4">
          Detailed debugging information for camera issues
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        {!isStreaming ? (
          <Button onClick={startCamera}>
            <Camera className="w-4 h-4 mr-2" />
            Start Debug Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="destructive">
            Stop Camera
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {isStreaming && (
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Camera is streaming
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
          style={{ 
            transform: 'scaleX(-1)',
            display: isStreaming ? 'block' : 'none'
          }}
          playsInline
          muted
          autoPlay
        />
      </div>

      {debugInfo.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center">
            <Info className="w-4 h-4 mr-2" />
            <span className="font-semibold">Debug Log:</span>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg max-h-60 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                {info}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
