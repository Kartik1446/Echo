import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, Calendar, MapPin } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const ListenToEchoModal = ({ theme = 'dark', onClose, memory = null }) => {
  const currentColors = themes[theme];
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  // Mock memory data - in real app this would come from props
  const mockMemory = memory || {
    id: 1,
    title: "Dad's 60th Birthday",
    date: "2024-01-15",
    location: "Goa, India",
    duration: "2:45",
    people: ["Dad", "Mom", "Me"],
    transcript: "This was such a special day. Dad was so surprised when we all showed up at his favorite restaurant. The look on his face when he saw the cake...",
    audioUrl: "#" // In real app, this would be actual audio URL
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSkip = (direction) => {
    if (audioRef.current) {
      const newTime = direction === 'forward' 
        ? Math.min(currentTime + 10, duration)
        : Math.max(currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border"
      style={{ borderColor: currentColors.glassBorder, background: currentColors.glassBg }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 transition-colors duration-300"
        style={{ color: currentColors.primaryText }}
        aria-label="Close echo player"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2" style={{ color: currentColors.primaryText }}>
          Listen to Your Echo
        </h2>
        <p className="text-lg" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
          Relive your precious memories
        </p>
      </div>

      {/* Memory Info */}
      <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: currentColors.secondaryBg }}>
        <h3 className="text-2xl font-bold mb-4" style={{ color: currentColors.primaryText }}>
          {mockMemory.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center" style={{ color: currentColors.primaryText }}>
            <Calendar size={20} className="mr-2" style={{ color: currentColors.accentGold }} />
            <span>{mockMemory.date}</span>
          </div>
          <div className="flex items-center" style={{ color: currentColors.primaryText }}>
            <MapPin size={20} className="mr-2" style={{ color: currentColors.accentGold }} />
            <span>{mockMemory.location}</span>
          </div>
          <div className="flex items-center" style={{ color: currentColors.primaryText }}>
            <Clock size={20} className="mr-2" style={{ color: currentColors.accentGold }} />
            <span>{mockMemory.duration}</span>
          </div>
        </div>

        <div className="text-sm" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
          <strong>People:</strong> {mockMemory.people.join(', ')}
        </div>
      </div>

      {/* Audio Player */}
      <div className="mb-8">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        >
          <source src={mockMemory.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Progress Bar */}
        <div className="mb-6">
          <div 
            className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: currentColors.accentGold,
                width: `${duration ? (currentTime / duration) * 100 : 0}%` 
              }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: currentColors.accentGold,
                left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2" style={{ color: currentColors.primaryText, opacity: 0.7 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={() => handleSkip('back')}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-gray-700"
            style={{ color: currentColors.primaryText }}
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-4 rounded-full transition-all duration-300 transform hover:scale-110"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>

          <button
            onClick={() => handleSkip('forward')}
            className="p-3 rounded-full transition-colors duration-300 hover:bg-gray-700"
            style={{ color: currentColors.primaryText }}
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-3">
          <Volume2 size={20} style={{ color: currentColors.primaryText }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
            style={{ accentColor: currentColors.accentGold }}
          />
        </div>
      </div>

      {/* Transcript */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3" style={{ color: currentColors.primaryText }}>
          Transcript
        </h4>
        <div className="p-4 rounded-lg text-sm leading-relaxed" style={{ backgroundColor: currentColors.secondaryBg, color: currentColors.primaryText }}>
          {mockMemory.transcript}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
          style={{ color: currentColors.primaryText, border: `1px solid ${currentColors.darkGold}` }}
        >
          Close
        </button>
        <button
          className="flex-1 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-300"
          style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
        >
          Share Memory
        </button>
      </div>
    </motion.div>
  );
};

export default ListenToEchoModal;
