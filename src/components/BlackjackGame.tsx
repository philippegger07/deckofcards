'use client';
import { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import DealerHand from './DealerHand';
import Controls from './Controls';
import GameStatus from './GameStatus';
import { CardType } from '../types/Card';
import './styles/Blackjack.css';


const API_BASE = 'https://deckofcardsapi.com/api/deck';

const BlackjackGame: React.FC = () => {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [playerCards, setPlayerCards] = useState<CardType[]>([]);
    const [dealerCards, setDealerCards] = useState<CardType[]>([]);
    const [gameStatus, setGameStatus] = useState<string>('Playing');
    const [showDealerCards, setShowDealerCards] = useState<boolean>(false);

    useEffect(() => {
        const initializeDeck = async () => {
            const response = await fetch(`${API_BASE}/new/shuffle/?deck_count=6`);
            const data = await response.json();
            setDeckId(data.deck_id);
        };
        initializeDeck();
    }, []);

    const drawCards = async (count: number): Promise<CardType[]> => {
        if (!deckId) return [];
        const response = await fetch(`${API_BASE}/${deckId}/draw/?count=${count}`);
        const data = await response.json();
        return data.cards;
    };

    const handleHit = async () => {
        if (gameStatus !== 'Playing') return;
        const newCard = await drawCards(1);
        const updatedPlayerCards = [...playerCards, ...newCard];
        setPlayerCards(updatedPlayerCards);

        const playerScore = calculateScore(updatedPlayerCards);
        if (playerScore > 21) {
            setGameStatus('Lost');
            setShowDealerCards(true);
        }
    };

    const handleStand = async () => {
        if (gameStatus !== 'Playing') return;

        let updatedDealerCards = [...dealerCards];
        while (calculateScore(updatedDealerCards) < 17) {
            const moreCards = await drawCards(1);
            updatedDealerCards = [...updatedDealerCards, ...moreCards];
        }
        setDealerCards(updatedDealerCards);
        setShowDealerCards(true);

        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(updatedDealerCards);

        if (dealerScore > 21 || playerScore > dealerScore) {
            setGameStatus('Won');
        } else if (dealerScore > playerScore) {
            setGameStatus('Lost');
        } else {
            setGameStatus('Draw');
        }
    };

    const handleNewGame = async () => {
        if (!deckId) return;
        const initialCards = await drawCards(4);
        setPlayerCards(initialCards.slice(0, 2));
        setDealerCards(initialCards.slice(2, 4));
        setGameStatus('Playing');
        setShowDealerCards(false);
    };

    const calculateScore = (cards: CardType[]): number => {
        let score = 0;
        let aces = 0;

        cards.forEach(card => {
            const value = card.value;
            if (['JACK', 'QUEEN', 'KING'].includes(value)) {
                score += 10;
            } else if (value === 'ACE') {
                aces += 1;
                score += 11;
            } else {
                score += parseInt(value, 10);
            }
        });

        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    };

    useEffect(() => {
        if (deckId) handleNewGame();
    }, [deckId]);

    return (
        <div className="text-center">
            <h1>Blackjack</h1>
            <DealerHand cards={dealerCards} reveal={showDealerCards} score={calculateScore(dealerCards)} />
            <PlayerHand cards={playerCards} score={calculateScore(playerCards)} />
            <GameStatus status={gameStatus} />
            <Controls
                onHit={handleHit}
                onStand={handleStand}
                onNewGame={handleNewGame}
                isGameOver={gameStatus !== 'Playing'}
            />
        </div>
    );
};

export default BlackjackGame;
