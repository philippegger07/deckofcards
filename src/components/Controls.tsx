'use client';

interface ControlsProps {
    onHit: () => void;
    onStand: () => void;
    onNewGame: () => void;
    isGameOver: boolean;
}

const Controls: React.FC<{
    onHit: () => void;
    onStand: () => void;
    onNewGame: () => void;
    isGameOver: boolean;
}> = ({ onHit, onStand, onNewGame, isGameOver }) => {
    return (
        <div className="controls">
            {!isGameOver && (
                <>
                    <button onClick={onHit}>Hit</button>
                    <button onClick={onStand}>Stand</button>
                </>
            )}
            <button onClick={onNewGame}>New Game</button>
        </div>
    );
};

export default Controls;
