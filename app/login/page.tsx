'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'Mccarthyworkmail@gmail.com',
      password: 'password123'
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    console.log('Attempting login with:', data.email)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      console.log('Login response status:', response.status)
      const result = await response.json()
      console.log('Login response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      // Success
      toast.success('Login successful! Redirecting...')
      
      // Wait a bit then redirect using window.location
      setTimeout(() => {
        console.log('Redirecting to dashboard...')
        window.location.replace('/dashboard')
      }, 1000)
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
      setIsLoading(false)
    }
  }

  const testDebugLogin = async () => {
    console.log('Testing debug login...')
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        credentials: 'include'
      })
      
      const result = await response.json()
      console.log('Debug login result:', result)
      
      if (response.ok) {
        toast.success('Debug login successful! Check console for details.')
        setTimeout(() => {
          window.location.replace('/dashboard')
        }, 1000)
      } else {
        toast.error('Debug login failed: ' + result.error)
      }
    } catch (error) {
      console.error('Debug login error:', error)
      toast.error('Debug login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Debug info */}
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
          <p><strong>Test Credentials (pre-filled):</strong></p>
          <p>Email: Mccarthyworkmail@gmail.com</p>
          <p>Password: password123</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <button
              type="button"
              onClick={testDebugLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Debug Login (Test)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}