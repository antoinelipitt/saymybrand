export type Brand = {
  name: string;
  flag: string;
  origin: string;
  reason: string;
};

export const HALL_OF_SHAME: Brand[] = [
  {
    name: "Bvlgari",
    flag: "🇮🇹",
    origin: "Italy",
    reason: "The V is read as a U — most AIs miss it",
  },
  {
    name: "Hyundai",
    flag: "🇰🇷",
    origin: "South Korea",
    reason: "Endless variants: Hi-yun-die, Hun-day, Hyoon-die",
  },
  {
    name: "Tag Heuer",
    flag: "🇨🇭",
    origin: "Switzerland",
    reason: "Few models ever get the German Heuer right",
  },
  {
    name: "Givenchy",
    flag: "🇫🇷",
    origin: "France",
    reason: "French nasal sounds defeat most TTS models",
  },
  {
    name: "Hermès",
    flag: "🇫🇷",
    origin: "France",
    reason: "Silent S? Pronounced S? Models can't agree",
  },
  {
    name: "Porsche",
    flag: "🇩🇪",
    origin: "Germany",
    reason: "Two syllables, not one — Por-shuh",
  },
  {
    name: "Huawei",
    flag: "🇨🇳",
    origin: "China",
    reason: "Wah-way trips up nearly every Western model",
  },
  {
    name: "Moët",
    flag: "🇫🇷",
    origin: "France",
    reason: "The T is meant to be pronounced — most omit it",
  },
  {
    name: "Versace",
    flag: "🇮🇹",
    origin: "Italy",
    reason: "Ver-sah-chey, never Ver-sayce",
  },
];
