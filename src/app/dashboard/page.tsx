"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllBatches, getTraceEventsByBatchId, updateBatchStatus, type Batch, type TraceEvent } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Loader2,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  Calendar,
  Wheat,
  Eye,
  X,
  Sparkles,
  BarChart3
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  recalledBatches: number;
  completedBatches: number;
  totalEvents: number;
}

export default function DashboardPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    activeBatches: 0,
    recalledBatches: 0,
    completedBatches: 0,
    totalEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchEvents, setBatchEvents] = useState<TraceEvent[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const batchesResult = await getAllBatches();

      if (!batchesResult.success) {
        throw new Error("Failed to fetch batches");
      }

      const batchesData = batchesResult.data || [];
      setBatches(batchesData);
      setFilteredBatches(batchesData);

      // Calculate stats
      const totalBatches = batchesData.length;
      const activeBatches = batchesData.filter((b) => b.status === "active").length;
      const recalledBatches = batchesData.filter((b) => b.status === "recalled").length;
      const completedBatches = batchesData.filter((b) => b.status === "completed").length;

      setStats({
        totalBatches,
        activeBatches,
        recalledBatches,
        completedBatches,
        totalEvents: 0,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecallBatch = async (batchId: string) => {
    try {
      const result = await updateBatchStatus(batchId, "recalled");

      if (!result.success) {
        throw new Error("Failed to recall batch");
      }

      await fetchData();
      toast.success(`Batch ${batchId} has been recalled successfully!`);
    } catch (err) {
      console.error("Error recalling batch:", err);
      toast.error("Failed to recall batch");
    }
  };

  const fetchBatchEvents = async (batchId: string) => {
    try {
      const result = await getTraceEventsByBatchId(batchId);

      if (!result.success) {
        throw new Error("Failed to fetch events");
      }

      setBatchEvents(result.data || []);
    } catch (err) {
      console.error("Error fetching batch events:", err);
      toast.error("Failed to fetch batch events");
    }
  };

  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    fetchBatchEvents(batch.batch_id);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter(
        (batch) =>
          batch.batch_id.toLowerCase().includes(query.toLowerCase()) ||
          batch.crop_name.toLowerCase().includes(query.toLowerCase()) ||
          batch.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBatches(filtered);
    }
  };

  const downloadQR = (batchId: string) => {
    const canvas = document.getElementById(`qr-${batchId}`) as HTMLCanvasElement | null;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-${batchId}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("QR Code downloaded!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['farmer', 'aggregator', 'retailer']}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 pb-20"
      >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Supply Chain <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage your agricultural supply chain batches
          </p>
        </div>
        <Button onClick={fetchData} size="lg" variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-0 shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalBatches}</div>
              <p className="text-xs text-gray-500 mt-1">All tracked batches</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-0 shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Batches</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center glow-green">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.activeBatches}</div>
              <p className="text-xs text-gray-500 mt-1">Currently in supply chain</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-0 shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Recalled Batches</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.recalledBatches}</div>
              <p className="text-xs text-gray-500 mt-1">Safety recalls issued</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-0 shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.completedBatches}</div>
              <p className="text-xs text-gray-500 mt-1">Delivered successfully</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search Bar */}
      {batches.length > 0 && (
        <Card className="glass border-0 shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by Batch ID, Crop Name, or Location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-6 text-base border-2 focus:border-emerald-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batches Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">All Batches</h2>
          <Badge variant="secondary" className="ml-2">{filteredBatches.length}</Badge>
        </div>

        {filteredBatches.length === 0 ? (
          <Card className="glass border-0 shadow-soft">
            <CardContent className="text-center py-16">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {searchQuery ? "No Batches Found" : "No Batches Yet"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No batches have been created yet. Create your first batch from the Farmer page."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => (window.location.href = "/farmer")}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Wheat className="w-5 h-5 mr-2" />
                  Create First Batch
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass border-0 shadow-soft hover-lift h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Wheat className="w-5 h-5 text-emerald-600" />
                          <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                        </div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {batch.batch_id}
                        </code>
                      </div>
                      <Badge
                        variant={
                          batch.status === "active"
                            ? "success"
                            : batch.status === "recalled"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {batch.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {batch.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(batch.harvest_date)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {batch.quantity} {batch.unit}
                      </div>
                    </div>

                    <div className="pt-4 border-t flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBatch(batch)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {batch.status === "active" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRecallBatch(batch.batch_id)}
                          className="flex-1"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Recall
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Details Modal */}
      <AnimatePresence>
        {selectedBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBatch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Batch Details</h2>
                  <code className="text-sm text-gray-600 font-mono">{selectedBatch.batch_id}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedBatch(null)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Batch Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      Product Information
                    </h3>
                    <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</label>
                        <p className="text-base font-semibold text-gray-900">{selectedBatch.crop_name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                        <p className="text-base text-gray-700">{selectedBatch.location}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Harvest Date</label>
                        <p className="text-base text-gray-700">{formatDate(selectedBatch.harvest_date)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedBatch.quantity} {selectedBatch.unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedBatch.status === "active"
                                ? "success"
                                : selectedBatch.status === "recalled"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {selectedBatch.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
                      <h4 className="font-semibold mb-3 text-gray-900">QR Code</h4>
                      <div className="flex items-center gap-4">
                        <div className="border-2 border-white rounded-xl p-3 bg-white shadow-sm">
                          {typeof window !== "undefined" && (
                            <QRCodeCanvas
                              id={`qr-${selectedBatch.batch_id}`}
                              value={selectedBatch.batch_id}
                              size={120}
                              level="M"
                              includeMargin={true}
                            />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadQR(selectedBatch.batch_id)}
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/consumer/${selectedBatch.batch_id}`, "_blank")
                            }
                            className="w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Consumer View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trace Events */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Supply Chain Timeline</h3>
                    {batchEvents.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {batchEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium capitalize text-gray-900">
                                {event.event_type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </div>
                            {event.notes && (
                              <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No trace events recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
}
