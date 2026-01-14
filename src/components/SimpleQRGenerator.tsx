'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'

export function SimpleQRGenerator() {
  const [batchId, setBatchId] = useState('BATCH-001')
  const [qrValue, setQrValue] = useState('BATCH-001')

  const generateQR = () => {
    setQrValue(batchId)
  }

  const downloadQR = () => {
    // Create a simple text-based QR code representation
    const qrText = `
┌─────────────────┐
│  QR Code Data   │
│                 │
│   ${qrValue.padEnd(12)}   │
│                 │
│  Scan with your │
│  camera app     │
└─────────────────┘
    `
    
    const blob = new Blob([qrText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `qr-code-${batchId}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Simple QR Generator</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate QR codes for testing (fallback version)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="batch-id">Batch ID</Label>
          <Input
            id="batch-id"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter batch ID (e.g., BATCH-001)"
          />
        </div>

        <Button onClick={generateQR} className="w-full">
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR Code
        </Button>

        {qrValue && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Generated QR Code</CardTitle>
              <CardDescription>
                Batch ID: {qrValue}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="border-2 border-gray-300 p-8 rounded-lg bg-white">
                  <div className="text-center">
                    <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {qrValue}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Use this text as your QR code content
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={downloadQR} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download as Text
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-semibold">Sample Batch IDs to test:</p>
        <div className="space-y-1">
          <button 
            onClick={() => setBatchId('BATCH-001')}
            className="block text-left hover:text-blue-600"
          >
            • BATCH-001
          </button>
          <button 
            onClick={() => setBatchId('BATCH-002')}
            className="block text-left hover:text-blue-600"
          >
            • BATCH-002
          </button>
          <button 
            onClick={() => setBatchId('BATCH-003')}
            className="block text-left hover:text-blue-600"
          >
            • BATCH-003
          </button>
        </div>
      </div>
    </div>
  )
}
