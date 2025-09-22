interface Props {
  data: { [key: string]: string }
  onChange: (field: string, value: string) => void
  issues: { [field: string]: string[] }
  setIssues: (issues: { [field: string]: string[] }) => void
  showIssueSelect: { [field: string]: boolean }
  setShowIssueSelect: (show: { [field: string]: boolean }) => void
  possibleIssues: string[]
}

export default function IdentificationsBiometrics({
  data,
  onChange,
  issues,
  setIssues,
  showIssueSelect,
  setShowIssueSelect,
  possibleIssues,
}: Props) {
  const fields = [
    'bvn',
    'passportPhotograph',
    'fingerprints',
    'digitalSignatures',
  ]

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {fields.map((field) => (
          <div key={field} className='col-span-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1 capitalize'>
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className='flex items-center space-x-2'>
              {field === 'passportPhotograph' ||
              field === 'fingerprints' ||
              field === 'digitalSignatures' ? (
                <input
                  type='file'
                  accept={
                    field === 'passportPhotograph'
                      ? 'image/*'
                      : field === 'fingerprints'
                      ? 'image/*'
                      : '.sig,.pdf'
                  }
                  onChange={(e) =>
                    onChange(field, e.target.files?.[0]?.name || '')
                  }
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
              ) : (
                <input
                  type='text'
                  value={data[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  placeholder={`Enter ${field
                    .replace(/([A-Z])/g, ' $1')
                    .trim()}`}
                />
              )}
              {showIssueSelect[field] ? (
                <div className='flex flex-col space-y-1'>
                  <div className='flex justify-end'>
                    <button
                      onClick={() =>
                        setShowIssueSelect({
                          ...showIssueSelect,
                          [field]: false,
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
                      <span className='text-xs'>{issue}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() =>
                    setShowIssueSelect({ ...showIssueSelect, [field]: true })
                  }
                  className={
                    issues[field]?.length > 0
                      ? 'text-red-500 hover:text-red-700'
                      : 'text-green-500 hover:text-green-700'
                  }
                >
                  {issues[field]?.length > 0 ? (
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
            </div>
            {issues[field] && issues[field].length > 0 && (
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
          </div>
        ))}
      </div>
    </>
  )
}
