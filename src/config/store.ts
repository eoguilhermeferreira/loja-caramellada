export const STORE_INFO = {
  name: "Caramellada Kids",
  instagram: "@caramelladakidsavare",
  instagramUrl: "https://instagram.com/caramelladakidsavare",
  whatsapp: "(14) 99852-7884",
  whatsappNumber: "5514998527884",
  email: "marciadamiao@hotmail.com",
  address: "667, Centro, Avaré/SP, CEP 18700-100",
  mapsUrl: "https://maps.google.com/?q=18700-100+Avaré+SP",
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
  "18",
  "20",
] as const;

export type Size = (typeof SIZES)[number];
