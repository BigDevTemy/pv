import pb from './pb'

interface CloudVerification {
  ippsId: string
  status: string
  submittedAt: string
  employeeRef: string
  verificationData: Record<string, unknown>
  issues: Record<string, unknown>
  cc_id: number
  submittedBy: string
  verify_by: number
  synced: number
  // Add other fields as needed
}

export async function syncVerificationsToCloud() {
  try {
    // Fetch unsynced and completed verifications from PocketBase
    const verifications = await pb.collection('verifications').getFullList({
      filter: 'synced = 0 && status = "complete"',
    })

    // Transform data if needed
    const transformedData: CloudVerification[] = verifications.map((v) => ({
      ippsId: v.ippsId,
      status: v.status,
      submittedAt: v.submittedAt,
      employeeRef: v.employeeRef,
      verificationData: v.verificationData,
      issues: v.issues,
      cc_id: v.cc_id,
      submittedBy: v.submittedBy,
      verify_by: v.verify_by,
      synced: v.synced,
    }))

    // Send to cloud DB endpoint
    const response = await fetch(
      'https://your-cloud-db-endpoint.com/api/sync-verifications',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify({ verifications: transformedData }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Sync successful:', result)

    // Mark verifications as synced
    for (const v of verifications) {
      await pb.collection('verifications').update(v.id, { synced: 1 })
    }
  } catch (error) {
    console.error('Failed to sync verifications:', error)
  }
}

// For running as a cron job
export function startSyncWorker() {
  // Run immediately
  syncVerificationsToCloud()

  // Then every 15 minutes
  setInterval(syncVerificationsToCloud, 15 * 60 * 1000)
}
