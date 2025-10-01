'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import DocumentsModal from './DocumentsModal'
import Warning from '@mui/icons-material/Warning'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import AttachFile from '@mui/icons-material/AttachFile'
import UploadFile from '@mui/icons-material/UploadFile'

interface CustomDocument {
  type: string
  name: string
  description: string
  expiryDate: string
  approvalDocument: string
  institutionProvided: string
  year: string
  dateIssued: string
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
  currentUserId: string
}

export default function NewEmployeeDocuments({
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
  currentUserId,
}: Props) {
  const [customDocuments, setCustomDocuments] = useState<CustomDocument[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentField, setCurrentField] = useState('')
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
  const [newDoc, setNewDoc] = useState<CustomDocument>({
    type: '',
    name: '',
    description: '',
    expiryDate: '',
    approvalDocument: '',
    institutionProvided: '',
    year: '',
    dateIssued: '',
  })

  const addDocument = () => {
    if (newDoc.name && newDoc.type) {
      setCustomDocuments([...customDocuments, newDoc])
      setNewDoc({
        type: '',
        name: '',
        description: '',
        expiryDate: '',
        approvalDocument: '',
        institutionProvided: '',
        year: '',
        dateIssued: '',
      })
    }
  }

  const removeDocument = (index: number) => {
    setCustomDocuments(customDocuments.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className='space-y-6'>
        <h3 className='text-lg font-semibold'>Add New Employee Documents</h3>

        {/* Add New Document Form */}
        <div className='border border-gray-300 rounded-md p-4'>
          <h4 className='font-medium mb-4'>Add New Document</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              type='text'
              placeholder='Document Type'
              value={newDoc.type}
              onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <input
              type='text'
              placeholder='Document Name'
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <textarea
              placeholder='Description'
              value={newDoc.description}
              onChange={(e) =>
                setNewDoc({ ...newDoc, description: e.target.value })
              }
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
              rows={2}
            />
            <input
              type='date'
              placeholder='Expiry Date'
              value={newDoc.expiryDate}
              onChange={(e) =>
                setNewDoc({ ...newDoc, expiryDate: e.target.value })
              }
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <input
              type='file'
              placeholder='Approval Document'
              onChange={(e) =>
                setNewDoc({
                  ...newDoc,
                  approvalDocument: e.target.files?.[0]?.name || '',
                })
              }
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <input
              type='text'
              placeholder='Institution Provided'
              value={newDoc.institutionProvided}
              onChange={(e) =>
                setNewDoc({ ...newDoc, institutionProvided: e.target.value })
              }
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <input
              type='number'
              placeholder='Year'
              value={newDoc.year}
              onChange={(e) => setNewDoc({ ...newDoc, year: e.target.value })}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
            <input
              type='date'
              placeholder='Date Issued'
              value={newDoc.dateIssued}
              onChange={(e) =>
                setNewDoc({ ...newDoc, dateIssued: e.target.value })
              }
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
            />
          </div>
          <button
            onClick={addDocument}
            className='mt-4 px-4 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
          >
            Add Document
          </button>
        </div>

        {/* List of Added Documents */}
        <div className='space-y-4'>
          <h4 className='font-medium'>Added Documents</h4>
          {customDocuments.map((doc, index) => (
            <div
              key={index}
              className='border border-gray-300 rounded-md p-4 relative'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h5 className='font-medium'>{doc.name}</h5>
                  <p className='text-sm text-gray-600'>{doc.type}</p>
                  <p className='text-sm'>{doc.description}</p>
                  <div className='text-xs text-gray-500 mt-2'>
                    <p>Institution: {doc.institutionProvided}</p>
                    <p>Year: {doc.year}</p>
                    <p>Date Issued: {doc.dateIssued}</p>
                    <p>Expiry: {doc.expiryDate}</p>
                  </div>
                  <div className='relative mt-2'>
                    <div className='flex items-center space-x-1'>
                      <button
                        onClick={() =>
                          setShowIssueSelect({
                            ...showIssueSelect,
                            [`custom_${index}`]:
                              !showIssueSelect[`custom_${index}`],
                          })
                        }
                        className='text-gray-500 hover:text-gray-700'
                      >
                        {issues[`custom_${index}`]?.length > 0 ? (
                          <Warning className='w-5 h-5 text-red-500' />
                        ) : (
                          <MoreHoriz className='w-5 h-5' />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentField(`custom_${index}`)
                          setIsModalOpen(true)
                        }}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        {assignedDocuments[`custom_${index}`]?.length > 0 ? (
                          <AttachFile className='w-5 h-5 text-green-500' />
                        ) : (
                          <UploadFile className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                    <label className='flex items-center space-x-1 mt-2'>
                      <input
                        type='checkbox'
                        checked={verify[`custom_${index}`] || false}
                        onChange={(e) =>
                          onVerifyChange(`custom_${index}`, e.target.checked)
                        }
                        className='h-4 w-4 text-primaryy focus:ring-primaryy border-gray-300 rounded'
                      />
                      <span className='text-xs text-gray-600'>Verify</span>
                    </label>
                    {showIssueSelect[`custom_${index}`] && (
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
                                  issues[`custom_${index}`]?.includes(issue) ||
                                  false
                                }
                                onChange={(e) => {
                                  const currentIssues =
                                    issues[`custom_${index}`] || []
                                  const newIssues = e.target.checked
                                    ? [...currentIssues, issue]
                                    : currentIssues.filter((i) => i !== issue)
                                  setIssues({
                                    ...issues,
                                    [`custom_${index}`]: newIssues,
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
                  {issues[`custom_${index}`]?.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-1'>
                      {issues[`custom_${index}`].map((issue) => (
                        <span
                          key={issue}
                          onClick={() =>
                            setShowIssueSelect({
                              ...showIssueSelect,
                              [`custom_${index}`]: true,
                            })
                          }
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-pointer hover:bg-red-200'
                        >
                          {issue}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const newIssues = issues[
                                `custom_${index}`
                              ].filter((i) => i !== issue)
                              setIssues({
                                ...issues,
                                [`custom_${index}`]: newIssues,
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
                  {assignedDocuments[`custom_${index}`]?.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-1'>
                      {assignedDocuments[`custom_${index}`].map((docId) => (
                        <span
                          key={docId}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                        >
                          Document {docId}
                          <button
                            onClick={() => {
                              const newDocs = assignedDocuments[
                                `custom_${index}`
                              ].filter((id) => id !== docId)
                              setAssignedDocuments({
                                ...assignedDocuments,
                                [`custom_${index}`]: newDocs,
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
                <button
                  onClick={() => removeDocument(index)}
                  className='text-red-500 hover:text-red-700'
                >
                  Remove
                </button>
              </div>
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
          currentUserId={currentUserId}
        />
      </div>
    </>
  )
}
