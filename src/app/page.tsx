'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Wheat,
  Truck,
  Search,
  BarChart3,
  Shield,
  Clock,
  Users,
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Lock,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center space-y-8 max-w-5xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Badge variant="success" className="mb-4 text-sm px-4 py-1.5">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Powered by Blockchain Technology
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight"
              variants={fadeIn}
            >
              Track Every Step From
              <span className="gradient-text block mt-2">Farm to Table</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              variants={fadeIn}
            >
              Revolutionary blockchain-powered supply chain transparency for agriculture.
              Build trust, ensure safety, and transform traceability.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              variants={fadeIn}
            >
              <Link href="/farmer">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6">
                  <Wheat className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="border-2 hover:border-emerald-500 hover:text-emerald-600 transition-all text-lg px-8 py-6">
                  <Search className="w-5 h-5 mr-2" />
                  Verify Products
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-8 justify-center items-center pt-12 text-sm text-gray-600"
              variants={fadeIn}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Blockchain Verified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="glass rounded-3xl p-12 shadow-strong">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Batches Tracked</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">500+</div>
              <div className="text-gray-600 font-medium">Happy Farmers</div>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="gradient-text block">Complete Transparency</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to track, verify, and manage your agricultural supply chain
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift glass border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Batch Creation</CardTitle>
              <CardDescription className="text-base">
                Farmers create crop batches with unique QR codes for end-to-end tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift glass border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Trace Events</CardTitle>
              <CardDescription className="text-base">
                Log every touchpoint from harvest to retail with timestamps and location data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift glass border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Blockchain Proof</CardTitle>
              <CardDescription className="text-base">
                Immutable records anchored to Polygon blockchain for tamper-proof verification
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift glass border-0">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">QR Verification</CardTitle>
              <CardDescription className="text-base">
                Consumers scan QR codes to instantly verify product authenticity and journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3 h-3 mr-1.5" />
              Benefits
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="gradient-text block">AgriChain?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Industry-leading blockchain supply chain platform built for modern agriculture
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Instant Recalls</h3>
                  <p className="text-gray-600">
                    Detect contamination and trace affected batches in minutes, protecting consumers and brands
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Multi-Stakeholder</h3>
                  <p className="text-gray-600">
                    Connect farmers, aggregators, retailers, and consumers in one transparent ecosystem
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Tamper-Proof</h3>
                  <p className="text-gray-600">
                    Blockchain immutability ensures data integrity and builds lasting consumer trust
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="glass border-0">
              <CardHeader>
                <Globe className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle>Global Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built on open blockchain standards for worldwide interoperability
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-0 mt-8">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor supply chain performance with live dashboards
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-0 -mt-8">
              <CardHeader>
                <Shield className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bank-grade security protecting your sensitive data
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader>
                <Zap className="w-8 h-8 text-orange-600 mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Instant verification and real-time tracking updates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-green-500 rounded-3xl p-12 md:p-20 text-center shadow-strong">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
              Join hundreds of farmers and retailers already using AgriChain for complete transparency
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/farmer">
                <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-lg text-lg px-8 py-6">
                  <Wheat className="w-5 h-5 mr-2" />
                  Create Your First Batch
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}