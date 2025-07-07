'use client';

interface CardProps {
    value: string;
    image: string;
}

const Card: React.FC<{ value: string; image: string }> = ({ image }) => (
    <img className="card" src={image} alt="card" />
);

export default Card;