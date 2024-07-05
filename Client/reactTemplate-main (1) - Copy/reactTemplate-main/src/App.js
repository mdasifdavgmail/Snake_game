import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const CELL_SIZE = 20;
const WIDTH = 400;
const HEIGHT = 400;

const getRandomPosition = () => {
    const x = Math.floor(Math.random() * (WIDTH / CELL_SIZE)) * CELL_SIZE;
    const y = Math.floor(Math.random() * (HEIGHT / CELL_SIZE)) * CELL_SIZE;
    return { x, y };
};

const App = () => {
    const [snake, setSnake] = useState([{ x: 200, y: 200 }]);
    const [direction, setDirection] = useState({ x: 0, y: -CELL_SIZE });
    const [food, setFood] = useState(getRandomPosition());
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameInterval = useRef(null);

    useEffect(() => {
        const fetchHighScore = async () => {
            const response = await axios.get('http://localhost:3001/highscore');
            setHighScore(response.data.highScore);
        };
        fetchHighScore();
    }, []);

    useEffect(() => {
        if (isPlaying) {
            gameInterval.current = setInterval(moveSnake, 200);
        } else {
            clearInterval(gameInterval.current);
        }
        return () => clearInterval(gameInterval.current);
    }, [isPlaying, direction, snake]);

    // useEffect(() => {
    //     const handleKeyDown = (event) => {
    //         switch (event.key) {
    //             case 'ArrowUp':
    //                 if (direction.y === 0) setDirection({ x: 0, y: -CELL_SIZE });
    //                 break;
    //             case 'ArrowDown':
    //                 if (direction.y === 0) setDirection({ x: 0, y: CELL_SIZE });
    //                 break;
    //             case 'ArrowLeft':
    //                 if (direction.x === 0) setDirection({ x: -CELL_SIZE, y: 0 });
    //                 break;
    //             case 'ArrowRight':
    //                 if (direction.x === 0) setDirection({ x: CELL_SIZE, y: 0 });
    //                 break;
    //             default:
    //                 break;
    //         }
    //     };

    //     // window.addEventListener('keydown', handleKeyDown);
    //     // return () => {
    //     //     window.removeEventListener('keydown', handleKeyDown);
    //     // };
    // }, [direction]);

    const moveSnake = () => {
        const newSnake = [...snake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        if (head.x >= WIDTH || head.x < 0 || head.y >= HEIGHT || head.y < 0 || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            setIsPlaying(false);
            setGameOver(true);
            updateHighScore();
            return;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            setFood(getRandomPosition());
            setScore(score + 1);
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    const updateHighScore = async () => {
        await axios.post('http://localhost:3001/highscore', { score });
        const response = await axios.get('http://localhost:3001/highscore');
        setHighScore(response.data.highScore);
    };

    const handleDirectionChange = (newDirection) => {
        if (!isPlaying) return;
        setDirection(newDirection);
    };

    const handlePlayAgain = () => {
        setSnake([{ x: 200, y: 200 }]);
        setDirection({ x: 0, y: -CELL_SIZE });
        setFood(getRandomPosition());
        setScore(0);
        setGameOver(false);
        setIsPlaying(false);
    };

    return (
        <div className="App">
            {!gameOver && (
                <>
                    <div className="game-info">
                        <p>Score: {score}</p>
                        <p>High Score: {highScore}</p>
                    </div>
                    <div className="game-area" style={{ width: WIDTH, height: HEIGHT }}>
                        {snake.map((segment, index) => (
                            <div
                                key={index}
                                className="snake-segment"
                                style={{ left: segment.x, top: segment.y, width: CELL_SIZE, height: CELL_SIZE }}
                            />
                        ))}
                        <div
                            className="food"
                            style={{ left: food.x, top: food.y, width: CELL_SIZE, height: CELL_SIZE }}
                        />
                    </div>
                    <div className="game-controls">
                        <button className="control-button" onClick={() => handleDirectionChange({ x: 0, y: -CELL_SIZE })}>↑</button>
                    </div>
                    <div className="arrow-controls">
                        <button className="control-button" onClick={() => handleDirectionChange({ x: -CELL_SIZE, y: 0 })}>←</button>
                        <button className="control-button" onClick={() => handleDirectionChange({ x: 0, y: CELL_SIZE })}>↓</button>
                        <button className="control-button" onClick={() => handleDirectionChange({ x: CELL_SIZE, y: 0 })}>→</button>
                    </div>
                    <div className="game-actions">
                        <button className="game-button play" onClick={() => setIsPlaying(true)}>Play</button>
                        <button className="game-button pause" onClick={() => setIsPlaying(false)}>Pause</button>
                    </div>
                </>
            )}
            {gameOver && (
                <div className="result-box">
                    <p className="game-over-message">Game Over</p>
                    <p className="high-score-message">Your High Score: {highScore}</p>
                    <button className="game-button" onClick={handlePlayAgain}>Play Again</button>
                </div>
            )}
        </div>
    );
};

export default App;
