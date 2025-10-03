'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import pb from '@/lib/pb'
import Image from 'next/image'
import Logo from '../images/logo-me.png'
import PemsoftLogo from '../images/pemsoft-logo.png'
import BarChart from '@mui/icons-material/BarChart'
import CheckCircle from '@mui/icons-material/CheckCircle'
import HourglassEmpty from '@mui/icons-material/HourglassEmpty'
import Celebration from '@mui/icons-material/Celebration'
import Inbox from '@mui/icons-material/Inbox'
import { CloudDoneOutlined, CloudOffOutlined } from '@mui/icons-material'
import { Tooltip } from '@mui/material'

interface User {
  id: string
  email: string
  name: string
  avatar: string
  first_name: string
  last_name: string
  user_id: string
}

interface Verification {
  id: string
  ippsId: string
  status: string
  submittedAt: string
  firstName: string
  lastName: string
  submittedBy: string
  sync?: number
}

interface EmployeeData {
  id: string
  firstName: string
  lastName: string
}

export default function Dashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    new Date(),
  ])
  const [startDate, endDate] = dateRange
  const [loading, setLoading] = useState(false)
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [perPage, setPerPage] = useState(100)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('currentUser')
    console.log('user', user)
    if (!token) {
      router.push('/login')
    } else if (user) {
      setCurrentUser(JSON.parse(user))
      pb.authStore.save(token, JSON.parse(user))
    }
  }, [router])

  const fetchVerifications = useCallback(async () => {
    setLoading(true)
    const userx = localStorage.getItem('currentUser')
    console.log(userx, userx ? JSON.parse(userx) : null)

    console.log('useridxxxx', userx)
    try {
      // Authenticate as admin to access verifications
      await pb.admins.authWithPassword('admin@ohcsf.com', 'admin12345')
      let filter = ''
      if (startDate && endDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        filter = `submittedAt >= "${start.toISOString()}" && submittedAt <= "${end.toISOString()}"`
      } else {
        // Default to current day
        const today = new Date()
        const start = new Date(today)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        filter = `submittedAt >= "${start.toISOString()}" && submittedAt <= "${end.toISOString()}"`
      }
      console.log('filter', filter)
      const result = await pb.collection('verifications').getList(1, perPage, {
        filter,
      })
      const records = result.items
      // Get unique employee IDs
      const employeeIds = [
        ...new Set(records.map((r) => r.employeeRef).filter((id) => id)),
      ]
      const employees =
        employeeIds.length > 0
          ? await pb.collection('employees').getFullList({
              filter: employeeIds.map((id) => `id = "${id}"`).join(' || '),
            })
          : []
      const employeeMap: Record<string, EmployeeData> = employees.reduce(
        (acc, emp) => ({ ...acc, [emp.id]: emp }),
        {}
      )
      // Sort: incomplete first
      records.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (b.status === 'pending' && a.status !== 'pending') return 1
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
      })
      setVerifications(
        records.map((r) => ({
          id: r.id,
          ippsId: r.ippsId,
          status: r.status,
          submittedAt: r.submittedAt,
          firstName: employeeMap[r.employeeRef]?.firstName || '',
          lastName: employeeMap[r.employeeRef]?.lastName || '',
          submittedBy: r.submittedBy || '',
          sync: r.sync2 || 0,
        }))
      )
    } catch (error) {
      console.error('Failed to fetch verifications:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, perPage])

  useEffect(() => {
    if (currentUser) {
      fetchVerifications()
    }
  }, [fetchVerifications, currentUser])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('pb_auth')
    localStorage.removeItem('user')

    router.push('/login')
  }
  console.log('currentUserxxx', currentUser?.user_id, currentUser)

  const totalVerifications = verifications.filter(
    (v) => v.status == 'complete'
  ).length

  const completedVerifications = verifications.filter(
    (v) => v.status === 'complete' && v.submittedBy == currentUser?.user_id
  ).length
  const pendingRequests = verifications.filter(
    (v) => v.status === 'pending' && v.submittedBy == currentUser?.user_id
  ).length
  const completedToday = verifications.filter((v) => {
    const today = new Date().toISOString().split('T')[0]
    const submittedDate = new Date(v.submittedAt).toISOString().split('T')[0]
    console.log('today', today, 'submittedDate', submittedDate)
    console.log('submittedBy', v.submittedBy, 'current', currentUser?.user_id)
    return (
      v.status === 'complete' &&
      v.submittedBy == currentUser?.user_id &&
      submittedDate == today
    )
  }).length

  const sync = verifications.filter((v) => {
    return v.sync === 1 && v.submittedBy == currentUser?.user_id
  }).length

  const cards = [
    {
      title: 'Total CC Verifications',
      value: totalVerifications.toString(),
      icon: <BarChart />,
      color: 'bg-blue-500',
      tooltip:
        'Total number of completed verifications across all CC officers.',
    },
    {
      title: 'Completed Verifications',
      value: completedVerifications.toString(),
      icon: <CheckCircle />,
      color: 'bg-green-500',
      tooltip: 'Number of verifications completed by you.',
    },
    {
      title: 'Pending Verifications',
      value: pendingRequests.toString(),
      icon: <HourglassEmpty />,
      color: 'bg-yellow-500',
      tooltip:
        'Number of verifications submitted by you that are still pending.',
    },
    {
      title: 'Completed Today',
      value: completedToday.toString(),
      icon: <Celebration />,
      color: 'bg-purple-500',
      tooltip: 'Number of verifications completed by you today.',
    },
    {
      title: 'Sync',
      value: sync.toString() + '/' + completedVerifications.toString(),
      icon: <CloudDoneOutlined />,
      color: 'bg-primaryy',
      tooltip:
        'Number of your completed verifications that have been synced to the server.',
    },
  ]

  const filteredVerifications = verifications.filter(
    (v) =>
      v.ippsId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      v.submittedBy == currentUser?.user_id
  )

  console.log(filteredVerifications)
  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8 relative'>
      <div className='max-w-7xl mx-auto'>
        {/* Header with Welcome message and buttons */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <Image src={Logo} alt='Logo' className='w-72' />
            <h1 className='text-3xl font-bold text-gray-900'>
              {currentUser ? `Welcome, ${currentUser.first_name}` : 'Dashboard'}
            </h1>
          </div>

          <div className='flex space-x-4'>
            <button
              onClick={() => router.push('/add-verification')}
              className='bg-primaryy hover:bg-primaryx text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
            >
              Start Verification
            </button>

            {/* <button
              onClick={() => router.push('/upload-image')}
              className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
            >
              Upload Image
            </button> */}

            <button
              onClick={handleLogout}
              className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
            >
              Logout
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
          {cards.map((card, index) => (
            <Tooltip
              title={card.tooltip}
              key={index}
              placement='top'
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #ccc',
                    fontSize: '0.875rem',
                    maxWidth: '200px',
                  },
                },
                arrow: {
                  sx: {
                    color: 'white',
                    '&::before': {
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                    },
                  },
                },
              }}
            >
              <div
                className={`${card.color} text-white p-6 rounded-lg shadow-lg`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm opacity-80'>{card.title}</p>
                    <p className='text-3xl font-bold'>{card.value}</p>
                  </div>
                  <div className='text-4xl'>{card.icon}</div>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* Verifications Table */}
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Verifications
            </h2>
            <div className='flex space-x-4'>
              <input
                type='text'
                placeholder='Search IPPS ID'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value={100}>100 per page</option>
                <option value={200}>200 per page</option>
                <option value={500}>500 per page</option>
                <option value={1000}>1000 per page</option>
              </select>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update)
                }}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
                placeholderText='Select date range'
              />
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    First Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Last Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    IPPS ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Submitted At
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Sync Status
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-4 text-center text-gray-500'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredVerifications.map((v) => (
                    <tr
                      key={v.id}
                      className='hover:bg-gray-50'
                      onDoubleClick={() => {
                        if (v.status !== 'complete') {
                          router.push(`/add-verification?ippsId=${v.ippsId}`)
                        }
                      }}
                      style={{
                        cursor: v.status !== 'complete' ? 'pointer' : 'default',
                      }}
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {v.firstName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {v.lastName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {v.ippsId}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            v.status === 'complete'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(v.submittedAt).toISOString().split('T')[0]}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        {v.sync === 1 ? (
                          <CloudDoneOutlined className='text-green-500' />
                        ) : (
                          <CloudOffOutlined className='text-red-500' />
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {filteredVerifications.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className='px-6 py-4'>
                      <div className='flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg'>
                        <Inbox className='text-6xl mb-4 text-gray-400' />
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                          No Verifications Found
                        </h3>
                        <p className='text-gray-500 text-center'>
                          There are no verifications matching your search
                          criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className='mt-4 flex items-center justify-center  bottom-0 absolute'
          style={{ width: '90%' }}
        >
          <span className='text-sm text-gray-500 mr-4'>Powered By:</span>
          <Image src={PemsoftLogo} alt='PEMSOFT Logo' className='w-32 h-auto' />
        </div>
      </div>
    </div>
  )
}
