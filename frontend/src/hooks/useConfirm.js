import { useState, useCallback } from 'react'

export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, resolve: null, options: {} })

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, resolve, options })
    })
  }, [])

  function handleConfirm() {
    state.resolve(true)
    setState({ isOpen: false, resolve: null, options: {} })
  }

  function handleCancel() {
    state.resolve(false)
    setState({ isOpen: false, resolve: null, options: {} })
  }

  return { confirm, isOpen: state.isOpen, options: state.options, handleConfirm, handleCancel }
}
