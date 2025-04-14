// src/components/Card.tsx
type CardProps = {
    image: string;
};

const Card = ({ image }: CardProps) => {
    return <img src={image} alt="Karte" className="w-24 h-auto" />;
};

export default Card;
