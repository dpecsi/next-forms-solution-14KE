# Űrlap gyakorló feladat — „🎟️ Rendezvény-jelentkezés"

## A feladat célja

Egy rövid, de teljes értékű űrlap megírása **komponensekre bontva**: kontrollált mezők, **egy**
objektum-állapot, beküldés és validáció. Emellett a komponensek közti adatátadást (props,
`children`, callback) is gyakorolod. A formázást a daisyUI kész osztályai intézik, így a hangsúly
az űrlapkezelésen és a komponenseken marad.

| Amit gyakorolsz             | Hol?                                                  |
| --------------------------- | ----------------------------------------------------- |
| kontrollált mezők           | minden mező (`value` + `onChange`)                    |
| egy objektum-állapot        | `name` attribútum + számított kulcs (`[name]`)        |
| checkbox és select kezelése | `e.target.checked` vs. `e.target.value`               |
| beküldés                    | `onSubmit` + `e.preventDefault()`                     |
| validáció                   | hibaüzenetek mezőnként, `input-error` osztállyal      |
| komponens és props típusa   | minden komponens (`type ...Props`)                    |
| `children` prop             | `FormField` — a mezőt „körbeölelő" keret              |
| callback prop               | `onAdd`, `onDelete` — a gyerek szól a szülőnek        |
| állapot felemelése          | a jelentkezések listája a közös szülőben (`page.tsx`) |

