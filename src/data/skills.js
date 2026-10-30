// Skills by Skill Town district, shared by the Skills section and the MR world.

export const SKILLS_BY_DISTRICT = {
  languages: [
    { name: 'Python', description: 'Versatile programming language for backend, AI/ML, and scripting' },
    { name: 'JavaScript', description: 'Essential language for web development and frontend interactions' },
    { name: 'TypeScript', description: 'Typed superset of JavaScript for large-scale applications' },
    { name: 'Dart', description: 'Programming language optimized for Flutter mobile app development' },
    { name: 'C', description: 'Low-level programming language for system programming' },
    { name: 'C++', description: 'Object-oriented extension of C for game development' },
    { name: 'Java', description: 'Platform-independent language for enterprise and Android development' },
    { name: 'SQL', description: 'Standard language for database queries' },
  ],
  web: [
    { name: 'HTML', description: 'Standard markup language for documents designed to be displayed in a web browser' },
    { name: 'CSS', description: 'Style sheet language used for describing the presentation of a document' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
    { name: 'React.js', description: 'JavaScript library for building interactive user interfaces' },
    { name: 'Next.js', description: 'React framework enabling server-side rendering and static site generation' },
    { name: 'Vue.js', description: 'Progressive JavaScript framework for building user interfaces' },
    { name: 'Angular', description: 'Platform and framework for building single-page client applications' },
    { name: 'Chart.js', description: 'Simple yet flexible JavaScript charting for designers & developers' },
  ],
  mobile: [
    { name: 'Flutter', description: 'Google\'s UI toolkit for building natively compiled applications' },
  ],
  backend: [
    { name: 'Node.js', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine' },
    { name: 'Express.js', description: 'Minimal and flexible Node.js web application framework' },
    { name: 'Flask', description: 'Micro web framework written in Python' },
    { name: 'Spring Boot', description: 'Java-based framework used to create microservices' },
    { name: 'REST API', description: 'Architectural style for designing networked applications' },
    { name: 'WebSockets', description: 'Communication protocol providing full-duplex communication channels' },
    { name: 'WebRTC', description: 'Real-Time Communications for the web' },
    { name: 'Apache Kafka', description: 'Distributed event streaming platform' },
    { name: 'Apache Spark', description: 'Unified analytics engine for large-scale data processing' },
  ],
  database: [
    { name: 'PostgreSQL', description: 'Powerful, open source object-relational database system' },
    { name: 'MySQL', description: 'Open-source relational database management system' },
    { name: 'MongoDB', description: 'Source-available cross-platform document-oriented database program' },
    { name: 'Redis', description: 'In-memory data structure store, used as a database, cache, and message broker' },
  ],
  arvr: [
    { name: 'React Three Fiber', description: 'React renderer for Three.js' },
    { name: 'Three.js', description: 'Cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics' },
    { name: 'Unity', description: 'Cross-platform game engine used to create three-dimensional and two-dimensional games' },
    { name: 'Godot', description: 'Cross-platform, free and open-source game engine' },
    { name: 'Blender', description: 'Free and open-source 3D computer graphics software toolset' },
  ],
  uiux: [
    { name: 'Figma', description: 'Vector graphics editor and prototyping tool' },
  ],
  tools: [
    { name: 'Docker', description: 'Set of platform as a service products that use OS-level virtualization' },
    { name: 'Git', description: 'Distributed version control system' },
    { name: 'Firebase', description: 'Platform developed by Google for creating mobile and web applications' },
    { name: 'Raspberry Pi', description: 'Series of small single-board computers' },
    { name: 'PySpark', description: 'Python API for Apache Spark' },
    { name: 'Spark Streaming', description: 'Extension of the core Spark API that enables scalable, high-throughput, fault-tolerant stream processing' },
    { name: 'Spark MLlib', description: 'Apache Spark\'s scalable machine learning library' },
  ],
  aiml: [
    { name: 'TensorFlow', description: 'Free and open-source software library for machine learning and artificial intelligence' },
    { name: 'OpenCV', description: 'Library of programming functions mainly aimed at real-time computer vision' },
    { name: 'CNNs', description: 'Class of artificial neural network most commonly applied to analyzing visual imagery' },
  ],
}

// Display names for each district (the panel pill and the MR skills card).
export const DISTRICT_NAMES = {
  languages: 'Languages',
  web: 'Web',
  mobile: 'Mobile',
  backend: 'Backend',
  database: 'Databases',
  arvr: 'AR / VR & 3D',
  uiux: 'UI / UX',
  tools: 'Tools',
  aiml: 'AI / ML',
};
