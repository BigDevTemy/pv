migrate(
  (app) => {
    // ---------------- EMPLOYEES COLLECTION ----------------
    const employees = new Collection({
      type: 'base',
      name: 'employees',
      schema: [
        {
          name: 'ippsId',
          type: 'text',
          required: true,
          unique: true,
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'bvn',
          type: 'text',
          unique: true,
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'firstName',
          type: 'text',
          required: true,
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'gender',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['Male', 'Female', 'Other'],
          },
        },
        {
          name: 'maritalStatus',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['Single', 'Married', 'Divorced', 'Widowed'],
          },
        },
        { name: 'dob', type: 'date', options: {} },
        {
          name: 'phone',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'address',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'state',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'lga',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        { name: 'email', type: 'email', unique: true, options: {} },
        { name: 'hireDate', type: 'date', options: {} },
        {
          name: 'position',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        {
          name: 'department',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        { name: 'photo', type: 'file', options: { maxSelect: 1 } },
      ],
      indexes: [],
    })

    app.save(employees)

    // ---------------- VERIFICATIONS COLLECTION ----------------
    const verifications = new Collection({
      type: 'base',
      name: 'verifications',
      schema: [
        {
          name: 'employee',
          type: 'relation',
          required: true,
          options: {
            collectionId: employees.id, // ✅ ensures it links to the actual employees collection
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: [],
          },
        },
        {
          name: 'verifiedBy',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        { name: 'verificationDate', type: 'date', options: {} },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['draft', 'submitted', 'approved', 'rejected'],
          },
        },
        {
          name: 'comments',
          type: 'text',
          options: { min: null, max: null, pattern: '' },
        },
        { name: 'attachments', type: 'file', options: { maxSelect: 5 } },
      ],
      indexes: [],
    })

    app.save(verifications)
  },
  (app) => {
    const verifications = app.findCollectionByNameOrId('verifications')
    if (verifications) app.delete(verifications)

    const employees = app.findCollectionByNameOrId('employees')
    if (employees) app.delete(employees)
  }
)
