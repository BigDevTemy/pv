import { useEffect } from 'react'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Error from '@mui/icons-material/Error'
import Warning from '@mui/icons-material/Warning'
import Info from '@mui/icons-material/Info'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function Alert({
  type,
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: AlertProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose, autoCloseDelay])

  const getAlertClasses = () => {
    const baseClasses =
      'p-4 mb-4 text-sm rounded-lg flex items-center justify-between'
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-100 border border-green-400 text-green-700`
      case 'error':
        return `${baseClasses} bg-red-100 border border-red-400 text-red-700`
      case 'warning':
        return `${baseClasses} bg-yellow-100 border border-yellow-400 text-yellow-700`
      case 'info':
        return `${baseClasses} bg-blue-100 border border-blue-400 text-blue-700`
      default:
        return `${baseClasses} bg-gray-100 border border-gray-400 text-gray-700`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 mr-2' />
      case 'error':
        return <Error className='w-5 h-5 mr-2' />
      case 'warning':
        return <Warning className='w-5 h-5 mr-2' />
      case 'info':
        return <Info className='w-5 h-5 mr-2' />
      default:
        return null
    }
  }

  return (
    <div className={getAlertClasses()}>
      <div className='flex items-center'>
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className='ml-4 text-lg font-bold leading-none hover:opacity-75'
        >
          ×
        </button>
      )}
    </div>
  )
}
