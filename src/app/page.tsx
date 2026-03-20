'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Wheat,
  Shield,
  Truck,
  Store,
  Users,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const rolesData = [
  {
    id: 'farmer',
    title: 'Farmer',
    icon: Wheat,
    color: 'emerald',
    badge: 'Initiator',
    shortDesc: 'Register crop harvests on the blockchain.',
    responsibilities: [
      'Register new crop batches securely on the blockchain',
      'Generate immutable QR codes for product tracking',
      'Log initial harvest location, date, and quantity'
    ]
  },
  {
    id: 'officer',
    title: 'Officer',
    icon: Shield,
    color: 'blue',
    badge: 'Authority',
    shortDesc: 'Maintain compliance and safety standards.',
    responsibilities: [
      'Audit supply chain activities and log trace events',
      'Verify regulatory compliance at any stage',
      'Access full transparent chain records to maintain safety'
    ]
  },
  {
    id: 'aggregator',
    title: 'Aggregator',
    icon: Truck,
    color: 'orange',
    badge: 'Logistics',
    shortDesc: 'Manage transit, storage, and batch transport.',
    responsibilities: [
      'Log transportation and storage events',
      'Handle batch updates across different facilities',
      'Maintain condition tracking (temperature/humidity logs)'
    ]
  },
  {
    id: 'retailer',
    title: 'Retailer',
    icon: Store,
    color: 'purple',
    badge: 'Destination',
    shortDesc: 'Final node presenting authenticated products.',
    responsibilities: [
      'Receive and securely log incoming shipments',
      'Present product tracking QR to end consumers',
      'Manage inventory and finalize the supply chain status'
    ]
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: Users,
    color: 'indigo',
    badge: 'Management',
    shortDesc: 'Control authorized personnel and stakeholders.',
    responsibilities: [
      'Pre-authorize new stakeholder emails',
      'Assign functional ecosystem roles (Farmer, Retailer, etc.)',
      'Oversee platform security and user management'
    ]
  }
]

const colorMaps = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'from-emerald-500 to-green-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'from-blue-500 to-cyan-600', btn: 'bg-blue-600 hover:bg-blue-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'from-orange-500 to-red-500', btn: 'bg-orange-600 hover:bg-orange-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'from-purple-500 to-indigo-600', btn: 'bg-purple-600 hover:bg-purple-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'from-indigo-500 to-purple-600', btn: 'bg-indigo-600 hover:bg-indigo-700' }
}

export default function GettingStartedPage() {
  const [selectedRole, setSelectedRole] = useState<typeof rolesData[0] | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      
      {/* Header */}
      <div className="pt-20 pb-16 text-center px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 text-sm uppercase tracking-widest text-[#15803d] border-[#15803d]">
            Getting Started
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Select Your <span className="text-emerald-600">AgriChain</span> Role
          </h1>
          <p className="text-lg text-gray-600 mt-4 leading-relaxed max-w-2xl mx-auto">
            AgriChain empowers all stakeholders in the agricultural supply chain. 
            Click on your designated role below to discover your features and responsibilities before logging into your portal.
          </p>
        </motion.div>
      </div>

      {/* Grid Flow */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {rolesData.map((role, idx) => {
            const Icon = role.icon
            const colors = colorMaps[role.color as keyof typeof colorMaps]
            
            return (
              <motion.div 
                key={role.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`${idx === 3 ? "lg:col-start-2" : ""} cursor-pointer`}
                onClick={() => setSelectedRole(role)}
              >
                <Card className={`h-full hover:-translate-y-2 transition-transform duration-300 border-2 ${colors.border} hover:shadow-xl bg-white relative overflow-hidden group`}>
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.icon}`} />
                  <CardHeader className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.icon} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge variant="secondary" className={`${colors.bg} ${colors.text} border-0`}>
                        {role.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{role.title}</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      {role.shortDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pop-up Modal */}
      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedRole(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className={`px-6 py-8 bg-gradient-to-br ${colorMaps[selectedRole.color as keyof typeof colorMaps].icon} text-white`}>
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <selectedRole.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedRole.title} Interface</h2>
                    <p className="text-white/80 mt-1">{selectedRole.badge} Portal</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                    Key Features & Responsibilities
                  </h3>
                  <ul className="space-y-4 mt-4">
                    {selectedRole.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className={`w-5 h-5 mr-3 flex-shrink-0 ${colorMaps[selectedRole.color as keyof typeof colorMaps].text}`} />
                        <span className="text-gray-700 leading-snug">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                  <Button variant="ghost" onClick={() => setSelectedRole(null)}>
                    Cancel
                  </Button>
                  <Link href="/auth">
                    <Button className={`${colorMaps[selectedRole.color as keyof typeof colorMaps].btn} text-white shadow-md`}>
                      Access {selectedRole.title} Portal
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}