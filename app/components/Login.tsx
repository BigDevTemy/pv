'use client'
import Image from 'next/image'
import Logo1m from '../images/logo-me.png'
import PemsoftLogo from '../images/pemsoft-logo.png'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api, { LOGIN } from './Serverurls'
import { useRouter } from 'next/navigation'
import Alert from './Alert'
import pb from '@/lib/pb'
import Delete from '@mui/icons-material/Delete'

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
        await pb.admins.authWithPassword('admin@ohcsf.com', 'admin12345')
        const records = await pb.collection('loggedInUsers').getFullList()

        console.log('record', records)
        const userList = records.map((record) => ({
          email: record.email,
          name: record.name || record.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.email}`,
        }))
        setUsers(userList)
        if (userList.length === 0) {
          setView('new')
          localStorage.setItem('users', JSON.stringify([]))
        } else {
          localStorage.setItem('users', JSON.stringify(userList))
        }
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
            email: email,
            password: password,
            device_name: 'web',
          }),
        }
      )
        .then((response) => response.json())
        .then(async (data) => {
          setLoading(false)
          console.log('Success:', data)

          if (data.success) {
            setMessage('Login Successful')

            // After a few seconds, show setting up message
            setTimeout(() => {
              setMessage('Setting up local configuration...')
            }, 2000)

            const existingRecords = await pb
              .collection('loggedInUsers')
              .getFullList({
                filter: `email = "${email}"`,
              })

            const existingUserRecords = await pb
              .collection('users')
              .getFullList({
                filter: `email = "${email}"`,
              })

            if (existingRecords.length > 0) {
              // Record exists → update lastSeen
              const existingRecord = existingRecords[0]
              await pb.collection('loggedInUsers').update(existingRecord.id, {
                lastSeen: new Date().toISOString(), // update to current time
              })
              console.log('UserLoggedRecord Update')
            } else {
              // Record does not exist → create new
              await pb.collection('loggedInUsers').create({
                cc_id: data.user.cc_id,
                user_id: data.user.id,
                email: email,
                firstname: data.user.first_name,
                lastname: data.user.last_name,
                lastSeen: new Date().toISOString(),
              })
              console.log('UserLoggedRecord Created')
            }

            if (existingUserRecords.length == 0) {
              await pb.collection('users').create({
                email: data.user.email,
                password: password,
                user_id: data.user.id,
                passwordConfirm: password,
                name: data.user.first_name + ' ' + data.user.last_name,
              })
              console.log('User has been created')
            } else {
              console.log('User Already Exist' + email + data.user.email)
            }

            if (data.employeeData.length > 0) {
              const employeeData = data.employeeData
              for (const employee of employeeData) {
                try {
                  const existingRecord = await pb
                    .collection('employees')
                    .getFullList({
                      filter: `ippsId = "${employee.ippis_no}"`,
                    })

                  if (existingRecord.length === 0) {
                    await pb.collection('employees').create({
                      ippsId: employee.ippis_no,
                      firstName: employee.first_name,
                      lastName: employee.last_name,
                      middleName: employee.middle_name,
                      email: employee.email,
                      dob: employee.date_of_birth,
                      phone: employee.mobile_number,
                      organisation: employee.org,
                      position: employee.position,
                      jobtitle: employee.job_title,
                      joblocation: employee.job_location,
                      state_of_origin: employee.state_of_origin,
                      taxstate: employee.tax_state,
                      qualification: employee.qualification,
                      hireDate: employee.hire_date,
                      confirmationDate: employee.confirmation_date,
                      ref_id: employee.ref_id,
                      sum_step18: employee.step_sum18,
                      grade: employee.grade,
                      department: employee.department,
                      // Add other fields as necessary
                    })
                    console.log(`Employee ${employee.first_name} created`)
                  }
                } catch (error) {
                  console.error(
                    `Failed to sync employee ${employee.first_name}:`,
                    error
                  )
                }
              }
            }
            if (data.departments && data.departments.length > 0) {
              for (const dept of data.departments) {
                try {
                  const existingDept = await pb
                    .collection('department')
                    .getFullList({
                      filter: `name = "${dept.department.trim()}"`,
                    })

                  if (existingDept.length === 0) {
                    await pb.collection('department').create({
                      name: dept.department.trim(),
                    })
                    console.log(`Department ${dept.department.trim()} created`)
                  }
                } catch (error) {
                  console.error(
                    `Failed to sync department ${dept.department}:`,
                    error
                  )
                }
              }
            }

            if (data.organisations && data.organisations.length > 0) {
              for (const org of data.organisations) {
                try {
                  const existingOrg = await pb
                    .collection('organisation')
                    .getFullList({
                      filter: `name = "${org.org.trim()}"`,
                    })

                  if (existingOrg.length === 0) {
                    await pb.collection('organisation').create({
                      name: org.org.trim(),
                    })
                    console.log(`Organisation ${org.org.trim()} created`)
                  }
                } catch (error) {
                  console.error(
                    `Failed to sync organisation ${org.org}:`,
                    error
                  )
                }
              }
            }

            const dataUserWithUserId = data.user
            dataUserWithUserId.user_id = data.user.id

            localStorage.setItem('token', data.token)
            localStorage.setItem(
              'currentUser',
              JSON.stringify(dataUserWithUserId)
            )

            // After syncing, show success message, then navigate
            setMessage('Configuration successful')
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
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

        if (authData?.record) {
          const firstName = authData.record.name.split(' ')[0]
          const lastName = authData.record.name.split(' ')[1]
          const records = authData.record
          records['first_name'] = firstName
          records['last_name'] = lastName
          localStorage.setItem('currentUser', JSON.stringify(records))
        }

        //localStorage.setItem('currentUser', JSON.stringify(authData.record))
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
      } catch (err: unknown) {
        console.log(err)
        setLoading(false)
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
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
        <div className='space-y-6'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Select Account
            </h2>
            <p className='text-gray-600'>Choose your account to continue</p>
          </div>
          <div className='space-y-3'>
            {users.map((user) => (
              <div
                key={user.email}
                className='group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-primaryy hover:shadow-lg transition-all duration-300 cursor-pointer'
                onClick={() => {
                  setCurrentUser(user)
                  setView('login')
                }}
              >
                <div className='flex items-center'>
                  <div className='relative'>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className='w-14 h-14 rounded-full border-2 border-gray-100 group-hover:border-primaryy transition-colors'
                    />
                    <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full'></div>
                  </div>
                  <div className='ml-4 flex-1'>
                    <p className='font-semibold text-gray-900 group-hover:text-primaryy transition-colors'>
                      {user.name}
                    </p>
                    <p className='text-sm text-gray-500'>{user.email}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      Swal.fire({
                        title: 'Remove Account?',
                        text: `Remove ${user.name} from this device?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Remove',
                        cancelButtonText: 'Cancel',
                        customClass: {
                          popup: 'rounded-xl',
                        },
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          const records = await pb
                            .collection('loggedInUsers')
                            .getFullList({
                              filter: `email = "${user.email}"`,
                            })

                          if (records.length > 0) {
                            const recordId = records[0].id
                            await pb
                              .collection('loggedInUsers')
                              .delete(recordId)
                            saveUsers(
                              users.filter((u) => u.email !== user.email)
                            )
                          }
                        }
                      })
                    }}
                    className='opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200'
                  >
                    <Delete className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView('new')}
            className='w-full py-3 px-4 bg-gradient-to-r from-primaryy to-primaryx text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200'
          >
            Add New Account
          </button>
        </div>
      )
    } else if (view === 'login') {
      if (!currentUser) return null
      return (
        <div className='space-y-6'>
          <div className='text-center'>
            <div className='relative inline-block'>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className='w-20 h-20 rounded-full border-4 border-white shadow-lg'
              />
              <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full'></div>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mt-4 mb-1'>
              Welcome back!
            </h2>
            <p className='text-gray-600'>{currentUser.name}</p>
          </div>

          {error && (
            <Alert type='error' message={error} onClose={() => setError('')} />
          )}

          <div className='space-y-4'>
            <div className='relative'>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryy focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white'
              />
            </div>

            <button
              onClick={() => {
                handleAuthLogin()
              }}
              disabled={loading}
              className='w-full py-3 px-4 bg-gradient-to-r from-primaryy to-primaryx text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {users.length > 0 && (
              <button
                onClick={() => setView('select')}
                className='w-full py-2 px-4 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200'
              >
                ← Back to accounts
              </button>
            )}
          </div>
        </div>
      )
    } else if (view === 'new') {
      return (
        <div className='space-y-6'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Sign In</h2>
            <p className='text-gray-600'>
              Welcome back! Please sign in to continue
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
            <div className='relative'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Email address'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryy focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white'
              />
            </div>

            <div className='relative'>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryy focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white'
              />
            </div>

            <button
              onClick={() => {
                handleAuthLogin()
              }}
              disabled={loading}
              className='w-full py-3 px-4 bg-gradient-to-r from-primaryy to-primaryx text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {users.length > 0 && (
              <button
                onClick={() => setView('select')}
                className='w-full py-2 px-4 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200'
              >
                ← Back to accounts
              </button>
            )}
          </div>
        </div>
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
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl w-full flex shadow-2xl rounded-2xl overflow-hidden bg-white'>
        {/* Left Side - Logo and Branding */}
        <div className='flex-[0.5] bg-white flex items-center justify-center p-12 relative border-r border-gray-100'>
          <div className='text-center'>
            <div className='mb-8'>
              <Image src={Logo1m} alt='Logo' className='mx-auto w-80 h-auto' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              Welcome Back
            </h1>
            <p className='text-gray-600 text-md leading-relaxed max-w-sm mx-auto'>
              Access your verification dashboard and manage employee
              verification data securely
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className='flex-[0.5] p-12 flex items-center justify-center bg-white'>
          <div className='w-full max-w-md space-y-8'>{renderContent()}</div>
        </div>
      </div>
      <div className='mt-1 text-center absolute bottom-0.5'>
        <div className='flex items-center justify-center'>
          <span className='text-sm text-gray-500 mr-4'>Powered By:</span>
          <Image src={PemsoftLogo} alt='PEMSOFT Logo' className='w-28 h-auto' />
        </div>
      </div>
    </div>
  )
}
