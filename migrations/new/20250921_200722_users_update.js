migrate(
  (app) => {
    // Fetching default users collection (system auth collection)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Checking for employees collection
    let employeesId = null
    try {
      const emp = app.findCollectionByNameOrId('employees')
      employeesId = emp?.id || null
    } catch (e) {
      // employees collection not found; we'll fallback to text for employee_id
    }

    let changed = false

    const ensureField = (fieldDef) => {
      if (!users.schema.findFieldByName(fieldDef.name)) {
        users.schema.addField(fieldDef)
        changed = true
      }
    }

    // Adding CCC_id (text)
    ensureField({
      system: false,
      id: 'usr_ccc_id',
      name: 'CCC_id',
      type: 'text',
      required: false,
      unique: false,
      options: { min: null, max: null, pattern: '' },
    })

    // Adding employee_id (prefer relation to employees; fallback to text)
    if (employeesId) {
      ensureField({
        system: false,
        id: 'usr_emp_rel',
        name: 'employee_id',
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
    } else {
      // Fallback text if employees collection is not present yet
      ensureField({
        system: false,
        id: 'usr_emp_txt',
        name: 'employee_id',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' },
      })
    }

    // Adding firstname (text)
    ensureField({
      system: false,
      id: 'usr_first',
      name: 'firstname',
      type: 'text',
      required: false,
      unique: false,
      options: { min: null, max: null, pattern: '' },
    })

    // Adding lastname (text)
    ensureField({
      system: false,
      id: 'usr_last',
      name: 'lastname',
      type: 'text',
      required: false,
      unique: false,
      options: { min: null, max: null, pattern: '' },
    })

    if (changed) {
      return app.saveCollection(users)
    }
  },
  (app) => {
    // Removing added fields from users collection
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')

      const removeIfExists = (name) => {
        const f = users.schema.findFieldByName(name)
        if (f) users.schema.removeField(f.id)
      }

      removeIfExists('CCC_id')
      removeIfExists('employee_id')
      removeIfExists('firstname')
      removeIfExists('lastname')

      return app.saveCollection(users)
    } catch (e) {
      // no-op if users collection not found
    }
  }
)
