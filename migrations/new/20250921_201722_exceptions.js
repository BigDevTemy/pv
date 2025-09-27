migrate(
  (app) => {
    // Checking for default users collection
    let usersId = null
    try {
      usersId = app.findCollectionByNameOrId('_pb_users_auth_')?.id || null
    } catch (e) {
      usersId = null
    }

    // Creating exceptions collection
    const exceptions = new Collection({
      id: 'exceptions00001',
      name: 'exceptions',
      type: 'base',
      system: false,
      schema: [
        // ipps_id (required, not unique for multiple logs)
        {
          system: false,
          id: 'exc_ipps001',
          name: 'ipps_id',
          type: 'text',
          required: true,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },
        // Basic identity: firstname
        {
          system: false,
          id: 'exc_fnm0001',
          name: 'firstname',
          type: 'text',
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },
        // Basic identity: lastname
        {
          system: false,
          id: 'exc_lnm0001',
          name: 'lastname',
          type: 'text',
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },
        // Date of birth
        {
          system: false,
          id: 'exc_dob0001',
          name: 'date_of_birth',
          type: 'date',
          required: false,
          unique: false,
          options: {},
        },
        // Department
        {
          system: false,
          id: 'exc_dept001',
          name: 'department',
          type: 'text',
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },
        // Created_by: relation to users if available, else text
        ...(usersId
          ? [
              {
                system: false,
                id: 'exc_cby0001',
                name: 'created_by',
                type: 'relation',
                required: true,
                unique: false,
                options: {
                  collectionId: usersId,
                  cascadeDelete: false,
                  minSelect: null,
                  maxSelect: 1,
                  displayFields: [],
                },
              },
            ]
          : [
              {
                system: false,
                id: 'exc_cbytxt1',
                name: 'created_by',
                type: 'text',
                required: true,
                unique: false,
                options: { min: null, max: null, pattern: '' },
              },
            ]),
      ],
      indexes: ['CREATE INDEX idx_exceptions_ipps_id ON exceptions (ipps_id)'],
      // PocketBase automatically adds/maintains system fields "created" and "updated"
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    })

    return app.saveCollection(exceptions)
  },
  (app) => {
    // Dropping exceptions collection
    try {
      const coll = app.findCollectionByNameOrId('exceptions')
      return app.deleteCollection(coll)
    } catch (e) {
      // no-op if already removed
    }
  }
)
