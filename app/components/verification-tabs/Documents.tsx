'use client'

import { useState, useEffect } from 'react'
import api from '../Serverurls'

interface DocumentType {
  id: string
  name: string
  description: string
}

interface Props {
  data: { [key: string]: string }
  onChange: (field: string, value: string) => void
  issues: { [field: string]: string[] }
  setIssues: (issues: { [field: string]: string[] }) => void
  showIssueSelect: { [field: string]: boolean }
  setShowIssueSelect: (show: { [field: string]: boolean }) => void
  possibleIssues: string[]
}

export default function Documents({
  data,
  onChange,
  issues,
  setIssues,
  showIssueSelect,
  setShowIssueSelect,
  possibleIssues,
}: Props) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await api.get('/collections/document_types/records')
        setDocumentTypes(response.data.items || [])
      } catch (err: any) {
        setError('Failed to load document types')
      } finally {
        setLoading(false)
      }
    }
    fetchDocumentTypes()
  }, [])

  if (loading) return <div>Loading documents...</div>
  if (error) return <div className='text-red-500'>{error}</div>

  return (
    <>
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Required Documents</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {documentTypes.map((docType) => (
            <div
              key={docType.id}
              className='border border-gray-300 rounded-md p-4'
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
              {showIssueSelect[`document_${docType.id}`] ? (
                <div className='flex flex-col space-y-1 mt-2'>
                  <div className='flex justify-end'>
                    <button
                      onClick={() =>
                        setShowIssueSelect({
                          ...showIssueSelect,
                          [`document_${docType.id}`]: false,
                        })
                      }
                      className='text-gray-500 hover:text-gray-700'
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
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>
                  {possibleIssues.map((issue) => (
                    <label key={issue} className='flex items-center space-x-1'>
                      <input
                        type='checkbox'
                        checked={
                          issues[`document_${docType.id}`]?.includes(issue) ||
                          false
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
                      <span className='text-xs'>{issue}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() =>
                    setShowIssueSelect({
                      ...showIssueSelect,
                      [`document_${docType.id}`]: true,
                    })
                  }
                  className={
                    issues[`document_${docType.id}`]?.length > 0
                      ? 'text-red-500 hover:text-red-700 mt-2'
                      : 'text-green-500 hover:text-green-700 mt-2'
                  }
                >
                  {issues[`document_${docType.id}`]?.length > 0 ? (
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
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </button>
              )}
              {issues[`document_${docType.id}`] &&
                issues[`document_${docType.id}`].length > 0 && (
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
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
