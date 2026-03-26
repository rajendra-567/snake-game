import React, { useEffect, useRef } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { Trophy, Play, RotateCcw, Zap } from 'lucide-react';

export function SnakeGame() {
  const {
    snake,
    food,
    gameOver,
    score,
    highScore,
    isPaused,
    speedMultiplier,
    gridSize,
    resetGame,
    setIsPaused,
    setSpeedMultiplier,
  } = useSnakeGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food (Magenta)
    ctx.fillStyle = '#f0f';
    ctx.fillRect(
      food.x * cellSize + 2,
      food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    // Draw snake (Cyan)
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#fff' : '#0ff';
      
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

  }, [snake, food, gridSize]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Score Header */}
      <div className="flex justify-between w-full mb-8 px-6 py-4 bg-black brutal-border">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500 text-black">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg text-cyan-500 uppercase tracking-widest">SCORE</p>
            <p className="text-4xl font-mono font-bold text-white">
              {score.toString().padStart(4, '0')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-lg text-pink-500 uppercase tracking-widest">HI-SCORE</p>
            <p className="text-4xl font-mono font-bold text-white">
              {highScore.toString().padStart(4, '0')}
            </p>
          </div>
          <div className="p-2 bg-pink-500 text-black">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-full max-w-[400px]">
        <div className="relative bg-black p-2 brutal-border-alt">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="bg-[#050505] w-full aspect-square"
          />

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
              <h2 className="text-6xl font-black text-white mb-4 uppercase tracking-widest glitch-text" data-text="FATAL_ERR">
                FATAL_ERR
              </h2>
              <p className="text-cyan-400 mb-8 text-2xl bg-cyan-500/20 px-4 py-2">SCORE: {score}</p>
              <button
                onClick={resetGame}
                className="flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black text-xl font-bold transition-colors shadow-[4px_4px_0px_#0ff] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_#0ff]"
              >
                <RotateCcw className="w-6 h-6" />
                REBOOT_SYS
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
              <h2 className="text-5xl font-bold text-white mb-8 tracking-widest uppercase glitch-text" data-text="SYS.PAUSED">
                SYS.PAUSED
              </h2>
              <button
                onClick={() => setIsPaused(false)}
                className="flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black text-xl font-bold transition-colors shadow-[4px_4px_0px_#f0f] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_#f0f]"
              >
                <Play className="w-6 h-6 fill-current" />
                RESUME_EXEC
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls Hint & Settings */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-xl text-cyan-500 font-mono bg-black p-4 brutal-border">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-cyan-500 text-black">WASD</span> MOVE
          </span>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-pink-500 text-black">SPC</span> HALT
          </span>
        </div>
        <button
          onClick={() => setSpeedMultiplier(p => p === 1 ? 2 : p === 2 ? 3 : 1)}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
        >
          <Zap className="w-5 h-5" />
          CLK_SPD: {speedMultiplier}X
        </button>
      </div>
    </div>
  );
}
