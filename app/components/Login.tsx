'use client'
import Image from 'next/image'
import Logo1m from '../images/logo-1.png'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api, { LOGIN } from './Serverurls'
import { useRouter } from 'next/navigation'
import Alert from './Alert'
import pb from '@/lib/pb'

interface User {
  email: string
  name: string
  avatar: string
}

export default function Login() {
  const [users, setUsers] = useState<User[]>([])
  const [view, setView] = useState('select')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await pb.admins.authWithPassword(
          'bigdevtemy@gmail.com',
          'T9Fkxak3hPKqaqC'
        )
        const records = await pb.collection('users').getFullList()

        console.log('record', records)
        const userList = records.map((record) => ({
          email: record.email,
          name: record.name || record.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.email}`,
        }))
        setUsers(userList)
        localStorage.setItem('users', JSON.stringify(userList))
      } catch (err) {
        console.error('Failed to fetch users:', err)
        const saved = localStorage.getItem('users')
        if (saved) setUsers(JSON.parse(saved))
      }
    }

    fetchUsers()
  }, [])

  const handleAuthLogin = async () => {
    if (loading) return

    setLoading(true)
    setError('')
    setMessage('')

    const dynamic_email = currentUser ? currentUser.email : email

    if (view === 'new') {
      fetch(
        'https://dev-api.phillipsoutsourcing.net/api/ppl-verification-login-check',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: dynamic_email,
            password: password,
            device_name: 'web',
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setLoading(false)
          console.log('Success:', data)
          if (data.success) {
            setMessage('Login successful!')
            localStorage.setItem('token', data.token)
            localStorage.setItem('currentUser', JSON.stringify(data.user))
            //router.push('/dashboard')
          } else {
            setError(data.message || 'Login failed. Please try again.')
          }
        })
        .catch((error) => {
          setLoading(false)
          setError('Login failed. Please try again.')
          console.error('Error:', error)
        })
    } else {
      try {
        const authData = await pb
          .collection('users')
          .authWithPassword(dynamic_email, password)
        console.log('Logged in:', authData)
        localStorage.setItem('token', authData.token)
        localStorage.setItem('currentUser', JSON.stringify(authData.record))
        setMessage('Login successful!')
        router.push('/dashboard')
        localStorage.setItem('token', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.record))
        setMessage('Login successful!')
        setLoading(false)
        setTimeout(() => {
          // router.push('/dashboard') // Redirect to dashboard or another page

          router.push('/dashboard')
        }, 5000)
      } catch (err: any) {
        console.log(err)
        setLoading(false)
        setError(err.message)
      }
    }
  }

  //  const newUser = {
  //                   email,
  //                   name: email,
  //                   avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
  //                 }
  //                 saveUsers([...users, newUser])
  //                 setCurrentUser(newUser)
  //                 setView('profile')

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers)
    localStorage.setItem('users', JSON.stringify(newUsers))
  }

  const renderContent = () => {
    if (view === 'select') {
      return (
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold text-center text-primaryy'>
            Select User
          </h2>
          <div className='grid grid-cols-1 gap-4'>
            {users.map((user) => (
              <div
                key={user.email}
                className='flex items-center p-4 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                <div
                  onClick={() => {
                    setCurrentUser(user)
                    setView('login')
                  }}
                  className='flex items-center flex-1 cursor-pointer'
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-12 h-12 rounded-full mr-4'
                  />
                  <p className='text-gray-900'>{user.name}</p>
                </div>
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Are you sure?',
                      text: `Do you want to remove ${user.name}?`,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Yes, remove it!',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        saveUsers(users.filter((u) => u.email !== user.email))
                      }
                    })
                  }}
                  className='ml-2 text-red-500 hover:text-red-700'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView('new')}
            className='w-full py-2 px-4 bg-primaryy text-white rounded-md hover:bg-primaryx'
          >
            New User
          </button>
        </div>
      )
    } else if (view === 'login') {
      if (!currentUser) return null
      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className='w-20 h-20 rounded-full mx-auto'
            />
            <p className='text-xl font-semibold text-gray-900 mt-2'>
              {currentUser.name}
            </p>
          </div>
          {error && (
            <Alert type='error' message={error} onClose={() => setError('')} />
          )}
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
          />
          <button
            onClick={() => {
              handleAuthLogin()
            }}
            disabled={loading}
            className='w-full py-2 px-4 bg-primaryy text-white rounded-md hover:bg-primaryx disabled:opacity-50'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {users.length > 0 && (
            <button
              onClick={() => setView('select')}
              className='w-full py-2 px-4 bg-gray-300 text-gray-900 rounded-md'
            >
              Back
            </button>
          )}
        </div>
      )
    } else if (view === 'new') {
      return (
        <>
          <div className='flex flex-col items-start justify-start p-4 rounded-md '>
            <h2 className='text-3xl font-extrabold text-primaryy'>Sign in</h2>
            <p className='text-gray-700'>
              Welcome back!. Kindly sign in to continue.
            </p>
          </div>
          {error && (
            <Alert type='error' message={error} onClose={() => setError('')} />
          )}
          {message && (
            <Alert
              type='success'
              message={message}
              onClose={() => setMessage('')}
            />
          )}
          <div className='space-y-4'>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email address'
              className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
            />
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
            />
            <button
              onClick={() => {
                handleAuthLogin()
              }}
              className='w-full py-2 px-4 bg-primaryy text-white rounded-md hover:bg-primaryx'
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {users.length > 0 && (
              <button
                onClick={() => setView('select')}
                className='w-full py-2 px-4 bg-gray-300 text-gray-900 rounded-md'
              >
                Back
              </button>
            )}
          </div>
        </>
      )
    } else if (view === 'profile') {
      if (!currentUser) return null
      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className='w-20 h-20 rounded-full mx-auto'
            />
            <p className='text-xl font-semibold text-gray-900 mt-2'>
              {currentUser.name}
            </p>
          </div>
          <input
            type='password'
            placeholder='Password'
            className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
          />
          <button
            onClick={() => setView('select')}
            className='w-full py-2 px-4 bg-gray-300 text-gray-900 rounded-md'
          >
            Logout
          </button>
        </div>
      )
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-primaryy py-12 px-4 sm:px-6 lg:px-8'>
      <div className='flex-[0.5] flex items-center justify-center'>
        <div className='text-center text-white'>
          <h1 className='text-4xl font-bold mb-4'>Welcome to</h1>
          <h2 className='text-3xl font-semibold'>Personal Verification App</h2>
          <p className='mt-4 text-lg'>
            Secure and easy verification for your personal needs.
          </p>
        </div>
      </div>
      <div className='flex-[0.5] h-auto max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg'>
        {/* <div className='text-center'>
          <Image src={Logo1m} alt='Logo' className='mx-auto mb-4 w-1/2' />
        </div> */}
        {renderContent()}
      </div>
    </div>
  )
}
