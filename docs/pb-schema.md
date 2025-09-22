# PocketBase schema for employees and verification

This document provides sample PocketBase collection definitions to support your Add Verification flow.

Employees collection (base)

Use this JSON to create a collection named employees.

```json
{
  "name": "employees",
  "type": "base",
  "schema": [
    { "name": "ippsId", "type": "text", "required": true, "unique": true },

    { "name": "firstName", "type": "text" },
    { "name": "lastName", "type": "text" },
    { "name": "dateOfBirth", "type": "date" },
    {
      "name": "gender",
      "type": "select",
      "options": { "values": ["Male", "Female", "Other"] }
    },
    {
      "name": "maritalStatus",
      "type": "select",
      "options": { "values": ["Single", "Married", "Divorced", "Widowed"] }
    },
    { "name": "nationality", "type": "text" },
    { "name": "stateOfOrigin", "type": "text" },
    { "name": "lga", "type": "text" },
    { "name": "phoneNumber", "type": "text" },
    { "name": "email", "type": "email" },
    { "name": "residentialAddress", "type": "text" },
    { "name": "nextOfKin", "type": "text" },
    { "name": "nextOfKinRelationship", "type": "text" },
    {
      "name": "profilePic",
      "type": "file",
      "options": { "maxSelect": 1, "mimeTypes": ["image/*"] }
    },

    { "name": "dateOfFirstAppointment", "type": "date" },
    { "name": "currentAppointment", "type": "text" },
    { "name": "designation", "type": "text" },
    { "name": "gradeLevel", "type": "text" },
    { "name": "grade", "type": "text" },
    { "name": "mda", "type": "text" },
    { "name": "cdre", "type": "text" },
    { "name": "dateOfConfirmation", "type": "date" },
    { "name": "expectedRetirementDate", "type": "date" },
    { "name": "dateOfLastPromotion", "type": "date" },

    { "name": "highestQualification", "type": "text" },
    { "name": "institutionAttended", "type": "text" },
    { "name": "yearOfGraduation", "type": "number" },
    { "name": "professionalCertifications", "type": "text" },
    { "name": "trainingAttended", "type": "text" },

    { "name": "salaryStructure", "type": "text" },
    { "name": "basicSalary", "type": "number" },
    { "name": "allowances", "type": "number" },
    { "name": "deductions", "type": "number" },
    { "name": "netPay", "type": "number" },
    { "name": "accountNumber", "type": "text" },
    { "name": "bvn", "type": "text" },
    { "name": "pfaName", "type": "text" },
    { "name": "rsaPin", "type": "text" },
    { "name": "nhisNumber", "type": "text" },

    {
      "name": "passportPhotograph",
      "type": "file",
      "options": { "maxSelect": 1, "mimeTypes": ["image/*"] }
    },
    {
      "name": "fingerprints",
      "type": "file",
      "options": { "maxSelect": 10, "mimeTypes": ["image/*"] }
    },
    {
      "name": "digitalSignatures",
      "type": "file",
      "options": { "maxSelect": 1, "mimeTypes": ["image/*"] }
    },

    { "name": "documents", "type": "json" },
    { "name": "newDocuments", "type": "json" },

    { "name": "bloodType", "type": "text" },
    { "name": "allergies", "type": "text" },
    { "name": "emergencyContact", "type": "text" },
    { "name": "medicalHistory", "type": "text" },

    { "name": "bankName", "type": "text" },
    { "name": "branch", "type": "text" },
    { "name": "ifscCode", "type": "text" },

    { "name": "degree", "type": "text" },
    { "name": "educationInstitution", "type": "text" },
    { "name": "yearOfPassing", "type": "number" },
    { "name": "finalGrade", "type": "text" }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_employees_ippsId ON employees (ippsId)",
    "CREATE INDEX idx_employees_bvn ON employees (bvn)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": ""
}
```

Verifications collection (to store submitted verifications)

This stores each submission with the captured payload, useful for audit trails. Create a collection named verifications.

```json
{
  "name": "verifications",
  "type": "base",
  "schema": [
    { "name": "ippsId", "type": "text", "required": true },
    {
      "name": "employeeRef",
      "type": "relation",
      "options": { "collectionId": "employees", "maxSelect": 1 },
      "required": false
    },
    { "name": "verificationData", "type": "json" },
    { "name": "issues", "type": "json" },
    {
      "name": "status",
      "type": "select",
      "options": { "values": ["draft", "submitted", "approved", "rejected"] },
      "required": true
    },
    { "name": "submittedAt", "type": "date" },
    { "name": "submittedBy", "type": "text" },
    { "name": "verify_by", "type": "number", "required": true }
  ],
  "indexes": [
    "CREATE INDEX idx_verifications_ippsId ON verifications (ippsId)",
    "CREATE INDEX idx_verifications_verify_by ON verifications (verify_by)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": ""
}
```

Seed data (optional)

You can import sample employees matching the UI's SAMPLE_EMPLOYEES. Create two records like below:

