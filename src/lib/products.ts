export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "A Single Grain of Sand",
    description: "The most exquisite, hand-picked grain of sand. Perfect for collectors.",
    price: 0.01,
    imageUrl: "/sand.png",
  },
  {
    id: "2",
    name: "Invisible Cloak (Pre-owned)",
    description: "Guaranteed to make you disappear. May or may not be actually there. No refunds.",
    price: 999999.99,
    imageUrl: "/cloak.png",
  },
  {
    id: "3",
    name: "The Sound of One Hand Clapping",
    description: "A truly unique auditory experience. Best enjoyed in absolute silence. Batteries not included (or needed).",
    price: 42.00,
    imageUrl: "/hand.png",
  },
  {
    id: "4",
    name: "Certified Pre-Owned Nothing",
    description: "It's nothing. Literally. But it's certified, so you know it's good nothing.",
    price: 12345.67,
    imageUrl: "/nothing.png",
  },
  {
    id: "5",
    name: "A Moment of Pure Silence",
    description: "Rare and fleeting. Capture it before it's gone. Limited edition.",
    price: 0.99,
    imageUrl: "/silence.png",
  },

];
