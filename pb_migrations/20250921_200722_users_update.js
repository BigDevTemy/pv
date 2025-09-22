// PocketBase migration: extend default users collection with CCC_id, employee_id, firstname, lastname
migrate(
  (db) => {
    const dao = new Dao(db)

    // Fetch default users collection (system auth collection)
    const users = dao.findCollectionByNameOrId('_pb_users_auth_')

    let employeesId = null
    try {
      const emp = dao.findCollectionByNameOrId('employees')
      employeesId = emp?.id || null
    } catch (e) {
      // employees collection not found; we'll fallback to text for employee_id
    }

    let changed = false

    const ensureField = (fieldDef) => {
      if (!users.schema.getFieldByName(fieldDef.name)) {
        users.schema.addField(new SchemaField(fieldDef))
        changed = true
      }
    }

    // Add CCC_id (text)
    ensureField({
      system: false,
      id: 'usr_ccc_id',
      name: 'CCC_id',
      type: 'text',
      required: false,
      unique: false,
      options: { min: null, max: null, pattern: '' },
    })

    // Add employee_id (prefer relation to employees; fallback to text)
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

    // Add firstname (text)
    ensureField({
      system: false,
      id: 'usr_first',
      name: 'firstname',
      type: 'text',
      required: false,
      unique: false,
      options: { min: null, max: null, pattern: '' },
    })

    // Add lastname (text)
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
      return dao.saveCollection(users)
    }
  },
  (db) => {
    const dao = new Dao(db)
    try {
      const users = dao.findCollectionByNameOrId('_pb_users_auth_')

      const removeIfExists = (name) => {
        const f = users.schema.getFieldByName(name)
        if (f) users.schema.removeField(f.id)
      }

      removeIfExists('CCC_id')
      removeIfExists('employee_id')
      removeIfExists('firstname')
      removeIfExists('lastname')

      return dao.saveCollection(users)
    } catch (e) {
      // no-op if users collection not found
    }
  }
)
