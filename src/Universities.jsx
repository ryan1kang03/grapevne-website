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
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const formSectionRef = useRef(null)

  // Scroll-lock horizontal state
  const horizontalScrollRef = useRef(null)
  const stickyContainerRef = useRef(null)
  const [horizontalProgress, setHorizontalProgress] = useState(0)
  const revealRefs = useRef([])
  const [visibleSections, setVisibleSections] = useState({})

  const setRevealRef = (index) => (el) => {
    if (el) revealRefs.current[index] = el
  }

  const getRevealStyle = (index, delay = 0) => ({
    opacity: visibleSections[index] ? 1 : 0,
    transform: visibleSections[index] ? 'translateY(0px)' : 'translateY(28px)',
    transition: `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: 'opacity, transform'
  })
  const partners = [
    {
      name: 'Trinity College',
      image: '/trinitylogo.svg',
      description: `At Trinity College, Grapevne is being implemented in partnership with the Sustainability Department to make student response more visible in one place.

Instead of relying on ad-hoc emails, word of mouth, or last-minute signage, Grapevne gives campuses a clearer way to understand what students notice, engage with, and show up for.

The app is launching campus-wide in Spring 2026 as part of Trinity's broader sustainability efforts.`
    }
  ]

  const faqs = [
    {
      question: 'What does Grapevne actually track?',
      answer:
        'Grapevne can surface interaction signals like swipes, saves, engagement patterns, timing windows, and which posts generate attention. The point is to make student response more legible instead of leaving activity scattered across disconnected systems.'
    },
    {
      question: 'Can campuses learn which events students care about?',
      answer:
        'Yes. When students interact with posts in one place, campuses can better understand what gets traction, what time windows perform best, and which kinds of events or drops generate the most response.'
    },
    {
      question: 'Who posts on Grapevne?',
      answer:
        'Posts can come from student organizations, campus departments, approved affiliates, or other university-connected groups. Grapevne makes that activity easier to distribute and easier to understand.'
    },
    {
      question: 'Does this create more work for staff?',
      answer:
        'The goal is the opposite. Grapevne is meant to reduce friction by making distribution and student response easier to see, without relying on scattered email threads, group chats, or manual tracking.'
    },
    {
      question: 'Is it specific to each campus?',
      answer:
        'Yes. Grapevne is designed to feel local to the university using it. Students are not entering a generic public feed. They are interacting inside a campus-specific environment.'
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

      const containerRect = container.getBoundingClientRect()
      const headerHeight = 140
      const scrollIntoContainer = -containerRect.top + headerHeight
      const scrollRange = container.offsetHeight - window.innerHeight

      if (scrollIntoContainer >= 0 && scrollIntoContainer <= scrollRange) {
        const progress = Math.min(1, Math.max(0, scrollIntoContainer / scrollRange))
        setHorizontalProgress(progress)
        scrollEl.scrollLeft = progress * maxScrollLeft
      } else if (scrollIntoContainer < 0) {
        setHorizontalProgress(0)
        scrollEl.scrollLeft = 0
      } else {
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
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.revealIndex)
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [index]: true }))
          }
        })
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -12% 0px'
      }
    )

    revealRefs.current.forEach((el, index) => {
      if (el) {
        el.dataset.revealIndex = index
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
  if (isFormOpen && formSectionRef.current) {
    const timer = setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 120)

    return () => clearTimeout(timer)
  }
}, [isFormOpen])

  return (
    <div className="min-h-screen bg-white">
      {/* Background Strip */}
      <div className="fixed top-0 left-0 right-0 h-[88px] sm:h-[100px] md:h-[120px] bg-white z-10" />

      {/* Header with Logo - always visible */}
      <header
        className="pt-4 pb-4 px-4 fixed top-0 left-0 right-0 bg-white z-20"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex justify-between items-center gap-2" style={{ perspective: '1000px' }}>
          <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 pl-2 sm:pl-6 md:pl-12 flex-1 min-w-0 flex-shrink">
            <div className="flex flex-col items-center shrink-0">
              <Link
                to="/universities"
                className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase whitespace-nowrap py-2 flex items-center"
                style={{ color: '#1a1a1a' }}
              >
                universities
              </Link>
              {location.pathname === '/universities' && (
                <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />
              )}
            </div>

            <div className="flex flex-col items-center shrink-0">
              <Link
                to="/about"
                className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase py-2 flex items-center"
                style={{ color: '#1a1a1a' }}
              >
                about
              </Link>
              {location.pathname === '/about' && (
                <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />
              )}
            </div>

            <div className="flex flex-col items-center shrink-0">
              <Link
                to="/press"
                className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase py-2 flex items-center"
                style={{ color: '#1a1a1a' }}
              >
                press
              </Link>
              {location.pathname === '/press' && (
                <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-6 md:pr-12 shrink-0">
            <a
              href="https://apps.apple.com/us/app/grapevne/id6745459372"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] sm:text-base md:text-lg font-bold hover-grapevne-blue transition-colors lowercase px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center whitespace-nowrap shadow-sm"
              style={{ color: '#1a1a1a' }}
            >
              download
            </a>
            <div className="flex flex-col items-center shrink-0">
              <Link to="/" className="flex justify-center min-h-[44px] min-w-[44px] items-center">
                <img
                  ref={logoRef}
                  src="/filledTransparent.png"
                  alt="Grapevne Logo"
                  className="h-10 sm:h-14 md:h-20 lg:h-28 w-auto"
                  style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform'
                  }}
                />
              </Link>
              {location.pathname === '/' && (
                <div className="w-1.5 h-1.5 rounded-full -mt-1" style={{ backgroundColor: 'var(--grapevne-blue)' }} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20" style={{ paddingTop: '140px', paddingBottom: '0' }}>
        <div className="space-y-16">
          {/* Hero Section */}
          <section className="text-left pt-12 pb-8 min-h-[600px] relative pl-8 md:pl-16 pr-8 md:pr-16">
            {/* Partner Pills - absolutely positioned at bottom left of hero section */}
            {partners.map((partner, index) => {
              const rotations = [-2, 1.5]
              const rotation = rotations[index] || 0
              const delays = ['0s', '0.3s']
              const delay = delays[index] || '0s'

              const leftPosition = index === 0 ? '10rem' : '2rem'
              const bottomPosition = index === 0 ? '-3rem' : '1rem'

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
                    className="partner-pill-bounce border border-black bg-white rounded-full text-base font-medium hover:bg-gray-50 cursor-pointer flex items-center justify-center px-6 py-3"
                    onMouseEnter={(e) => {
                      setHoveredPartner(index)
                      e.currentTarget.style.transform = `scale(1.1) rotate(${rotation}deg)`
                      e.currentTarget.style.boxShadow =
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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
                      padding: partner.image ? '12px 16px' : undefined,
                      animationDelay: delay,
                      transform: `rotate(${rotation}deg)`
                    }}
                  >
                    {partner.image ? (
                      <img src={partner.image} alt={partner.name} className="h-12 w-auto object-contain" />
                    ) : (
                      <>
                        {partner.name} →
                      </>
                    )}
                  </button>
                </div>
              )
            })}

            <div
                ref={setRevealRef(0)}
                className="flex flex-col gap-4 md:gap-5 lg:gap-6 relative"
                style={getRevealStyle(0)}
            >
              <h1 className="text-6xl md:text-7xl font-bold leading-tight -mt-2 md:-mt-6" style={{ fontFamily: '"Futura Bold", sans-serif' }}>
                Built for <span style={{ color: 'var(--grapevne-blue)' }}>Universities.</span><br />
                <span style={{ color: '#1a1a1a' }}>Designed for Students.</span>
              </h1>

              <div
                className="grid grid-cols-5 gap-0 mt-8 md:mt-6"
                style={{
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)'
                }}
            >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 11' }}>
                  <img
                    src="/universitiesimage.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 11' }}>
                  <img
                    src="/universitiesimage2.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 11' }}>
                  <img
                    src="/Photozhoot3.png"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 11' }}>
                  <img
                    src="/universitiesimage5.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 11' }}>
                  <img
                    src="/universitiesimage4.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>

              <p className="text-2xl leading-relaxed font-bold text-right mt-6 md:mt-8" style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                A shared feed for events, leftover &amp; free food, on campus.
              </p>
            </div>
          </section>

          {/* Scroll-Locked Horizontal Narrative Section */}
            <div
            ref={stickyContainerRef}
            style={{ height: '320vh' }}
            >
            <div
                className="sticky top-[140px] bg-white py-8"
                style={{ height: 'calc(100vh - 180px)' }}
            >
                {/* Progress indicator */}
                <div className="flex items-center mb-10 pl-8 md:pl-16 pr-8 md:pr-16">
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

                {/* Horizontal scroll container */}
                <div
                ref={horizontalScrollRef}
                id="narrative-scroll"
                className="flex gap-14 overflow-x-hidden pb-4 h-full items-start pt-36"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                {/* Card 1 */}
                <div
                    className="flex-shrink-0 pl-8 md:pl-16"
                    style={{ width: '540px', minWidth: '540px' }}
                >
                    <h3
                    className="text-3xl font-bold mb-6 leading-tight"
                    style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                    >
                    Data-Driven Decision Making
                    </h3>
                    <p
                    className="text-[24px] leading-[1.5]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                    >
                    Real-time engagement data provides measurable insight into waste reduction and surplus distribution.
                    </p>
                </div>

                {/* Card 2 */}
                <div
                    className="flex-shrink-0"
                    style={{ width: '540px', minWidth: '540px' }}
                >
                    <h3
                    className="text-3xl font-bold mb-6 leading-tight"
                    style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                    >
                    Financial Optimization
                    </h3>
                    <p
                    className="text-[24px] leading-[1.5]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                    >
                    Campus analytics reveal how efficiently surplus food reaches students and support more effective resource allocation.
                    </p>
                </div>

                {/* Card 3 */}
                <div
                    className="flex-shrink-0"
                    style={{ width: '540px', minWidth: '540px' }}
                >
                    <h3
                    className="text-3xl font-bold mb-6 leading-tight"
                    style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                    >
                    Innovation
                    </h3>
                    <p
                    className="text-[24px] leading-[1.5]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                    >
                    Digitizing surplus-to-demand systems enables campuses to test and advance zero-waste and carbon reduction strategies.
                    </p>
                </div>

                {/* Card 4 */}
                <div
                    className="flex-shrink-0 pr-8 md:pr-16"
                    style={{ width: '540px', minWidth: '540px' }}
                >
                    <h3
                    className="text-3xl font-bold mb-6 leading-tight"
                    style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                    >
                    Student Experience
                    </h3>
                    <p
                    className="text-[24px] leading-[1.5]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                    >
                    Accessible, human-centered solutions powered by technology reduce barriers to food access and support more sustainable behavior on campus.
                    </p>
                </div>
                </div>
            </div>
            </div>

          {/* Visibility section */}
          <section className="px-8 md:px-16 pt-24 md:pt-28 pb-24 md:pb-28">
            <div
                ref={setRevealRef(1)}
                className="max-w-7xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-x-12 md:gap-y-16 items-start"
                style={getRevealStyle(1)}
            >
              <div className="max-w-3xl">
                <p
                  className="text-sm uppercase tracking-[0.14em] mb-6"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#6b7280' }}
                >
                  Visibility
                </p>

                <h2
                  className="text-[40px] md:text-[60px] leading-[1.2] tracking-[-0.03em] font-bold mb-10"
                  style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                >
                  Make student engagement measurable.
                </h2>

                <div className="space-y-6">
                  <p
                    className="text-xl md:text-2xl leading-[1.7] max-w-2xl"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                  >
                    Centralizing interaction enables campuses to better analyze student engagement, identify what gains traction, and measure how interest translates into attendance.
                  </p>

                  <p
                    className="text-lg md:text-xl leading-relaxed italic max-w-2xl"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#4b5563' }}
                  >
                    That includes signals around what students swipe on, save, revisit, and ultimately show up for.
                  </p>
                </div>
              </div>

              <div className="pt-1 md:pt-2">
                <img
                  src="/snake.jpg"
                  alt="Grapevne app feed"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </section>

          {/* Product Section */}
          <section className="px-8 md:px-16 pb-24 md:pb-28">
            <div
                ref={setRevealRef(2)}
                className="max-w-7xl mx-auto grid md:grid-cols-[0.85fr_1.1fr] gap-12 md:gap-20 items-center"
                style={getRevealStyle(2)}
            >
              <div className="overflow-hidden md:translate-y-8">
                <img
                  src="/see-who-iphone.png"
                  alt="Grapevne app preview"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div>
                <h2
                  className="text-[40px] md:text-[60px] leading-[1.2] tracking-[-0.03em] font-bold mb-8"
                  style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                >
                  Useful for students.
                  <br />
                  Useful for campuses.
                </h2>

                <p
                  className="text-xl md:text-2xl leading-[1.35] max-w-2xl"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                >
                  Immediate on the surface.
                  <br />
                  Measurable underneath.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-8 md:px-16 pb-28 md:pb-36">
            <div
                ref={setRevealRef(3)}
                className="max-w-7xl mx-auto"
                style={getRevealStyle(3)}
            >
              <div className="mb-14 md:mb-16">
                <p
                  className="text-sm uppercase tracking-[0.14em] mb-6"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#6b7280' }}
                >
                  
                </p>

                <h2
                  className="text-[40px] md:text-[68px] leading-[0.9] tracking-[-0.04em] font-bold max-w-5xl"
                  style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                >
                  Frequently asked questions.
                </h2>
              </div>

              <div className="border-t border-gray-200">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index

                  return (
                    <div key={faq.question} className="border-b border-gray-200">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full text-left py-8 md:py-10 flex items-start justify-between gap-8"
                      >
                        <span
                          className="text-xl md:text-2xl leading-[1.2] pr-6"
                          style={{ fontFamily: '"Futura Bold", sans-serif', color: '#1a1a1a' }}
                        >
                          {faq.question}
                        </span>

                        <span
                          className="text-3xl md:text-4xl leading-none shrink-0"
                          style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          maxHeight: isOpen ? '220px' : '0px',
                          opacity: isOpen ? 1 : 0
                        }}
                      >
                        <div className="pb-8 md:pb-10 max-w-4xl">
                          <p
                            className="text-lg md:text-xl leading-[1.45]"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-8 md:px-16 pt-2 pb-20">
            <div
                ref={setRevealRef(4)}
                className="max-w-7xl mx-auto text-center"
                style={getRevealStyle(4)}
            >
              <h2
                className="text-[40px] md:text-[68px] leading-[1.2] tracking-[-0.04em] font-bold mb-8"
                style={{ color: '#1a1a1a', fontFamily: '"Futura Bold", sans-serif' }}
              >
                Want to bring Grapevne to your campus?
              </h2>

              <p
                className="text-xl md:text-2xl leading-[1.5] mb-10"
                style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}
              >
                A better student-facing system on the surface
                <br />
                A clearer dataset underneath
              </p>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=general@grapevneapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-10 py-5 rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
              >
                Get in Touch
            </a>
            </div>
          </section>

          {/* Contact Form */}
          <section
            ref={formSectionRef}
            className="transition-all duration-500 ease-in-out px-8 md:px-16 pb-8 scroll-mt-24"
          >
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
            <button
              onClick={handleCloseGallery}
              className="fixed right-8 md:right-16 top-8 text-xl md:text-2xl font-bold z-10"
              style={{ color: '#1a1a1a', fontFamily: 'Helvetica, Arial, sans-serif' }}
            >
              exit
            </button>

            <button
              onClick={handlePrev}
              className="fixed left-8 md:left-16 top-1/2 transform -translate-y-1/2 text-5xl md:text-6xl font-bold z-10 transition-colors"
              style={{ color: '#1a1a1a' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--grapevne-blue)')}
              onMouseLeave={(e) => (e.target.style.color = '#1a1a1a')}
            >
              −
            </button>
            <button
              onClick={handleNext}
              className="fixed right-8 md:right-16 top-1/2 transform -translate-y-1/2 text-5xl md:text-6xl font-bold z-10 transition-colors"
              style={{ color: '#1a1a1a' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--grapevne-blue)')}
              onMouseLeave={(e) => (e.target.style.color = '#1a1a1a')}
            >
              +
            </button>

            <div className="flex flex-col items-center w-full">
              <div className="mb-6 w-full flex justify-start">
                <div
                  className="border border-black bg-white rounded-full flex items-center justify-center px-6 py-3"
                  style={{
                    transform: 'rotate(-2deg)',
                    padding: partners[selectedPartnerIndex].image ? '12px 16px' : undefined
                  }}
                >
                  {partners[selectedPartnerIndex].image ? (
                    <img
                      src={partners[selectedPartnerIndex].image}
                      alt={partners[selectedPartnerIndex].name}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <>{partners[selectedPartnerIndex].name} →</>
                  )}
                </div>
              </div>

              <div className="w-full h-1 bg-black mb-6"></div>

              <div
                className="text-lg md:text-xl mb-8 w-full whitespace-pre-line"
                style={{
                  color: '#1a1a1a',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: '1.6',
                  textAlign: 'justify'
                }}
              >
                {partners[selectedPartnerIndex].description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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