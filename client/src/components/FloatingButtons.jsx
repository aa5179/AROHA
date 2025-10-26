import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Music, Volume2, VolumeX, X } from "lucide-react";

const FloatingButtons = () => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMusicOptions, setShowMusicOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const audioRef = useRef(null);

  // Peaceful sounds data
  const peacefulSounds = [
    { name: "Rain", url: "/src/assets/RAIN.mp3", icon: "🌧️" },
    { name: "Ocean", url: "/src/assets/OCEAN.mp3", icon: "🌊" },
    { name: "Forest", url: "/src/assets/FOREST.mp3", icon: "🌲" },
    { name: "Birds", url: "/src/assets/BIRDS.mp3", icon: "🐦" },
    { name: "Wind", url: "/src/assets/WIND.mp3", icon: "💨" },
  ];

  const emergencyContacts = [
    {
      name: "Emergency Services (Police/Fire/Medical)",
      number: "112",
      type: "Emergency",
    },
    {
      name: "National Mental Health Helpline",
      number: "080-46110007",
      type: "Crisis",
    },
    {
      name: "Vandrevala Foundation Helpline",
      number: "9999 666 555",
      type: "Crisis",
    },
    {
      name: "AASRA Mumbai Suicide Prevention",
      number: "91-9820466726",
      type: "Crisis",
    },
    {
      name: "Sneha Chennai Suicide Prevention",
      number: "044-24640050",
      type: "Crisis",
    },
    {
      name: "iCall Mumbai Crisis Helpline",
      number: "022-25521111",
      type: "Crisis",
    },
  ];

  const playSound = (sound) => {
    if (audioRef.current) {
      if (currentSound === sound.name && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentSound(null);
      } else {
        audioRef.current.src = sound.url;
        audioRef.current.play().catch(() => {
          // Fallback for browsers that don't allow autoplay
          console.log("Audio playback requires user interaction");
        });
        setIsPlaying(true);
        setCurrentSound(sound.name);
      }
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSound(null);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = true;
      audio.volume = 0.3;
    }

    // Auto-start default sound (Forest) when component mounts
    const startDefaultSound = async () => {
      try {
        const defaultSound = peacefulSounds.find(
          (sound) => sound.name === "Forest"
        );
        if (defaultSound && audio) {
          audio.src = defaultSound.url;
          await audio.play();
          setIsPlaying(true);
          setCurrentSound(defaultSound.name);
        }
      } catch (error) {
        // Browser blocked autoplay, user will need to interact first
        console.log("Autoplay blocked by browser, user interaction required");
      }
    };

    // Small delay to ensure component is fully mounted
    setTimeout(startDefaultSound, 1000);
  }, []);

  return (
    <>
      {/* Audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Music Button - Left Side */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMusicOptions(!showMusicOptions)}
            className={`w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-200 flex items-center justify-center ${
              isPlaying
                ? "bg-forest-500 text-white border-forest-400"
                : "bg-white/80 dark:bg-forest-800/80 text-forest-600 dark:text-forest-200 border-forest-200/60 dark:border-forest-600/60 hover:bg-forest-50/90 dark:hover:bg-forest-700/90"
            }`}
          >
            {isPlaying ? <Volume2 size={20} /> : <Music size={20} />}
          </motion.button>

          {/* Music Options Dropdown */}
          <AnimatePresence>
            {showMusicOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-14 left-0 bg-white/90 dark:bg-forest-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-forest-200/60 dark:border-forest-700/60 p-3 min-w-48"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-forest-700 dark:text-forest-200">
                    Peaceful Sounds
                  </h3>
                  {isPlaying && (
                    <button
                      onClick={stopSound}
                      className="text-forest-600 dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100"
                    >
                      <VolumeX size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {peacefulSounds.map((sound) => (
                    <button
                      key={sound.name}
                      onClick={() => playSound(sound)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        currentSound === sound.name && isPlaying
                          ? "bg-forest-500 text-white"
                          : "hover:bg-forest-100/50 dark:hover:bg-forest-800/50 text-forest-700 dark:text-forest-200"
                      }`}
                    >
                      <span>{sound.icon}</span>
                      <span className="text-sm font-medium">{sound.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Emergency Button - Right Side */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmergencyModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <Phone size={24} />
        </motion.button>
      </div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmergencyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-forest-200/60 dark:border-forest-700/60 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-forest-700 dark:text-forest-200">
                  Emergency Contacts
                </h2>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="text-forest-600 dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                    🚨 If you're in immediate danger, call 9152987821 right
                    away.
                  </p>
                </div>

                {emergencyContacts.map((contact, index) => (
                  <motion.div
                    key={contact.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-forest-50/50 dark:bg-forest-800/50 rounded-xl p-4 border border-forest-200/30 dark:border-forest-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-forest-700 dark:text-forest-200">
                          {contact.name}
                        </h3>
                        <p className="text-forest-600 dark:text-forest-300 text-lg font-mono">
                          {contact.number}
                        </p>
                        <span className="inline-block px-2 py-1 bg-forest-200 dark:bg-forest-700 text-forest-700 dark:text-forest-200 text-xs rounded-full mt-1">
                          {contact.type}
                        </span>
                      </div>
                      <a
                        href={`tel:${contact.number.replace(/\D/g, "")}`}
                        className="bg-gradient-to-r from-forest-500 to-moss-500 hover:from-forest-600 hover:to-moss-600 text-white p-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Phone size={20} />
                      </a>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 p-4 bg-forest-50 dark:bg-forest-800/30 rounded-lg">
                  <p className="text-forest-700 dark:text-forest-300 text-sm">
                    💚 Remember: You're not alone. Reaching out for help is a
                    sign of strength, not weakness.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingButtons;
