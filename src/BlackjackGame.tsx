// Blackjack Game using Deck of Cards API in React + TypeScript + Tailwind CSS
import React, { useEffect, useState } from "react";

interface Card {
    code: string;
    image: string;
    value: string;
    suit: string;
}

export default function BlackjackGame() {
    const [deckId, setDeckId] = useState<string>("");
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");

    // Start the new game when the component mounts
    useEffect(() => {
        startNewGame();
    }, []);

    // Function to start a new game
    async function startNewGame() {
        try {
            const deckRes = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6");
            const deckData = await deckRes.json();

            if (!deckData || !deckData.deck_id) {
                console.error("Fehler beim Abrufen des Decks:", deckData);
                return;
            }

            setDeckId(deckData.deck_id);

            const drawRes = await fetch(`https://deckofcardsapi.com/api/deck/${deckData.deck_id}/draw/?count=4`);
            const drawData = await drawRes.json();

            if (!drawData || !drawData.cards || drawData.cards.length < 4) {
                console.error("Fehler beim Abrufen der Karten:", drawData);
                return;
            }

            setPlayerHand([drawData.cards[0], drawData.cards[2]]);
            setDealerHand([drawData.cards[1], drawData.cards[3]]);
            setIsPlayerTurn(true);
            setGameOver(false);
            setMessage("");
        } catch (error) {
            console.error("Fehler beim Starten des Spiels:", error);
        }
    }

    // Handle the "Hit" action, draw a new card for the player
    async function handleHit() {
        if (!isPlayerTurn || gameOver) return;
        try {
            const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const data = await res.json();

            if (!data.cards) {
                console.error("Fehler beim Abrufen einer Karte:", data);
                return;
            }

            const newHand = [...playerHand, data.cards[0]];
            setPlayerHand(newHand);

            const total = calculateHandValue(newHand);
            if (total > 21) {
                setMessage("You busted! Dealer wins.");
                setGameOver(true);
            }
        } catch (error) {
            console.error("Fehler beim Ziehen einer Karte:", error);
        }
    }

    // Handle the "Stand" action, end the player's turn and start the dealer's turn
    async function handleStand() {
        setIsPlayerTurn(false);
        let newDealerHand = [...dealerHand];
        let dealerTotal = calculateHandValue(newDealerHand);

        // Dealer draws cards until their total is at least 17
        while (dealerTotal < 17) {
            try {
                const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
                const data = await res.json();

                if (!data.cards) {
                    console.error("Fehler beim Abrufen einer Karte für den Dealer:", data);
                    return;
                }

                newDealerHand.push(data.cards[0]);
                dealerTotal = calculateHandValue(newDealerHand);
            } catch (error) {
                console.error("Fehler beim Ziehen einer Karte für den Dealer:", error);
                return;
            }
        }

        const playerTotal = calculateHandValue(playerHand);
        let outcome = "";
        if (dealerTotal > 21 || playerTotal > dealerTotal) outcome = "You win!";
        else if (dealerTotal > playerTotal) outcome = "Dealer wins.";
        else outcome = "Push!";  // A tie

        setDealerHand(newDealerHand);
        setMessage(outcome);
        setGameOver(true);
    }

    // Calculate the total value of a hand
    function calculateHandValue(hand: Card[]): number {
        let total = 0;
        let aces = 0;
        for (let card of hand) {
            if (["KING", "QUEEN", "JACK"].includes(card.value)) total += 10;
            else if (card.value === "ACE") {
                total += 11;
                aces++;
            } else total += parseInt(card.value);
        }
        // Adjust for aces if total exceeds 21
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

    // Render a card image or a placeholder if hidden
    function renderCard(card: Card, hidden = false) {
        if (!card || !card.image) {
            console.error("Ungültige Karte:", card);
            return <div>Fehler bei der Karte</div>;
        }

        return (
            <div className="w-16 h-24 border rounded bg-white shadow-md flex items-center justify-center text-xl font-bold mx-1">
                {hidden ? "🂠" : <img src={card.image} alt={card.code} className="w-full h-full object-contain" />}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-700 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-6">Blackjack</h1>

            <div className="mb-4">
                <h2 className="text-xl mb-2">Dealer's Hand</h2>
                <div className="flex">
                    {dealerHand.map((card, index) =>
                        index === 0 && isPlayerTurn && !gameOver
                            ? renderCard(card, true)
                            : renderCard(card)
                    )}
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-xl mb-2">Your Hand ({calculateHandValue(playerHand)})</h2>
                <div className="flex">
                    {playerHand.map(card => renderCard(card))}
                </div>
            </div>

            <div className="mb-4 text-2xl font-semibold">{message}</div>

            <div className="flex gap-4">
                {!gameOver && isPlayerTurn && (
                    <>
                        <button onClick={handleHit} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">Hit</button>
                        <button onClick={handleStand} className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">Stand</button>
                    </>
                )}
                {gameOver && (
                    <button onClick={startNewGame} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">New Game</button>
                )}
            </div>
        </div>
    );
}
