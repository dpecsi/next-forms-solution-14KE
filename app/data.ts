// Közös típusok és konstans adatok. Több komponens is használja őket, ezért külön fájlban vannak,
// és onnan importáljuk: import { TICKETS, type Entry } from "@/app/data";

// --- Konstans adatok ---
// NEM állapot, mert soha nem változik: komponensen kívül van, így nem keletkezik
// újra minden rendereléskor.
export type Ticket = {
  id: string;
  label: string;
  price: number;
};

export const TICKETS: Ticket[] = [
  { id: "diak", label: "Diákjegy", price: 2000 },
  { id: "teljes", label: "Teljes árú jegy", price: 4000 },
  { id: "vip", label: "VIP jegy", price: 9000 },
];

// Az űrlap állapotának típusa. A mezők name attribútuma PONTOSAN ezekkel a kulcsokkal egyezik -
// erre épül az egyetlen közös eseménykezelő.
export type Form = {
  name: string;
  email: string;
  ticketId: string;
  guests: number;
  comment: string;
  accepted: boolean;
};

// A hibaüzenetek ugyanazokkal a kulcsokkal, de mind elhagyható: ami hiányzik, az a mező rendben van.
export type Errors = Partial<Record<keyof Form, string>>;

// Egy lezárt jelentkezés a listában
export type Entry = {
  id: number;
  name: string;
  ticketLabel: string;
  guests: number;
  total: number;
};

// A kezdőállapot is konstans: így az űrlap ürítése egyetlen sor lesz.
export const EMPTY_FORM: Form = {
  name: "",
  email: "",
  ticketId: "",
  guests: 0,
  comment: "",
  accepted: false,
};