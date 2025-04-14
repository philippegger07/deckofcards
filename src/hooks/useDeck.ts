// src/hooks/useDeck.ts
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://deckofcardsapi.com/api/deck";

const useDeck = () => {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [cards, setCards] = useState<any[]>([]);

    useEffect(() => {
        const createDeck = async () => {
            const res = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
            setDeckId(res.data.deck_id);
        };
        createDeck();
    }, []);

    const drawCard = async () => {
        if (!deckId) return;
        const res = await axios.get(`${API_URL}/${deckId}/draw/?count=1`);
        if (res.data.success) {
            setCards(prev => [...prev, ...res.data.cards]);
        }
    };

    return { cards, drawCard };
};

export default useDeck;
