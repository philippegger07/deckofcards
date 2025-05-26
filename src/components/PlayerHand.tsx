'use client';
import Card from './Card';
import { CardType } from '../types/Card';

interface PlayerHandProps {
    cards: CardType[];
    score: number;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, score }) => {
    return (
        <div className="hand">
            <h2>Player ({score})</h2>
            <div className="flex gap-2 justify-center">
                {cards.map((card, index) => (
                    <Card key={index} value={card.value} image={card.image}/>
                ))}
            </div>
        </div>
    );
};


export default PlayerHand;