Segédlet: `FORMS.md`, a komponensekhez a [next-components-demo](https://github.com/nits68/next-components-demo).

## Játékszabályok

**Használható:**

- a lent megadott fájlok: `app/data.ts`, `app/page.tsx` és az `app/components/` mappa komponensei,
- a `useState` hook és a `react-hot-toast` (a `<Toaster>` már be van kötve),
- a **daisyUI** osztályai (`input`, `select`, `checkbox`, `btn`, …).

**Nem használható (nem kell hozzá):** `useEffect`, `useRef`, `useContext`, globális store, backend,
űrlapkezelő könyvtár (react-hook-form, Formik).

## A kész alkalmazás

Egy középre igazított kártyán egy űrlap:

1. **Név** (szöveg) — kötelező, legalább 3 karakter
2. **E-mail** (szöveg) — kötelező, tartalmaznia kell `@` jelet
3. **Jegytípus** (legördülő lista) — diák / teljes árú / VIP, alapból „válassz…"
4. **Kísérők száma** (szám) — 0 és 5 között
5. **Megjegyzés** (többsoros szöveg) — elhagyható
6. **Elfogadom a részvételi feltételeket** (checkbox) — kötelező
7. **„Jelentkezés" és „Ürítés" gomb**, a beküldött jelentkezések listája alattuk

## A komponensek

```
page.tsx  (HomePage)              ← entries állapot: a jelentkezések listája
├── RegistrationForm              ← form és errors állapot, validáció, beküldés
│   ├── FormField  (× 5)          ← címke + a mező (children) + hibaüzenet
│   │   └── ErrorMessage
│   └── ErrorMessage              ← a checkbox hibaüzenete
└── EntryList                     ← a jelentkezések megjelenítése
```

| Fájl                                  | Props                                    | Állapota         |
| ------------------------------------- | ---------------------------------------- | ---------------- |
| `app/page.tsx`                        | —                                        | `entries`        |
| `app/components/RegistrationForm.tsx` | `onAdd: (entry: Entry) => void`          | `form`, `errors` |
| `app/components/FormField.tsx`        | `label`, `htmlFor`, `error?`, `children` | nincs            |
| `app/components/ErrorMessage.tsx`     | `message?`                               | nincs            |
| `app/components/EntryList.tsx`        | `entries`, `onDelete` (bónusz)           | nincs            |

Az állapot mindig **annál a komponensnél** legyen, amelyiknek szüksége van rá:

- A mezők értéke és a hibák csak az űrlapot érdeklik → a `RegistrationForm`-ban vannak.
- A jelentkezések listáját az űrlap **bővíti**, a lista **megjeleníti** → a közös szülőben, a
  `page.tsx`-ben van. Lefelé propként megy tovább, felfelé a callbackeken (`onAdd`, `onDelete`)
  érkeznek a változások.

> `"use client"` azokba a fájlokba kell, amelyek `useState`-et használnak: `page.tsx` és
> `RegistrationForm.tsx`. A többi komponenst ezek importálják, így azok is a kliensen futnak.

## Adatok — `app/data.ts`

Több komponens is használja őket, ezért egy közös fájlba kerülnek, és onnan **exportáljuk**:

```tsx
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

export type Form = {
  name: string;
  email: string;
  ticketId: string;
  guests: number;
  comment: string;
  accepted: boolean;
};

export type Errors = Partial<Record<keyof Form, string>>;

export type Entry = {
  id: number;
  name: string;
  ticketLabel: string;
  guests: number;
  total: number;
};

export const EMPTY_FORM: Form = {
  name: "",
  email: "",
  ticketId: "",
  guests: 0,
  comment: "",
  accepted: false,
};
```

Használat: `import { EMPTY_FORM, Entry, Form, TICKETS } from "@/app/data";`

---

## 1. lépés — Az oldal váza (`page.tsx`)

Készítsd el a `HomePage` komponenst egy kártyával (`<h1>` cím), és benne egy `entries` állapotot
(`Entry[]`, üres tömbbel). Hozd létre a `RegistrationForm` és az `EntryList` komponenst egyelőre
egy egyszerű szöveggel, és tedd be őket a kártyába:

```tsx
<RegistrationForm onAdd={addEntry} />
<EntryList entries={entries} />
```

Az `addEntry` az új jelentkezést a lista **végére** teszi, szétterítéssel (`push()` tilos!):

```tsx
const addEntry = (entry: Entry) => {
  setEntries((prev) => [...prev, entry]);
};
```

> Figyeld meg: a függvényt adjuk át (`onAdd={addEntry}`), **nem** a hívását (`addEntry()`).

## 2. lépés — Kis építőkockák: `ErrorMessage` és `FormField`

**`ErrorMessage`**: egy elhagyható `message` propot kap. Ha nincs üzenet, `null`-t ad vissza
(semmit nem jelenít meg), különben:

```tsx
<p className="mt-1 text-sm text-error">{message}</p>
```

**`FormField`**: egy mező „kerete". A mezőt `children`-ként kapja, köré rakja a címkét és a
hibaüzenetet:

```tsx
type FormFieldProps = {
  label: string;
  htmlFor: string; // a mező id-je
  error?: string;
  children: React.ReactNode;
};
```

```tsx
<div>
  <label className="label" htmlFor={htmlFor}>
    {label}
  </label>
  {children}
  <ErrorMessage message={error} />
</div>
```

Használata az űrlapban:

```tsx
<FormField error={errors.name} htmlFor="name" label="Név">
  <input id="name" name="name" ... />
</FormField>
```

## 3. lépés — Az űrlap állapota és a mezők (`RegistrationForm`)

Készíts egy `form` állapotot `EMPTY_FORM` kezdőértékkel, egy `errors` állapotot (`{}`), és
**egyetlen** eseménykezelőt az összes mezőhöz:

```tsx
const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => {
  const { name, value, type } = e.target;
  // ...
};
```

- minden mező kapjon `name` attribútumot, ami **megegyezik** a `Form` típus kulcsával,
- a **checkbox**nál az `e.target.checked` az érték (a `type === "checkbox"` ágban),
- a **szám** mezőnél `Number(value)`-t tárolj, ne szöveget,
- az állapotot mindig szétterítéssel frissítsd: `setForm((prev) => ({ ...prev, [name]: ... }))`.

> A checkbox `checked` mezőjéhez a TypeScript miatt szűkítés kell, például:
> `const checked = "checked" in e.target ? e.target.checked : false;`
> (Vagy írj a checkboxnak külön, kétsoros kezelőt — az is elfogadható megoldás.)

A jegytípus legördülő listát a `TICKETS` tömbből `map()`-peld ki (`key` kötelező!), és legyen egy
üres értékű első opció: `<option value="">Válassz…</option>`.

Az öt mező (név, e-mail, jegytípus, kísérők, megjegyzés) egy-egy `FormField`-be kerül. A
checkboxnál a címke a mező **mellett** van, ezért ott saját `<label>` kell, alatta csak az
`ErrorMessage`.

Formázás daisyUI-jal:

| Mező             | Osztály                     |
| ---------------- | --------------------------- |
| szöveg, szám     | `input w-full`              |
| legördülő lista  | `select w-full`             |
| megjegyzés       | `textarea w-full`           |
| checkbox         | `checkbox checkbox-primary` |
| Jelentkezés gomb | `btn btn-primary`           |
| Ürítés gomb      | `btn btn-outline`           |

A név és az e-mail mező kis képernyőtől (`sm:`) két oszlopban jelenjen meg
(`grid gap-3 sm:grid-cols-2`).

## 4. lépés — Beküldés

A gombok egy `<form>`-on belül legyenek, a beküldést az `onSubmit` kezelje
(`const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => { ... }`):

- `e.preventDefault()` — enélkül az oldal újratöltődik,
- az „Ürítés" gomb kapjon `type="button"`-t (különben az is beküldené az űrlapot), és állítsa
  vissza az `EMPTY_FORM`-ot és a hibákat.

## 5. lépés — Validáció

Írj egy `validate(data: Form): Errors` függvényt, ami egy **hibaobjektumot** ad vissza (kulcs =
mezőnév). Nem használ semmit a komponensből, ezért a komponensen **kívül** is lehet.

| Mező       | Szabály                                            |
| ---------- | -------------------------------------------------- |
| `name`     | nem üres (`trim()`!), és legalább 3 karakter       |
| `email`    | nem üres, és tartalmaz `@` jelet (`includes("@")`) |
| `ticketId` | ki van választva (nem üres)                        |
| `guests`   | 0 és 5 közötti szám                                |
| `accepted` | igaz                                               |

A beküldéskor futtasd le, tedd `errors` állapotba, és ha van benne bármi
(`Object.keys(found).length > 0`), `toast.error(...)` után **ne** menj tovább.

A hibás mező kapjon `input-error` (illetve `select-error`) osztályt; a hibaüzenetet a `FormField`
`error` propja jeleníti meg.

## 6. lépés — Sikeres jelentkezés

Ha nincs hiba:

1. számold ki a fizetendőt: a jegy ára × (1 + kísérők száma) — ez **származtatott** érték,
2. állítsd össze az `Entry` objektumot (`id: Date.now()`), és add át a szülőnek: `onAdd(entry)`,
3. `toast.success(...)` a névvel és az összeggel,
4. ürítsd az űrlapot (`EMPTY_FORM`) és a hibákat is.

> Az űrlap nem tudja, és nem is kell tudnia, hová kerül a jelentkezés — ez a szülő dolga.

## 7. lépés — A lista (`EntryList`)

A lista az `entries` propot jeleníti meg: név, jegytípus, kísérők száma, fizetendő. Üres listánál
egy szürke, dőlt „Még nincs jelentkezés." szöveg. A `map()`-nél legyen `key` (az `entry.id`).
A lista **nem** tárol állapotot: csak azt mutatja, amit kap.

---

## Ellenőrző lista

- [ ] Minden mező kontrollált (`value`/`checked` + `onChange`).
- [ ] **Egy** objektum-állapot tartja az összes mezőt, a `name` attribútumok a kulcsokkal egyeznek.
- [ ] A szám mező `number` típusú értéket tárol, a checkbox logikait.
- [ ] A beküldést az `onSubmit` kezeli `e.preventDefault()`-tal, az Ürítés gomb `type="button"`.
- [ ] Hibás űrlap esetén mezőnkénti hibaüzenet jelenik meg, és nem kerül be új jelentkezés.
- [ ] Sikeres beküldés után ürül az űrlap, és bekerül egy tétel a listába.
- [ ] A megoldás a fenti komponensekből áll, mindegyiknek típusos props-a van (`type ...Props`).
- [ ] A `FormField` a mezőt `children`-ként kapja; az `EntryList`-nek nincs saját állapota.
- [ ] Az `entries` állapot a `page.tsx`-ben van, az űrlap az `onAdd` callbackkel bővíti.
- [ ] A vezérlők daisyUI osztályokat használnak, a `map()`-eknél van `key`.

## Gyakori hibák

1. **Elmaradt `preventDefault()`** — az oldal újratöltődik, minden állapot elveszik.
2. **`type="button"` hiánya** az Ürítés gombon — az is beküldi az űrlapot.
3. **Szám mező szövegként tárolva** — `Number()` nélkül `"2" + 1 === "21"`.
4. **Checkboxnál `value` olvasása** — ott az `e.target.checked` az érték.
5. **Az állapot helyben módosítása** (`form.name = ...`, `entries.push(...)`) — mindig új
   objektum/tömb kell.
6. **A callback meghívása átadás helyett** — `onAdd={addEntry()}` vagy `onClick={onDelete(id)}`
   már rendereléskor lefut. Helyesen: `onAdd={addEntry}`, `onClick={() => onDelete(id)}`.
7. **Az `entries` állapot az űrlapban** — akkor a lista nem fér hozzá. A közös szülőben a helye.
8. **Hiányzó `export`** — a `data.ts` elemei és a komponensek csak exportálva importálhatók.

## Bónusz (opcionális)

- **Élő összegzés:** a gomb fölött mutasd a fizetendőt, amint a jegytípus vagy a kísérők száma
  változik (származtatott érték, nem állapot).
- **Törlés:** minden lista-tétel mellé egy `btn btn-ghost btn-xs` törlés gomb. Az `EntryList` kap
  egy `onDelete: (id: number) => void` propot, a törlést pedig a `page.tsx` végzi `filter()`-rel.
