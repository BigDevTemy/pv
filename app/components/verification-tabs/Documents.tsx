'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../Serverurls'
import pb from '@/lib/pb'
import DocumentsModal from './DocumentsModal'

interface DocumentType {
  id: string
  name: string
  description: string
}

interface UploadedDocument {
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
  data: { [key: string]: string }
  onChange: (field: string, value: string) => void
  issues: { [field: string]: string[] }
  setIssues: (issues: { [field: string]: string[] }) => void
  assignedDocuments: { [field: string]: string[] }
  setAssignedDocuments: (docs: { [field: string]: string[] }) => void
  showIssueSelect: { [field: string]: boolean }
  setShowIssueSelect: (show: { [field: string]: boolean }) => void
  possibleIssues: string[]
  ippsId: string
  verify: { [key: string]: boolean }
  onVerifyChange: (field: string, value: boolean) => void
}

export default function Documents({
  data,
  onChange,
  issues,
  setIssues,
  assignedDocuments,
  setAssignedDocuments,
  showIssueSelect,
  setShowIssueSelect,
  possibleIssues,
  ippsId,
  verify,
  onVerifyChange,
}: Props) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentField, setCurrentField] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('')
  const filteredIssues = useMemo(
    () =>
      possibleIssues.filter((issue) =>
        issue.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [possibleIssues, searchTerm]
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowIssueSelect({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // useEffect(() => {
  //   const fetchDocumentTypes = async () => {
  //     try {
  //       const response = await api.get('/collections/document_types/records')
  //       setDocumentTypes(response.data.items || [])
  //     } catch (err: any) {
  //       setError('Failed to load document types')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchDocumentTypes()
  // }, [])

  useEffect(() => {
    fetchUploadedDocuments()
  }, [ippsId])

  const fetchUploadedDocuments = async () => {
    try {
      const records = await pb.collection('documents').getFullList({
        filter: `ippsId = "${ippsId}"`,
      })
      setLoading(false)
      setUploadedDocuments(records as unknown as UploadedDocument[])
    } catch (error) {
      setLoading(false)
      console.error('Failed to fetch documents:', error)
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

      await pb.collection('documents').create(formData)
      setSelectedFile(null)
      setDocumentName('')
      setDocumentType('')
      setLoading(false)
      fetchUploadedDocuments()
    } catch (error) {
      console.error('Failed to upload document:', error)
      setLoading(false)
      alert('Failed to upload document.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div>Loading documents...</div>
  if (error) return <div className='text-red-500'>{error}</div>

  return (
    <>
      <div className='space-y-6'>
        <h3 className='text-lg font-semibold'>Document Management</h3>

        {/* Upload New Document */}
        <div className='border border-gray-300 rounded-md p-4'>
          <h4 className='font-medium mb-4'>Upload New Document</h4>
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
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
                Select Document
              </label>
              <input
                type='file'
                accept='.png,.pdf,.jpeg'
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setSelectedFile(files[0] || null) // For now, handle one file, but can extend to multiple
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <button
              onClick={handleFileUpload}
              disabled={
                !selectedFile || !documentName || !documentType || uploading
              }
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50'
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* My Uploaded Documents */}
        <div className='border border-gray-300 rounded-md p-4'>
          <h4 className='font-medium mb-4'>My Uploaded Documents</h4>
          {uploadedDocuments.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <div className='space-y-2'>
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between p-2 border rounded'
                >
                  <div>
                    <p className='font-medium'>{doc.name}</p>
                    <p className='text-sm text-gray-600'>{doc.type}</p>
                    <p className='text-sm text-gray-500'>
                      {new Date(doc.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 className='text-lg font-semibold'>Required Documents</h3>
        <div className='grid grid-cols-1 gap-4'>
          {documentTypes.map((docType) => (
            <div
              key={docType.id}
              className='border border-gray-300 rounded-md p-4 relative'
            >
              <h4 className='font-medium'>{docType.name}</h4>
              <p className='text-sm text-gray-600 mb-2'>
                {docType.description}
              </p>
              <input
                type='file'
                accept='image/*,.pdf,.doc,.docx'
                onChange={(e) =>
                  onChange(
                    `document_${docType.id}`,
                    e.target.files?.[0]?.name || ''
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
              />
              <label className='flex items-center space-x-1 mt-2'>
                <input
                  type='checkbox'
                  checked={verify[`document_${docType.id}`] || false}
                  onChange={(e) =>
                    onVerifyChange(`document_${docType.id}`, e.target.checked)
                  }
                  className='h-4 w-4 text-primaryy focus:ring-primaryy border-gray-300 rounded'
                />
                <span className='text-xs text-gray-600'>Verify</span>
              </label>
              <div className='relative mt-2'>
                <div className='flex items-center space-x-1'>
                  <button
                    onClick={() =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        [`document_${docType.id}`]:
                          !showIssueSelect[`document_${docType.id}`],
                      })
                    }
                    className='text-gray-500 hover:text-gray-700'
                  >
                    {issues[`document_${docType.id}`]?.length > 0 ? (
                      <svg
                        className='w-5 h-5 text-red-500'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                          clipRule='evenodd'
                        />
                      </svg>
                    ) : (
                      <svg
                        className='w-5 h-5'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      // Assign all uploaded documents to this field
                      const allDocIds = uploadedDocuments.map((doc) => doc.id)
                      setAssignedDocuments({
                        ...assignedDocuments,
                        [`document_${docType.id}`]: allDocIds,
                      })
                    }}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </div>
                {showIssueSelect[`document_${docType.id}`] && (
                  <div
                    ref={dropdownRef}
                    className='absolute right-0 top-full z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                  >
                    <div className='p-2'>
                      <input
                        type='text'
                        placeholder='Search issues...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                      />
                    </div>
                    <div className='max-h-48 overflow-y-auto p-2 light-scrollbar'>
                      {filteredIssues.map((issue) => (
                        <label
                          key={issue}
                          className='flex items-center space-x-2 p-1'
                        >
                          <input
                            type='checkbox'
                            checked={
                              issues[`document_${docType.id}`]?.includes(
                                issue
                              ) || false
                            }
                            onChange={(e) => {
                              const currentIssues =
                                issues[`document_${docType.id}`] || []
                              const newIssues = e.target.checked
                                ? [...currentIssues, issue]
                                : currentIssues.filter((i) => i !== issue)
                              setIssues({
                                ...issues,
                                [`document_${docType.id}`]: newIssues,
                              })
                            }}
                            className='h-4 w-4 text-primaryy focus:ring-primaryy border-gray-300 rounded'
                          />
                          <span className='text-sm font-medium text-gray-700'>
                            {issue}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {issues[`document_${docType.id}`]?.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1'>
                  {issues[`document_${docType.id}`].map((issue) => (
                    <span
                      key={issue}
                      onClick={() =>
                        setShowIssueSelect({
                          ...showIssueSelect,
                          [`document_${docType.id}`]: true,
                        })
                      }
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-pointer hover:bg-red-200'
                    >
                      {issue}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newIssues = issues[
                            `document_${docType.id}`
                          ].filter((i) => i !== issue)
                          setIssues({
                            ...issues,
                            [`document_${docType.id}`]: newIssues,
                          })
                        }}
                        className='ml-1 text-red-600 hover:text-red-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {assignedDocuments[`document_${docType.id}`]?.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1'>
                  {assignedDocuments[`document_${docType.id}`].map((docId) => (
                    <span
                      key={docId}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                    >
                      Document {docId}
                      <button
                        onClick={() => {
                          const newDocs = assignedDocuments[
                            `document_${docType.id}`
                          ].filter((id) => id !== docId)
                          setAssignedDocuments({
                            ...assignedDocuments,
                            [`document_${docType.id}`]: newDocs,
                          })
                        }}
                        className='ml-1 text-blue-600 hover:text-blue-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <DocumentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ippsId={ippsId}
          field={currentField}
          onAssign={(field, docs, append) => {
            const currentDocs = assignedDocuments[field] || []
            const newDocs = append ? [...currentDocs, ...docs] : docs
            setAssignedDocuments({ ...assignedDocuments, [field]: newDocs })
          }}
        />
      </div>
    </>
  )
}
