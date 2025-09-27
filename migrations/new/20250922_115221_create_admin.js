migrate(
  async (app) => {
    // Checking if admin already exists
    let existingAdmin = null
    try {
      existingAdmin = await app.findFirstRecordByData(
        'admins',
        'email',
        'admin@ohcsf.com'
      )
    } catch (e) {
      // Admin doesn't exist, proceed to create
    }

    if (!existingAdmin) {
      // Creating new super admin
      const admin = new Admin({
        email: 'admin@ohcsf.com',
        password: 'Admin@2025',
      })

      return await app.saveAdmin(admin)
    }
  },
  async (app) => {
    // Deleting super admin if it exists
    try {
      const admin = await app.findFirstRecordByData(
        'admins',
        'email',
        'admin@ohcsf.com'
      )
      if (admin) {
        return await app.deleteAdmin(admin)
      }
    } catch (e) {
      // no-op if admin not found
    }
  }
)
