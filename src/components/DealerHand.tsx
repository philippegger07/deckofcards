'use client';
import Card from './Card';
import { CardType } from '../types/Card';

interface DealerHandProps {
    cards: CardType[];
    reveal: boolean;
    score: number;
}

const DealerHand: React.FC<DealerHandProps> = ({ cards, reveal, score }) => {
    return (
        <div>
            <h2>Dealer {reveal && <span>({score})</span>}</h2>
            <div className="hand">
                {cards.map((card, index) => (
                    <div key={index}>
                        {index === 0 || reveal ? (
                            <Card value={card.value} image={card.image}/>
                        ) : (
                            <img className="card" src="https://www.deckofcardsapi.com/static/img/back.png" alt="hidden card"/>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DealerHand;
