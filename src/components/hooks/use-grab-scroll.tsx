import type React from "react"

import { useState, useEffect, type RefObject } from "react"

interface UseGrabScrollProps {
  ref: RefObject<HTMLElement>
  isGrabMode: boolean
}

export function useGrabScroll({ ref, isGrabMode }: UseGrabScrollProps) {
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  // This function handles the mouse down event when in grab mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isGrabMode || !ref.current) return

    e.preventDefault() // Prevent default behavior
    setIsGrabbing(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
    setScrollLeft(ref.current.scrollLeft)
    setScrollTop(ref.current.scrollTop)
  }

  // This function handles the mouse up event
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isGrabMode) return

    e.preventDefault() // Prevent default behavior
    setIsGrabbing(false)
  }

  // This function handles the mouse move event when grabbing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isGrabbing || !ref.current || !isGrabMode) return

    e.preventDefault() // Prevent default behavior

    // Calculate distance moved
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    // Update scroll position
    ref.current.scrollLeft = scrollLeft - dx
    ref.current.scrollTop = scrollTop - dy
  }

  // Clean up event listeners and prevent default space behavior
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isGrabbing) {
        setIsGrabbing(false)
      }
    }

    // Prevent space key from scrolling the page
    const preventSpaceScroll = (e: KeyboardEvent) => {
      if (e.code === "Space" && isGrabMode) {
        e.preventDefault()
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("keydown", preventSpaceScroll, { passive: false })

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("keydown", preventSpaceScroll)
    }
  }, [isGrabbing, isGrabMode])

  return {
    containerProps: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseUp,
    },
    isGrabbing,
  }
}
