'use client'
import Image from 'next/image'
import Logo1m from '../images/logo1m.png'

export default function Signup() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-primaryy py-12 px-4 sm:px-6 lg:px-8'>
      <div className='flex-[0.5]'>
        <Image src={Logo1m} alt='Logo' className='flex-1' />
      </div>
      <div className='flex-[0.5] h-auto max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Create your account
          </h2>
        </div>
        <form className='mt-8 space-y-6' action='#' method='POST'>
          <input type='hidden' name='remember' defaultValue='true' />
          <div className='rounded-md shadow-sm -space-y-px'>
            <div className='mb-2'>
              <label htmlFor='full-name' className='sr-only'>
                Full Name
              </label>
              <input
                id='full-name'
                name='name'
                type='text'
                autoComplete='name'
                required
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy focus:z-10 sm:text-sm'
                placeholder='Full Name'
              />
            </div>
            <div className='mb-2'>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy focus:z-10 sm:text-sm'
                placeholder='Email address'
              />
            </div>
            <div className='mb-2'>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy focus:z-10 sm:text-sm'
                placeholder='Password'
              />
            </div>
            <div className='mb-2'>
              <label htmlFor='confirm-password' className='sr-only'>
                Confirm Password
              </label>
              <input
                id='confirm-password'
                name='confirm-password'
                type='password'
                autoComplete='new-password'
                required
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primaryy focus:border-primaryy focus:z-10 sm:text-sm'
                placeholder='Confirm Password'
              />
            </div>
          </div>
          <div className='flex items-center'>
            <input
              id='terms'
              name='terms'
              type='checkbox'
              required
              className='h-4 w-4 text-primaryy focus:ring-primaryy border-gray-300 rounded'
            />
            <label htmlFor='terms' className='ml-2 block text-sm text-gray-900'>
              I agree to the{' '}
              <a href='#' className='text-primaryy hover:text-primaryy'>
                Terms and Conditions
              </a>
            </label>
          </div>
          <div>
            <button
              type='submit'
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primaryy hover:bg-primaryx focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryy'
            >
              Sign up
            </button>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <a
                href='#'
                className='font-medium text-primaryy hover:text-primaryy'
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
