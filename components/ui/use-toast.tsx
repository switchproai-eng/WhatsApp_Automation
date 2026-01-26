"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useToast() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      toast,
    }
  }

  return {
    toast
  }
}
