'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Mail,
  Lock,
  LogIn,
  UserCheck,
  Truck,
  Store,
  Search
} from 'lucide-react'

const demoUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'farmer@example.com',
    password: 'farmer123',
    role: 'farmer',
    name: 'John Farmer',
    organization: 'Green Valley Farms',
    icon: UserCheck,
    color: 'bg-green-600'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'aggregator@example.com',
    password: 'aggregator123',
    role: 'aggregator',
    name: 'Jane Aggregator',
    organization: 'Fresh Supply Co',
    icon: Truck,
    color: 'bg-blue-600'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'retailer@example.com',
    password: 'retailer123',
    role: 'retailer',
    name: 'Bob Retailer',
    organization: 'SuperMart Chain',
    icon: Store,
    color: 'bg-purple-600'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'consumer@example.com',
    password: 'consumer123',
    role: 'consumer',
    name: 'Alice Consumer',
    organization: null,
    icon: Search,
    color: 'bg-orange-600'
  }
]

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Find demo user
      const user = demoUsers.find(u => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Login user
      login(user)
      
      // Redirect based on role
      switch (user.role) {
        case 'farmer':
          router.push('/farmer')
          break
        case 'aggregator':
        case 'retailer':
          router.push('/event')
          break
        case 'consumer':
          router.push('/verify')
          break
        default:
          router.push('/')
      }

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AgriChain
          </h1>
          <p className="text-lg text-gray-600">
            Choose a demo account to explore the blockchain supply chain platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </CardTitle>
              <CardDescription>
                Sign in with your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Accounts</CardTitle>
              <CardDescription>
                Click on any account to auto-fill credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoUsers.map((user) => {
                const Icon = user.icon
                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border-2 border-transparent hover:border-gray-300 cursor-pointer transition-colors ${user.color} bg-opacity-10`}
                    onClick={() => handleDemoLogin(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                        {user.organization && (
                          <p className="text-xs text-gray-500">{user.organization}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {user.email} / {user.password}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            This is a demo application. All accounts are pre-configured for testing purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
