"use client"

import type React from "react"

// Adapted from https://ui.shadcn.com/docs/components/toast
import { useEffect, useState } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toasts: ToasterToast[] = []

type Toast = Omit<ToasterToast, "id">

function useToast() {
  const [mounted, setMounted] = useState(false)
  const [toastState, setToastState] = useState<ToasterToast[]>([])

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      setToastState(toasts)
    }
  }, [mounted, toasts])

  function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: Toast) => {
      setToastState((state) => {
        const newState = state.map((t) => (t.id === id ? { ...t, ...props } : t))
        toasts.splice(0, toasts.length, ...newState)
        return newState
      })
    }

    const dismiss = () => {
      setToastState((state) => {
        const newState = state.filter((t) => t.id !== id)
        toasts.splice(0, toasts.length, ...newState)
        return newState
      })
    }

    setToastState((state) => {
      if (state.length >= TOAST_LIMIT) {
        state.shift()
      }
      const newState = [...state, { id, ...props }]
      toasts.splice(0, toasts.length, ...newState)
      return newState
    })

    return {
      id,
      dismiss,
      update,
    }
  }

  return {
    toast,
    toasts: toastState,
    dismiss: (toastId?: string) => {
      setToastState((state) => {
        const newState = toastId ? state.filter((t) => t.id !== toastId) : []
        toasts.splice(0, toasts.length, ...newState)
        return newState
      })
    },
  }
}

export { useToast }
