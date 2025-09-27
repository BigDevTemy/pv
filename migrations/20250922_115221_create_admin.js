// PocketBase migration: create super admin user
migrate(
  (db) => {
    const dao = new Dao(db)

    // Check if admin already exists
    let existingAdmin = null
    try {
      existingAdmin = dao.findFirstRecordByData(
        'admins',
        'email',
        'admin@ohcsf.com'
      )
    } catch (e) {
      // Admin doesn't exist, proceed to create
    }

    if (!existingAdmin) {
      const admin = new Admin({
        email: 'admin@ohcsf.com',
        password: 'Admin@2025',
      })

      return dao.saveAdmin(admin)
    }
  },
  (db) => {
    const dao = new Dao(db)
    try {
      const admin = dao.findFirstRecordByData(
        'admins',
        'email',
        'admin@ohcsf.com'
      )
      if (admin) {
        return dao.deleteAdmin(admin)
      }
    } catch (e) {
      // no-op if admin not found
    }
  }
)
