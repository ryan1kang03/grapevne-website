import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Home from './Home'
import Press from './Press'
import Brands from './Brands'
import Terms from './Terms'
const Universities = lazy(() => import('./Universities'))
import Privacy from './Privacy'
import Ambassadors from './Ambassadors'
import About from './About'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  useEffect(() => {
    let topHandle = null
    let bottomHandle = null
    let topLine = null
    let bottomLine = null

    const createHandles = () => {
      // Remove existing handles
      if (topHandle) topHandle.remove()
      if (bottomHandle) bottomHandle.remove()
      if (topLine) topLine.remove()
      if (bottomLine) bottomLine.remove()

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        return
      }

      const range = selection.getRangeAt(0)
      
      // Get start and end positions for multi-line selections
      const startRange = range.cloneRange()
      startRange.collapse(true) // Collapse to start
      const startRect = startRange.getBoundingClientRect()
      
      const endRange = range.cloneRange()
      endRange.collapse(false) // Collapse to end
      const endRect = endRange.getBoundingClientRect()

      // Check if rects are valid
      if ((startRect.width === 0 && startRect.height === 0) || (endRect.width === 0 && endRect.height === 0)) {
        return
      }

      const handleSize = 12
      const handleOffset = 12 // Distance from corner to handle center
      const lineWidth = 2
      
      // Top handle: positioned at start of selection (top-left)
      topHandle = document.createElement('div')
      topHandle.className = 'selection-handle'
      topHandle.style.position = 'fixed'
      topHandle.style.left = startRect.left + 'px'
      topHandle.style.top = (startRect.top - handleOffset) + 'px'
      topHandle.style.zIndex = '10000'
      document.body.appendChild(topHandle)

      // Top line: connects handle center to start position
      topLine = document.createElement('div')
      topLine.className = 'selection-handle-line'
      topLine.style.position = 'fixed'
      topLine.style.left = (startRect.left - lineWidth / 2) + 'px'
      topLine.style.top = (startRect.top - handleOffset) + 'px'
      topLine.style.height = handleOffset + 'px'
      topLine.style.zIndex = '9999'
      document.body.appendChild(topLine)

      // Bottom handle: positioned at end of selection (bottom-right)
      bottomHandle = document.createElement('div')
      bottomHandle.className = 'selection-handle'
      bottomHandle.style.position = 'fixed'
      bottomHandle.style.left = endRect.right + 'px'
      bottomHandle.style.top = (endRect.bottom + handleOffset) + 'px'
      bottomHandle.style.zIndex = '10000'
      document.body.appendChild(bottomHandle)

      // Bottom line: connects end position to handle center
      bottomLine = document.createElement('div')
      bottomLine.className = 'selection-handle-line'
      bottomLine.style.position = 'fixed'
      bottomLine.style.left = (endRect.right - lineWidth / 2) + 'px'
      bottomLine.style.top = endRect.bottom + 'px'
      bottomLine.style.height = handleOffset + 'px'
      bottomLine.style.zIndex = '9999'
      document.body.appendChild(bottomLine)
    }

    const removeHandles = () => {
      if (topHandle) {
        topHandle.remove()
        topHandle = null
      }
      if (bottomHandle) {
        bottomHandle.remove()
        bottomHandle = null
      }
      if (topLine) {
        topLine.remove()
        topLine = null
      }
      if (bottomLine) {
        bottomLine.remove()
        bottomLine = null
      }
    }

    const handleSelection = () => {
      // Small delay to ensure selection is fully updated
      setTimeout(() => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
          createHandles()
        } else {
          removeHandles()
        }
      }, 0)
    }

    const handleClick = (e) => {
      // Small delay to let selection update
      setTimeout(() => {
        handleSelection()
      }, 10)
    }

    const handleScroll = () => {
      // Update handle positions when scrolling
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
        createHandles()
      }
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('keyup', handleSelection)
    document.addEventListener('click', handleClick)
    document.addEventListener('selectionchange', handleSelection)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('keyup', handleSelection)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('selectionchange', handleSelection)
      window.removeEventListener('scroll', handleScroll, true)
      removeHandles()
    }
  }, [])

  return (
    <Router basename="/grapevne-website">
      <ScrollToTop />
      <Analytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/press" element={<Press />} />
        <Route path="/about" element={<About />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/universities" element={<Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}><Universities /></Suspense>} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/ambassadors" element={<Ambassadors />} />
      </Routes>
    </Router>
  )
}

export default App

