'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export function QRCodeGenerator() {
  const [batchId, setBatchId] = useState('BATCH-001')
  const [qrValue, setQrValue] = useState('BATCH-001')

  const generateQR = () => {
    setQrValue(batchId)
  }

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr-code-${batchId}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">QR Code Generator</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate QR codes for testing the scanner
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
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <Button onClick={downloadQR} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
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
          <button 
            onClick={() => setBatchId('FARM-2024-001')}
            className="block text-left hover:text-blue-600"
          >
            • FARM-2024-001
          </button>
        </div>
      </div>
    </div>
  )
}
