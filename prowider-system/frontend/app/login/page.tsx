'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Eye,
  EyeOff,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card, CardBody } from '@/components/Card'
import { Loader } from '@/components/Loader'


export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)

  const passwordInputType = useMemo(() => (showPassword ? 'text' : 'password'), [showPassword])

  return (
    <div className="flex min-h-screen overflow-hidden overflow-x-hidden bg-gray-50">
      <div className="flex min-h-screen w-full overflow-x-hidden">


        {/* LEFT BRANDING PANEL */}
        <div className="hidden lg:flex w-[45%] max-w-[720px] h-screen flex-col justify-between relative overflow-hidden">

          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900" />

          {/* subtle tech background */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_70%_10%,rgba(99,102,241,0.20),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(37,99,235,0.20),transparent_45%)]" />
          </div>

          {/* content */}
          <div className="relative z-10 w-full px-12 py-8 flex flex-col h-full justify-center overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                <Sparkles className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Prowider</div>
                <div className="text-blue-200/90 text-sm">Lead Distribution System</div>
              </div>
            </div>

            <div className="mt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                <Gauge className="w-4 h-4 text-blue-200" />
                <span className="text-sm text-white/90">Premium allocation engine</span>
              </div>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
                Smart Lead Distribution
              </h2>

              <p className="mt-2 text-white/75 max-w-lg text-base leading-snug">
                Real-time provider allocation for fair and reliable lead management.
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-400/15 border border-blue-300/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Fair Allocation</div>
                      <div className="text-white/70 text-xs mt-0.5">Equal opportunity for providers.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-400/15 border border-indigo-300/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-indigo-200" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Real-time Updates</div>
                      <div className="text-white/70 text-xs mt-0.5">Instant lead distribution.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-sky-400/15 border border-sky-300/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-sky-200" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Secure System</div>
                      <div className="text-white/70 text-xs mt-0.5">Reliable and protected workflows.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* bottom illustration */}
            <div className="mt-auto pt-6">
              <div className="relative max-h-[220px]">
                <div className="absolute -top-10 left-10 h-24 w-24 rounded-full bg-blue-300/10 blur-2xl opacity-50" />
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 max-w-[360px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold text-sm">CRM Analytics</div>
                    <div className="text-[11px] text-white/70">Live</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between px-4">
                      <div className="text-white/80 text-xs">Fairness score</div>
                      <div className="text-white font-bold text-sm">98.7%</div>
                    </div>
                    <div className="h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between px-4">
                      <div className="text-white/80 text-xs">Avg response</div>
                      <div className="text-white font-bold text-sm">1.2s</div>
                    </div>
                    <div className="h-24 rounded-2xl bg-gradient-to-b from-white/7 to-transparent border border-white/10 p-3 opacity-60">
                      <div className="flex items-end gap-2 h-full">
                        {['20%', '45%', '30%', '60%', '50%', '78%'].map((h, idx) => (
                          <div key={idx} className="flex-1 rounded-lg bg-gradient-to-t from-blue-300/30 to-blue-300/5" style={{ height: h }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* rounded right corners hint */}
                <div className="pointer-events-none absolute inset-0 rounded-tl-none rounded-bl-none" />
              </div>
            </div>
          </div>

        </div>


        {/* RIGHT LOGIN PANEL */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 lg:py-0 overflow-hidden">

          <div className="w-full max-w-md">
            <div className="card-hover animate-in">

              <Card className="shadow-xl rounded-[20px] border border-gray-200">
                <CardBody className="p-8">
                  <div className="text-center mb-6 lg:mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Prowider</h1>
                    <p className="text-gray-600">Lead Distribution System</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="h-14"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={passwordInputType}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full h-14 px-4 pr-12 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_10px_25px_rgba(37,99,235,0.25)] transition-all duration-300"
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader size="sm" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="font-semibold">Sign In</span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                        Register
                      </a>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

