"use client";

import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://deckofcardsapi.com/api/deck";

interface Card {
    code: string;
    image: string;
    value: string;
    suit: string;
}

const BlackjackGame = () => {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [message, setMessage] = useState<string>("");
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);

    // Funktion, um einen neuen Kartenstapel zu erstellen
    const createDeck = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/new/shuffle/?deck_count=1`);
            const data = await response.json();
            setDeckId(data.deck_id);
        } catch (error) {
            console.error("Fehler beim Erstellen des Kartenstapels:", error);
        }
    };

    // Funktion, um Karten aus dem Stapel zu ziehen
    const drawCards = async (count: number) => {
        if (!deckId) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/${deckId}/draw/?count=${count}`);
            const data = await response.json();
            return data.cards;
        } catch (error) {
            console.error("Fehler beim Ziehen der Karten:", error);
            return [];
        }
    };

    // Berechnung des Handwerts
    const calculateHandValue = (hand: Card[]) => {
        let total = 0;
        let aces = 0;

        hand.forEach((card) => {
            if (!card || !card.value) return; // ⛑ Schutz gegen undefinierte Karten

            if (card.value === "KING" || card.value === "QUEEN" || card.value === "JACK") {
                total += 10;
            } else if (card.value === "ACE") {
                total += 11;
                aces += 1;
            } else {
                total += parseInt(card.value);
            }
        });

        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }

        return total;
    };


    // Start des Spiels, initial 2 Karten für Spieler und Dealer ziehen
    const startGame = async () => {
        if (!deckId) return;

        const cards = await drawCards(4); // Zwei Karten für den Spieler und zwei für den Dealer
        setPlayerHand([cards[0], cards[2]]);
        setDealerHand([cards[1], cards[3]]);
        setMessage("Dein Zug!");
        setGameOver(false); // Spielstatus auf "Nicht vorbei" setzen
        setIsPlayerTurn(true); // Spieler beginnt das Spiel
    };

    // Hit - Eine Karte ziehen
    const handleHit = async () => {
        if (!deckId || gameOver || !isPlayerTurn) return;

        const card = await drawCards(1);
        const newHand = [...playerHand, ...card];
        setPlayerHand(newHand);

        const total = calculateHandValue(newHand);
        if (total > 21) {
            setMessage("Du hast überkauft! Dealer gewinnt.");
            setGameOver(true);
            setIsPlayerTurn(false);
        }
    };


    // Stand - Spieler hört auf zu ziehen, Dealer spielt nun
    const handleStand = async () => {
        setIsPlayerTurn(false);

        const playerTotal = calculateHandValue(playerHand);
        if (playerTotal > 21) {
            setMessage("Du hast überkauft! Dealer gewinnt.");
            setGameOver(true);
            return;
        }

        const currentHand = [...dealerHand];
        let dealerTotal = calculateHandValue(currentHand);

        while (dealerTotal < 17) {
            const card = await drawCards(1);
            currentHand.push(card[0]);
            dealerTotal = calculateHandValue(currentHand);
        }

        setDealerHand(currentHand);

        if (dealerTotal > 21) {
            setMessage("Dealer überkauft! Du gewinnst!");
        } else if (dealerTotal > playerTotal) {
            setMessage("Dealer gewinnt!");
        } else if (dealerTotal < playerTotal) {
            setMessage("Du gewinnst!");
        } else {
            setMessage("Unentschieden!");
        }

        setGameOver(true);
    };




    // Stapel beim Laden der Komponente erstellen
    useEffect(() => {
        createDeck();
    }, []);

    return (
        <div>
            <h1>Blackjack</h1>
            {!gameOver && (
                <button onClick={startGame}>Spiel starten</button>
            )}

            <div>
                <h2>Dealers Hand ({calculateHandValue(dealerHand)})</h2>
                <div>
                    {dealerHand.map((card, index) => (
                        <img key={index} src={card.image} alt={`${card.value} of ${card.suit}`} width="50" />
                    ))}
                </div>
            </div>

            <div>
                <h2>Deine Hand ({calculateHandValue(playerHand)})</h2>
                <div>
                    {playerHand.map((card, index) => (
                        <img key={index} src={card.image} alt={`${card.value} of ${card.suit}`} width="50" />
                    ))}
                </div>
            </div>

            <div>
                <p>{message}</p>
                {!gameOver && isPlayerTurn && (
                    <>
                        <button onClick={handleHit}>Hit</button>
                        <button onClick={handleStand}>Stand</button>
                    </>
                )}
                {gameOver && (
                    <button onClick={startGame}>Neues Spiel</button>
                )}
            </div>
        </div>
    );
};

export default BlackjackGame;
