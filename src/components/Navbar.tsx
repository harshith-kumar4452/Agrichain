'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  Wheat,
  Truck,
  Search,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home, roles: ['farmer', 'aggregator', 'retailer', 'consumer', 'officer', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Shield, roles: ['admin'] },
  { name: 'Farmer', href: '/farmer', icon: Wheat, roles: ['farmer'] },
  { name: 'Trace Event', href: '/event', icon: Truck, roles: ['aggregator', 'retailer', 'officer'] },
  { name: 'Verify', href: '/verify', icon: Search, roles: ['consumer', 'officer', 'admin'] },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['farmer', 'aggregator', 'retailer', 'admin', 'officer'] },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  // Filter navigation items based on user role
  const visibleNavigation = user
    ? navigation.filter(item => item.roles.includes(user.role))
    : navigation

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AgriChain</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "relative px-4 py-2 rounded-lg transition-all duration-300 group flex items-center space-x-2",
                    isActive
                      ? "text-emerald-600"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-white/50"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-600 to-green-500" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{user.name || 'User'}</div>
                    <div className="text-xs text-gray-600 capitalize">{user.role}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {visibleNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-200"
                        : "bg-white/50 text-gray-700 hover:bg-white/80"
                    )}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                )
              })}

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-white/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center text-white font-semibold">
                        {user.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{user.name || 'User'}</div>
                        <div className="text-xs text-gray-600 capitalize">{user.role}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
