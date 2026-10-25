import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioContext = createContext()

// Drop the matching files into public/audio before enabling these tracks.
const TRACK_SOURCES = {
  alienClick: '/audio/alienClick.mp3',
  space: '/audio/space.mp3',
  background: '/audio/background.mp3',
  happy: '/audio/happy.mp3',
  whoosh: '/audio/whoosh.mp3'
}
const LOOP_TRACKS = ['space', 'background', 'happy']

export const AudioProvider = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [currentTrack, setCurrentTrack] = useState('')
  const audioRefs = useRef({})
  const crossfadeRef = useRef(null)

  // Audio elements are created lazily, only once sound is switched on,
  // so a muted visitor never downloads any track.
  const getAudio = useCallback((trackName) => {
    if (!TRACK_SOURCES[trackName]) return null
    if (!audioRefs.current[trackName]) {
      const audio = new Audio(TRACK_SOURCES[trackName])
      audio.loop = LOOP_TRACKS.includes(trackName)
      audioRefs.current[trackName] = audio
    }
    return audioRefs.current[trackName]
  }, [])

  useEffect(() => {
    const audios = audioRefs.current
    return () => {
      Object.values(audios).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
    }
  }, [])

  const stopAll = useCallback(() => {
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
      else if (currentTrack) {
        getAudio(currentTrack)?.play().catch(() => {})
      }
      return next
    })
  }, [currentTrack, stopAll, getAudio])

  const playTrack = useCallback((trackName) => {
    if (!TRACK_SOURCES[trackName]) return
    stopAll()
    setCurrentTrack(trackName)
    if (isAudioEnabled) {
      const audio = getAudio(trackName)
      audio.volume = 1
      audio.play().catch(() => {})
    }
  }, [isAudioEnabled, stopAll, getAudio])

  const crossfadeTo = useCallback((trackName, duration = 800) => {
    if (!TRACK_SOURCES[trackName]) return
    if (trackName === currentTrack) return

    if (crossfadeRef.current) {
      cancelAnimationFrame(crossfadeRef.current)
    }

    if (!isAudioEnabled) {
      setCurrentTrack(trackName)
      return
    }

    const currentAudio = audioRefs.current[currentTrack]
    const nextAudio = getAudio(trackName)

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
  }, [currentTrack, isAudioEnabled, getAudio])

  return (
    <AudioContext.Provider value={{ isAudioEnabled, toggleAudio, playTrack, crossfadeTo, currentTrack }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)
