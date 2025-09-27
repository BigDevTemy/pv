import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pb'

interface Document {
  id: string
  ipps_no: string
  file: string
  name: string
  type: string
  created: string
  created_at: string
  submittedAt: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  ippsId: string
  field: string
  onAssign: (field: string, documents: string[], append?: boolean) => void
}

export default function DocumentsModal({
  isOpen,
  onClose,
  ippsId,
  field,
  onAssign,
}: Props) {
  const [activeTab, setActiveTab] = useState<'uploaded' | 'upload' | 'scan'>(
    'uploaded'
  )
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [scanning, setScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedDocuments([])
      if (activeTab === 'uploaded') {
        fetchDocuments()
      }
      if (activeTab === 'scan') {
        loadScanner()
      }
    }
  }, [isOpen, activeTab, ippsId])

  // Cleanup scanner on unmount or tab change
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const loadScanner = async () => {
    try {
      setScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setScanning(false)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const captureDocument = () => {
    if (!videoRef.current || !documentName || !documentType) return

    // Create a canvas to capture the current video frame
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (ctx && videoRef.current) {
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `${documentName}.png`, {
            type: 'image/png',
          })
          await uploadScannedDocument(file)
        }
      }, 'image/png')
    }
  }

  const uploadScannedDocument = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('ippsId', ippsId)
      formData.append('file', file)
      formData.append('name', documentName)
      formData.append('type', documentType)
      formData.append('submittedAt', new Date().toISOString())
      formData.append('submittedBy', 'admin')

      const createdRecord = await pb.collection('documents').create(formData)
      onAssign(field, [createdRecord.name], true)

      // Reset form
      setDocumentName('')
      setDocumentType('')
      setCapturedImage(null)
      stopScanner()

      onClose()
    } catch (error) {
      console.error('Failed to upload scanned document:', error)
      alert('Failed to save scanned document.')
    } finally {
      setUploading(false)
    }
  }

  // const loadScanner = () => {
  //   const scanner = new jscanify()
  //   const canvasCtx = canvas.getContext('2d')
  //   const resultCtx = result.getContext('2d')
  //   navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  //     video.srcObject = stream
  //     video.onloadedmetadata = () => {
  //       video.play()

  //       setInterval(() => {
  //         canvasCtx.drawImage(video, 0, 0)
  //         const resultCanvas = scanner.highlightPaper(canvas)
  //         resultCtx.drawImage(resultCanvas, 0, 0)
  //       }, 10)
  //     }
  //   })
  // }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('documents').getFullList({
        filter: `ippsId = "${ippsId}"`,
      })
      setDocuments(records as unknown as Document[])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !documentName || !documentType) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('ippsId', ippsId)
      formData.append('file', selectedFile)
      formData.append('name', documentName)
      formData.append('type', documentType)
      formData.append('submittedAt', new Date().toISOString())
      formData.append('submittedBy', 'admin')

      const createdRecord = await pb.collection('documents').create(formData)
      onAssign(field, [createdRecord.name], true)
      setSelectedFile(null)
      setDocumentName('')
      setDocumentType('')
      onClose()
    } catch (error) {
      console.error('Failed to upload document:', error)
      alert('Failed to upload document.')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Document Management
            </h2>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
          >
            <svg
              className='w-5 h-5 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className='grid grid-cols-3 border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'uploaded'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center justify-center space-x-2'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
              <span className='text-sm'>My Documents</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center justify-center space-x-2'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
              <span className='text-sm'>Upload New</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-4 px-4 text-center font-medium transition-colors ${
              activeTab === 'scan'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center justify-center space-x-2'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              <span className='text-sm'>Scan</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[50vh]'>
          {activeTab === 'uploaded' && (
            <div>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                  <span className='ml-3 text-gray-600'>
                    Loading documents...
                  </span>
                </div>
              ) : documents.length === 0 ? (
                <div className='text-center py-8'>
                  <svg
                    className='w-12 h-12 text-gray-400 mx-auto mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <p className='text-gray-500'>No documents found.</p>
                  <p className='text-sm text-gray-400 mt-1'>
                    Upload your first document to get started.
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between mb-4'>
                    <p className='text-sm text-gray-600'>
                      Select documents to assign
                    </p>
                    <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                      {selectedDocuments.length} selected
                    </span>
                  </div>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedDocuments.includes(doc.id)
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        if (selectedDocuments.includes(doc.id)) {
                          setSelectedDocuments((prev) =>
                            prev.filter((id) => id !== doc.id)
                          )
                        } else {
                          setSelectedDocuments((prev) => [...prev, doc.id])
                        }
                      }}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium text-gray-900'>
                            {doc.name}
                          </p>
                          <div className='flex items-center space-x-2 mt-1'>
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {doc.type}
                            </span>
                            <span className='text-sm text-gray-500'>
                              {new Date(doc.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedDocuments.includes(doc.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedDocuments.includes(doc.id) && (
                            <svg
                              className='w-3 h-3 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scan' && (
            <div className='space-y-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Document Scanner
                </h3>
                <p className='text-gray-600'>
                  Scan documents directly from your device camera
                </p>
              </div>

              {/* Document Details Form */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Document Name *
                  </label>
                  <input
                    type='text'
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder='Enter document name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  >
                    <option value=''>Select document type</option>
                    <option value='ID Card'>ID Card</option>
                    <option value='Passport'>Passport</option>
                    <option value='Birth Certificate'>Birth Certificate</option>
                    <option value='Educational Certificate'>
                      Educational Certificate
                    </option>
                    <option value='Employment Letter'>Employment Letter</option>
                    <option value='Medical Report'>Medical Report</option>
                    <option value='Bank Statement'>Bank Statement</option>
                    <option value='Utility Bill'>Utility Bill</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>
              </div>

              {/* Camera View */}
              <div className='bg-gray-900 rounded-lg overflow-hidden relative'>
                {!scanning ? (
                  <div className='aspect-video flex items-center justify-center bg-gray-800'>
                    <button
                      onClick={loadScanner}
                      className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
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
                          d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                        />
                      </svg>
                      <span>Start Camera</span>
                    </button>
                  </div>
                ) : (
                  <div className='relative'>
                    <video
                      ref={videoRef}
                      className='w-full aspect-video object-cover'
                      playsInline
                      muted
                    />
                    <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3'>
                      <button
                        onClick={captureDocument}
                        disabled={!documentName || !documentType || uploading}
                        className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                      >
                        {uploading ? (
                          <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                            </svg>
                            <span>Capture</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={stopScanner}
                        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 10l6 6m0-6l-6 6'
                          />
                        </svg>
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className='text-sm text-gray-600 bg-blue-50 p-3 rounded-lg'>
                <p className='font-medium mb-1'>Camera Tips:</p>
                <ul className='list-disc list-inside space-y-1'>
                  <li>Ensure good lighting and hold the document steady</li>
                  <li>Position the document clearly within the camera frame</li>
                  <li>Fill in document name and type before capturing</li>
                  <li>The captured image will be saved as a PNG file</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className='space-y-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Upload New Document
                </h3>
                <p className='text-gray-600'>
                  Select a file to upload and assign to this field
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Document Name
                  </label>
                  <input
                    type='text'
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder='Enter document name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select document type</option>
                    <option value='ID Card'>ID Card</option>
                    <option value='Passport'>Passport</option>
                    <option value='Birth Certificate'>Birth Certificate</option>
                    <option value='Educational Certificate'>
                      Educational Certificate
                    </option>
                    <option value='Employment Letter'>Employment Letter</option>
                    <option value='Medical Report'>Medical Report</option>
                    <option value='Bank Statement'>Bank Statement</option>
                    <option value='Utility Bill'>Utility Bill</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Choose File
                  </label>
                  <div className='relative'>
                    <input
                      type='file'
                      accept='.png,.pdf,.jpeg,.jpg'
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className='hidden'
                      id='file-upload'
                    />
                    <label
                      htmlFor='file-upload'
                      className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors'
                    >
                      <div className='text-center'>
                        <svg
                          className='w-8 h-8 text-gray-400 mx-auto mb-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                          />
                        </svg>
                        <p className='text-sm text-gray-600'>
                          {selectedFile
                            ? selectedFile.name
                            : 'Click to select or drag and drop'}
                        </p>
                        <p className='text-xs text-gray-400 mt-1'>
                          PNG, PDF, JPEG up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={
                    !selectedFile || !documentName || !documentType || uploading
                  }
                  className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
                >
                  {uploading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                        />
                      </svg>
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'uploaded' && documents.length > 0 && (
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
            <div className='flex justify-between items-center'>
              <p className='text-sm text-gray-600'>
                {selectedDocuments.length} document
                {selectedDocuments.length !== 1 ? 's' : ''} selected
              </p>
              <div className='flex space-x-3'>
                <button
                  onClick={onClose}
                  className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selectedDocNames = documents
                      .filter((doc) => selectedDocuments.includes(doc.id))
                      .map((doc) => doc.name)
                    onAssign(field, selectedDocNames, false)
                    onClose()
                  }}
                  disabled={selectedDocuments.length === 0}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span>Assign Documents</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
