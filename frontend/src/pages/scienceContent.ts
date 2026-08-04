export type ScienceImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export type ScienceQuestion = {
  id: string;
  prompt: string;
  points: number;
  hint?: string;
  image?: ScienceImage;
};

export type ScienceUnit = {
  id: string;
  title: string;
  theme: string;
  intro: string;
  images: ScienceImage[];
  questions: ScienceQuestion[];
};

export const scienceUnits: ScienceUnit[] = [
  {
    id: 'greenhouse-observation',
    title: 'Observation 1: Greenhouse effect',
    theme: 'Earth and climate',
    intro: 'Students compare how heat behaves in a glass box and in open air. They use evidence from the figures to explain why the inside stays warmer.',
    images: [
      {
        id: 'greenhouse-figure',
        src: '/science-images/greenhouse-ecosystem.svg',
        alt: 'Diagram of a greenhouse with sunlight entering and heat trapped inside',
        caption: 'Figure 1. A greenhouse traps heat inside a glass chamber.',
      },
    ],
    questions: [
      {
        id: 'greenhouse-1',
        prompt: 'What is the main reason the air inside the greenhouse becomes warmer than the air outside?',
        points: 2,
        hint: 'Think about what happens to sunlight and heat after it enters.',
        image: {
          id: 'greenhouse-figure',
          src: '/science-images/greenhouse-ecosystem.svg',
          alt: 'Diagram of a greenhouse with sunlight entering and heat trapped inside',
          caption: 'Use this figure to support your answer.',
        },
      },
      {
        id: 'greenhouse-2',
        prompt: 'Name two pieces of evidence from the figure that support your explanation.',
        points: 3,
        hint: 'Look for the path of sunlight and the direction of heat.',
      },
      {
        id: 'greenhouse-3',
        prompt: 'Explain how this effect might influence the growth of plants in the greenhouse.',
        points: 3,
        hint: 'Link temperature to plant growth and water loss.',
      },
    ],
  },
  {
    id: 'water-cycle',
    title: 'Observation 2: Water cycle in a pond',
    theme: 'Water and weather',
    intro: 'Students follow a simple water-cycle story around a pond and decide which changes happen because of heat or cooling.',
    images: [
      {
        id: 'water-cycle-figure',
        src: '/science-images/water-cycle.svg',
        alt: 'Illustration of water evaporating from a pond and forming clouds',
        caption: 'Figure 2. Heat causes water to evaporate, then cool and fall again.',
      },
    ],
    questions: [
      {
        id: 'water-1',
        prompt: 'Which stage in the water cycle happens first after the sun warms the pond?',
        points: 2,
        image: {
          id: 'water-cycle-figure',
          src: '/science-images/water-cycle.svg',
          alt: 'Illustration of water evaporating from a pond and forming clouds',
          caption: 'Use this figure to identify the first stage.',
        },
      },
      {
        id: 'water-2',
        prompt: 'Describe what happens after the water vapor rises and cools.',
        points: 3,
        hint: 'Think about clouds and precipitation.',
      },
      {
        id: 'water-3',
        prompt: 'Why does the pond lose water faster on a hot day than on a cool day?',
        points: 3,
        hint: 'Connect temperature to evaporation rate.',
      },
    ],
  },
  {
    id: 'plant-growth',
    title: 'Observation 3: Plant growth under light',
    theme: 'Living things and energy',
    intro: 'Students compare two plants and decide which environment is better for steady growth and why.',
    images: [
      {
        id: 'plant-growth-figure',
        src: '/science-images/plant-growth.svg',
        alt: 'Comparison of two plants grown in different light conditions',
        caption: 'Figure 3. One plant is grown under stronger light and another under weaker light.',
      },
    ],
    questions: [
      {
        id: 'plant-1',
        prompt: 'Which plant is likely to grow faster over time, and why?',
        points: 2,
        image: {
          id: 'plant-growth-figure',
          src: '/science-images/plant-growth.svg',
          alt: 'Comparison of two plants grown in different light conditions',
          caption: 'Use this figure to compare the two plants.',
        },
      },
      {
        id: 'plant-2',
        prompt: 'Give one limitation of this comparison and one way to improve the investigation.',
        points: 3,
        hint: 'Think about controlled variables such as water and soil.',
      },
    ],
  },
];
