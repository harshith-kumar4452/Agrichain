'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { addAuthorizedUser, getAllAuthorizedUsers } from '@/lib/firebase'
import { UserPlus, Shield, Loader2, Users, LayoutDashboard, FileText, Download, CheckCircle2, UploadCloud } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthorizedUser {
  id: string
  email: string
  role: string
  name: string
  mobile?: string
  created_at: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration'>('dashboard')
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedIdCard, setGeneratedIdCard] = useState<any>(null)

  const [formData, setFormData] = useState({
    role: 'farmer',
    name: '',
    email: '',
    mobile: '',
    age: '',
    land_owned: '',
    top_crop: '',
    aadhar_number: '',
    pan_number: '',
    bank_details: '',
    address: ''
  })

  useEffect(() => {
    if (activeTab === 'dashboard') fetchUsers()
  }, [activeTab])

  const fetchUsers = async () => {
    setIsLoading(true)
    const resp = await getAllAuthorizedUsers()
    if (resp.success && resp.data) {
      setAuthorizedUsers(resp.data)
    }
    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Auto-generate a dummy email if empty to satisfy Firebase Authorized system
    const safeEmail = formData.email || `${formData.mobile}@agrichain.local`
    
    const exists = authorizedUsers.find(u => u.email.toLowerCase() === safeEmail.toLowerCase())
    if (exists && formData.email) {
      toast.error('This email is already registered!')
      setIsSubmitting(false)
      return
    }

    const resp = await addAuthorizedUser(safeEmail, formData.role, formData.name)
    if (resp.success) {
      toast.success(`User ${formData.name} securely registered as ${formData.role}!`)
      
      // Generate ID Card UI Model
      const uniqueAgriId = `AGRI-${formData.role.substring(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
      setGeneratedIdCard({
        agri_id: uniqueAgriId,
        ...formData,
        email: safeEmail
      })
      
      setFormData({
        role: formData.role, name: '', email: '', mobile: '', age: '', land_owned: '',
        top_crop: '', aadhar_number: '', pan_number: '', bank_details: '', address: ''
      })
    } else {
      toast.error(resp.error?.toString() || 'Failed to authorize user')
    }
    setIsSubmitting(false)
  }

  const printIdCard = () => {
    window.print()
  }

  // Calculate roles breakdown
  const roleCounts: Record<string, number> = authorizedUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Admin Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500">Manage AgriChain Ecosystem</p>
            </div>
          </div>
          
          <div className="flex bg-white/50 p-1 rounded-lg border border-gray-200 shadow-sm print:hidden">
            <button onClick={() => { setActiveTab('dashboard'); setGeneratedIdCard(null) }} className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button onClick={() => { setActiveTab('registration'); setGeneratedIdCard(null) }} className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'registration' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              <UserPlus className="w-4 h-4 mr-2" />
              Registration
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Stakeholder Breakdown Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {['farmer', 'officer', 'aggregator', 'retailer'].map(r => (
                   <Card key={r} className="glass border-0">
                     <CardContent className="p-4 flex flex-col items-center justify-center">
                       <span className="text-3xl font-bold text-indigo-700">{roleCounts[r] || 0}</span>
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{r}s</span>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <Card className="glass shadow-strong border-0">
                <CardHeader className="bg-white/50 border-b border-gray-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-xl text-gray-800">
                      <Users className="w-5 h-5 mr-3 text-indigo-600" />
                      Pre-Authorized Members
                    </CardTitle>
                    <CardDescription>
                      List of all authorized personnel across the platform.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                    {authorizedUsers.length} Total Status
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                      Loading ecosystem members...
                    </div>
                  ) : authorizedUsers.length === 0 ? (
                    <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p>No stakeholders registered yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-indigo-50/50 text-indigo-900 font-semibold">
                          <tr>
                            <th className="px-5 py-4">Full Name</th>
                            <th className="px-5 py-4">Credential (Email/Mobile)</th>
                            <th className="px-5 py-4">Assigned Role</th>
                            <th className="px-5 py-4 text-right">Added On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white/50">
                          {authorizedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-5 py-4 font-medium text-gray-900">{user.name}</td>
                              <td className="px-5 py-4 text-gray-600">
                                {user.email?.includes('@agrichain.local') ? 'Mobile Access via ' + user.email.replace('@agrichain.local', '') : user.email}
                              </td>
                              <td className="px-5 py-4 capitalize">
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="uppercase text-[10px] tracking-wider">
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-gray-500 text-xs text-right">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* REGISTRATION TAB */}
          {activeTab === 'registration' && !generatedIdCard && (
            <motion.div key="registration" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="glass shadow-strong border-0 max-w-4xl mx-auto">
                <CardHeader className="bg-white/50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-xl text-indigo-900">
                    <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                    Stakeholder Registration Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 bg-zinc-50/50">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Role Selection */}
                    <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                      <label className="text-sm font-bold text-indigo-900 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                        1. Select Stakeholder Role
                      </label>
                      <select
                        className="w-full h-12 px-4 py-2 border-2 border-indigo-200 rounded-lg text-base font-medium text-indigo-900 bg-white focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10 hover:border-indigo-300"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      >
                        <option value="farmer">Farmer (Producer)</option>
                        <option value="aggregator">Aggregator (Logistics)</option>
                        <option value="retailer">Retailer (Distributor)</option>
                        <option value="officer">Officer (Authority/Auditor)</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>

                    {/* DYNAMIC FORM INJECTION SPOT */}
                    {formData.role === 'farmer' ? (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">2</div>
                           <h3 className="text-lg font-bold text-gray-800">Required Farmer Details</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          {/* Name & Age */}
                          <div className="space-y-2"><label className="text-sm font-semibold">Full Name *</label><Input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-white" /></div>
                          <div className="space-y-2"><label className="text-sm font-semibold">Age *</label><Input type="number" required value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className="bg-white" /></div>
                          
                          {/* Contact Info */}
                          <div className="space-y-2"><label className="text-sm font-semibold">Mobile Number *</label><Input type="tel" required value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} className="bg-white" /></div>
                          <div className="space-y-2"><label className="text-sm font-semibold">Email Profile (Optional)</label><Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="If none, Mobile Login is used" className="bg-white border-dashed border-gray-300" /></div>
                          
                          {/* Farm Details */}
                          <div className="space-y-2"><label className="text-sm font-semibold">Land Owned (Acreage/Units) *</label><Input required value={formData.land_owned} onChange={(e) => handleInputChange('land_owned', e.target.value)} className="bg-white" /></div>
                          <div className="space-y-2"><label className="text-sm font-semibold">Top Priority Crop to Grow *</label><Input required value={formData.top_crop} onChange={(e) => handleInputChange('top_crop', e.target.value)} className="bg-white" /></div>
                          
                          {/* Identity details */}
                          <div className="space-y-2"><label className="text-sm font-semibold">Aadhaar Number *</label><Input required value={formData.aadhar_number} onChange={(e) => handleInputChange('aadhar_number', e.target.value)} className="bg-white" /></div>
                          <div className="space-y-2"><label className="text-sm font-semibold">PAN Number *</label><Input required value={formData.pan_number} onChange={(e) => handleInputChange('pan_number', e.target.value)} className="bg-white" /></div>
                        </div>

                        <div className="space-y-4 pt-2">
                           {/* Bank Details */}
                           <div className="space-y-2"><label className="text-sm font-semibold">Bank Details (Bank Name, AC No, IFSC) *</label><textarea required className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={formData.bank_details} onChange={(e) => handleInputChange('bank_details', e.target.value)} /></div>
                           
                           {/* Address */}
                           <div className="space-y-2"><label className="text-sm font-semibold">Full Address *</label><textarea required className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} /></div>
                        </div>

                        {/* File Uploads */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                           <h4 className="font-semibold text-gray-800 flex items-center mb-3"><UploadCloud className="w-4 h-4 mr-2 text-indigo-500"/> Required Document Uploads</h4>
                           <div className="grid md:grid-cols-2 gap-4">
                             <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                               <label className="text-sm font-bold text-gray-700 block mb-2 cursor-pointer">Upload Passport Photo *</label>
                               <input type="file" required className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                             </div>
                             <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                               <label className="text-sm font-bold text-gray-700 block mb-2 cursor-pointer">Upload Aadhaar Card (PDF/JPG) *</label>
                               <input type="file" required className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                             </div>
                           </div>
                        </div>

                      </div>
                    ) : (
                      <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
                        <p className="text-sm text-gray-500 italic">
                          Standard minimal registration process applies for <strong className="text-indigo-600 capitalize">{formData.role}</strong>. Proceed utilizing basic details.
                        </p>
                        <div className="grid md:grid-cols-2 gap-5 mt-4 text-left">
                          <div className="space-y-2"><label className="text-sm font-semibold">Full Name *</label><Input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-white" /></div>
                          <div className="space-y-2"><label className="text-sm font-semibold">Email Address *</label><Input type="email" required value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-white" /></div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white shadow-xl text-lg font-semibold transition-all hover:-translate-y-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Finalizing Database Entry...</>
                      ) : (
                        <><UserPlus className="w-5 h-5 mr-2" /> Officially Register {formData.role === 'farmer' ? "Farmer & Generate ID Card" : "Member"}</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* GENERATED ID CARD MODAL */}
          {generatedIdCard && (
            <motion.div key="idcard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center py-10">
              <div className="w-full max-w-sm">
                 <div className="text-center mb-6 print:hidden">
                    <div className="inline-flex w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                    <p className="text-gray-500 mt-2">The stakeholder has been approved and registered. Here is their official system clearance ID.</p>
                 </div>

                 {/* PHYSICAL ID CARD PREVIEW */}
                 <Card id="printable-id-card" className="bg-white shadow-2xl border-2 border-emerald-600 overflow-hidden print:shadow-none print:border-2 relative">
                    <div className="h-20 bg-emerald-600 flex items-center justify-center text-white relative">
                      {/* Logo / Title */}
                      <span className="font-black text-xl tracking-widest uppercase">AGRICHAIN PASSPORT</span>
                    </div>
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-gray-200 border-4 border-white rounded-full flex items-center justify-center text-gray-400 overflow-hidden shadow-lg">
                       <span className="text-xs font-semibold">PHOTO</span>
                    </div>
                    
                    <CardContent className="pt-16 pb-8 text-center px-6">
                       <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold tracking-widest uppercase mb-4">
                         OFFICIAL {generatedIdCard.role}
                       </Badge>
                       <h3 className="text-2xl font-bold text-gray-900 mb-1">{generatedIdCard.name}</h3>
                       <p className="text-gray-500 font-mono text-sm tracking-widest">{generatedIdCard.agri_id}</p>
                       
                       <div className="mt-6 pt-6 border-t border-dashed border-gray-200 grid grid-cols-2 gap-y-4 gap-x-2 text-left text-xs bg-slate-50 p-4 rounded-xl">
                          <div><span className="text-gray-400 font-semibold block uppercase">Aadhaar</span><span className="font-bold text-gray-800">{generatedIdCard.aadhar_number || 'N/A'}</span></div>
                          <div><span className="text-gray-400 font-semibold block uppercase">PAN</span><span className="font-bold text-gray-800">{generatedIdCard.pan_number || 'N/A'}</span></div>
                          <div className="col-span-2"><span className="text-gray-400 font-semibold block uppercase">Authorized Signature & Seal</span><span className="block h-10 border-b border-gray-400 mt-2 w-3/4"></span></div>
                       </div>
                    </CardContent>
                 </Card>

                 <div className="mt-8 flex gap-3 print:hidden">
                    <Button onClick={printIdCard} className="flex-1 bg-gray-900 text-white hover:bg-gray-800"><Download className="w-4 h-4 mr-2"/> Print ID Card</Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setGeneratedIdCard(null); setActiveTab('dashboard') }}>Return to Dashboard</Button>
                 </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
