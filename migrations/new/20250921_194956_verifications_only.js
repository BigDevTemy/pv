migrate(
  (app) => {
    // Checking for employees collection
    let employeesId = null
    try {
      employeesId = app.findCollectionByNameOrId('employees').id
    } catch (e) {}

    // Checking for existing verifications collection
    let existing = null
    try {
      existing = app.findCollectionByNameOrId('verifications')
    } catch (e) {}

    if (!existing) {
      // Ensuring employees collection exists before creating verifications
      if (!employeesId) {
        throw new Error(
          'employees collection not found; run employees migration first.'
        )
      }
      // Creating new verifications collection
      const verifications = new Collection({
        id: 'verifications_only_20250921',
        name: 'verifications',
        type: 'base',
        system: false,
        schema: [
          {
            system: false,
            id: 'v_ippsid001',
            name: 'ippsId',
            type: 'text',
            required: true,
            unique: false,
            options: { min: null, max: null, pattern: '' },
          },
          {
            system: false,
            id: 'v_empref001',
            name: 'employeeRef',
            type: 'relation',
            required: false,
            unique: false,
            options: {
              collectionId: employeesId,
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: [],
            },
          },
          {
            system: false,
            id: 'v_vdata001',
            name: 'verificationData',
            type: 'json',
            required: false,
            unique: false,
            options: {},
          },
          {
            system: false,
            id: 'v_issues001',
            name: 'issues',
            type: 'json',
            required: false,
            unique: false,
            options: {},
          },
          {
            system: false,
            id: 'v_status001',
            name: 'status',
            type: 'select',
            required: true,
            unique: false,
            options: {
              maxSelect: 1,
              values: ['draft', 'submitted', 'approved', 'rejected'],
            },
          },
          {
            system: false,
            id: 'v_subAt001',
            name: 'submittedAt',
            type: 'date',
            required: false,
            unique: false,
            options: {},
          },
          {
            system: false,
            id: 'v_subBy001',
            name: 'submittedBy',
            type: 'text',
            required: false,
            unique: false,
            options: { min: null, max: null, pattern: '' },
          },
          {
            system: false,
            id: 'v_vby000001',
            name: 'verify_by',
            type: 'number',
            required: true,
            unique: false,
            options: { min: null, max: null },
          },
        ],
        indexes: [
          'CREATE INDEX idx_verifications_ippsId ON verifications (ippsId)',
          'CREATE INDEX idx_verifications_verify_by ON verifications (verify_by)',
        ],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      })
      return app.saveCollection(verifications)
    } else {
      // Updating existing verifications collection
      const schema = existing.schema
      const addFieldIfMissing = (field) => {
        if (!schema.findFieldByName(field.name)) {
          schema.addField(field)
        }
      }

      addFieldIfMissing({
        system: false,
        id: 'v_ippsid001x',
        name: 'ippsId',
        type: 'text',
        required: true,
        unique: false,
        options: { min: null, max: null, pattern: '' },
      })
      if (employeesId) {
        addFieldIfMissing({
          system: false,
          id: 'v_empref001x',
          name: 'employeeRef',
          type: 'relation',
          required: false,
          unique: false,
          options: {
            collectionId: employeesId,
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: [],
          },
        })
      }
      addFieldIfMissing({
        system: false,
        id: 'v_vdata001x',
        name: 'verificationData',
        type: 'json',
        required: false,
        unique: false,
        options: {},
      })
      addFieldIfMissing({
        system: false,
        id: 'v_issues001x',
        name: 'issues',
        type: 'json',
        required: false,
        unique: false,
        options: {},
      })
      addFieldIfMissing({
        system: false,
        id: 'v_status001x',
        name: 'status',
        type: 'select',
        required: true,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['draft', 'submitted', 'approved', 'rejected'],
        },
      })
      addFieldIfMissing({
        system: false,
        id: 'v_subAt001x',
        name: 'submittedAt',
        type: 'date',
        required: false,
        unique: false,
        options: {},
      })
      addFieldIfMissing({
        system: false,
        id: 'v_subBy001x',
        name: 'submittedBy',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' },
      })
      addFieldIfMissing({
        system: false,
        id: 'v_vby000001x',
        name: 'verify_by',
        type: 'number',
        required: true,
        unique: false,
        options: { min: null, max: null },
      })

      // Updating indexes
      const idx = new Set(existing.indexes || [])
      idx.add('CREATE INDEX idx_verifications_ippsId ON verifications (ippsId)')
      idx.add(
        'CREATE INDEX idx_verifications_verify_by ON verifications (verify_by)'
      )
      existing.indexes = Array.from(idx)

      return app.saveCollection(existing)
    }
  },
  (app) => {
    // Removing verify_by field from verifications collection
    try {
      const existing = app.findCollectionByNameOrId('verifications')
      const fld = existing.schema.findFieldByName('verify_by')
      if (fld) {
        existing.schema.removeField(fld.id)
        return app.saveCollection(existing)
      }
    } catch (e) {
      // no-op
    }
  }
)
