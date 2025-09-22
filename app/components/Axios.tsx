'use client'

import { useState } from 'react'
import api from './Serverurls'

export default function Axios() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const testApi = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/test') // Replace with actual endpoint
      setResponse(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Axios Test Component</h2>
      <button
        onClick={testApi}
        disabled={loading}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>
      {response && (
        <pre className='mt-4 p-2 bg-gray-100 rounded'>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
      {error && <p className='mt-4 text-red-500'>Error: {error}</p>}
    </div>
  )
}
