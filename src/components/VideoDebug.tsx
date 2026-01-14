'use client'

import React, { useEffect, useRef, useState } from 'react'
import { QrCode, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoDebugProps {
  isScanning: boolean
}

export function VideoDebug({ isScanning }: VideoDebugProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    console.log('VIDEO DEBUG:', info)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      addDebugInfo('Camera stopped')
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    const startCamera = async () => {
      try {
        addDebugInfo('Requesting camera access...')
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            addDebugInfo('Video metadata loaded, playing video')
          }
          setTimeout(() => {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {})
              addDebugInfo('Forced video play')
            }
          }, 500)
          addDebugInfo('Camera stream assigned to video element')
        }
      } catch (err) {
        addDebugInfo('Camera access error')
        console.error('Camera access error:', err)
      }
    }

    if (isScanning) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isScanning])

  useEffect(() => {
    if (videoRef.current) {
      addDebugInfo(`Video element exists: ${!!videoRef.current}`)
      addDebugInfo(`Video srcObject: ${!!videoRef.current.srcObject}`)
      addDebugInfo(`Video readyState: ${videoRef.current.readyState}`)
      addDebugInfo(`Video paused: ${videoRef.current.paused}`)
      addDebugInfo(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
      addDebugInfo(`Video display style: ${videoRef.current.style.display}`)
      addDebugInfo(`Video visibility: ${videoRef.current.offsetWidth}x${videoRef.current.offsetHeight}`)
    }
  }, []) // <-- Only run once

  return (
    <div>
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
            background: '#fff'
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 16
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
      <div className="mt-4">
        <h4>Debug Info:</h4>
        <ul>
          {debugInfo.map((info, idx) => (
            <li key={idx} style={{ fontSize: '12px' }}>{info}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
