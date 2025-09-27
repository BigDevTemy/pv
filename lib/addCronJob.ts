import api from '../app/components/Serverurls'

interface CronJobData {
  name: string
  schedule: string
  command: string
  // Add other fields as necessary
}

export async function getCronJobs() {
  try {
    const response = await api.get('/crons')
    return response.data
  } catch (error: unknown) {
    console.error('Error fetching cron jobs:', error)
    throw error
  }
}

export async function addCronJob(cronJobData: CronJobData) {
  try {
    // Check if cron job already exists
    const existingCrons = await getCronJobs()
    const exists = existingCrons.some(
      (cron: unknown) => (cron as { name: string }).name === cronJobData.name
    )
    if (exists) {
      console.log('Cron job already exists:', cronJobData.name)
      return null
    }

    const response = await api.post('/crons', cronJobData)
    console.log('Cron job added:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Error adding cron job:', error)
    throw error
  }
}
