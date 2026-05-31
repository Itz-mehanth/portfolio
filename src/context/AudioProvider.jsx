import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [currentTrack, setCurrentTrack] = useState('')
  const audioRefs = useRef(null)
  const crossfadeRef = useRef(null)

  useEffect(() => {
    audioRefs.current = {
      alienClick: new Audio('/audio/alienClick.mp3'),
      space: new Audio('/audio/space.mp3'),
      background: new Audio('/audio/background.mp3'),
      happy: new Audio('/audio/happy.mp3'),
      whoosh: new Audio('/audio/whoosh.mp3')
    }

    const loopTracks = ['space', 'background', 'happy']
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      audio.loop = loopTracks.includes(key)
      audio.preload = 'auto'
    })

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
    }
  }, [])

  const stopAll = useCallback(() => {
    if (!audioRefs.current) return
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = 1
    })
  }, [])

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev
      if (!next) stopAll()
      else if (currentTrack && audioRefs.current?.[currentTrack]) {
        audioRefs.current[currentTrack].play().catch(() => {})
      }
      return next
    })
  }, [currentTrack, stopAll])

  const playTrack = useCallback((trackName) => {
    if (!audioRefs.current?.[trackName]) return
    stopAll()
    setCurrentTrack(trackName)
    if (isAudioEnabled) {
      audioRefs.current[trackName].volume = 1
      audioRefs.current[trackName].play().catch(() => {})
    }
  }, [isAudioEnabled, stopAll])

  const crossfadeTo = useCallback((trackName, duration = 800) => {
    if (!audioRefs.current?.[trackName]) return
    if (trackName === currentTrack) return

    if (crossfadeRef.current) {
      cancelAnimationFrame(crossfadeRef.current)
    }

    const currentAudio = audioRefs.current[currentTrack]
    const nextAudio = audioRefs.current[trackName]

    if (!isAudioEnabled) {
      setCurrentTrack(trackName)
      return
    }

    nextAudio.volume = 0
    nextAudio.currentTime = 0
    nextAudio.play().catch(() => {})

    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      if (currentAudio) currentAudio.volume = Math.max(0, 1 - t)
      nextAudio.volume = t

      if (t < 1) {
        crossfadeRef.current = requestAnimationFrame(tick)
      } else {
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
          currentAudio.volume = 1
        }
        setCurrentTrack(trackName)
        crossfadeRef.current = null
      }
    }
    crossfadeRef.current = requestAnimationFrame(tick)
  }, [currentTrack, isAudioEnabled])

  return (
    <AudioContext.Provider value={{ isAudioEnabled, toggleAudio, playTrack, crossfadeTo, currentTrack }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)
