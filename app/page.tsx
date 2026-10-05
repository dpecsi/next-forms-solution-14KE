"use client";

import { useState } from "react";

import { EntryList } from "@/app/components/EntryList";
import RegistrationForm from "@/app/components/RegistrationForm";
import { Entry } from "@/app/data";

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const addEntry = (entry: Entry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const deleteEntry = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id != id));
  };

  return (
    <main className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl space-y-5 self-start rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-2xl font-bold">🎟️ Rendezvény-jelentkezés</h1>
        <RegistrationForm onAdd={addEntry} />
        <EntryList entries={entries} onDelete={deleteEntry} />
      </div>
    </main>
  );
}
