"use client"; // Saját állapota (useState) és eseménykezelői vannak, ezért kliens komponens.

import { ChangeEvent, SubmitEvent, useState } from "react";
import toast from "react-hot-toast";

import { ErrorMessage } from "@/app/components/ErrorMessage";
import FormField from "@/app/components/FormField";
import { EMPTY_FORM, Entry, Errors, Form, TICKETS } from "@/app/data";

function validate(data: Form): Errors {
  const result: Errors = {};
  if (data.name.trim().length == 0) result.name = "A név megadása kötelező";
  else if (data.name.trim().length < 3) result.name = "A névnek legalább 3 karakternek kell lennie";
  if (data.email.trim().length == 0) result.email = "Az email cím megadása kötelező";
  else if (!data.email.trim().includes("@"))
    result.email = "Az email címnek tartalmaznia kell @ jelet";
  if (data.ticketId === "") result.ticketId = "Válassz jegytípust";
  if (data.guests < 0 || data.guests > 5) result.guests = "Legfeljebb 5 kísérő lehet";
  if (!data.accepted) result.accepted = "El kell fogadnod a részvételi feltételeket";
  return result;
}

type RegistrationFormProps = {
  onAdd: (entry: Entry) => void;
};

export default function RegistrationForm({ onAdd }: RegistrationFormProps) {
  // A kiválasztott jegy és a fizetendő SZÁRMAZTATOTT érték, nem állapot: a ticketId-ból és a
  // kísérők számából minden rendereléskor újraszámoljuk (az élő összegzés - bónusz - is ezt mutatja).
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState(EMPTY_FORM);

  // --- 3. lépés: EGYETLEN eseménykezelő az összes mezőhöz ---
  // A mező name attribútuma adja meg, melyik kulcsot kell frissíteni: a [name] szögletes
  // zárójelben "számított kulcs", azaz a name változó ÉRTÉKE lesz a kulcs.
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    if (type === "checkbox") setForm((prev) => ({ ...prev, [name]: checked }));
    else if (type === "number") setForm((prev) => ({ ...prev, [name]: Number(value) }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- 4. és 6. lépés: beküldés ---
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    // Enélkül a böngésző újratöltené az oldalt, és minden állapot elveszne!
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Az űrlap hibás, javítsd a jelölt mezőket!");
      return;
    }
    const ticket = TICKETS.find((v) => v.id == form.ticketId)!;
    const entry: Entry = {
      id: e.timeStamp,
      name: form.name,
      ticketLabel: ticket.label,
      guests: 1 + form.guests,
      total: ticket.price * (1 + form.guests),
    };
    onAdd(entry);
    resetForm();
    toast.success(`Köszönjük ${entry.name}! Fizetendő: ${entry.total} Ft`);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    // A beküldést a form onSubmit eseménye kezeli - így az Enter billentyű is működik.
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* A FormField adja a címkét és a hibaüzenetet, a mezőt children-ként kapja. */}
        <FormField error={errors.name} htmlFor="name" label="Név">
          <input
            className={`input w-full ${errors.name ? "input-error" : ""}`}
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
          />
        </FormField>

        <FormField error={errors.email} htmlFor="email" label="E-mail">
          <input
            className={`input w-full ${errors.email ? "input-error" : ""}`}
            id="email"
            name="email"
            type="text"
            value={form.email}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField error={errors.ticketId} htmlFor="ticketId" label="Jegytípus">
          {/* A value a <select>-en van, nem az <option>-ökön. Az üres értékű első opció
              jelenti azt, hogy még nincs választás. */}
          <select
            className={`select w-full ${errors.ticketId ? "select-error" : ""}`}
            id="ticketId"
            name="ticketId"
            value={form.ticketId}
            onChange={handleChange}
          >
            <option value="">Válassz…</option>
            {TICKETS.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.label} ({ticket.price} Ft)
              </option>
            ))}
          </select>
        </FormField>

        <FormField error={errors.guests} htmlFor="guests" label="Kísérők száma">
          <input
            className={`input w-full ${errors.guests ? "input-error" : ""}`}
            id="guests"
            max={5}
            min={0}
            name="guests"
            type="number"
            value={form.guests}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <FormField htmlFor="comment" label="Megjegyzés (elhagyható)">
        <textarea
          className="textarea w-full"
          id="comment"
          name="comment"
          rows={2}
          value={form.comment}
          onChange={handleChange}
        />
      </FormField>

      {/* A checkboxnál a címke a mező MELLETT van, ezért itt nem a FormField-et használjuk,
          csak a hibaüzenet komponenst. */}
      <div>
        <label className="flex cursor-pointer items-center gap-2">
          {/* Checkboxnál a checked az állapot, nem a value! */}
          <input
            checked={form.accepted}
            className="checkbox checkbox-primary"
            name="accepted"
            type="checkbox"
            onChange={handleChange}
          />
          Elfogadom a részvételi feltételeket
        </label>
        <ErrorMessage message={errors.accepted} />
      </div>

      {/* Élő összegzés: azonnal frissül, ahogy a jegytípus vagy a kísérők száma változik. */}
      {form.ticketId && (
        <p className="rounded-xl bg-gray-100 p-3 text-sm">
          Fizetendő:{" "}
          <span className="font-bold tabular-nums">
            {TICKETS.find((v) => v.id == form.ticketId)!.price * (1 + form.guests)} Ft
          </span>{" "}
          ({TICKETS.find((v) => v.id == form.ticketId)!.price} Ft x {1 + form.guests} fő)
        </p>
      )}

      <div className="flex gap-3">
        <button className="btn btn-primary" type="submit">
          Jelentkezés
        </button>
        {/* A type="button" nélkül ez a gomb is beküldené az űrlapot! */}
        <button className="btn btn-outline" type="button" onClick={resetForm}>
          Ürítés
        </button>
      </div>
    </form>
  );
}
