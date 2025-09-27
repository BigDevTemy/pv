// PocketBase migration: create "exceptions" collection for unfetched employee details
migrate(
  (db) => {
    const dao = new Dao(db);

    // Try to link created_by to default users collection if present
    let usersId = null;
    try {
      usersId = dao.findCollectionByNameOrId("_pb_users_auth_")?.id || null;
    } catch (e) {
      usersId = null;
    }

    // Create "exceptions" collection
    const exceptions = new Collection({
      "id": "exceptions00001",
      "name": "exceptions",
      "type": "base",
      "system": false,
      "schema": [
        // ipps_id (required, not unique in case multiple logs happen for same id)
        { "system": false, "id": "exc_ipps001", "name": "ipps_id", "type": "text", "required": true, "unique": false, "options": { "min": null, "max": null, "pattern": "" } },

        // basic identity
        { "system": false, "id": "exc_fnm0001", "name": "firstname", "type": "text", "required": false, "unique": false, "options": { "min": null, "max": null, "pattern": "" } },
        { "system": false, "id": "exc_lnm0001", "name": "lastname", "type": "text", "required": false, "unique": false, "options": { "min": null, "max": null, "pattern": "" } },

        // dob
        { "system": false, "id": "exc_dob0001", "name": "date_of_birth", "type": "date", "required": false, "unique": false, "options": {} },

        // department text
        { "system": false, "id": "exc_dept001", "name": "department", "type": "text", "required": false, "unique": false, "options": { "min": null, "max": null, "pattern": "" } },

        // created_by - prefer relation to users if available; else text fallback
        ...(usersId ? [{
          "system": false,
          "id": "exc_cby0001",
          "name": "created_by",
          "type": "relation",
          "required": true,
          "unique": false,
          "options": {
            "collectionId": usersId,
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": []
          }
        }] : [{
          "system": false,
          "id": "exc_cbytxt1",
          "name": "created_by",
          "type": "text",
          "required": true,
          "unique": false,
          "options": { "min": null, "max": null, "pattern": "" }
        }])
      ],
      "indexes": [
        "CREATE INDEX idx_exceptions_ipps_id ON exceptions (ipps_id)"
      ],
      // PocketBase automatically adds/maintains system fields "created" and "updated"
      "listRule": null,
      "viewRule": null,
      "createRule": null,
      "updateRule": null,
      "deleteRule": null
    });

    return dao.saveCollection(exceptions);
  },
  (db) => {
    const dao = new Dao(db);
    try {
      const coll = dao.findCollectionByNameOrId("exceptions");
      return dao.deleteCollection(coll);
    } catch (e) {
      // no-op if already removed
    }
  }
);