import React, { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
const ContactForm = lazy(() => import('./ContactForm'))

function Universities() {
  const location = useLocation()
  const logoRef = useRef(null)
  const currentRotateX = useRef(0)
  const currentRotateY = useRef(0)
  const targetRotateX = useRef(0)
  const targetRotateY = useRef(0)
  const animationFrameId = useRef(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [hoveredPartner, setHoveredPartner] = useState(null)
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(null)
  
  // Scroll-lock horizontal state
  const horizontalScrollRef = useRef(null)
  const stickyContainerRef = useRef(null)
  const [horizontalProgress, setHorizontalProgress] = useState(0)

  const partners = [
    {
      name: 'Trinity College',
      image: '/trinitylogo.svg',
      description: `At Trinity College, Grapevne is being implemented in partnership with the Sustainability Department to notify students about available leftover food on campus.

Instead of relying on ad-hoc emails, word of mouth, or last-minute signage, Grapevne provides a simple way to: notify students when surplus food is available, thereby reduce food waste from campus events and meetings, and support sustainability initiatives without adding staff overhead.

The app is launching campus-wide in Spring 2026 as part of Trinity's broader sustainability efforts.`
    }
  ]

  const handlePartnerClick = (index) => {
    setSelectedPartnerIndex(index)
  }

  const handleNext = () => {
    setSelectedPartnerIndex((prev) => (prev + 1) % partners.length)
  }

  const handlePrev = () => {
    setSelectedPartnerIndex((prev) => (prev - 1 + partners.length) % partners.length)
  }

  const handleCloseGallery = () => {
    setSelectedPartnerIndex(null)
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedPartnerIndex !== null) {
        if (e.key === 'ArrowRight' || e.key === '+' || e.key === '=') {
          setSelectedPartnerIndex((prev) => (prev + 1) % partners.length)
        } else if (e.key === 'ArrowLeft' || e.key === '-') {
          setSelectedPartnerIndex((prev) => (prev - 1 + partners.length) % partners.length)
        } else if (e.key === 'Escape') {
          setSelectedPartnerIndex(null)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedPartnerIndex, partners.length])

  useEffect(() => {
    const updateLogoTransform = () => {
      if (logoRef.current) {
        const logo = logoRef.current
        const lerpFactor = 0.6
        currentRotateX.current += (targetRotateX.current - currentRotateX.current) * lerpFactor
        currentRotateY.current += (targetRotateY.current - currentRotateY.current) * lerpFactor
        logo.style.transform = `perspective(1000px) rotateX(${currentRotateX.current}deg) rotateY(${currentRotateY.current}deg)`
      }
      animationFrameId.current = requestAnimationFrame(updateLogoTransform)
    }

    const handleMouseMove = (e) => {
      if (logoRef.current) {
        const logo = logoRef.current
        const rect = logo.getBoundingClientRect()
        const logoCenterX = rect.left + rect.width / 2
        const logoCenterY = rect.top + rect.height / 2
        const dx = e.clientX - logoCenterX
        const dy = e.clientY - logoCenterY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const maxDistance = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight)
        const normalizedDistance = Math.min(distance / maxDistance, 1)
        const influence = normalizedDistance * 0.35 + 0.2
        const angle = Math.atan2(dy, dx)
        const maxRotation = 60
        targetRotateY.current = Math.cos(angle) * maxRotation * influence
        targetRotateX.current = -Math.sin(angle) * maxRotation * influence
      }
    }

    animationFrameId.current = requestAnimationFrame(updateLogoTransform)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  useEffect(() => {
    // Scroll-lock: vertical scroll controls horizontal scroll
    const handleScroll = () => {
      if (!stickyContainerRef.current || !horizontalScrollRef.current) return
      
      const container = stickyContainerRef.current
      const scrollEl = horizontalScrollRef.current
      const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth
      
      if (maxScrollLeft <= 0) return
      
      // Get the container's position
      const containerRect = container.getBoundingClientRect()
      const headerHeight = 140
      
      // Calculate how far we've scrolled into the sticky zone
      const scrollIntoContainer = -containerRect.top + headerHeight
      const scrollRange = container.offsetHeight - window.innerHeight
      
      if (scrollIntoContainer >= 0 && scrollIntoContainer <= scrollRange) {
        // We're in the sticky zone - translate vertical to horizontal
        const progress = Math.min(1, Math.max(0, scrollIntoContainer / scrollRange))
        setHorizontalProgress(progress)
        scrollEl.scrollLeft = progress * maxScrollLeft
      } else if (scrollIntoContainer < 0) {
        // Before sticky zone
        setHorizontalProgress(0)
        scrollEl.scrollLeft = 0
      } else {
        // After sticky zone
        setHorizontalProgress(1)
        scrollEl.scrollLeft = maxScrollLeft
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    setTimeout(handleScroll, 100)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])


  return (
    <div className="min-h-screen bg-white">
      {/* Background Strip */}
      <div className="fixed top-0 left-0 right-0 h-[88px] sm:h-[100px] md:h-[120px] bg-white z-10" />
      
      {/* Header with Logo - always visible */}
      <header className="pt-4 pb-4 px-4 fixed top-0 left-0 right-0 bg-white z-20" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex justify-between items-center gap-2" style={{ perspective: '1000px' }}>
          <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 pl-2 sm:pl-6 md:pl-12 flex-1 min-w-0 flex-shrink">
            <div className="flex flex-col items-center shrink-0">
              <Link to="/universities" className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase whitespace-nowrap py-2 flex items-center" style={{ color: '#1a1a1a' }}>universities</Link>
              {location.pathname === '/universities' && <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />}
            </div>
            {/* brands - commented out for now
            <div className="flex flex-col items-center shrink-0">
              <Link to="/brands" className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase whitespace-nowrap py-2 flex items-center" style={{ color: '#1a1a1a' }}>brands</Link>
              {location.pathname === '/brands' && <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />}
            </div>
            */}
            <div className="flex flex-col items-center shrink-0">
              <Link to="/about" className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase py-2 flex items-center" style={{ color: '#1a1a1a' }}>about</Link>
              {location.pathname === '/about' && <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />}
            </div>
            <div className="flex flex-col items-center shrink-0">
              <Link to="/press" className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase py-2 flex items-center" style={{ color: '#1a1a1a' }}>press</Link>
              {location.pathname === '/press' && <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />}
            </div>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-6 md:pr-12 shrink-0">
            <a href="https://apps.apple.com/us/app/grapevne/id6745459372" target="_blank" rel="noopener noreferrer" className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center whitespace-nowrap shadow-sm" style={{ color: '#1a1a1a' }}>download</a>
            <div className="flex flex-col items-center shrink-0">
              <Link to="/" className="flex justify-center min-h-[44px] min-w-[44px] items-center">
                <img ref={logoRef} src="/filledTransparent.png" alt="Grapevne Logo" className="h-10 sm:h-14 md:h-20 lg:h-28 w-auto"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
              />
              </Link>
              {location.pathname === '/' && <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20" style={{ paddingTop: '140px', paddingBottom: '0' }}>
        <div className="space-y-0">
          {/* Hero Section */}
          <section className="text-left pt-12 pb-8 min-h-[600px] relative pl-8 md:pl-16 pr-8 md:pr-16">
            {/* Partner Pills - absolutely positioned at bottom left of hero section */}
            {partners.map((partner, index) => {
              const rotations = [-2, 1.5]
              const rotation = rotations[index] || 0
              const delays = ['0s', '0.3s']
              const delay = delays[index] || '0s'
              
              // Position at bottom left, stacked vertically - respecting left margin (pl-8 = 2rem, md:pl-16 = 4rem)
              const leftPosition = index === 0 ? '10rem' : '2rem'  // Trinity offset right, Stevens at margin
              const bottomPosition = index === 0 ? '0.5rem' : '4rem'
              
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    bottom: bottomPosition,
                    left: leftPosition,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: hoveredPartner === index ? 1000 : index
                  }}
                >
                  <button
                    onClick={() => handlePartnerClick(index)}
                    className={`partner-pill-bounce border border-black bg-white rounded-full text-base font-medium hover:bg-gray-50 cursor-pointer flex items-center justify-center ${partner.image && partner.name === 'Stevens' ? '' : 'px-6 py-3'}`}
                    onMouseEnter={(e) => {
                      setHoveredPartner(index)
                      e.currentTarget.style.transform = `scale(1.1) rotate(${rotation}deg)`
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      setHoveredPartner(null)
                      e.currentTarget.style.transform = `rotate(${rotation}deg)`
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    style={{
                      color: '#1a1a1a',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      whiteSpace: 'nowrap',
                      padding: partner.image ? (partner.name === 'Stevens' ? '0' : '12px 16px') : undefined,
                      animationDelay: delay,
                      transform: `rotate(${rotation}deg)`
                    }}
                  >
                    {partner.image ? (
                      <img src={partner.image} alt={partner.name} className={partner.name === 'Stevens' ? 'h-24 w-auto object-contain' : 'h-12 w-auto object-contain'} style={partner.name === 'Stevens' ? { margin: '-6px' } : {}} />
                    ) : (
                      <>
                        {partner.name} →
                      </>
                    )}
                  </button>
                </div>
              )
            })}
            
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 relative">
                {/* Header */}
              <h1 className="text-6xl md:text-7xl font-bold leading-tight" style={{ fontFamily: '"Futura Bold", sans-serif' }}>
                  Built for <span style={{ color: 'var(--grapevne-blue)' }}>Universities.</span><br />
                  <span style={{ color: '#1a1a1a' }}>Designed for Students.</span>
              </h1>
              
              {/* 1x5 Grid Image */}
              <div className="grid grid-cols-5 gap-0 -ml-8 md:-ml-16 -mr-8 md:-mr-16" style={{ width: 'calc(100% + 4rem)' }}>
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3', filter: 'grayscale(1)' }}>
                  <img 
                    src="/university.jpg" 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3', filter: 'sepia(1) hue-rotate(60deg) saturate(2)' }}>
                  <img 
                    src="/university2.jpg" 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                  <img 
                    src="/university.jpg" 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3', filter: 'sepia(1) hue-rotate(180deg) saturate(2)' }}>
                  <img 
                    src="/university2.jpg" 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3', filter: 'sepia(1) hue-rotate(300deg) saturate(2)' }}>
                  <img 
                    src="/university.jpg" 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
              
              {/* Subtext under image strip */}
              <p className="text-2xl leading-relaxed font-bold text-right" style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                A shared feed for leftover & free food, on campus.
              </p>
              
              {/* Folder Tabs - commented out */}
              {/*
              <div className="fixed left-0 right-0" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw', minHeight: '120px', bottom: '75px' }}>
                <div 
                  className="absolute py-2 px-6 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#DCDCDC',
                    color: '#1a1a1a',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)',
                    paddingRight: '32px',
                    width: '50%',
                    top: '0',
                    left: '0',
                    height: '120px',
                    zIndex: 1
                  }}
                >
                  Travel
                </div>
                <div 
                  className="absolute py-2 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#3FA9F5',
                    color: 'white',
                    clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    top: '0',
                    left: 'calc(50% - 20px)',
                    right: '0',
                    height: '120px',
                    zIndex: 2
                  }}
                >
                  Energy
                </div>
                <div 
                  className="absolute py-2 px-6 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#3FA9F5',
                    color: 'white',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) calc(100% - 20px), calc(100% - 40px) 100%, 0 100%)',
                    paddingRight: '32px',
                    width: '28%',
                    top: '40px',
                    left: '0',
                    height: '80px',
                    zIndex: 3
                  }}
                >
                  Waste
                </div>
                <div 
                  className="absolute py-2 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    top: '40px',
                    left: 'calc(28% - 20px)',
                    width: '28%',
                    height: '80px',
                    zIndex: 2
                  }}
                >
                  Catering
                </div>
                <div 
                  className="absolute py-2 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#0CAD55',
                    color: 'white',
                    clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    top: '40px',
                    left: 'calc(56% - 40px)',
                    right: '0',
                    height: '40px',
                    zIndex: 3
                  }}
                >
                  Suppliers
                </div>
                <div 
                  className="absolute py-2 px-6 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#F66800',
                    color: 'white',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)',
                    paddingRight: '32px',
                    width: '45%',
                    top: '80px',
                    left: '0',
                    height: '40px',
                    zIndex: 3
                  }}
                >
                  Community
                </div>
                <div 
                  className="absolute py-2 text-sm font-bold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: '#DCDCDC',
                    color: '#1a1a1a',
                    clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    top: '80px',
                    left: 'calc(45% - 20px)',
                    right: '0',
                    height: '40px',
                    zIndex: 4
                  }}
                >
                  Conclusion
                </div>
              </div>
              */}
            </div>
            
          </section>

          {/* Scroll-Locked Horizontal Narrative Section */}
          <div 
            ref={stickyContainerRef}
            style={{ height: '300vh' }}
          >
            <div 
              className="sticky top-[140px] bg-white py-8"
              style={{ height: 'calc(100vh - 180px)' }}
            >
              {/* Progress indicator */}
              <div className="flex items-center mb-8 pl-8 md:pl-16 pr-8 md:pr-16">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-100"
              style={{ 
                      width: `${horizontalProgress * 100}%`,
                      backgroundColor: 'var(--grapevne-blue)'
                    }}
                  />
                </div>
              </div>
              
              {/* Horizontal scroll container - controlled by vertical scroll */}
              <div 
                ref={horizontalScrollRef}
                id="narrative-scroll"
                className="flex gap-8 overflow-x-hidden pb-4 h-full items-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Card 1: Place and trust */}
                <div className="flex-shrink-0 w-80 md:w-96 pl-8 md:pl-16" style={{ minWidth: '320px' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                    Place and trust.
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    Things work better when they're built for the place they're used. Everything you see is specific to your campus.
                  </p>
                  <p className="text-base leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    Students, organizers, and campus affiliates join through their university.
                  </p>
                </div>

                {/* Card 2: Shared by the people already there */}
                <div className="flex-shrink-0 w-80 md:w-96" style={{ minWidth: '320px' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                    Shared by the people already there.
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    Posting takes seconds. Checking takes even less. When students are looking, they know where to check.
                  </p>
                  <p className="text-base leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    It's the same place. Every time.
                  </p>
                </div>

                {/* Card 3: Make it legible */}
                <div className="flex-shrink-0 w-80 md:w-96" style={{ minWidth: '320px' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                    Make it legible.
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    Built for campus life. Clear. Immediate. Uncluttered.
                  </p>
                  <p className="text-base leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    When free food becomes available, students hear about it in time. Designed to feel like second nature.
                  </p>
                </div>
                
                {/* Card 4: Real Impact */}
                <div className="flex-shrink-0 w-80 md:w-96" style={{ minWidth: '320px' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                    Real Impact.
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    When sharing happens in one place, it's easier to see what's actually happening.
                  </p>
                  <p className="text-base leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    That visibility supports sustainability reporting and planning, without adding work for students or staff.
                  </p>
                </div>

                {/* Card 5: It becomes routine */}
                <div className="flex-shrink-0 w-80 md:w-96 pr-8 md:pr-16" style={{ minWidth: '320px' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                    It becomes routine.
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    It takes less effort than the alternatives. So people keep using it.
                  </p>
                  <p className="text-base leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
                    And when people keep using it, it becomes the place campus turns to.
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* Final Section: Full-Screen Device Mockup */}
          <section 
            className="min-h-[40vh] py-16 flex flex-col items-center justify-center px-8 md:px-16 relative"
            style={{ backgroundColor: '#fafafa' }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-10" style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}>
                If there's free food, students know.
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-left mb-10" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a1a', fontFamily: '"Futura Bold", sans-serif' }}>Data-Driven Decision Making</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#444', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    Real-time behavioral data on food sharing, including post creation, engagement, and check-in rates, translates into visibility on waste reduction and surplus redistribution patterns.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a1a', fontFamily: '"Futura Bold", sans-serif' }}>Financial Optimization</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#444', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    Campus-specific analytics on daily active users, weekly posts, and conversion metrics help you spend effectively and track how well surplus food reaches students before it becomes waste.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a1a', fontFamily: '"Futura Bold", sans-serif' }}>Innovation</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#444', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    Digitizing the surplus-to-demand pipeline turns your campus into a living test bed for zero-waste initiatives and carbon footprint reduction.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a1a', fontFamily: '"Futura Bold", sans-serif' }}>Student Experience</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#444', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    Accessible solutions inspired by humanity and powered by technology, removing barriers to food access and promoting environmentally conscious behavior on campus.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="inline-block bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
              >
                {isFormOpen ? 'Close Form' : 'Get in Touch'}
              </button>
            </div>
          </section>

          {/* Contact Form - lazy loaded when opened */}
          <section className="transition-all duration-500 ease-in-out px-8 md:px-16 pb-8">
            {isFormOpen && (
              <Suspense fallback={null}>
                <ContactForm 
                  isOpen={isFormOpen} 
                  onClose={() => setIsFormOpen(false)}
                  emailTo="universities@grapevneapp.com"
                />
              </Suspense>
            )}
          </section>

        </div>
      </main>

      {/* Partner Gallery Modal */}
      {selectedPartnerIndex !== null && (
        <div 
          className="fixed inset-0 bg-white z-50 flex items-center justify-center"
          style={{ backgroundColor: '#ffffff' }}
          onClick={handleCloseGallery}
        >
          <div 
            className="relative w-full h-full flex flex-col items-center justify-center px-8 py-12 max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseGallery}
              className="fixed right-8 md:right-16 top-8 text-xl md:text-2xl font-bold z-10"
              style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}
            >
              exit
            </button>

            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              className="fixed left-8 md:left-16 top-1/2 transform -translate-y-1/2 text-5xl md:text-6xl font-bold z-10 transition-colors"
              style={{ color: '#1a1a1a' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--grapevne-blue)'}
              onMouseLeave={(e) => e.target.style.color = '#1a1a1a'}
            >
              −
            </button>
            <button
              onClick={handleNext}
              className="fixed right-8 md:right-16 top-1/2 transform -translate-y-1/2 text-5xl md:text-6xl font-bold z-10 transition-colors"
              style={{ color: '#1a1a1a' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--grapevne-blue)'}
              onMouseLeave={(e) => e.target.style.color = '#1a1a1a'}
            >
              +
            </button>

            {/* Gallery content */}
            <div className="flex flex-col items-center w-full">
              {/* Partner Pill */}
              <div className="mb-6 w-full flex justify-start">
                <div
                  className={`border border-black bg-white rounded-full flex items-center justify-center ${partners[selectedPartnerIndex].name === 'Stevens' ? '' : 'px-6 py-3'}`}
                  style={{
                    transform: `rotate(${partners[selectedPartnerIndex].name === 'Trinity College' ? '-2deg' : '1.5deg'})`,
                    padding: partners[selectedPartnerIndex].image ? (partners[selectedPartnerIndex].name === 'Stevens' ? '0' : '12px 16px') : undefined
                  }}
                >
                  {partners[selectedPartnerIndex].image ? (
                    <img 
                      src={partners[selectedPartnerIndex].image} 
                      alt={partners[selectedPartnerIndex].name} 
                      className={partners[selectedPartnerIndex].name === 'Stevens' ? 'h-24 w-auto object-contain' : 'h-12 w-auto object-contain'} 
                      style={partners[selectedPartnerIndex].name === 'Stevens' ? { margin: '-6px' } : {}} 
                    />
                  ) : (
                    <>
                      {partners[selectedPartnerIndex].name} →
                    </>
                  )}
                </div>
              </div>

              {/* Black bar */}
              <div className="w-full h-1 bg-black mb-6"></div>

              {/* Description */}
              <div 
                className="text-lg md:text-xl mb-8 w-full whitespace-pre-line"
                style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: '1.6', textAlign: 'justify' }}
              >
                {partners[selectedPartnerIndex].description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - anchored to bottom of page */}
      <footer className="pt-3 pb-4 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-1">
          <div className="flex justify-center items-center gap-3">
            <span className="ip-symbol" style={{ transform: 'translateY(-1px)', color: '#1a1a1a' }}>®</span>
            <span className="ip-symbol" style={{ transform: 'translateY(1px)', color: '#1a1a1a' }}>™</span>
            <span className="ip-symbol" style={{ transform: 'translateY(-1px)', color: '#1a1a1a' }}>©</span>
          </div>
          <div className="flex justify-center items-center gap-3 text-xs text-gray-600">
            <span className="text-gray-400 font-medium">USE CASES</span>
            <Link to="/universities" className="hover-grapevne-blue transition-colors footer-link">Universities</Link>
            {/* <Link to="/brands" className="hover-grapevne-blue transition-colors footer-link">Brands</Link> */}
            <span className="text-gray-400 font-medium ml-2">LEGAL AREA</span>
            <Link to="/terms" className="hover-grapevne-blue transition-colors footer-link">Terms</Link>
            <Link to="/privacy" className="hover-grapevne-blue transition-colors footer-link">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Universities