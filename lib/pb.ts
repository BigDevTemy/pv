import PocketBase from 'pocketbase'

const pb = new PocketBase('http://localhost:8090') // ⚡ use http, not https
export default pb
export const USERS = '/collections/users/records'
export const VERIFY = '/collections/verify/records'
