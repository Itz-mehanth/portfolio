import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: (delay = 0) => ({
    transition: {
      staggerChildren: 0.04,
      delayChildren: delay,
    },
  }),
}

const charVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
}

const wordContainerVariants = {
  hidden: {},
  visible: (delay = 0) => ({
    transition: {
      staggerChildren: 0.06,
      delayChildren: delay,
    },
  }),
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 150,
    },
  },
}

export function AnimatedChars({ text, className, style, isVisible, delay = 0 }) {
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block', ...style }}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      custom={delay}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={charVariants}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export function AnimatedWords({ text, className, style, isVisible, delay = 0 }) {
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block', ...style }}
      variants={wordContainerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      custom={delay}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}
