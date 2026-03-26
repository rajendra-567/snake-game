import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc3, Mic2 } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'ERR: NEON_DRIFT',
    artist: 'AI_SYNTH_V1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: 'text-cyan-500',
    lyrics: "CRUISING DOWN THE DIGITAL HIGHWAY\nNEON LIGHTS FLASHING IN MY EYES\nSYNTHWAVE BEATS PUMPING THROUGH THE NIGHT\nWE'RE DRIFTING THROUGH THE CYBER SKIES",
  },
  {
    id: 2,
    title: 'SYS: CYBER_PULSE',
    artist: 'NEURAL_NET_99',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: 'text-pink-500',
    lyrics: "HEARTBEAT SYNCS WITH THE BASSLINE\nCIRCUITS GLOWING RED AND BRIGHT\nDATA STREAMS FLOWING THROUGH MY MIND\nLOST INSIDE THIS ENDLESS NIGHT",
  },
  {
    id: 3,
    title: 'EXE: DIGI_HORIZON',
    artist: 'ALGO_BEATS_X',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    color: 'text-white',
    lyrics: "LOOKING OUT ACROSS THE GRID\nWHERE THE VIRTUAL MEETS THE REAL\nEVERY PIXEL TELLS A STORY\nOF THE FUTURE WE CAN FEEL",
  },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 bg-black brutal-border p-6 relative">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Track Info */}
        <div className="flex items-center gap-6 flex-1 w-full border-2 border-zinc-800 p-4">
          <div className={`w-16 h-16 bg-zinc-900 flex items-center justify-center border-2 ${isPlaying ? 'border-pink-500' : 'border-cyan-500'}`}>
            <Disc3 className={`w-8 h-8 ${currentTrack.color} ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold truncate text-2xl tracking-tight ${currentTrack.color}`}>{currentTrack.title}</h3>
            <p className="text-zinc-500 text-lg truncate">ID: {currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center w-full md:w-auto gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={playPrev}
              className="p-3 bg-zinc-900 border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="p-4 bg-zinc-900 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black transition-colors shadow-[4px_4px_0px_#0ff] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button 
              onClick={playNext}
              className="p-3 bg-zinc-900 border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-3 border-2 transition-colors ${showLyrics ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-500 text-zinc-500 hover:border-white hover:text-white'}`}
              title="DECODE_LYRICS"
            >
              <Mic2 className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div 
            className="w-full md:w-72 h-4 bg-zinc-900 border-2 border-zinc-700 cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex flex-col items-center gap-2 w-24">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-pink-500 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-full h-2 bg-zinc-900 border border-pink-500 appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>

      {/* Lyrics Display */}
      {showLyrics && (
        <div className="mt-6 p-6 bg-zinc-900 border-2 border-white max-h-48 overflow-y-auto">
          <p className="text-white text-xl font-mono whitespace-pre-line text-center leading-relaxed glitch-text" data-text={currentTrack.lyrics}>
            {currentTrack.lyrics}
          </p>
        </div>
      )}
    </div>
  );
}
