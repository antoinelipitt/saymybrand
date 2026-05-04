export type Brand = {
  name: string;
  flag: string;
  origin: string;
  correctPronunciation: string;
  reason: string;
  mockScore: { correct: number; total: number };
};

export const HALL_OF_SHAME: Brand[] = [
  {
    name: "Bvlgari",
    flag: "🇮🇹",
    origin: "Italy",
    correctPronunciation: "Bull-gah-ree",
    reason: "The V is read as a U — most AIs miss it",
    mockScore: { correct: 1, total: 4 },
  },
  {
    name: "Hyundai",
    flag: "🇰🇷",
    origin: "South Korea",
    correctPronunciation: "Hyun-day",
    reason: "Endless variants: Hi-yun-die, Hun-day, Hyoon-die",
    mockScore: { correct: 0, total: 4 },
  },
  {
    name: "Tag Heuer",
    flag: "🇨🇭",
    origin: "Switzerland",
    correctPronunciation: "Tag Hoy-er",
    reason: "Few models ever get the German Heuer right",
    mockScore: { correct: 1, total: 4 },
  },
  {
    name: "Givenchy",
    flag: "🇫🇷",
    origin: "France",
    correctPronunciation: "Zhee-vohn-shee",
    reason: "French nasal sounds defeat most TTS models",
    mockScore: { correct: 2, total: 4 },
  },
  {
    name: "Hermès",
    flag: "🇫🇷",
    origin: "France",
    correctPronunciation: "Air-mez",
    reason: "Silent S? Pronounced S? Models can't agree",
    mockScore: { correct: 1, total: 4 },
  },
  {
    name: "Porsche",
    flag: "🇩🇪",
    origin: "Germany",
    correctPronunciation: "Por-shuh",
    reason: "Two syllables, not one — Por-shuh",
    mockScore: { correct: 2, total: 4 },
  },
  {
    name: "Huawei",
    flag: "🇨🇳",
    origin: "China",
    correctPronunciation: "Wah-way",
    reason: "Wah-way trips up nearly every Western model",
    mockScore: { correct: 1, total: 4 },
  },
  {
    name: "Moët",
    flag: "🇫🇷",
    origin: "France",
    correctPronunciation: "Mo-ett",
    reason: "The T is meant to be pronounced — most omit it",
    mockScore: { correct: 0, total: 4 },
  },
  {
    name: "Versace",
    flag: "🇮🇹",
    origin: "Italy",
    correctPronunciation: "Ver-sah-chey",
    reason: "Ver-sah-chey, never Ver-sayce",
    mockScore: { correct: 2, total: 4 },
  },
];
