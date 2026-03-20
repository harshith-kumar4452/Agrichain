'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { signInWithEmail, signUpWithEmail, signInWithGoogle, getUserData, saveUserData, getAuthorizedUserByEmail } from '@/lib/firebase'
import { Mail, Lock, Phone, Wheat } from 'lucide-react'

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function AuthPage() {
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleRoute = (role: string) => {
    switch (role) {
      case 'admin': router.push('/admin'); break;
      case 'farmer': router.push('/farmer'); break;
      case 'aggregator': case 'retailer': case 'officer': router.push('/event'); break;
      case 'consumer': router.push('/verify'); break;
      default: router.push('/');
    }
  }

  const handleAuthSuccess = async (firebaseUser: any, authEmail: string) => {
    let userDataResp = await getUserData(firebaseUser.uid)
    
    if (!userDataResp.success) {
      // First time logging in (either Google or Email)
      // Check if authorized by Admin
      const authCheck = await getAuthorizedUserByEmail(authEmail)
      if (!authCheck.success) {
        throw new Error('This email is not authorized by the Admin. Please contact support.')
      }
      
      const newUserData = {
        email: authCheck.data.email,
        name: authCheck.data.name || firebaseUser.displayName || 'New User',
        role: authCheck.data.role, // Admin assigned role!
        created_at: new Date().toISOString()
      }
      await saveUserData(firebaseUser.uid, newUserData)
      login({ id: firebaseUser.uid, ...newUserData })
      handleRoute(newUserData.role)
    } else {
      // Returning user
      login({ id: firebaseUser.uid, ...userDataResp.data })
      handleRoute(userDataResp.data?.role)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isFirstTime) {
        // Pre-verify before creating an account
        const authCheck = await getAuthorizedUserByEmail(email)
        if (!authCheck.success) {
          throw new Error('This email is not authorized by the Admin for First Time Setup.')
        }
        const resp = await signUpWithEmail(email, password);
        if (!resp.success) throw new Error(resp.error?.message || 'Setup failed')
        await handleAuthSuccess(resp.user, email)
      } else {
        const resp = await signInWithEmail(email, password);
        if (!resp.success) throw new Error(resp.error?.message || 'Login failed')
        await handleAuthSuccess(resp.user, email)
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err)
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const resp = await signInWithGoogle()
      if (!resp.success) throw new Error(resp.error?.message || 'Google Auth failed')
      
      await handleAuthSuccess(resp.user, resp.user.email)
    } catch (err: any) {
      console.error('Google Auth Error:', err)
      setError(err.message || 'Google sign in failed or email not authorized.')
    } finally {
      setIsLoading(false)
    }
  }

  const bypassAdminSetup = async () => {
      // Only for local testing demo purposes
      try {
        setIsLoading(true)
        const resp = await signUpWithEmail('harshithkumar4452@gmail.com', 'admin123')
        if (resp.success) {
          const newUserData = { email: 'harshithkumar4452@gmail.com', name: 'Harshith Kumar', role: 'admin' as any, created_at: new Date().toISOString() }
          await saveUserData(resp.user.uid, newUserData)
          login({ id: resp.user.uid, ...newUserData })
          handleRoute('admin')
        }
      } catch (e) { console.error(e) }
      setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 relative">
      <button onClick={bypassAdminSetup} className="absolute top-4 right-4 text-xs text-transparent hover:text-gray-400">Admin Setup</button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg mx-auto mb-4 group hover:scale-105 transition-transform cursor-pointer">
            <Wheat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AgriChain
          </h1>
          <p className="text-sm text-gray-600">
            Sign in to access your blockchain supply chain portal
          </p>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden glass">
          <CardHeader className="bg-white/50 border-b border-gray-100">
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsFirstTime(false)} 
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isFirstTime ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsFirstTime(true)} 
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isFirstTime ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                First Time Setup
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700"><Mail className="w-4 h-4 inline mr-1" />Registered Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/70 focus-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700"><Lock className="w-4 h-4 inline mr-1" />{isFirstTime ? "Create Password" : "Password"}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/70 focus-ring"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                  <p className="text-red-800 text-xs font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-semibold py-2 h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isFirstTime ? 'Complete Account Setup' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f0f9ff] px-2 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="bg-white hover:bg-gray-50 text-gray-700 font-medium h-11"
              >
                <GoogleIcon />
                Google
              </Button>
              
              <Button 
                variant="outline" 
                disabled 
                className="bg-white text-gray-400 font-medium h-11 relative overflow-hidden"
              >
                <Phone className="w-4 h-4 mr-2" />
                Mobile Number
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Coming Soon
                </span>
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
