export const FRAMES = [
  {
    id: "frm_circle",
    name: "Circle",
    style: {
      borderRadius: "9999px",
    },
  },
  {
    id: "frm_diagonal_capsule",
    name: "Diagonal Capsule",
    style: {
      borderTopLeftRadius: "2rem", // rounded-tl-4xl
      borderBottomRightRadius: "2rem", // rounded-br-4xl
    },
  },
  {
    id: "frm_triple_rounded",
    name: "Triple Rounded",
    style: {
      borderTopLeftRadius: "1.5rem", // rounded-tl-3xl
      borderTopRightRadius: "1.5rem", // rounded-tr-3xl
      borderBottomLeftRadius: "1.5rem", // rounded-bl-3xl
    },
  },
  {
    id: "frm_leaf",
    name: "Leaf",
    style: {
      borderTopRightRadius: "9999px", // rounded-tr-full
      borderBottomRightRadius: "9999px",
      borderTopLeftRadius: "9999px", // rounded-l-full
      borderBottomLeftRadius: "9999px",
    },
  },
  {
    id: "frm_corner_bump",
    name: "Corner Bump",
    style: {
      borderTopLeftRadius: "0.125rem", // rounded-tl-sm
      borderTopRightRadius: "1.5rem", // rounded-tr-3xl
      borderBottomRightRadius: "1.5rem", // rounded-br-3xl
      borderBottomLeftRadius: "0.5rem", // rounded-bl-lg
    },
  },
  {
    id: "frm_organic_blob",
    name: "Organic Blob",
    style: {
      borderTopLeftRadius: "1.5rem", // rounded-tl-3xl
      borderTopRightRadius: "0.5rem", // rounded-tr-lg
      borderBottomRightRadius: "1rem", // rounded-br-2xl
      borderBottomLeftRadius: "0.125rem", // rounded-bl-sm
    },
  },
];

export const AVATARS = [
  { id: "avat_1", src: "/avatars/1.svg" },
  { id: "avat_2", src: "/avatars/2.svg" },
  { id: "avat_3", src: "/avatars/3.svg" },
  { id: "avat_4", src: "/avatars/4.svg" },
  { id: "avat_5", src: "/avatars/5.svg" },
  { id: "avat_6", src: "/avatars/6.svg" },
  { id: "avat_7", src: "/avatars/7.svg" },
  { id: "avat_8", src: "/avatars/8.svg" },
  { id: "avat_9", src: "/avatars/9.svg" },
  { id: "avat_10", src: "/avatars/10.svg" },
  { id: "avat_11", src: "/avatars/11.svg" },
  { id: "avat_12", src: "/avatars/12.svg" },
];

export const BACKGROUND = [
  { id: "red-800", color: "oklch(44.4% 0.177 26.899)", textColor: "#000000" },
  { id: "lime-800", color: "oklch(45.3% 0.124 130.933)", textColor: "#000000" },
  { id: "blue-800", color: "oklch(42.4% 0.199 265.638)", textColor: "#000000" },
  {
    id: "green-500",
    color: "oklch(72.3% 0.219 149.579)",
    textColor: "#000000",
  },
  { id: "stone-800", color: "oklch(26.8% 0.007 34.298)", textColor: "#ffffff" },
  {
    id: "yellow-500",
    color: "oklch(79.5% 0.184 86.047)",
    textColor: "#000000",
  },
  { id: "pink-500", color: "oklch(65.6% 0.241 354.308)", textColor: "#000000" },
  {
    id: "orange-500",
    color: "oklch(70.5% 0.213 47.604)",
    textColor: "#000000",
  },
  {
    id: "fuchsia-500",
    color: "oklch(66.7% 0.295 322.15)",
    textColor: "#000000",
  },
];

export function getRandomBackground() {
  return BACKGROUND[Math.floor(Math.random() * BACKGROUND.length)];
}

export function getBackgroundById(id?: string) {
  return BACKGROUND.find((b) => b.id === id) || null;
}

export function getFrameById(id?: string) {
  return FRAMES.find((b) => b.id === id) || null;
}

export function getAvatarById(id?: string) {
  return AVATARS.find((b) => b.id === id) || null;
}
