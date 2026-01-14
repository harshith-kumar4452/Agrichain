"use client";

import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBatchByBatchId, getTraceEventsByBatchId, type Batch, type TraceEvent } from "@/lib/firebase";
import { formatDate, getEventTypeIcon, getStatusColor } from "@/lib/utils";
import { getRecord } from "@/lib/blockchain";
import { VideoDebug } from "@/components/VideoDebug";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  QrCode,
  Camera,
  Search,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  FileText,
  Shield,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function VerifyPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedBatchId, setScannedBatchId] = useState<string | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [blockchainProof, setBlockchainProof] = useState<{
    success: boolean;
    hash?: string;
    timestamp?: number;
    sender?: string;
    txHash?: string;
    blockNumber?: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualBatchId, setManualBatchId] = useState("");
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanInterval: NodeJS.Timeout | null = null;

    const startCamera = async () => {
      try {
        console.log("Requesting camera access...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        console.log("Camera stream received:", mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            console.log("Video metadata loaded, playing video");
          };
          // Force play in case metadata event doesn't fire
          setTimeout(() => {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch((err) => {
                console.error("Error forcing video play:", err);
              });
              console.log("Forced video play");
            }
          }, 500);
          console.log("Camera stream assigned to video element");
        } else {
          console.log("videoRef.current is null");
        }
        scanInterval = setInterval(scanQRCode, 500);
      } catch (err) {
        setError("Camera access error");
        console.error("Camera access error:", err);
      }
    };

    const scanQRCode = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState !== 4) return; // Wait until video is ready
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        setQrResult(code.data);
        stopScanning();
        fetchBatchData(code.data);
      }
    };

    if (isScanning) {
      startCamera();
    }

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isScanning]);

  const startScanning = () => {
    setIsScanning(true);
    setError(null);
    setQrResult(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError(null);
    setQrResult(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const fetchBatchData = async (batchId: string) => {
    setIsLoading(true);
    setError(null);
    setEventsError(null);

    try {
      // Fetch batch data from Firebase
      const batchResult = await getBatchByBatchId(batchId);

      if (!batchResult.success || !batchResult.data) {
        setError("Batch not found");
        setBatch(null);
        setEvents([]);
        setBlockchainProof(null);
        return;
      }

      setScannedBatchId(batchId);
      setBatch(batchResult.data);

      // Fetch trace events from Firebase
      const eventsResult = await getTraceEventsByBatchId(batchId);

      if (!eventsResult.success) {
        setEventsError("Error fetching trace events");
        setEvents([]);
      } else {
        setEvents(eventsResult.data || []);
      }

      // Fetch blockchain proof
      const blockchainResult = await getRecord(batchId);
      if (blockchainResult.success) {
        setBlockchainProof(blockchainResult);
      }
    } catch (err) {
      console.error("Error fetching batch data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch batch data"
      );
      setBatch(null);
      setEvents([]);
      setBlockchainProof(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (manualBatchId.trim()) {
      setScannedBatchId(manualBatchId.trim());
      fetchBatchData(manualBatchId.trim());
    }
  };

  const resetForm = () => {
    setScannedBatchId(null);
    setBatch(null);
    setEvents([]);
    setBlockchainProof(null);
    setManualBatchId("");
    setError(null);
  };

  if (batch) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Product Verification
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Verified blockchain traceability for batch {batch.batch_id}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Batch Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Batch ID
                </label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                  {batch.batch_id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Crop
                </label>
                <p className="text-lg">{batch.crop_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Origin
                </label>
                <p className="text-lg">{batch.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Harvest Date
                </label>
                <p className="text-lg">{formatDate(batch.harvest_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Quantity
                </label>
                <p className="text-lg">
                  {batch.quantity} {batch.unit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    batch.status
                  )}`}
                >
                  {batch.status.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Blockchain Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {blockchainProof ? (
                <>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Verified on Blockchain</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transaction Hash
                    </label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {blockchainProof.txHash || "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Block Number
                    </label>
                    <p className="text-sm">
                      {blockchainProof.blockNumber || "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Timestamp
                    </label>
                    <p className="text-sm">
                      {blockchainProof.timestamp
                        ? formatDate(new Date(blockchainProof.timestamp * 1000))
                        : "Not available"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Blockchain proof not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={resetForm} variant="outline" className="w-full">
                Verify Another Product
              </Button>
              {batch.blockchain_tx_hash && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://mumbai.polygonscan.com/tx/${batch.blockchain_tx_hash}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on PolygonScan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supply Chain Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Timeline</CardTitle>
            <CardDescription>
              Complete journey of this product from farm to table
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsError ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{eventsError}</p>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">
                          {getEventTypeIcon(event.event_type)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900 capitalize">
                          {event.event_type}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        {event.temperature && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Thermometer className="w-4 h-4 mr-2" />
                            {event.temperature}°C
                          </div>
                        )}
                        {event.humidity && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Droplets className="w-4 h-4 mr-2" />
                            {event.humidity}%
                          </div>
                        )}
                        {event.notes && (
                          <div className="flex items-start text-sm text-gray-600">
                            <FileText className="w-4 h-4 mr-2 mt-0.5" />
                            {event.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No trace events found for this batch
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['consumer']}>
      <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <Search className="w-16 h-16 text-green-600 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Verify Product</h1>
        <p className="text-lg text-gray-600">
          Scan a QR code or enter a batch ID to verify product authenticity
        </p>
      </div>

      <div className="space-y-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use your camera to scan the product QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isScanning ? (
              <div className="text-center space-y-4">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto" />
                <Button
                  onClick={startScanning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scanner
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                    style={{
                      transform: "scaleX(-1)",
                      display: isScanning ? "block" : "none",
                    }}
                    playsInline
                    muted
                    autoPlay
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-green-500 rounded-lg opacity-50"></div>
                    </div>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Point your camera at a QR code
                  </p>
                  <Button onClick={stopScanning} variant="outline">
                    Stop Scanning
                  </Button>
                  {qrResult && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800">
                      QR Code: {qrResult}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Or Enter Batch ID Manually</CardTitle>
            <CardDescription>
              If you have the batch ID, enter it directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter batch ID (e.g., BATCH-ABC123)"
                value={manualBatchId}
                onChange={(e) => setManualBatchId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button
                onClick={handleManualSearch}
                disabled={!manualBatchId.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">
                {error === "Batch not found"
                  ? "Batch not found. Please check the QR code or batch ID."
                  : error}
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
