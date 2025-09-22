'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '../components/Alert'
import api from '../components/Serverurls'
import BasicInfo from '../components/verification-tabs/BasicInfo'
import EmploymentDetails from '../components/verification-tabs/EmploymentDetails'
import EducationalQualifications from '../components/verification-tabs/EducationalQualifications'
import PaymentSalaryRecord from '../components/verification-tabs/PaymentSalaryRecord'
import IdentificationsBiometrics from '../components/verification-tabs/IdentificationsBiometrics'
import Documents from '../components/verification-tabs/Documents'
import NewEmployeeDocuments from '../components/verification-tabs/NewEmployeeDocuments'
// import MedicalInfo from '../components/verification-tabs/MedicalInfo'
// import BankInfo from '../components/verification-tabs/BankInfo'
// import EducationInfo from '../components/verification-tabs/EducationInfo'

interface Employee {
  id: string
  ippsId: string
  name: string
  email: string
  department: string
}

export default function AddVerification() {
  const router = useRouter()
  const [ippsId, setIppsId] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [exceptionData, setExceptionData] = useState({
    ippsId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    department: '',
  })
  const [activeTab, setActiveTab] = useState('basic')
  const [verificationData, setVerificationData] = useState({
    basic: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: '',
      stateOfOrigin: '',
      lga: '',
      phoneNumber: '',
      email: '',
      residentialAddress: '',
      nextOfKin: '',
      nextOfKinRelationship: '',
      profilePic: '',
    },
    employment: {
      dateOfFirstAppointment: '',
      currentAppointment: '',
      designation: '',
      gradeLevel: '',
      grade: '',
      mda: '',
      cdre: '',
      dateOfConfirmation: '',
      expectedRetirementDate: '',
      dateOfLastPromotion: '',
    },
    educational: {
      highestQualification: '',
      institutionAttended: '',
      yearOfGraduation: '',
      professionalCertifications: '',
      trainingAttended: '',
    },
    payment: {
      salaryStructure: '',
      basicSalary: '',
      allowances: '',
      deductions: '',
      netPay: '',
      accountNumber: '',
      bvn: '',
      pfaName: '',
      rsaPin: '',
      nhisNumber: '',
    },
    identifications: {
      bvn: '',
      passportPhotograph: '',
      fingerprints: '',
      digitalSignatures: '',
    },
    documents: {},
    newDocuments: {},
    medical: {
      bloodType: '',
      allergies: '',
      emergencyContact: '',
      medicalHistory: '',
    },
    bank: {
      accountNumber: '',
      bankName: '',
      branch: '',
      ifscCode: '',
    },
    education: {
      degree: '',
      institution: '',
      yearOfPassing: '',
      grade: '',
    },
  })

  const [issues, setIssues] = useState<{
    [key: string]: { [field: string]: string[] }
  }>({})
  const [showIssueSelect, setShowIssueSelect] = useState<{
    [key: string]: { [field: string]: boolean }
  }>({})

  const possibleIssues = [
    'Name not match',
    'Invalid DOB certificate',
    'No valid ID provided',
    'Address mismatch',
    'Phone number incorrect',
    'Medical records incomplete',
    'Bank details unverified',
    'Education certificates missing',
  ]

  const tabs = [
    { key: 'basic', label: 'Basic Information' },
    { key: 'employment', label: 'Employment Details' },
    { key: 'educational', label: 'Educational Qualifications' },
    { key: 'payment', label: 'Payment/Salary Record' },
    { key: 'identifications', label: 'Identifications/Biometrics' },
    { key: 'documents', label: 'Documents' },
    { key: 'newDocuments', label: 'New Employee Documents' },
    // { key: 'medical', label: 'Medical Information' },
    // { key: 'bank', label: 'Bank Information' },
    // { key: 'education', label: 'Education Records' },
  ]
  // Sample employees for local UI testing and prepopulation
  const SAMPLE_EMPLOYEES = {
    '12345': {
      meta: {
        id: '1',
        ippsId: '12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'IT',
      },
      basic: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1988-05-14',
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'Nigerian',
        stateOfOrigin: 'Lagos',
        lga: 'Ikeja',
        phoneNumber: '08030000000',
        email: 'john.doe@example.com',
        residentialAddress: '12 Adewale St, Ikeja',
        nextOfKin: 'Jane Doe',
        nextOfKinRelationship: 'Sister',
        profilePic: '',
      },
      employment: {
        dateOfFirstAppointment: '2012-01-10',
        currentAppointment: 'Senior Developer',
        designation: 'Software Engineer',
        gradeLevel: '12',
        grade: 'Step 3',
        mda: 'IT Services',
        cdre: 'CDRE-123',
        dateOfConfirmation: '2014-03-01',
        expectedRetirementDate: '2048-05-14',
        dateOfLastPromotion: '2022-08-01',
      },
      educational: {
        highestQualification: 'B.Sc Computer Science',
        institutionAttended: 'UNILAG',
        yearOfGraduation: '2010',
        professionalCertifications: 'PMP, AWS SAA',
        trainingAttended: 'Secure Coding',
      },
      payment: {
        salaryStructure: 'CONIT',
        basicSalary: '350000',
        allowances: '150000',
        deductions: '50000',
        netPay: '450000',
        accountNumber: '0123456789',
        bvn: '12345678901',
        pfaName: 'ARM Pensions',
        rsaPin: 'PEN123456',
        nhisNumber: 'NHIS123456',
      },
      identifications: {
        bvn: '12345678901',
        passportPhotograph: '',
        fingerprints: '',
        digitalSignatures: '',
      },
      documents: {},
      newDocuments: {},
      medical: {
        bloodType: 'O+',
        allergies: 'None',
        emergencyContact: 'Jane Doe',
        medicalHistory: 'N/A',
      },
      bank: {
        accountNumber: '0123456789',
        bankName: 'GTBank',
        branch: 'Ikeja',
        ifscCode: '',
      },
      education: {
        degree: 'B.Sc',
        institution: 'UNILAG',
        yearOfPassing: '2010',
        grade: 'First Class',
      },
    },
    '67890': {
      meta: {
        id: '2',
        ippsId: '67890',
        name: 'Mary Johnson',
        email: 'mary.johnson@example.com',
        department: 'Finance',
      },
      basic: {
        firstName: 'Mary',
        lastName: 'Johnson',
        dateOfBirth: '1990-09-21',
        gender: 'Female',
        maritalStatus: 'Married',
        nationality: 'Nigerian',
        stateOfOrigin: 'Oyo',
        lga: 'Ibadan North',
        phoneNumber: '08030000001',
        email: 'mary.johnson@example.com',
        residentialAddress: '3 Ring Road, Ibadan',
        nextOfKin: 'Paul Johnson',
        nextOfKinRelationship: 'Husband',
        profilePic: '',
      },
      employment: {
        dateOfFirstAppointment: '2015-06-01',
        currentAppointment: 'Accountant',
        designation: 'Senior Accountant',
        gradeLevel: '10',
        grade: 'Step 2',
        mda: 'Finance Dept',
        cdre: 'CDRE-456',
        dateOfConfirmation: '2017-01-01',
        expectedRetirementDate: '2055-09-21',
        dateOfLastPromotion: '2021-05-15',
      },
      educational: {
        highestQualification: 'M.Sc Accounting',
        institutionAttended: 'UI',
        yearOfGraduation: '2014',
        professionalCertifications: 'ICAN',
        trainingAttended: 'IFRS',
      },
      payment: {
        salaryStructure: 'CONF',
        basicSalary: '300000',
        allowances: '120000',
        deductions: '40000',
        netPay: '380000',
        accountNumber: '0123456790',
        bvn: '10987654321',
        pfaName: 'Stanbic Pensions',
        rsaPin: 'PEN654321',
        nhisNumber: 'NHIS654321',
      },
      identifications: {
        bvn: '10987654321',
        passportPhotograph: '',
        fingerprints: '',
        digitalSignatures: '',
      },
      documents: {},
      newDocuments: {},
      medical: {
        bloodType: 'A-',
        allergies: 'Penicillin',
        emergencyContact: 'Paul Johnson',
        medicalHistory: 'Asthma',
      },
      bank: {
        accountNumber: '0123456790',
        bankName: 'Access Bank',
        branch: 'Bodija',
        ifscCode: '',
      },
      education: {
        degree: 'M.Sc',
        institution: 'UI',
        yearOfPassing: '2014',
        grade: 'Distinction',
      },
    },
  } as const

  // duplicate SAMPLE_EMPLOYEES removed

  const handleCheck = async () => {
    if (!ippsId.trim()) return
    setLoading(true)
    setError('')
    try {
      // Use local samples first for quick UI testing
      const hasSample = Object.prototype.hasOwnProperty.call(
        SAMPLE_EMPLOYEES,
        ippsId
      )
      if (hasSample) {
        const sample = SAMPLE_EMPLOYEES[ippsId as keyof typeof SAMPLE_EMPLOYEES]
        const empName =
          sample.meta?.name ??
          `${sample.basic?.firstName ?? ''} ${
            sample.basic?.lastName ?? ''
          }`.trim()
        const empEmail = sample.meta?.email ?? sample.basic?.email ?? ''
        const emp: Employee = {
          id: sample.meta?.id ?? `sample-${ippsId}`,
          ippsId,
          name: empName,
          email: empEmail,
          department: sample.meta?.department ?? sample.employment?.mda ?? '',
        }
        setEmployee(emp)
        setVerificationData((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            ...(sample.basic ?? {}),
            profilePic:
              sample.basic?.profilePic && sample.basic.profilePic !== ''
                ? sample.basic.profilePic
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${empEmail}`,
          },
          employment: { ...prev.employment, ...(sample.employment ?? {}) },
          educational: { ...prev.educational, ...(sample.educational ?? {}) },
          payment: { ...prev.payment, ...(sample.payment ?? {}) },
          identifications: {
            ...prev.identifications,
            ...(sample.identifications ?? {}),
          },
          documents: { ...prev.documents, ...(sample.documents ?? {}) },
          newDocuments: {
            ...prev.newDocuments,
            ...(sample.newDocuments ?? {}),
          },
          medical: { ...prev.medical, ...(sample.medical ?? {}) },
          bank: { ...prev.bank, ...(sample.bank ?? {}) },
          education: { ...prev.education, ...(sample.education ?? {}) },
        }))
      } else {
        // Fallback to PocketBase lookup
        const response = await api.get(
          `/collections/employees/records?filter=ippsId='${ippsId}'`
        )
        if (response.data.items.length > 0) {
          const emp = response.data.items[0]
          setEmployee(emp)
          const [firstName = '', ...rest] = (emp.name || '').split(' ')
          const lastName = rest.join(' ')
          setVerificationData((prev) => ({
            ...prev,
            basic: {
              ...prev.basic,
              firstName,
              lastName,
              email: emp.email,
              profilePic:
                emp.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`,
            },
          }))
        } else {
          setError('Employee not found. You can add an exception.')
        }
      }
    } catch {
      setError('Failed to check employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddException = async () => {
    // Simulate adding exception
    alert('Exception added successfully!')
    setShowDrawer(false)
    setExceptionData({
      ippsId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      department: '',
    })
  }

  const handleVerificationSubmit = async () => {
    // eslint-disable-next-line no-console
    console.log('Verification payload:', {
      ippsId,
      employee,
      verificationData,
      issues,
      submittedAt: new Date().toISOString(),
    })
    setEmployee(null)
    alert('Verification submitted successfully!')

    //router.push('/dashboard')
  }

  // const handleNext = () => {
  //   const tabs = [
  //     'basic',
  //     'employment',
  //     'educational',
  //     'medical',
  //     'bank',
  //     'education',
  //   ]
  //   const currentIndex = tabs.indexOf(activeTab)
  //   if (currentIndex < tabs.length - 1) {
  //     setActiveTab(tabs[currentIndex + 1])
  //   } else {
  //     handleVerificationSubmit()
  //   }
  // }

  const renderForm = () => {
    const tabs = [
      { key: 'basic', label: 'Basic Information' },
      { key: 'employment', label: 'Employment Details' },
      { key: 'educational', label: 'Educational Qualifications' },
      { key: 'payment', label: 'Payment/Salary Record' },
      { key: 'identifications', label: 'Identifications/Biometrics' },
      { key: 'documents', label: 'Documents' },
      { key: 'newDocuments', label: 'New Employee Documents' },
      { key: 'medical', label: 'Medical Information' },
      { key: 'bank', label: 'Bank Information' },
      { key: 'education', label: 'Education Records' },
    ]

    const currentData =
      verificationData[activeTab as keyof typeof verificationData]

    const currentTabIndex = tabs.findIndex((tab) => tab.key === activeTab)
    const isLastTab = currentTabIndex === tabs.length - 1

    const handleNext = () => {
      if (isLastTab) {
        handleVerificationSubmit()
      } else {
        setActiveTab(tabs[currentTabIndex + 1].key)
      }
    }

    return (
      <div className='flex'>
        {/* Vertical Tabs */}
        <div className='w-1/4 pr-4'>
          <div className='space-y-2'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab.key
                    ? 'bg-primaryy text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className='w-3/4'>
          {activeTab === 'basic' && verificationData.basic.profilePic && (
            <div className='text-center mb-6'>
              <img
                src={verificationData.basic.profilePic}
                alt='Profile'
                className='w-40 h-40 rounded-full mx-auto bg-black/60'
              />
            </div>
          )}
          <div className='space-y-4'>
            {Object.keys(currentData).map((field) => (
              <div key={field}>
                <label className='block text-sm font-medium text-gray-700 mb-1 capitalize'>
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {field === 'profilePic' ? (
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) =>
                      setVerificationData({
                        ...verificationData,
                        [activeTab]: {
                          ...currentData,
                          [field]: e.target.files?.[0]?.name || '',
                        },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  />
                ) : (
                  <input
                    type={
                      field.includes('email')
                        ? 'email'
                        : field.includes('phone')
                        ? 'tel'
                        : 'text'
                    }
                    value={(currentData as Record<string, string>)[field] ?? ''}
                    onChange={(e) =>
                      setVerificationData({
                        ...verificationData,
                        [activeTab]: {
                          ...currentData,
                          [field]: e.target.value,
                        },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                    placeholder={`Enter ${field
                      .replace(/([A-Z])/g, ' $1')
                      .trim()}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-6'>
            <button
              onClick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.key === activeTab
                )
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].key)
                }
              }}
              disabled={tabs.findIndex((tab) => tab.key === activeTab) === 0}
              className='px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className='px-6 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
            >
              {isLastTab ? 'Submit Verification' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className='mb-6 flex items-center text-primaryy hover:text-primaryx'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Main Content */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Add Verification
            </h1>
            {employee && (
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab)
                    if (idx > 0) setActiveTab(tabs[idx - 1].key)
                  }}
                  disabled={tabs.findIndex((t) => t.key === activeTab) === 0}
                  className='px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab)
                    if (idx === tabs.length - 1) {
                      handleVerificationSubmit()
                    } else {
                      setActiveTab(tabs[idx + 1].key)
                    }
                  }}
                  className='px-6 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
                >
                  {activeTab === tabs[tabs.length - 1].key
                    ? 'Submit Verification'
                    : 'Next'}
                </button>
              </div>
            )}
          </div>

          {/* IPPS ID Input */}
          {!employee && (
            <div className='mb-6'>
              <label
                htmlFor='ippsId'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Employee IPPS ID
              </label>
              <div className='flex space-x-4'>
                <input
                  type='text'
                  id='ippsId'
                  value={ippsId}
                  onChange={(e) => setIppsId(e.target.value)}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  placeholder='Enter IPPS ID'
                />
                <button
                  onClick={handleCheck}
                  disabled={loading}
                  className='px-6 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx disabled:opacity-50'
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              type='error'
              message={error}
              onClose={() => setError('')}
              autoClose={false}
            />
          )}

          {/* Employee Details */}
          {employee && (
            <div className='flex'>
              {/* Vertical Tabs */}
              <div className='w-1/4 pr-4'>
                <div className='space-y-2'>
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                        activeTab === tab.key
                          ? 'bg-primaryy text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Component Content */}
              <div className='w-3/4'>
                {activeTab === 'basic' && (
                  <BasicInfo
                    data={verificationData.basic}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        basic: { ...verificationData.basic, [field]: value },
                      })
                    }
                    issues={issues.basic || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, basic: newIssues })
                    }
                    showIssueSelect={showIssueSelect.basic || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({ ...showIssueSelect, basic: newShow })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'employment' && (
                  <EmploymentDetails
                    data={verificationData.employment}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        employment: {
                          ...verificationData.employment,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.employment || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, employment: newIssues })
                    }
                    showIssueSelect={showIssueSelect.employment || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        employment: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'educational' && (
                  <EducationalQualifications
                    data={verificationData.educational}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        educational: {
                          ...verificationData.educational,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.educational || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, educational: newIssues })
                    }
                    showIssueSelect={showIssueSelect.educational || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        educational: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'payment' && (
                  <PaymentSalaryRecord
                    data={verificationData.payment}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        payment: {
                          ...verificationData.payment,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.payment || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, payment: newIssues })
                    }
                    showIssueSelect={showIssueSelect.payment || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        payment: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'identifications' && (
                  <IdentificationsBiometrics
                    data={verificationData.identifications}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        identifications: {
                          ...verificationData.identifications,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.identifications || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, identifications: newIssues })
                    }
                    showIssueSelect={showIssueSelect.identifications || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        identifications: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'documents' && (
                  <Documents
                    data={verificationData.documents}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        documents: {
                          ...verificationData.documents,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.documents || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, documents: newIssues })
                    }
                    showIssueSelect={showIssueSelect.documents || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        documents: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {activeTab === 'newDocuments' && (
                  <NewEmployeeDocuments
                    data={verificationData.newDocuments}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        newDocuments: {
                          ...verificationData.newDocuments,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.newDocuments || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, newDocuments: newIssues })
                    }
                    showIssueSelect={showIssueSelect.newDocuments || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        newDocuments: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                  />
                )}
                {/* {activeTab === 'medical' && (
                  <MedicalInfo
                    data={verificationData.medical}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        medical: {
                          ...verificationData.medical,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.medical || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, medical: newIssues })
                    }
                    showIssueSelect={showIssueSelect.medical || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        medical: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                    onNext={handleNext}
                  />
                )}
                {activeTab === 'bank' && (
                  <BankInfo
                    data={verificationData.bank}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        bank: { ...verificationData.bank, [field]: value },
                      })
                    }
                    issues={issues.bank || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, bank: newIssues })
                    }
                    showIssueSelect={showIssueSelect.bank || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({ ...showIssueSelect, bank: newShow })
                    }
                    possibleIssues={possibleIssues}
                    onNext={handleNext}
                  />
                )}
                {activeTab === 'education' && (
                  <EducationInfo
                    data={verificationData.education}
                    onChange={(field, value) =>
                      setVerificationData({
                        ...verificationData,
                        education: {
                          ...verificationData.education,
                          [field]: value,
                        },
                      })
                    }
                    issues={issues.education || {}}
                    setIssues={(newIssues) =>
                      setIssues({ ...issues, education: newIssues })
                    }
                    showIssueSelect={showIssueSelect.education || {}}
                    setShowIssueSelect={(newShow) =>
                      setShowIssueSelect({
                        ...showIssueSelect,
                        education: newShow,
                      })
                    }
                    possibleIssues={possibleIssues}
                    onNext={handleNext}
                  />
                )} */}
              </div>
            </div>
          )}

          {/* Add Exception Button */}
          {error && !employee && (
            <button
              onClick={() => setShowDrawer(true)}
              className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Add Exception
            </button>
          )}
        </div>
      </div>

      {/* Exception Drawer */}
      {showDrawer && (
        <div className='fixed inset-0 z-50 flex'>
          <div
            className='absolute inset-0 bg-black/40 bg-opacity-25'
            onClick={() => setShowDrawer(false)}
          ></div>
          <div className='relative ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300'>
            <div className='p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Add Exception
              </h2>
              <input
                type='text'
                placeholder='IPPS ID'
                value={exceptionData.ippsId}
                onChange={(e) =>
                  setExceptionData({
                    ...exceptionData,
                    ippsId: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
              />
              <div className='space-y-4 flex flex-row flex-wrap gap-4'>
                <div>
                  <input
                    type='text'
                    placeholder='First Name'
                    value={exceptionData.firstName}
                    onChange={(e) =>
                      setExceptionData({
                        ...exceptionData,
                        firstName: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  />
                  <input
                    type='text'
                    placeholder='Last Name'
                    value={exceptionData.lastName}
                    onChange={(e) =>
                      setExceptionData({
                        ...exceptionData,
                        lastName: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  />
                </div>

                <input
                  type='date'
                  placeholder='Date of Birth'
                  value={exceptionData.dateOfBirth}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
                <input
                  type='text'
                  placeholder='Department'
                  value={exceptionData.department}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      department: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
              </div>
              <div className='flex space-x-4 mt-6'>
                <button
                  onClick={handleAddException}
                  className='flex-1 px-4 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
                >
                  Add Exception
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
