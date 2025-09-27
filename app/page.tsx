export default function Home() {
  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
      <h1>Personal Verification PRO</h1>
      <div className='text-center'>
        <a href='/login' className='text-primaryy hover:underline'>
          Login
        </a>{' '}
        |{' '}
        <a href='/signup' className='text-primaryy hover:underline'>
          Signup
        </a>{' '}
        |{' '}
        <a href='/biometrics' className='text-primaryy hover:underline'>
          Biometrics
        </a>
      </div>
    </div>
  )
}