```json
[
  {
    "collection": "employees",
    "data": {
      "ippsId": "12345",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1988-05-14",
      "gender": "Male",
      "maritalStatus": "Single",
      "nationality": "Nigerian",
      "stateOfOrigin": "Lagos",
      "lga": "Ikeja",
      "phoneNumber": "08030000000",
      "email": "john.doe@example.com",
      "residentialAddress": "12 Adewale St, Ikeja",
      "nextOfKin": "Jane Doe",
      "nextOfKinRelationship": "Sister",
      "profilePic": "",
      "dateOfFirstAppointment": "2012-01-10",
      "currentAppointment": "Senior Developer",
      "designation": "Software Engineer",
      "gradeLevel": "12",
      "grade": "Step 3",
      "mda": "IT Services",
      "cdre": "CDRE-123",
      "dateOfConfirmation": "2014-03-01",
      "expectedRetirementDate": "2048-05-14",
      "dateOfLastPromotion": "2022-08-01",
      "highestQualification": "B.Sc Computer Science",
      "institutionAttended": "UNILAG",
      "yearOfGraduation": 2010,
      "professionalCertifications": "PMP, AWS SAA",
      "trainingAttended": "Secure Coding",
      "salaryStructure": "CONIT",
      "basicSalary": 350000,
      "allowances": 150000,
      "deductions": 50000,
      "netPay": 450000,
      "accountNumber": "0123456789",
      "bvn": "12345678901",
      "pfaName": "ARM Pensions",
      "rsaPin": "PEN123456",
      "nhisNumber": "NHIS123456",
      "passportPhotograph": "",
      "fingerprints": "",
      "digitalSignatures": "",
      "documents": {},
      "newDocuments": {},
      "bloodType": "O+",
      "allergies": "None",
      "emergencyContact": "Jane Doe",
      "medicalHistory": "N/A",
      "bankName": "GTBank",
      "branch": "Ikeja",
      "ifscCode": "",
      "degree": "B.Sc",
      "educationInstitution": "UNILAG",
      "yearOfPassing": 2010,
      "finalGrade": "First Class"
    }
  },
  {
    "collection": "employees",
    "data": {
      "ippsId": "67890",
      "firstName": "Mary",
      "lastName": "Johnson",
      "dateOfBirth": "1990-09-21",
      "gender": "Female",
      "maritalStatus": "Married",
      "nationality": "Nigerian",
      "stateOfOrigin": "Oyo",
      "lga": "Ibadan North",
      "phoneNumber": "08030000001",
      "email": "mary.johnson@example.com",
      "residentialAddress": "3 Ring Road, Ibadan",
      "nextOfKin": "Paul Johnson",
      "nextOfKinRelationship": "Husband",
      "profilePic": "",
      "dateOfFirstAppointment": "2015-06-01",
      "currentAppointment": "Accountant",
      "designation": "Senior Accountant",
      "gradeLevel": "10",
      "grade": "Step 2",
      "mda": "Finance Dept",
      "cdre": "CDRE-456",
      "dateOfConfirmation": "2017-01-01",
      "expectedRetirementDate": "2055-09-21",
      "dateOfLastPromotion": "2021-05-15",
      "highestQualification": "M.Sc Accounting",
      "institutionAttended": "UI",
      "yearOfGraduation": 2014,
      "professionalCertifications": "ICAN",
      "trainingAttended": "IFRS",
      "salaryStructure": "CONF",
      "basicSalary": 300000,
      "allowances": 120000,
      "deductions": 40000,
      "netPay": 380000,
      "accountNumber": "0123456790",
      "bvn": "10987654321",
      "pfaName": "Stanbic Pensions",
      "rsaPin": "PEN654321",
      "nhisNumber": "NHIS654321",
      "passportPhotograph": "",
      "fingerprints": "",
      "digitalSignatures": "",
      "documents": {},
      "newDocuments": {},
      "bloodType": "A-",
      "allergies": "Penicillin",
      "emergencyContact": "Paul Johnson",
      "medicalHistory": "Asthma",
      "bankName": "Access Bank",
      "branch": "Bodija",
      "ifscCode": "",
      "degree": "M.Sc",
      "educationInstitution": "UI",
      "yearOfPassing": 2014,
      "finalGrade": "Distinction"
    }
  }
]
```

How to import

- Open PocketBase Admin UI.
- Create the employees and verifications collections with the above JSON (Collections -> Import collection).
- Optionally insert the seed data (Collections -> employees -> Import records).

Notes

- The UI in ['app/add-verification/page.tsx'](app/add-verification/page.tsx:147) uses SAMPLE_EMPLOYEES for local testing with IPPS IDs 12345 and 67890.
- Submit logs the payload to the console; see ['handleVerificationSubmit()'](app/add-verification/page.tsx:581).
- You can switch to live PB by removing SAMPLE_EMPLOYEES usage in ['handleCheck()'](app/add-verification/page.tsx:483).
