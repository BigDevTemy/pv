import PocketBase from 'pocketbase'

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8091'
)

//const pb = new PocketBase('http://localhost:8090') // ⚡ use http, not https
export default pb
export const USERS = '/collections/users/records'
export const VERIFY = '/collections/verify/records'
