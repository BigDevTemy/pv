import { useState, useMemo, useRef, useEffect } from 'react'
import DocumentsModal from './DocumentsModal'
import Warning from '@mui/icons-material/Warning'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import AttachFile from '@mui/icons-material/AttachFile'
import UploadFile from '@mui/icons-material/UploadFile'
interface Props {
  data: { [key: string]: string }
  onChange: (field: string, value: string) => void
  issues: { [field: string]: string[] }
  setIssues: (issues: { [field: string]: string[] }) => void
  showIssueSelect: { [field: string]: boolean }
  setShowIssueSelect: (show: { [field: string]: boolean }) => void
  possibleIssues: string[]
  ippsId: string
}

export default function EmploymentDetails({
  data,
  onChange,
  issues,
  setIssues,
  showIssueSelect,
  setShowIssueSelect,
  possibleIssues,
  ippsId,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentField, setCurrentField] = useState('')
  const [assignedDocuments, setAssignedDocuments] = useState<{
    [field: string]: string[]
  }>({})
  const [initialData, setInitialData] = useState<{ [key: string]: string }>({})
  const fields = [
    'organisation',
    'refId',
    'jobLocation',
    'jobTitle',
    'position',
    'stepSum18',
    'dateOfHire',
    'dateOfConfirmation',
    'taxState',
    'gradeLevel',
    'grade',
    'department',
    'expectedRetirementDate',
    'dateOfLastPromotion',
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const datePart = dateString.split(' ')[0] // Take only the date part before space
    const [year, month, day] = datePart.split('-')
    return `${day}/${month}/${year}`
  }

  const parseDate = (dateString: string) => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const filteredIssues = useMemo(
    () =>
      possibleIssues.filter((issue) =>
        issue.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [possibleIssues, searchTerm]
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInitialData(data)
  }, [])

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

  //org,ref_id, joblocation,jobtitle,position,step_sum18,hiredate,taxstate,ste_of_origin,confirmation_date,qualification

  return (
    <>
      <div className='grid grid-cols-1 gap-4'>
        {fields.map((field) => (
          <div key={field} className='relative'>
            <label className='block text-sm font-medium text-gray-700 mb-1 capitalize'>
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className='flex items-center space-x-2'>
              <input
                type='text'
                value={
                  field.includes('date')
                    ? formatDate(data[field] || '')
                    : data[field] || ''
                }
                onChange={(e) =>
                  onChange(
                    field,
                    field.includes('date')
                      ? parseDate(e.target.value)
                      : e.target.value
                  )
                }
                disabled={!!initialData[field]}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder={
                  field.includes('date')
                    ? 'DD/MM/YYYY'
                    : `Enter ${field.replace(/([A-Z])/g, ' $1').trim()}`
                }
              />
              <div className='relative'>
                <div className='flex items-center space-x-1'>
                  <button
                    onClick={() =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        [field]: !showIssueSelect[field],
                      })
                    }
                    className='text-gray-500 hover:text-gray-700'
                  >
                    {issues[field]?.length > 0 ? (
                      <Warning className='w-5 h-5 text-red-500' />
                    ) : (
                      <MoreHoriz className='w-5 h-5' />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentField(field)
                      setIsModalOpen(true)
                    }}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    {assignedDocuments[field]?.length > 0 ? (
                      <AttachFile className='w-5 h-5 text-green-500' />
                    ) : (
                      <UploadFile className='w-5 h-5' />
                    )}
                  </button>
                </div>
                {showIssueSelect[field] && (
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
                            checked={issues[field]?.includes(issue) || false}
                            onChange={(e) => {
                              const currentIssues = issues[field] || []
                              const newIssues = e.target.checked
                                ? [...currentIssues, issue]
                                : currentIssues.filter((i) => i !== issue)
                              setIssues({ ...issues, [field]: newIssues })
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
            </div>
            {issues[field]?.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-1'>
                {issues[field].map((issue) => (
                  <span
                    key={issue}
                    onClick={() =>
                      setShowIssueSelect({ ...showIssueSelect, [field]: true })
                    }
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-pointer hover:bg-red-200'
                  >
                    {issue}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newIssues = issues[field].filter(
                          (i) => i !== issue
                        )
                        setIssues({ ...issues, [field]: newIssues })
                      }}
                      className='ml-1 text-red-600 hover:text-red-800'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {assignedDocuments[field]?.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-1'>
                {assignedDocuments[field].map((docId) => (
                  <span
                    key={docId}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                  >
                    Document {docId}
                    <button
                      onClick={() => {
                        const newDocs = assignedDocuments[field].filter(
                          (id) => id !== docId
                        )
                        setAssignedDocuments({
                          ...assignedDocuments,
                          [field]: newDocs,
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
        onAssign={(field, docs) =>
          setAssignedDocuments((prev) => ({ ...prev, [field]: docs }))
        }
      />
    </>
  )
}
