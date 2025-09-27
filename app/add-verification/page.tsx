'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Alert from '../components/Alert'
import api from '../components/Serverurls'
import BasicInfo from '../components/verification-tabs/BasicInfo'
import EmploymentDetails from '../components/verification-tabs/EmploymentDetails'
import EducationalQualifications from '../components/verification-tabs/EducationalQualifications'
import PaymentSalaryRecord from '../components/verification-tabs/PaymentSalaryRecord'
import IdentificationsBiometrics from '../components/verification-tabs/IdentificationsBiometrics'
import Documents from '../components/verification-tabs/Documents'
import NewEmployeeDocuments from '../components/verification-tabs/NewEmployeeDocuments'
import Biometrics from '../components/biometrics/page'
import pb from '@/lib/pb'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Close from '@mui/icons-material/Close'
import { Face, FaceOutlined } from '@mui/icons-material'
import Logo1m from '../images/logo-me.png'
import Image from 'next/image'
// import MedicalInfo from '../components/verification-tabs/MedicalInfo'
// import BankInfo from '../components/verification-tabs/BankInfo'
// import EducationInfo from '../components/verification-tabs/EducationInfo'

interface Employee {
  id: string
  ippsId: string
  name: string
  email: string
  department: string
  lastName: string
  dateOfBirth: string
}

interface OrgDep {
  id: string
  name: string
}

