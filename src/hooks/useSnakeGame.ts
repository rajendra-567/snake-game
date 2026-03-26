import { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 12; // Reduced grid size makes the snake appear larger
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 50;

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export function useSnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 5, y: 5 }]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 2, y: 2 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const directionRef = useRef<Direction>(direction);
  const lastMoveDirectionRef = useRef<Direction>(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 5, y: 5 }]);
    setDirection('UP');
    directionRef.current = 'UP';
    lastMoveDirectionRef.current = 'UP';
    setFood(generateFood([{ x: 5, y: 5 }]));
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = directionRef.current;
      lastMoveDirectionRef.current = currentDir;

      const newHead = { ...head };

      switch (currentDir) {
        case 'UP':
          newHead.y -= 1;
          break;
        case 'DOWN':
          newHead.y += 1;
          break;
        case 'LEFT':
          newHead.x -= 1;
          break;
        case 'RIGHT':
          newHead.x += 1;
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          setHighScore((hs) => Math.max(hs, newScore));
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      const lastDir = lastMoveDirectionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (lastDir !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (lastDir !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (lastDir !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (lastDir !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    const intervalId = setInterval(moveSnake, speed / speedMultiplier);
    return () => clearInterval(intervalId);
  }, [moveSnake, speed, speedMultiplier]);

  return {
    snake,
    food,
    direction,
    gameOver,
    score,
    highScore,
    isPaused,
    speedMultiplier,
    gridSize: GRID_SIZE,
    resetGame,
    setIsPaused,
    setSpeedMultiplier,
  };
}
