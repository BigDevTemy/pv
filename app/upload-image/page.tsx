'use client'
import Image from 'next/image'
import Logo1m from '../images/logo-1.png'
import { useState } from 'react'
import pb from '@/lib/pb'
import { useRouter } from 'next/navigation'
import Alert from '../components/Alert'

export default function UploadImage() {
  const [ippsId, setIppsId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()

  const handleUpload = async () => {
    if (!ippsId.trim() || !selectedFile) {
      setError('Please enter IPPS ID and select an image.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Find employee by IPPS ID
      const employees = await pb.collection('employees').getFullList({
        filter: `ippsId = "${ippsId}"`,
      })

      if (employees.length === 0) {
        setError('Employee not found with the provided IPPS ID.')
        return
      }

      const employee = employees[0]

      // Update employee with the photo
      await pb.collection('employees').update(employee.id, {
        photo: selectedFile,
      })

      setMessage('Image uploaded successfully!')
      setIppsId('')
      setSelectedFile(null)
    } catch (err: unknown) {
      console.error('Upload failed:', err)
      setError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-primaryy py-12 px-4 sm:px-6 lg:px-8'>
      <div className='flex-[0.5] flex items-center justify-center'>
        <div className='text-center text-white'>
          <Image src={Logo1m} alt='Logo' className='mx-auto mb-4 w-1/2' />
          <h1 className='text-4xl font-bold mb-4'>Welcome to</h1>
          <h2 className='text-3xl font-semibold'>Personal Verification App</h2>
          <p className='mt-4 text-lg'>Upload employee images securely.</p>
        </div>
      </div>
      <div className='flex-[0.5] h-auto max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-primaryy'>
            Upload Image
          </h2>
          <p className='text-gray-700'>Upload employee photo by IPPS ID.</p>
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
            type='text'
            value={ippsId}
            onChange={(e) => setIppsId(e.target.value)}
            placeholder='Employee IPPS ID'
            className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
          />
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy sm:text-sm'
          />
          {selectedFile && (
            <p className='text-sm text-gray-600'>
              Selected: {selectedFile.name}
            </p>
          )}
          <button
            onClick={handleUpload}
            disabled={loading}
            className='w-full py-2 px-4 bg-primaryy text-white rounded-md hover:bg-primaryx disabled:opacity-50'
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className='w-full py-2 px-4 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
