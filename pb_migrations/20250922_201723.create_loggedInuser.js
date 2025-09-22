// PocketBase migration: create "loggedInUsers" collection
migrate(
  (db) => {
    const dao = new Dao(db)

    // Create "loggedInUsers" collection
    const loggedInUsers = new Collection({
      id: 'loggedInUsers0001', // explicit collection ID
      name: 'loggedInUsers',
      type: 'base',
      system: false,
      schema: [
        // cc_id (integer, required, not unique)
        {
          system: false,
          id: 'liu_ccid001',
          name: 'cc_id',
          type: 'number',
          required: true,
          unique: false,
          options: { min: null, max: null },
        },

        // email (unique)
        {
          system: false,
          id: 'liu_email01',
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          options: { exceptDomains: null, onlyDomains: null },
        },

        // firstname
        {
          system: false,
          id: 'liu_fnm001',
          name: 'firstname',
          type: 'text',
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },

        // lastname
        {
          system: false,
          id: 'liu_lnm001',
          name: 'lastname',
          type: 'text',
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: '' },
        },

        // lastSeen (date, optional)
        {
          system: false,
          id: 'liu_seen01',
          name: 'lastSeen',
          type: 'date',
          required: false,
          unique: false,
          options: { min: '', max: '' },
        },
      ],
      indexes: [
        // Indexes for faster lookups
        'CREATE UNIQUE INDEX idx_loggedInUsers_email ON loggedInUsers (email)',
        'CREATE INDEX idx_loggedInUsers_cc_id ON loggedInUsers (cc_id)',
        'CREATE INDEX idx_loggedInUsers_lastSeen ON loggedInUsers (lastSeen)',
      ],
      // PocketBase auto-adds "created" and "updated"
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    })

    return dao.saveCollection(loggedInUsers)
  },
  (db) => {
    const dao = new Dao(db)
    try {
      const coll = dao.findCollectionByNameOrId('loggedInUsers')
      return dao.deleteCollection(coll)
    } catch (e) {
      // no-op if already removed
    }
  }
)
