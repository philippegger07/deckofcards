// src/components/GameStatus.tsx
'use client';

interface GameStatusProps {
    status: string;
}

const GameStatus: React.FC<{ status: string }> = ({ status }) => {
    return <div className={`status ${status}`}>{status !== 'Playing' && `You ${status}!`}</div>;
};

export default GameStatus;