export default function AddVerification() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ippsId, setIppsId] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [organisations, setOrganisations] = useState<OrgDep[]>([])
  const [departments, setDepartments] = useState<OrgDep[]>([])
  const [tags, setTags] = useState<OrgDep[]>([])
  const [exceptionData, setExceptionData] = useState({
    ippsId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    department: '',
    organisation: '',
    tags: [] as string[],
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [biometricStep, setBiometricStep] = useState<
    'facial' | 'surname' | 'dob'
  >('facial')
  const [skipIppsInput, setSkipIppsInput] = useState(false)
  const [hasHandledIppsId, setHasHandledIppsId] = useState(false)
  const [biometricResults, setBiometricResults] = useState({
    facial: '',
    surname: '',
    dob: '',
  })
  const [surnameInput, setSurnameInput] = useState('')
  const [surnameResult, setSurnameResult] = useState('')
  const [dobInput, setDobInput] = useState('')
  const [dobResult, setDobResult] = useState('')
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
      photo: '',
    },
    employment: {
      dateOfFirstAppointment: '',
      organisation: '',
      refId: '',
      currentAppointment: '',
      jobLocation: '',
      jobTitle: '',
      position: '',
      taxState: '',
      designation: '',
      gradeLevel: '',
      stepSum18: '',
      grade: '',
      mda: '',
      cdre: '',
      dateOfConfirmation: '',
      dateOfHire: '',
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
      educationInstitution: '',
      yearOfPassing: '',
      finalGrade: '',
    },
  })

  const [issues, setIssues] = useState<{
    [key: string]: { [field: string]: string[] }
  }>({})
  const [showIssueSelect, setShowIssueSelect] = useState<{
    [key: string]: { [field: string]: boolean }
  }>({})
  const [verify, setVerify] = useState<{
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
    { key: 'identifications', label: 'Biometrics' },
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

  useEffect(() => {
    const ippsIdParam = searchParams.get('ippsId')
    if (!hasHandledIppsId && ippsIdParam && !employee) {
      setHasHandledIppsId(true)
      setIppsId(ippsIdParam)
      setSkipIppsInput(true)
      // Trigger handleCheck after setting ippsId
      handleCheck(ippsIdParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchOrgDepTags = async () => {
      try {
        const orgs = await pb.collection('organisation').getFullList()
        setOrganisations(orgs as unknown as OrgDep[])
      } catch (error) {
        console.error('Failed to fetch organisations:', error)
      }
      try {
        const deps = await pb.collection('department').getFullList()
        setDepartments(deps as unknown as OrgDep[])
      } catch (error) {
        console.error('Failed to fetch departments:', error)
      }
      try {
        const tagList = await pb.collection('tags').getFullList()
        setTags(tagList as unknown as OrgDep[])
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchOrgDepTags()
  }, [])

  // const handleCheck = async (ippsParams = null) => {
  //   if (!ippsParams && !ippsId.trim()) return

  //   setLoading(true)
  //   setError('')
  //   let employees
  //   try {
  //     if (ippsParams) {
  //       employees = await pb.collection('employees').getFullList({
  //         filter: `ippsId = "${ippsParams}"`,
  //       })
  //     } else {
  //       employees = await pb.collection('employees').getFullList({
  //         filter: `ippsId = "${ippsId}"`,
  //       })
  //     }

  //     console.log(employees, ippsId, ippsParams)

  //     if (employees.length > 0) {
  //       const emp = employees[0]
  //       console.log('emp', emp)
  //       const empData: Employee = {
  //         id: emp.id,
  //         ippsId: emp.ippsId,
  //         name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
  //         email: emp.email || '',
  //         department: emp.mda || '',
  //         lastName: emp.lastName || '',
  //         dateOfBirth: emp.dob || '',
  //       }
  //       setEmployee(empData)

  //       let ippsId

  //       if (ippsId) {
  //         ippsId = ippsId
  //       } else {
  //         ippsId = ippsParams
  //       }

  //       // Check for existing incomplete verification
  //       const existingVerifications = await pb
  //         .collection('verifications')
  //         .getFullList({
  //           filter: `ippsId = "${ippsId}"`,
  //         })
  //       const existing = existingVerifications.find(
  //         (v) => v.status === 'pending'
  //       )
  //       if (existing) {
  //         // Load existing data
  //         setVerificationData(
  //           existing.rawVerificationData || {
  //             basic: {
  //               firstName: emp.firstName || '',
  //               lastName: (emp.lastName || '').trim(),
  //               dateOfBirth: emp.dob || '',
  //               gender: emp.gender || '',
  //               maritalStatus: emp.maritalStatus || '',
  //               nationality: emp.nationality || '',
  //               stateOfOrigin: emp.state_of_origin || '',
  //               lga: emp.lga || '',
  //               phoneNumber: emp.phone || '',
  //               email: emp.email || '',
  //               residentialAddress: emp.residentialAddress || '',
  //               nextOfKin: emp.nextOfKin || '',
  //               nextOfKinRelationship: emp.nextOfKinRelationship || '',
  //               profilePic:
  //                 emp.profilePic ||
  //                 `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`,
  //               photo: emp.photo || '',
  //             },
  //             employment: {
  //               dateOfFirstAppointment: emp.dateOfFirstAppointment || '',
  //               organisation: emp.organisation || '',
  //               refId: emp.ref_id || '',
  //               currentAppointment: emp.currentAppointment || '',
  //               jobLocation: emp.joblocation || '',
  //               jobTitle: emp.jobtitle || '',
  //               position: emp.position || '',
  //               taxState: emp.taxstate || '',
  //               designation: emp.designation || '',
  //               gradeLevel: emp.gradeLevel || '',
  //               stepSum18: emp.sum_step18 || '',
  //               grade: emp.grade || '',
  //               mda: emp.mda || '',
  //               cdre: emp.cdre || '',
  //               dateOfConfirmation: emp.confirmationDate || '',
  //               dateOfHire: emp.hireDate || '',
  //               expectedRetirementDate: emp.expectedRetirementDate || '',
  //               dateOfLastPromotion: emp.dateOfLastPromotion || '',
  //             },
  //             educational: {
  //               highestQualification: emp.highestQualification || '',
  //               institutionAttended: emp.institutionAttended || '',
  //               yearOfGraduation: emp.yearOfGraduation || '',
  //               professionalCertifications:
  //                 emp.professionalCertifications || '',
  //               trainingAttended: emp.trainingAttended || '',
  //             },
  //             payment: {
  //               salaryStructure: emp.salaryStructure || '',
  //               basicSalary: emp.basicSalary || '',
  //               allowances: emp.allowances || '',
  //               deductions: emp.deductions || '',
  //               netPay: emp.netPay || '',
  //               accountNumber: emp.accountNumber || '',
  //               bvn: emp.bvn || '',
  //               pfaName: emp.pfaName || '',
  //               rsaPin: emp.rsaPin || '',
  //               nhisNumber: emp.nhisNumber || '',
  //             },
  //             identifications: {
  //               bvn: emp.bvn || '',
  //               passportPhotograph: emp.passportPhotograph || '',
  //               fingerprints: emp.fingerprints || '',
  //               digitalSignatures: emp.digitalSignatures || '',
  //             },
  //             documents: emp.documents || {},
  //             newDocuments: emp.newDocuments || {},
  //             medical: {
  //               bloodType: emp.bloodType || '',
  //               allergies: emp.allergies || '',
  //               emergencyContact: emp.emergencyContact || '',
  //               medicalHistory: emp.medicalHistory || '',
  //             },
  //             bank: {
  //               accountNumber: emp.accountNumber || '',
  //               bankName: emp.bankName || '',
  //               branch: emp.branch || '',
  //               ifscCode: emp.ifscCode || '',
  //             },
  //             education: {
  //               degree: emp.degree || '',
  //               educationInstitution: emp.educationInstitution || '',
  //               yearOfPassing: emp.yearOfPassing || '',
  //               finalGrade: emp.finalGrade || '',
  //             },
  //           }
  //         )
  //         setIssues(existing.issues || {})
  //         setVerify(existing.verify || {})
  //         setActiveTab(existing.lastTab || 'basic')
  //         setBiometricVerified(true)
  //         setBiometricStep(existing.biometricStep || 'facial')
  //         setBiometricResults(
  //           existing.biometricResults || {
  //             facial: '',
  //             surname: '',
  //             dob: '',
  //           }
  //         )
  //         setSurnameInput(existing.surnameInput || '')
  //         setSurnameResult(existing.surnameResult || '')
  //         setDobInput(existing.dobInput || '')
  //         setDobResult(existing.dobResult || '')
  //       } else {
  //         // New verification, load employee data
  //         setVerificationData({
  //           basic: {
  //             firstName: emp.firstName || '',
  //             lastName: (emp.lastName || '').trim(),
  //             dateOfBirth: emp.dob || '',
  //             gender: emp.gender || '',
  //             maritalStatus: emp.maritalStatus || '',
  //             nationality: emp.nationality || '',
  //             stateOfOrigin: emp.state_of_origin || '',
  //             lga: emp.lga || '',
  //             phoneNumber: emp.phone || '',
  //             email: emp.email || '',
  //             residentialAddress: emp.residentialAddress || '',
  //             nextOfKin: emp.nextOfKin || '',
  //             nextOfKinRelationship: emp.nextOfKinRelationship || '',
  //             profilePic:
  //               emp.profilePic ||
  //               `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`,
  //             photo: emp.photo || '',
  //           },
  //           employment: {
  //             dateOfFirstAppointment: emp.dateOfFirstAppointment || '',
  //             organisation: emp.organisation || '',
  //             refId: emp.ref_id || '',
  //             currentAppointment: emp.currentAppointment || '',
  //             jobLocation: emp.joblocation || '',
  //             jobTitle: emp.jobtitle || '',
  //             position: emp.position || '',
  //             taxState: emp.taxstate || '',
  //             designation: emp.designation || '',
  //             gradeLevel: emp.gradeLevel || '',
  //             stepSum18: emp.sum_step18 || '',
  //             grade: emp.grade || '',
  //             mda: emp.mda || '',
  //             cdre: emp.cdre || '',
  //             dateOfConfirmation: emp.confirmationDate || '',
  //             dateOfHire: emp.hireDate || '',
  //             expectedRetirementDate: emp.expectedRetirementDate || '',
  //             dateOfLastPromotion: emp.dateOfLastPromotion || '',
  //           },
  //           educational: {
  //             highestQualification: emp.highestQualification || '',
  //             institutionAttended: emp.institutionAttended || '',
  //             yearOfGraduation: emp.yearOfGraduation || '',
  //             professionalCertifications: emp.professionalCertifications || '',
  //             trainingAttended: emp.trainingAttended || '',
  //           },
  //           payment: {
  //             salaryStructure: emp.salaryStructure || '',
  //             basicSalary: emp.basicSalary || '',
  //             allowances: emp.allowances || '',
  //             deductions: emp.deductions || '',
  //             netPay: emp.netPay || '',
  //             accountNumber: emp.accountNumber || '',
  //             bvn: emp.bvn || '',
  //             pfaName: emp.pfaName || '',
  //             rsaPin: emp.rsaPin || '',
  //             nhisNumber: emp.nhisNumber || '',
  //           },
  //           identifications: {
  //             bvn: emp.bvn || '',
  //             passportPhotograph: emp.passportPhotograph || '',
  //             fingerprints: emp.fingerprints || '',
  //             digitalSignatures: emp.digitalSignatures || '',
  //           },
  //           documents: emp.documents || {},
  //           newDocuments: emp.newDocuments || {},
  //           medical: {
  //             bloodType: emp.bloodType || '',
  //             allergies: emp.allergies || '',
  //             emergencyContact: emp.emergencyContact || '',
  //             medicalHistory: emp.medicalHistory || '',
  //           },
  //           bank: {
  //             accountNumber: emp.accountNumber || '',
  //             bankName: emp.bankName || '',
  //             branch: emp.branch || '',
  //             ifscCode: emp.ifscCode || '',
  //           },
  //           education: {
  //             degree: emp.degree || '',
  //             educationInstitution: emp.educationInstitution || '',
  //             yearOfPassing: emp.yearOfPassing || '',
  //             finalGrade: emp.finalGrade || '',
  //           },
  //         })
  //         setBiometricVerified(false)
  //       }
  //     } else {
  //       setError('Employee not found. You can add an exception.')
  //       setSkipIppsInput(false)
  //     }
  //   } catch (err) {
  //     console.error('Failed to check employee:', err)
  //     setError('Failed to check employee. Please try again.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleCheck = async (ippsParams: string | null = null) => {
    // choose the ippsId to use
    const idToCheck = ippsParams || ippsId?.trim()
    if (!idToCheck) return

    setLoading(true)
    setError('')
    try {
      // get employee by ippsId
      const employees = await pb.collection('employees').getFullList({
        filter: `ippsId = "${idToCheck}"`,
      })

      console.log(employees, ippsId, ippsParams)

      if (employees.length > 0) {
        const emp = employees[0]
        console.log('emp', emp)

        // Check for existing verifications first
        const existingVerifications = await pb
          .collection('verifications')
          .getFullList({
            filter: `ippsId = "${idToCheck}"`,
          })

        // Check if already completed
        const completedVerification = existingVerifications.find(
          (v) => v.status === 'complete'
        )

        if (completedVerification) {
          setError('This IPPS ID has already been verified and completed.')
          setSkipIppsInput(false)
          setLoading(false)
          return
        }

        const empData: Employee = {
          id: emp.id,
          ippsId: emp.ippsId,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          email: emp.email || '',
          department: emp.mda || '',
          lastName: emp.lastName || '',
          dateOfBirth: emp.dob || '',
        }
        setEmployee(empData)

        const existing = existingVerifications.find(
          (v) => v.status === 'pending'
        )

        if (existing) {
          // Load existing data
          setVerificationData(
            existing.rawVerificationData || {
              basic: {
                firstName: emp.firstName || '',
                lastName: (emp.lastName || '').trim(),
                dateOfBirth: emp.dob || '',
                gender: emp.gender || '',
                maritalStatus: emp.maritalStatus || '',
                nationality: emp.nationality || '',
                stateOfOrigin: emp.state_of_origin || '',
                lga: emp.lga || '',
                phoneNumber: emp.phone || '',
                email: emp.email || '',
                residentialAddress: emp.residentialAddress || '',
                nextOfKin: emp.nextOfKin || '',
                nextOfKinRelationship: emp.nextOfKinRelationship || '',
                profilePic:
                  emp.profilePic ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`,
                photo: emp.photo || '',
              },
              employment: {
                dateOfFirstAppointment: emp.dateOfFirstAppointment || '',
                organisation: emp.organisation || '',
                refId: emp.ref_id || '',
                currentAppointment: emp.currentAppointment || '',
                jobLocation: emp.joblocation || '',
                jobTitle: emp.jobtitle || '',
                position: emp.position || '',
                taxState: emp.taxstate || '',
                designation: emp.designation || '',
                gradeLevel: emp.gradeLevel || '',
                stepSum18: emp.sum_step18 || '',
                grade: emp.grade || '',
                mda: emp.mda || '',
                cdre: emp.cdre || '',
                dateOfConfirmation: emp.confirmationDate || '',
                dateOfHire: emp.hireDate || '',
                expectedRetirementDate: emp.expectedRetirementDate || '',
                dateOfLastPromotion: emp.dateOfLastPromotion || '',
              },
              educational: {
                highestQualification: emp.highestQualification || '',
                institutionAttended: emp.institutionAttended || '',
                yearOfGraduation: emp.yearOfGraduation || '',
                professionalCertifications:
                  emp.professionalCertifications || '',
                trainingAttended: emp.trainingAttended || '',
              },
              payment: {
                salaryStructure: emp.salaryStructure || '',
                basicSalary: emp.basicSalary || '',
                allowances: emp.allowances || '',
                deductions: emp.deductions || '',
                netPay: emp.netPay || '',
                accountNumber: emp.accountNumber || '',
                bvn: emp.bvn || '',
                pfaName: emp.pfaName || '',
                rsaPin: emp.rsaPin || '',
                nhisNumber: emp.nhisNumber || '',
              },
              identifications: {
                bvn: emp.bvn || '',
                passportPhotograph: emp.passportPhotograph || '',
                fingerprints: emp.fingerprints || '',
                digitalSignatures: emp.digitalSignatures || '',
              },
              documents: emp.documents || {},
              newDocuments: emp.newDocuments || {},
              medical: {
                bloodType: emp.bloodType || '',
                allergies: emp.allergies || '',
                emergencyContact: emp.emergencyContact || '',
                medicalHistory: emp.medicalHistory || '',
              },
              bank: {
                accountNumber: emp.accountNumber || '',
                bankName: emp.bankName || '',
                branch: emp.branch || '',
                ifscCode: emp.ifscCode || '',
              },
              education: {
                degree: emp.degree || '',
                educationInstitution: emp.educationInstitution || '',
                yearOfPassing: emp.yearOfPassing || '',
                finalGrade: emp.finalGrade || '',
              },
            }
          )
          setIssues(existing.issues || {})
          setVerify(existing.verify || {})
          setActiveTab(existing.lastTab || 'basic')
          setBiometricVerified(false)
          setBiometricStep(existing.biometricStep || 'facial')
          setBiometricResults(
            existing.biometricResults || {
              facial: '',
              surname: '',
              dob: '',
            }
          )
          setSurnameInput(existing.surnameInput || '')
          setSurnameResult(existing.surnameResult || '')
          setDobInput(existing.dobInput || '')
          setDobResult(existing.dobResult || '')
        } else {
          // New verification, load employee data
          setVerificationData({
            basic: {
              firstName: emp.firstName || '',
              lastName: (emp.lastName || '').trim(),
              dateOfBirth: emp.dob || '',
              gender: emp.gender || '',
              maritalStatus: emp.maritalStatus || '',
              nationality: emp.nationality || '',
              stateOfOrigin: emp.state_of_origin || '',
              lga: emp.lga || '',
              phoneNumber: emp.phone || '',
              email: emp.email || '',
              residentialAddress: emp.residentialAddress || '',
              nextOfKin: emp.nextOfKin || '',
              nextOfKinRelationship: emp.nextOfKinRelationship || '',
              profilePic:
                emp.profilePic ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`,
              photo: emp.photo || '',
            },
            employment: {
              dateOfFirstAppointment: emp.dateOfFirstAppointment || '',
              organisation: emp.organisation || '',
              refId: emp.ref_id || '',
              currentAppointment: emp.currentAppointment || '',
              jobLocation: emp.joblocation || '',
              jobTitle: emp.jobtitle || '',
              position: emp.position || '',
              taxState: emp.taxstate || '',
              designation: emp.designation || '',
              gradeLevel: emp.gradeLevel || '',
              stepSum18: emp.sum_step18 || '',
              grade: emp.grade || '',
              mda: emp.mda || '',
              cdre: emp.cdre || '',
              dateOfConfirmation: emp.confirmationDate || '',
              dateOfHire: emp.hireDate || '',
              expectedRetirementDate: emp.expectedRetirementDate || '',
              dateOfLastPromotion: emp.dateOfLastPromotion || '',
            },
            educational: {
              highestQualification: emp.highestQualification || '',
              institutionAttended: emp.institutionAttended || '',
              yearOfGraduation: emp.yearOfGraduation || '',
              professionalCertifications: emp.professionalCertifications || '',
              trainingAttended: emp.trainingAttended || '',
            },
            payment: {
              salaryStructure: emp.salaryStructure || '',
              basicSalary: emp.basicSalary || '',
              allowances: emp.allowances || '',
              deductions: emp.deductions || '',
              netPay: emp.netPay || '',
              accountNumber: emp.accountNumber || '',
              bvn: emp.bvn || '',
              pfaName: emp.pfaName || '',
              rsaPin: emp.rsaPin || '',
              nhisNumber: emp.nhisNumber || '',
            },
            identifications: {
              bvn: emp.bvn || '',
              passportPhotograph: emp.passportPhotograph || '',
              fingerprints: emp.fingerprints || '',
              digitalSignatures: emp.digitalSignatures || '',
            },
            documents: emp.documents || {},
            newDocuments: emp.newDocuments || {},
            medical: {
              bloodType: emp.bloodType || '',
              allergies: emp.allergies || '',
              emergencyContact: emp.emergencyContact || '',
              medicalHistory: emp.medicalHistory || '',
            },
            bank: {
              accountNumber: emp.accountNumber || '',
              bankName: emp.bankName || '',
              branch: emp.branch || '',
              ifscCode: emp.ifscCode || '',
            },
            education: {
              degree: emp.degree || '',
              educationInstitution: emp.educationInstitution || '',
              yearOfPassing: emp.yearOfPassing || '',
              finalGrade: emp.finalGrade || '',
            },
          })
          setBiometricVerified(false)
        }
      } else {
        setError('Employee not found. You can add an exception.')
        setSkipIppsInput(false)
      }
    } catch (err) {
      console.error('Failed to check employee:', err)
      //setError('Failed to check employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddException = async () => {
    try {
      // Get current user ID
      const currentUserStr = localStorage.getItem('currentUser')
      let submittedBy = 'current_user'
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        console.log('currentUser', currentUser)
        const users = await pb.collection('users').getFullList({
          filter: `email = "${currentUser.email}"`,
        })
        console.log(users)
        if (users.length > 0) {
          submittedBy = users[0].user_id
        }
      }

      const payload = {
        firstName: exceptionData.firstName,
        lastName: exceptionData.lastName,
        dateOfBirth: exceptionData.dateOfBirth,
        email: exceptionData.email,
        phoneNumber: exceptionData.phoneNumber,
        department: exceptionData.department,
        organisation: exceptionData.organisation,
        tags: exceptionData.tags,
        submittedAt: new Date().toISOString(),
        submittedBy,
      }
      await pb.collection('exception_logs').create(payload)
      setSuccessMessage('Exception added successfully!')
      setTimeout(() => {
        setSuccessMessage('')
        setShowDrawer(false)
        setExceptionData({
          ippsId: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          email: '',
          phoneNumber: '',
          department: '',
          organisation: '',
          tags: [],
        })
        setSearchTerm('')
      }, 2500)
    } catch (error) {
      console.error('Failed to add exception:', error)
      setError('Failed to add exception. Please try again.')
    }
  }

  const handleVerificationSubmit = async () => {
    if (!employee || !ippsId) return

    try {
      // Transform data into the required format
      const transformedData = {
        'basic-info': transformTabData(
          'basic',
          verificationData.basic,
          issues.basic || {},
          verify.basic || {}
        ),
        'employment-details': transformTabData(
          'employment',
          verificationData.employment,
          issues.employment || {},
          verify.employment || {}
        ),
        'educational-qualifications': transformTabData(
          'educational',
          verificationData.educational,
          issues.educational || {},
          verify.educational || {}
        ),
        'payment-salary-record': transformTabData(
          'payment',
          verificationData.payment,
          issues.payment || {},
          verify.payment || {}
        ),
        'identifications-biometrics': transformTabData(
          'identifications',
          verificationData.identifications,
          issues.identifications || {},
          verify.identifications || {}
        ),
        documents: transformTabData(
          'documents',
          verificationData.documents,
          issues.documents || {},
          verify.documents || {}
        ),
        'new-documents': transformTabData(
          'newDocuments',
          verificationData.newDocuments,
          issues.newDocuments || {},
          verify.newDocuments || {}
        ),
      }

      // Get current user ID
      const currentUserStr = localStorage.getItem('currentUser')
      let submittedBy = 'current_user'
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        const users = await pb.collection('users').getFullList({
          filter: `email = "${currentUser.email}"`,
        })

        console.log('currentUser', users)
        if (users.length > 0) {
          submittedBy = users[0].user_id
        }
      }

      const payload = {
        ippsId,
        employeeRef: employee.id,
        verificationData: transformedData,
        rawVerificationData: verificationData,
        biometricResults,
        biometricVerified,
        biometricStep,
        surnameInput,
        surnameResult,
        dobInput,
        dobResult,
        issues,
        verify,
        lastTab: activeTab,
        status: 'complete', // Changed to complete
        cc_id: 1,
        submittedAt: new Date().toISOString(),
        submittedBy,
        verify_by: 1, // You might want to set this appropriately
      }

      // Check if verification already exists
      const existingVerifications = await pb
        .collection('verifications')
        .getFullList({
          filter: `ippsId = "${ippsId}"`,
        })

      if (existingVerifications.length > 0) {
        // Update existing
        await pb
          .collection('verifications')
          .update(existingVerifications[0].id, payload)
      } else {
        // Create new
        await pb.collection('verifications').create(payload)
      }

      alert('Verification completed successfully!')

      // Reset form and navigate to dashboard
      setEmployee(null)
      setIppsId('')
      setSkipIppsInput(false)
      setHasHandledIppsId(false)
      // Remove ippsId from URL if present
      if (searchParams.get('ippsId')) {
        router.replace('/add-verification')
      }
      setVerificationData({
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
          photo: '',
        },
        employment: {
          dateOfFirstAppointment: '',
          organisation: '',
          refId: '',
          currentAppointment: '',
          jobLocation: '',
          jobTitle: '',
          position: '',
          taxState: '',
          designation: '',
          gradeLevel: '',
          stepSum18: '',
          grade: '',
          mda: '',
          cdre: '',
          dateOfConfirmation: '',
          dateOfHire: '',
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
          educationInstitution: '',
          yearOfPassing: '',
          finalGrade: '',
        },
      })
      setIssues({})
      setShowIssueSelect({})
      setVerify({})
      setActiveTab('basic')
      setBiometricVerified(false)

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to submit verification:', error)
      alert('Failed to submit verification. Please try again.')
    }
  }

  const handleSaveProgress = async () => {
    if (!employee || !ippsId) return

    try {
      // Transform data into the required format
      const transformedData = {
        'basic-info': transformTabData(
          'basic',
          verificationData.basic,
          issues.basic || {},
          verify.basic || {}
        ),
        'employment-details': transformTabData(
          'employment',
          verificationData.employment,
          issues.employment || {},
          verify.employment || {}
        ),
        'educational-qualifications': transformTabData(
          'educational',
          verificationData.educational,
          issues.educational || {},
          verify.educational || {}
        ),
        'payment-salary-record': transformTabData(
          'payment',
          verificationData.payment,
          issues.payment || {},
          verify.payment || {}
        ),
        'identifications-biometrics': transformTabData(
          'identifications',
          verificationData.identifications,
          issues.identifications || {},
          verify.identifications || {}
        ),
        documents: transformTabData(
          'documents',
          verificationData.documents,
          issues.documents || {},
          verify.documents || {}
        ),
        'new-documents': transformTabData(
          'newDocuments',
          verificationData.newDocuments,
          issues.newDocuments || {},
          verify.newDocuments || {}
        ),
      }

      // Get current user ID
      const currentUserStr = localStorage.getItem('currentUser')
      let submittedBy = 'current_user'
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        const users = await pb.collection('users').getFullList({
          filter: `email = "${currentUser.email}"`,
        })

        console.log('currentUser', users)
        if (users.length > 0) {
          submittedBy = users[0].user_id
        }
      }

      const payload = {
        ippsId,
        employeeRef: employee.id,
        verificationData: transformedData,
        rawVerificationData: verificationData,
        biometricResults,
        biometricVerified,
        biometricStep,
        surnameInput,
        surnameResult,
        dobInput,
        dobResult,
        issues,
        verify,
        lastTab: activeTab,
        status: 'pending',
        cc_id: 1,
        submittedAt: new Date().toISOString(),
        submittedBy,
        verify_by: 1, // You might want to set this appropriately
      }

      // Check if verification already exists
      const existingVerifications = await pb
        .collection('verifications')
        .getFullList({
          filter: `ippsId = "${ippsId}"`,
        })

      if (existingVerifications.length > 0) {
        // Update existing
        await pb
          .collection('verifications')
          .update(existingVerifications[0].id, payload)
      } else {
        // Create new
        await pb.collection('verifications').create(payload)
      }

      alert('Progress saved successfully!')

      // Reset form to allow entering new IPPS ID
      setEmployee(null)
      setIppsId('')
      setSkipIppsInput(false)
      setHasHandledIppsId(false)
      // Remove ippsId from URL if present
      if (searchParams.get('ippsId')) {
        router.replace('/add-verification')
      }
      setVerificationData({
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
          photo: '',
        },
        employment: {
          dateOfFirstAppointment: '',
          organisation: '',
          refId: '',
          currentAppointment: '',
          jobLocation: '',
          jobTitle: '',
          position: '',
          taxState: '',
          designation: '',
          gradeLevel: '',
          stepSum18: '',
          grade: '',
          mda: '',
          cdre: '',
          dateOfConfirmation: '',
          dateOfHire: '',
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
          educationInstitution: '',
          yearOfPassing: '',
          finalGrade: '',
        },
      })
      setIssues({})
      setShowIssueSelect({})
      setVerify({})
      setActiveTab('basic')
      setBiometricVerified(false)
    } catch (error) {
      console.error('Failed to save progress:', error)
      alert('Failed to save progress. Please try again.')
      // Reset employee state on error
    }
  }

  const transformTabData = (
    tabKey: string,
    tabData: Record<string, string>,
    tabIssues: Record<string, string[]>,
    tabVerify: Record<string, boolean>
  ) => {
    const result: Record<
      string,
      { verify: number; tags: string[]; document_proof: string[] }
    > = {}

    Object.keys(tabData).forEach((field) => {
      const fieldIssues = tabIssues[field] || []
      const fieldVerify = tabVerify[field] ? 1 : 0

      result[field] = {
        verify: fieldVerify,
        tags: fieldIssues,
        document_proof: [], // This would need to be populated from assignedDocuments if available
      }
    })

    return result
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
        <div className='w-1/3 pr-4'>
          <div className='space-y-2'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-2 py-2 rounded-lg font-medium ${
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
        <div className='w-3/4 ml-4'>
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
          <div className='w-full flex justify-between mt-6'>
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
            <button
              onClick={() => handleSaveProgress()}
              className='px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-opacity duration-200'
              style={{ backgroundColor: '#ffc107' }}
            >
              Save Progress
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto '>
        {/* Back Button */}
        <div className='flex w-full items-center'>
          <div className='flex-[0.5]'>
            <button
              onClick={() => router.push('/dashboard')}
              className='mb-6  flex items-center text-primaryy hover:text-primaryx'
            >
              <ArrowBack className='w-5 h-5 mr-2' />
              Back to Dashboard
            </button>
          </div>

          <div className='flex-1 '>
            <Image src={Logo1m} alt='Logo' className='w-1/2' />
          </div>
        </div>

        {/* Main Content */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='w-fit flex justify-between items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Start Verification
              </h1>
            </div>

            {employee && biometricVerified && (
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
                <button
                  onClick={handleSaveProgress}
                  className='px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-opacity duration-200'
                  style={{ backgroundColor: '#ffc107' }}
                >
                  Save Progress
                </button>
              </div>
            )}
          </div>

          {/* Loading when skipping IPPS input */}
          {skipIppsInput && !employee && !error && (
            <div className='mb-6 text-center'>
              <p className='text-gray-500'>Loading employee data...</p>
            </div>
          )}

          {/* IPPS ID Input */}
          {!employee && !skipIppsInput && (
            <div className='mb-6'>
              <label
                htmlFor='ippsId'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Employee IPPS Number
              </label>
              <div className='flex space-x-4'>
                <input
                  type='text'
                  id='ippsId'
                  value={ippsId}
                  onChange={(e) => setIppsId(e.target.value)}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                  placeholder='Enter IPPS Number'
                />
                <button
                  onClick={() => handleCheck()}
                  disabled={loading}
                  className='px-6 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx disabled:opacity-50'
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
                <button
                  onClick={() => setShowDrawer(true)}
                  className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                >
                  Log Exception
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

          {/* Success Alert */}
          {successMessage && (
            <Alert
              type='success'
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              autoClose={false}
            />
          )}

          {/* Biometric Verification */}
          {employee && !biometricVerified && (
            <div className='mt-6'>
              <div className='w-full flex flex-col items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Identity Verification
                </h2>
                <div className='flex items-center justify-center mb-2'>
                  <div className='flex items-center'>
                    <div
                      className={`w-10 h-10 rounded-full ${
                        biometricStep === 'facial'
                          ? 'bg-blue-500'
                          : biometricResults.facial.includes('successfully')
                          ? 'bg-green-500'
                          : biometricResults.facial
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      } text-white flex items-center justify-center text-sm font-bold`}
                    >
                      1
                    </div>
                    <span className='ml-2 text-sm'>Facial Recognition</span>
                  </div>
                  <div
                    className={`h-1 w-16 mx-4 ${
                      biometricStep !== 'facial' || biometricResults.facial
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                  <div className='flex items-center'>
                    <div
                      className={`w-10 h-10 rounded-full ${
                        biometricStep === 'surname'
                          ? 'bg-blue-500'
                          : biometricResults.surname.includes('successfully')
                          ? 'bg-green-500'
                          : biometricResults.surname
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      } text-white flex items-center justify-center text-sm font-bold`}
                    >
                      2
                    </div>
                    <span className='ml-2 text-sm'>Verify Surname</span>
                  </div>
                  <div
                    className={`h-1 w-16 mx-4 ${
                      biometricStep === 'dob' || biometricResults.dob
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                  <div className='flex items-center'>
                    <div
                      className={`w-10 h-10 rounded-full ${
                        biometricStep === 'dob'
                          ? 'bg-blue-500'
                          : biometricResults.dob.includes('successfully')
                          ? 'bg-green-500'
                          : biometricResults.dob
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      } text-white flex items-center justify-center text-sm font-bold`}
                    >
                      3
                    </div>
                    <span className='ml-2 text-sm'>Verify Date of Birth</span>
                  </div>
                </div>
              </div>

              {biometricStep === 'facial' && (
                <div>
                  <Biometrics
                    onVerifySuccess={() => {
                      setBiometricResults((prev) => ({
                        ...prev,
                        facial: 'Face verified successfully',
                      }))
                      setBiometricStep('surname')
                    }}
                    onSkip={(error) => {
                      setBiometricResults((prev) => ({
                        ...prev,
                        facial: error,
                      }))
                      setBiometricStep('surname')
                    }}
                    ippsId={ippsId}
                  />
                  <button
                    onClick={() => {
                      setBiometricResults((prev) => ({
                        ...prev,
                        facial: 'Facial verification marked as failed',
                      }))
                      setBiometricStep('surname')
                    }}
                    className='mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Mark Facial as Failed
                  </button>
                </div>
              )}

              {biometricStep === 'surname' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Enter Employee Surname
                  </label>
                  <input
                    type='text'
                    value={surnameInput}
                    onChange={(e) => setSurnameInput(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy mb-4'
                    placeholder='Enter surname'
                  />
                  {surnameResult && (
                    <p
                      className={`mb-4 text-sm ${
                        surnameResult.includes('successfully')
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {surnameResult}
                    </p>
                  )}
                  <div className='flex justify-between'>
                    <button
                      onClick={() => setBiometricStep('facial')}
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400'
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        console.log(
                          'Input:',
                          JSON.stringify(surnameInput.toLowerCase())
                        )
                        console.log(
                          'Employee lastName:',
                          JSON.stringify(
                            (employee?.lastName || '').toLowerCase()
                          )
                        )
                        console.log('Input length:', surnameInput.length)
                        console.log(
                          'LastName length:',
                          (employee?.lastName || '').length
                        )
                        const isSuccess =
                          surnameInput.toLowerCase() ===
                          (employee?.lastName || '').trim().toLowerCase()
                        console.log('Surname verification:', {
                          input: surnameInput,
                          correct: employee?.lastName,
                          isSuccess,
                        })
                        setSurnameResult(
                          isSuccess
                            ? 'Surname verified successfully'
                            : 'Surname does not match.'
                        )
                        setBiometricResults((prev) => ({
                          ...prev,
                          surname: isSuccess
                            ? 'Surname verified successfully'
                            : 'Surname does not match.',
                        }))
                      }}
                      className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setBiometricStep('dob')}
                      className='px-4 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {biometricStep === 'dob' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Select Employee Date of Birth
                  </label>
                  <input
                    type='date'
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy mb-4'
                  />
                  {dobResult && (
                    <p
                      className={`mb-4 text-sm ${
                        dobResult.includes('successfully')
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {dobResult}
                    </p>
                  )}
                  <div className='flex justify-between'>
                    <button
                      onClick={() => setBiometricStep('surname')}
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400'
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        const empDob = employee?.dateOfBirth || ''
                        const selectedDate = new Date(dobInput)
                        const selectedYear = selectedDate
                          .getFullYear()
                          .toString()
                        const selectedMonth = (selectedDate.getMonth() + 1)
                          .toString()
                          .padStart(2, '0')
                        const [empYear, empMonth] = empDob.split('-')
                        const isSuccess =
                          selectedYear === empYear && selectedMonth === empMonth
                        setDobResult(
                          isSuccess
                            ? 'Date of Birth verified successfully'
                            : 'Date of Birth does not match'
                        )
                        setBiometricResults((prev) => ({
                          ...prev,
                          dob: isSuccess
                            ? 'Date of Birth verified successfully'
                            : 'Date of Birth does not match',
                        }))
                      }}
                      className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => {
                        const results = {
                          ...biometricResults,
                          surname: biometricResults.surname,
                          dob: biometricResults.dob,
                        }
                        const successCount = Object.values(results).filter(
                          (r) => r.includes('successfully')
                        ).length
                        if (successCount >= 2) {
                          setBiometricVerified(true)
                          setVerificationSuccess(true)
                          setSuccessMessage(
                            'Biometric verification successful!'
                          )
                          setTimeout(() => {
                            setVerificationSuccess(false)
                            setSuccessMessage('')
                          }, 3000)
                        } else {
                          setBiometricVerified(true) // Allow continuing even on failure
                          setError(
                            'Biometric verification failed. Less than 2 verifications passed. Proceeding with manual verification.'
                          )
                        }
                        // Reset biometric step and inputs for next time
                        setBiometricStep('facial')
                        setSurnameInput('')
                        setDobInput('')
                        setSurnameResult('')
                        setDobResult('')
                        setBiometricResults({
                          facial: '',
                          surname: '',
                          dob: '',
                        })
                      }}
                      className='px-4 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
                    >
                      Complete Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Success */}
          {employee && !biometricVerified && verificationSuccess && (
            <div className='mt-6'>
              <div className='w-full h-auto flex items-center justify-center mb-4 '>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Verification Successful
                </h2>
                <div className='text-center'>
                  <CheckCircle className='w-16 h-16 text-green-500 mx-auto' />
                </div>
              </div>
            </div>
          )}

          {/* Employee Details */}
          {employee && biometricVerified && (
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
                    ippsId={ippsId}
                    verify={verify.basic || {}}
                    onVerifyChange={(field, value) =>
                      setVerify({
                        ...verify,
                        basic: { ...verify.basic, [field]: value },
                      })
                    }
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
                    ippsId={ippsId}
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
                    ippsId={ippsId}
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
                    ippsId={ippsId}
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
                    ippsId={ippsId}
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
                    ippsId={ippsId}
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
                    ippsId={ippsId}
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
          {/* {error && !employee && (
            <button
              onClick={() => setShowDrawer(true)}
              className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Log Exception
            </button>
          )} */}
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
            <div className='p-6 max-h-screen overflow-y-auto'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Log Exception
              </h2>

              <div className='space-y-1 flex flex-row flex-wrap gap-2'>
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
                  required
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
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />

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
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
                <input
                  type='email'
                  placeholder='Email'
                  value={exceptionData.email}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      email: e.target.value,
                    })
                  }
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
                <input
                  type='tel'
                  placeholder='Phone Number'
                  value={exceptionData.phoneNumber}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                />
                <select
                  value={exceptionData.organisation}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      organisation: e.target.value,
                    })
                  }
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                >
                  <option value=''>Select Organisation/Ministry</option>
                  {organisations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <select
                  value={exceptionData.department}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      department: e.target.value,
                    })
                  }
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy'
                >
                  <option value=''>Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Tags
                  </label>
                  <input
                    type='text'
                    placeholder='Search tags...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primaryy focus:border-primaryy mb-2'
                  />
                  <div className='max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2'>
                    {tags
                      .filter((tag) =>
                        tag.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((tag) => (
                        <label
                          key={tag.id}
                          className='flex items-center space-x-2'
                        >
                          <input
                            type='checkbox'
                            checked={exceptionData.tags.includes(tag.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExceptionData({
                                  ...exceptionData,
                                  tags: [...exceptionData.tags, tag.name],
                                })
                              } else {
                                setExceptionData({
                                  ...exceptionData,
                                  tags: exceptionData.tags.filter(
                                    (t) => t !== tag.name
                                  ),
                                })
                              }
                            }}
                            className='form-checkbox'
                          />
                          <span>{tag.name}</span>
                        </label>
                      ))}
                  </div>
                  {exceptionData.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {exceptionData.tags.map((tag) => (
                        <span
                          key={tag}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                        >
                          {tag}
                          <button
                            type='button'
                            onClick={() =>
                              setExceptionData({
                                ...exceptionData,
                                tags: exceptionData.tags.filter(
                                  (t) => t !== tag
                                ),
                              })
                            }
                            className='ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500'
                          >
                            <Close className='w-2 h-2' />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className='flex space-x-4 mt-6'>
                <button
                  onClick={handleAddException}
                  className='flex-1 px-4 py-2 bg-primaryy text-white rounded-md hover:bg-primaryx'
                >
                  Save
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
