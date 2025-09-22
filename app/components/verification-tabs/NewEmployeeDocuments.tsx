'use client'

import { useState } from 'react'

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
  showIssueSelect: { [field: string]: boolean }
  setShowIssueSelect: (show: { [field: string]: boolean }) => void
  possibleIssues: string[]
}

export default function NewEmployeeDocuments({
  data,
  onChange,
  issues,
  setIssues,
  showIssueSelect,
  setShowIssueSelect,
  possibleIssues,
}: Props) {
  const [customDocuments, setCustomDocuments] = useState<CustomDocument[]>([])
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
            <div key={index} className='border border-gray-300 rounded-md p-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <h5 className='font-medium'>{doc.name}</h5>
                  <p className='text-sm text-gray-600'>{doc.type}</p>
                  <p className='text-sm'>{doc.description}</p>
                  <div className='text-xs text-gray-500 mt-2'>
                    <p>Institution: {doc.institutionProvided}</p>
                    <p>Year: {doc.year}</p>
                    <p>Date Issued: {doc.dateIssued}</p>
                    <p>Expiry: {doc.expiryDate}</p>
                  </div>
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
      </div>
    </>
  )
}
