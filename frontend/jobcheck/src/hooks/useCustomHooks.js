import { useState, useCallback } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const show = useCallback((message, type = 'info', duration = 5000) => {
    setNotification({ message, type })
    if (duration) {
      setTimeout(() => setNotification(null), duration)
    }
  }, [])

  const hide = useCallback(() => {
    setNotification(null)
  }, [])

  return { notification, show, hide }
}

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit, setErrors, reset, setValues }
}
