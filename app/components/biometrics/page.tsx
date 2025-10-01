'use client'
import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import pb from '@/lib/pb'
import Alert from '../Alert'

export default function Biometrics({
  onVerifySuccess,
  onSkip,
  ippsId,
}: {
  onVerifySuccess?: () => void
  onSkip?: (error: string) => void
  ippsId?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [referenceDescriptor, setReferenceDescriptor] =
    useState<Float32Array | null>(null)
  const [loadingReference, setLoadingReference] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [photoNotFound, setPhotoNotFound] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load models + start webcam
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        if (videoRef.current) videoRef.current.srcObject = stream

        setIsModelLoaded(true)
      } catch (error) {
        console.error('Error loading models:', error)
        setError(
          'Failed to load face recognition models. Please check the model files.'
        )
      }
    }
    loadModels()
  }, [])

  // Capture face descriptor from webcam
  const captureDescriptor = async (): Promise<Float32Array | null> => {
    if (!videoRef.current || !isModelLoaded) return null
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    return detection ? detection.descriptor : null
  }

  // Load reference descriptor from employee photo
  useEffect(() => {
    if (ippsId && isModelLoaded) {
      const loadReference = async () => {
        setLoadingReference(true)
        try {
          const employees = await pb.collection('employees').getFullList({
            filter: `ippsId = "${ippsId}"`,
          })
          if (employees.length > 0 && employees[0].photo) {
            const photoUrl = pb.files.getUrl(employees[0], employees[0].photo)
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = async () => {
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor()
              if (detection) {
                setReferenceDescriptor(detection.descriptor)
              } else {
                setError('No face detected in employee photo.')
              }
              setLoadingReference(false)
            }
            img.src = photoUrl
          } else {
            setPhotoNotFound(true)
            setError("Employee's Photo not found.")
            setLoadingReference(false)
          }
        } catch (error) {
          console.error('Error loading reference:', error)
          setError('Failed to load employee photo.')
        } finally {
          setLoadingReference(false)
        }
      }
      loadReference()
    }
  }, [ippsId, isModelLoaded])

  // Skip verification
  const handleSkip = () => {
    onVerifySuccess?.()
  }

  // Verify against reference face
  const handleVerify = async () => {
    if (!referenceDescriptor) {
      setError('Reference face not loaded!')
      return
    }
    setVerifying(true)
    const liveDescriptor = await captureDescriptor()
    setVerifying(false)

    if (liveDescriptor) {
      const distance = faceapi.euclideanDistance(
        referenceDescriptor,
        liveDescriptor
      )
      if (distance < 0.5) {
        setMessage('Face verification successful!')
        setTimeout(() => {
          onVerifySuccess?.()
        }, 2000)
      } else {
        setError(
          '❌ Face does not match (distance: ' + distance.toFixed(2) + ')'
        )
      }
    } else {
      setError('❌ No face detected in camera!')
    }
  }

  return (
    <div className='flex flex-col items-center gap-4'>
      {error && (
        <Alert type='error' message={error} onClose={() => setError('')} />
      )}
      {message && (
        <Alert
          type='success'
          message={message}
          onClose={() => setMessage('')}
        />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        width={400}
        height={300}
        className='rounded-xl shadow'
      />
      <div className='flex flex-col gap-2'>
        {loadingReference && (
          <p className='text-center'>Loading reference image...</p>
        )}
        {photoNotFound ? (
          <button
            onClick={handleSkip}
            className='px-4 py-2 bg-yellow-500 text-white rounded-xl'
          >
            Skip
          </button>
        ) : error === 'No face detected in employee photo.' ? (
          <button
            onClick={() => onSkip?.(error)}
            className='px-4 py-2 bg-yellow-500 text-white rounded-xl'
          >
            Skip Facial
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={!referenceDescriptor || verifying}
            className='px-4 py-2 bg-green-500 text-white rounded-xl disabled:opacity-50'
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  )
}
