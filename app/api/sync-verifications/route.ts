import { NextResponse } from 'next/server'
import { syncVerificationsToCloud } from '@/lib/sync-verifications'

export async function POST() {
  try {
    await syncVerificationsToCloud()
    return NextResponse.json({ success: true, message: 'Sync completed' })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    )
  }
}
