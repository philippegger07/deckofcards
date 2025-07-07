'use client';
import { CardType } from '../types/Card';
import React, {useRef, useState} from "react";

type Recommendation = 'Hit' | 'Stand';

interface CheatOverlayProps {
    playerCards: CardType[];
    dealerCards: CardType[];
    drawnCards: CardType[];
    remainingCards: number;
    isPlayersTurn: boolean;
}

const allRanks = [
    'ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'
];

function calculateScore(cards: CardType[]): number {
    let score = 0;
    let aces = 0;
    cards.forEach(card => {
        if (['JACK', 'QUEEN', 'KING'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'ACE') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value, 10);
        }
    });
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

function getRemainingCounts(drawnCards: CardType[], deckCount = 6) {
    const counts: Record<string, number> = Object.fromEntries(allRanks.map(r => [r, 4 *  deckCount]));
    for (const card of drawnCards) {
        counts[card.value] = (counts[card.value] || 0) - 1;
    }
    return counts;
}

function bustChance(playerCards: CardType[], drawnCards: CardType[], remainingCards: number, deckCount = 6): number {
    const playerScore = calculateScore(playerCards);
    const counts = getRemainingCounts(drawnCards, deckCount);
    let busts = 0;
    let total = 0;
    for (const rank of allRanks) {
        const count = counts[rank];
        if (count <= 0) continue;
        const testCard = { value: rank } as any as CardType;
        const newScore = calculateScore([...playerCards, testCard]);
        if (newScore > 21) busts += count;
        total += count;
    }
    return total === 0 ? 0 : busts / total;
}

function getRecommendation(playerCards: CardType[], drawnCards: CardType[], remainingCards: number, deckCount = 6): Recommendation {
    const bust = bustChance(playerCards, drawnCards, remainingCards, deckCount);
    return bust > 0.45 ? 'Stand' : 'Hit';
}

const CheatOverlay: React.FC<CheatOverlayProps> = ({
                                                       playerCards,
                                                       dealerCards,
                                                       drawnCards,
                                                       remainingCards,
                                                       isPlayersTurn
                                                   }) => {
    const deckCount = 6;
    const bust = bustChance(playerCards, drawnCards, remainingCards, deckCount);
    const recommendation = getRecommendation(playerCards, drawnCards, remainingCards, deckCount);
    const playerScore = calculateScore(playerCards);
    const winChance = playerScore > 21 ? 0 : (bust < 0.45 ? 0.6 : 0.3); // Dummy approx.
    const remainingCounts = getRemainingCounts(drawnCards, deckCount);

    // Drag logic
    const overlayRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: window.innerWidth * 0.5 - 140, y: 80 });
    const [dragging, setDragging] = useState(false);
    const [diff, setDiff] = useState({ x: 0, y: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setDiff({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        });
        document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
        setDragging(false);
        document.body.style.userSelect = "";
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!dragging) return;
        setPos({
            x: e.clientX - diff.x,
            y: e.clientY - diff.y,
        });
    };

    React.useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    });

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                background: 'rgba(35,40,44,0.93)',
                color: '#FFEB3B',
                borderRadius: 14,
                boxShadow: '0 0 16px #000a',
                padding: 24,
                minWidth: 280,
                zIndex: 9999,
                cursor: dragging ? 'grabbing' : 'default',
                userSelect: 'none'
            }}
        >
            <div
                style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 10,
                    cursor: 'grab',
                    background: 'rgba(255,255,255,0.09)',
                    borderRadius: 7,
                    padding: '4px 8px',
                    margin: '-16px -16px 12px -16px'
                }}
                onMouseDown={onMouseDown}
            >
                Cheatmodus aktiviert
            </div>
            <div style={{marginBottom: 8}}>Gezogene Karten insgesamt: <b>{drawnCards.length}</b></div>
            <div style={{marginBottom: 8}}>Empfehlung: <b style={{color: recommendation === 'Hit' ? '#76FF03' : '#FF5252'}}>{recommendation}</b></div>
            <div style={{marginBottom: 8}}>Bust-Chance bei Hit: <b>{(bust * 100).toFixed(1)}%</b></div>
            <div style={{marginBottom: 8}}>Gewinnchance (grob): <b>{(winChance * 100).toFixed(0)}%</b></div>
            <div>
                <details>
                    <summary>Kartenzähler (Rest im Deck)</summary>
                    <ul style={{columns: 2, margin: 0, padding: 0, listStyle: 'none'}}>
                        {allRanks.map(rank =>
                            <li key={rank}>{rank}: <b>{remainingCounts[rank]}</b></li>
                        )}
                    </ul>
                </details>
            </div>
        </div>
    );
};

export default CheatOverlay;