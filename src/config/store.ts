export const STORE_INFO = {
  name: "Caramellada Kids",
  instagram: "@caramelladakidsavare",
  instagramUrl: "https://instagram.com/caramelladakidsavare",
  whatsapp: "(14) 99852-7789",
  whatsappNumber: "5514998527789",
  email: "marciadamiao@hotmail.com",
} as const;

export const SIZES = [
  "RN",
  "P",
  "M",
  "G",
  "1",
  "2",
  "3",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
] as const;

export type Size = (typeof SIZES)[number];
