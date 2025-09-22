'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface User {
  email: string
  name: string
  avatar: string
}

export default function Dashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ])
  const [startDate, endDate] = dateRange
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('currentUser')
    if (!token) {
      router.push('/login')
    } else if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('pb_auth')
    localStorage.removeItem('user')

    router.push('/login')
  }
  const cards = [
    { title: 'Total Users', value: '1,234', icon: '👥', color: 'bg-blue-500' },
    {
      title: 'Active Verifications',
      value: '567',
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Pending Requests',
      value: '89',
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed Today',
      value: '42',
      icon: '🎉',
      color: 'bg-purple-500',
    },
  ]

  const employees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      department: 'IT',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Active',
      department: 'HR',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'Inactive',
      department: 'Finance',
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      status: 'Active',
      department: 'Marketing',
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      status: 'Active',
      department: 'Sales',
    },
  ]

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header with Welcome message and buttons */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            {currentUser ? `Welcome, ${currentUser.name}` : 'Dashboard'}
          </h1>
          <div className='flex space-x-4'>
            <button
              onClick={() => router.push('/add-verification')}
              className='bg-primaryy hover:bg-primaryx text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
            >
              Add Verification
            </button>
            <button
              onClick={handleLogout}
              className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
            >
              Logout
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {cards.map((card, index) => (
            <div
              key={index}
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
          ))}
        </div>

        {/* Employees Table */}
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900'>Employees</h2>
            <div className='relative'>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update)
                  setLoading(true)
                  // Simulate API call
                  setTimeout(() => setLoading(false), 1000)
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
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-6 py-4 text-center text-gray-500'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {employee.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {employee.email}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {employee.department}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
