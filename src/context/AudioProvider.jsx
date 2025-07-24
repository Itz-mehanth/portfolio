// src/context/AudioContext.jsx
import { createContext, useContext, useState, useRef, useEffect } from 'react'

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [currentTrack, setCurrentTrack] = useState('') // Track name like 'intro', 'moon'
  const audioRefs = {
    alienClick: useRef(new Audio('/audio/alienClick.mp3')),
    space: useRef(new Audio('/audio/space.mp3')),
    background: useRef(new Audio('/audio/background.mp3')),
    happy: useRef(new Audio('/audio/happy.mp3')),
    whoosh: useRef(new Audio('/audio/whoosh.mp3'))
  }

  // Ensure all audios loop and preload
  useEffect(() => {
    Object.entries(audioRefs).forEach(([key, ref]) => {
        ref.current.loop = key === 'space' || key === 'background' || key == 'happy' // only loop these
        ref.current.preload = 'auto'
    })
  }, [])

  // Toggle playback
  const toggleAudio = () => {
    setIsAudioEnabled(prev => {
      const next = !prev
      if (!next) stopAll()
      else if (currentTrack) audioRefs[currentTrack]?.current?.play()
      return next
    })
  }

  const stopAll = () => {
    Object.values(audioRefs).forEach(ref => {
      ref.current.pause()
      ref.current.currentTime = 0
    })
  }

  const playTrack = (trackName) => {
    if (!audioRefs[trackName]) return
    stopAll()
    setCurrentTrack(trackName)
    if (isAudioEnabled) audioRefs[trackName].current.play()
  }

  return (
    <AudioContext.Provider value={{ isAudioEnabled, toggleAudio, playTrack, currentTrack }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)