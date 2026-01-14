"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBatchByBatchId, getTraceEventsByBatchId, type Batch, type TraceEvent } from "@/lib/firebase";
import {
  formatDate,
  getEventTypeIcon,
  getStatusColor,
  computeTraceEventsSha256,
} from "@/lib/utils";
import { getRecord } from "@/lib/blockchain";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  FileText,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Sparkles,
  Package,
  Calendar,
  Share2,
  Printer,
  Copy,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ConsumerBatchPage() {
  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [blockchainProof, setBlockchainProof] = useState<{
    success: boolean;
    hash?: string;
    timestamp?: number;
    sender?: string;
    txHash?: string;
    blockNumber?: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch batch data from Firebase
      const batchResult = await getBatchByBatchId(batchId);

      if (!batchResult.success || !batchResult.data) {
        throw new Error("Batch not found");
      }

      setBatch(batchResult.data);

      // Fetch trace events from Firebase
      const eventsResult = await getTraceEventsByBatchId(batchId);

      if (eventsResult.success && eventsResult.data) {
        const list = eventsResult.data;
        setEvents(list);
        // compute deterministic SHA-256 of trace
        if (list.length > 0) {
          const hash = computeTraceEventsSha256(list);
          setComputedHash(hash);
        } else {
          setComputedHash(null);
        }
      } else {
        console.error("Error fetching events:", eventsResult.error);
        setEvents([]);
        setComputedHash(null);
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
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (batchId) {
      fetchBatchData();
    }
  }, [batchId, fetchBatchData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Batch Not Found</h1>
            <p className="text-xl text-gray-600">
              The batch ID you're looking for doesn't exist or has been removed from our system.
            </p>
          </div>
          <Link href="/verify">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Verification
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Batch ${batch.batch_id} Verification`,
          text: `Check out the verified supply chain for ${batch.crop_name}`,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  const isVerified = computedHash && blockchainProof?.hash &&
    computedHash.toLowerCase() === blockchainProof.hash.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Verification Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full shadow-lg mx-auto ${
              isVerified ? "bg-gradient-to-br from-emerald-500 to-green-600 glow-green" : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}
          >
            {isVerified ? (
              <CheckCircle className="w-14 h-14 text-white" />
            ) : (
              <Shield className="w-14 h-14 text-white" />
            )}
          </motion.div>

          <div>
            <Badge variant={isVerified ? "success" : "warning"} className="mb-3">
              {isVerified ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Blockchain Verified
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Limited Verification
                </>
              )}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Product <span className="gradient-text">Verification</span>
            </h1>
            <p className="text-xl text-gray-600">
              Complete supply chain traceability for {batch.crop_name}
            </p>
          </div>

          <Link href="/verify">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Verify Another Product
            </Button>
          </Link>
        </div>

        {/* Product Information & Blockchain Proof Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Information */}
          <Card className="glass border-0 shadow-soft hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Product Information
              </CardTitle>
              <CardDescription>Verified product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch ID</label>
                <code className="block text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-800 break-all">
                  {batch.batch_id}
                </code>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</label>
                <p className="text-lg font-semibold text-gray-900">{batch.crop_name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Origin
                </label>
                <p className="text-base text-gray-700">{batch.location}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Harvest Date
                </label>
                <p className="text-base text-gray-700">{formatDate(batch.harvest_date)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                <p className="text-lg font-semibold text-gray-900">{batch.quantity} {batch.unit}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <div>
                  <Badge variant={batch.status === "active" ? "success" : batch.status === "recalled" ? "destructive" : "default"}>
                    {batch.status.toUpperCase()}
                  </Badge>
                </div>
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
                {computedHash &&
                blockchainProof.hash &&
                computedHash.toLowerCase() ===
                  blockchainProof.hash.toLowerCase() ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Blockchain Proof Verified
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Data Integrity Mismatch</span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Computed Off-chain Hash (SHA-256)
                  </label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                    {computedHash || "Not available"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    On-chain Anchored Hash
                  </label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                    {blockchainProof.hash || "Not available"}
                  </p>
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
                {(batch.blockchain_tx_hash || blockchainProof.txHash) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://mumbai.polygonscan.com/tx/${
                          batch.blockchain_tx_hash || blockchainProof.txHash
                        }`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on PolygonScan
                  </Button>
                )}
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
            <Link href="/verify">
              <Button variant="outline" className="w-full">
                Verify Another Product
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.print()}
            >
              Print Certificate
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
              }}
            >
              Share Link
            </Button>
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
          {events.length > 0 ? (
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

      {/* Food Safety Notice */}
      {batch.status === "recalled" && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Product Recall Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              This product has been recalled due to safety concerns. Please do
              not consume and contact the retailer for a refund or replacement.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </motion.div>
  );
}
