type DeckProps = {
    drawCard: () => void;
  };
  
  const Deck = ({ drawCard }: DeckProps) => {
    return (
      <button
        onClick={drawCard}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Karte ziehen
      </button>
    );
  };
  
  export default Deck;
  