import { toast } from 'react-toastify'
import { useState, createElement } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

interface ConfirmOptions {
  onConfirm?: () => void
  onCancel?: () => void
  title?: string
  confirmText?: string
  cancelText?: string
}

export function useNotification() {

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    message: string
    options: ConfirmOptions
  }>({
    open: false,
    message: '',
    options: {}
  })

  const confirm = (message: string, options: ConfirmOptions = {}) => {
    setConfirmState({
      open: true,
      message,
      options
    })
  }

  const handleConfirm = () => {
    confirmState.options.onConfirm?.()
    setConfirmState({ open: false, message: '', options: {} })
  }

  const handleCancel = () => {
    confirmState.options.onCancel?.()
    setConfirmState({ open: false, message: '', options: {} })
  }

  const ConfirmDialog = () => {
    return createElement(
      Dialog,
      {
        open: confirmState.open,
        onClose: handleCancel,
        maxWidth: 'sm' as const,
        fullWidth: true
      },
      createElement(
        DialogTitle,
        { className: 'text-[18px] font-medium' },
        confirmState.options.title || 'Confirmation'
      ),
      createElement(
        DialogContent,
        null,
        createElement(Typography, { className: 'text-[15px] leading-[22px] text-[#2F2B3D99]' }, confirmState.message)
      ),
      createElement(
        DialogActions,
        { className: 'p-3' },
        createElement(
          Button,
          {
            variant: 'outlined' as const,
            onClick: handleCancel,
            className: 'rounded-full'
          },
          confirmState.options.cancelText || 'Cancel'
        ),
        createElement(
          Button,
          {
            variant: 'contained' as const,
            onClick: handleConfirm,
            className: 'bg-[#3651f2] text-white rounded-full',
            color: 'primary' as const
          },
          confirmState.options.confirmText || 'Confirm'
        )
      )
    )
  }

  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    confirm,
    ConfirmDialog
  }
}
