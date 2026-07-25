"use client"

import { useEffect } from "react"

export default function Eruda() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/eruda"
      script.onload = () => {
        // @ts-ignore
        window.eruda?.init()
      }
      document.body.appendChild(script)
    }
  }, [])

  return null
}
