# Űrlapok — tanulói segédlet

Indítás:

```
npm run dev
```

Majd nyisd meg: http://localhost:8080

## 1. Kontrollált mező — `value` + `onChange`

A React-ben az űrlapmező értékét **az állapot adja**, nem a DOM. Ezt hívjuk kontrollált mezőnek:

```tsx
const [text, setText] = useState<string>("");

<input type="text" value={text} onChange={(e) => setText(e.target.value)} />;
```

Ez a kettő mindig együtt jár:

| Ami hiányzik | Mi történik?                                                                  |
| ------------ | ----------------------------------------------------------------------------- |
| `onChange`   | a mező „befagy": nem lehet bele gépelni (a React figyelmeztet is a konzolban) |
| `value`      | a mező kontrollálatlan lesz: működik, de az állapot nem tud róla              |

Az `e` az **eseményobjektum**, az `e.target` maga a mező (a DOM elem). Innen olvassuk ki az
értéket.

### Kontrollált és kontrollálatlan mező

- **Kontrollált:** `value` + `onChange`, az értéket az állapot adja. Erre van szükség, ha gépelés
  közben reagálni kell az értékre (élő validáció, számláló, egymástól függő mezők). Az űrlapjaink
  ilyenek.
- **Kontrollálatlan:** a DOM tárolja az értéket, a kezdőértéket a **`defaultValue`** adja. Ez a
  szabályos eszköz például szerkesztő űrlap előtöltésére, vagy Server Action-nel beküldött űrlapnál
  (az értéket a szerver a `FormData`-ból olvassa ki).
- **A kettőt nem keverjük:** kontrollált mezőn nincs `defaultValue`, csak `value`.

### Hol használható melyik? (`"use client"`)

- Kontrollált mezőhöz `useState` és `onChange` kell, ezek **csak kliens komponensben** érhetők el.
  Ezért a fájl tetején `"use client"` kell (vagy a fájlt egy `"use client"` fájl importálja).
- **Server Component**-ben nincs állapot és nincs eseménykezelő, ott csak kontrollálatlan mező
  lehet.
- A kliens komponens attól még szerveren is előrenderelődik (SSR): a kezdeti `value` benne van a
  HTML-ben, a böngészőben pedig hydration után kötődik be az `onChange`. A `"use client"` tehát nem
  azt jelenti, hogy a komponens csak a böngészőben fut.

## 2. Mit olvasunk ki az eseményből?

Minden mezőt ugyanaz a minta köt az állapothoz, csak az olvasott mező és az állapot típusa más:

| Mező                        | Az állapot típusa | Amit kiolvasunk    | Megjegyzés                                          |
| --------------------------- | ----------------- | ------------------ | --------------------------------------------------- |
| `text`, `email`, `password` | `string`          | `e.target.value`   |                                                     |
| `number`                    | `number`          | `e.target.value`   | **szöveg!** — `Number(...)`-rel alakítsd            |
| `date`                      | `string`          | `e.target.value`   | `"ÉÉÉÉ-HH-NN"` szöveg, nem `Date`                   |
| `select`                    | `string`          | `e.target.value`   | a `value` a `<select>`-en van, nem az `<option>`-ön |
| `textarea`                  | `string`          | `e.target.value`   | a tartalma a `value` prop, nem a tagek közé írjuk   |
| `checkbox`                  | `boolean`         | `e.target.checked` | `checked={...}`, nem `value={...}`                  |
| `radio` (csoport)           | `string`          | `e.target.value`   | azonos `name`, `checked={érték === állapot}`        |

TypeScriptben az eseményobjektum típusa a mező fajtájától függ:

```tsx
import { ChangeEvent, SubmitEvent } from "react";

const handleChange = (e: ChangeEvent<HTMLInputElement>) => { ... };   // input
const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => { ... };  // select
const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => { ... };    // form beküldése
```

> A React 19 típusaiban a régi **`FormEvent` elavult** (a szerkesztő át is húzza): beküldéshez
> `SubmitEvent`, mezőváltozáshoz `ChangeEvent` a helyes típus.

Ha közvetlenül a JSX-be írod a nyíl-függvényt (`onChange={(e) => ...}`), a típust a TypeScript
magától kitalálja — külön függvénynél viszont ki kell írni.

## 3. Több mező egyetlen objektum-állapotban

Sok mezőhöz sok `useState` is tartozhatna, de egy űrlapnál kényelmesebb **egy objektumban**
tartani az egészet. A mező `name` attribútuma legyen azonos az objektum kulcsával — így
**egyetlen** eseménykezelő elég az összes mezőhöz:

```tsx
const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};
```

```tsx
<input name="firstName" value={form.firstName} onChange={handleChange} />
<input name="lastName"  value={form.lastName}  onChange={handleChange} />
```

Két dolog történik itt:

- a **`[name]`** szögletes zárójelben „számított kulcs": a `name` változó _értéke_ lesz a kulcs,
- a **`...prev`** szétterítés miatt új objektum keletkezik — az állapotot sosem módosítjuk helyben
  (`form.firstName = "X"` **tilos**), mert azt a React nem venné észre.

Ha checkbox is van az űrlapon, a kezelő egy sorral bővül:

```tsx
const { name, value, type, checked } = e.target;
setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
```

Az űrlap ürítése így egyetlen sor: `setForm(EMPTY_FORM)` — ahol az `EMPTY_FORM` a komponensen
kívül definiált kezdőállapot.

## 4. Beküldés: `onSubmit` és `preventDefault()`

A beküldést a **`<form>` `onSubmit`** eseménye kezelje, ne a gomb `onClick`-je — így az **Enter**
billentyű is működik:

```tsx
const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
  e.preventDefault(); // enélkül a böngésző újratöltené az oldalt!
  // ... validáció, mentés, toast
};

<form onSubmit={handleSubmit}> ... </form>;
```

A `<form>`-on belül **minden `<button>` alapértelmezetten submit gomb**. Amelyik nem az (Mégse,
Ürítés), az kapjon `type="button"`-t:

```tsx
<button type="submit">Küldés</button>
<button type="button" onClick={reset}>Mégse</button>
```

## 5. Validáció és hibaüzenetek

A hibákat egy **külön állapotban** tartjuk, mezőnként:

```tsx
type Errors = Partial<Record<keyof Form, string>>; // minden kulcs elhagyható

const validate = (data: Form): Errors => {
  const result: Errors = {};
  if (data.username.trim() === "") result.username = "A felhasználónév kötelező.";
  if (data.password.length < 6) result.password = "A jelszó legalább 6 karakter legyen.";
  return result;
};
```

A beküldéskor lefuttatjuk, eltároljuk, és csak akkor megyünk tovább, ha üres:

```tsx
const found = validate(form);
setErrors(found);
if (Object.keys(found).length > 0) return;
```

Néhány gyakorlati szabály:

- **`trim()`**: a csupa szóközből álló szöveg is üresnek számít.
- A hibaüzenet **a mező alatt** jelenjen meg, és a mező is kapjon jelzést (`input-error`).
- Sikeres beküldés után adj visszajelzést (`toast.success`) és ürítsd az űrlapot.

## 6. daisyUI osztályok — gyors formázás

| Elem             | Osztály                              |
| ---------------- | ------------------------------------ |
| szövegmező       | `input w-full`                       |
| hibás mező       | `input input-error w-full`           |
| legördülő lista  | `select w-full`                      |
| többsoros szöveg | `textarea w-full`                    |
| checkbox         | `checkbox checkbox-primary`          |
| rádiógomb        | `radio radio-primary`                |
| címke            | `label`                              |
| gombok           | `btn btn-primary`, `btn btn-outline` |
| hibaüzenet       | `text-sm text-error`                 |

Ezek hozzák a keretet, a fókuszjelzést és a letiltott állapot formázását is — nem kell hozzájuk
külön Tailwind-osztálylista.

## 7. A demó (`app/page.tsx` + `app/components/`)

| Komponens             | Mit mutat be?                                                   |
| --------------------- | --------------------------------------------------------------- |
| `ControlledDemo.tsx`  | kontrollált mező, és mi történik `onChange` nélkül              |
| `FieldTypesDemo.tsx`  | az összes gyakori mezőtípus, élő állapotkiírással               |
| `ObjectStateDemo.tsx` | több mező egy objektum-állapotban, `name` + számított kulcs     |
| `SubmitDemo.tsx`      | `onSubmit`, `preventDefault()`, validáció, hibaüzenetek, ürítés |

Próbáld ki: a 2. szekcióban figyeld az állapot JSON-ját gépelés közben — jól látszik, melyik mező
milyen **típusú** értéket tárol (a szám mező is szöveget adna `Number()` nélkül!). A 4. szekcióban
küldd be az űrlapot üresen, majd javítsd a mezőket egyesével.

## 8. Gyakori hibák

1. **Hiányzó `onChange`.** A `value`-val ellátott mezőbe nem lehet gépelni — a React figyelmeztet
   a konzolban.
2. **Elmaradt `preventDefault()`.** Az oldal újratöltődik, és minden állapot elveszik.
3. **`onClick` az `onSubmit` helyett.** Így az Enter billentyűre nem történik semmi.
4. **`type="button"` hiánya** a Mégse/Ürítés gombon — az is beküldi az űrlapot.
5. **Az állapot helyben módosítása.** `form.email = "x"` helyett mindig új objektum kell:
   `setForm((prev) => ({ ...prev, email: "x" }))`.
6. **Szám mező szövegként.** Az `e.target.value` `number` típusú mezőnél is szöveg — `Number()`
   kell hozzá, különben `"1" + 1 === "11"`.
7. **Checkboxnál `value` olvasása.** Ott az `e.target.checked` az érték.
8. **`null` kezdőérték a mezőnek.** Az input `value`-ja nem lehet `null` — üres szöveg (`""`) a
   helyes kezdőérték (vagy `value={x ?? ""}`).

## 9. Dokumentáció

- [`<input>` – React dokumentáció](https://react.dev/reference/react-dom/components/input)
- [`<select>`](https://react.dev/reference/react-dom/components/select) ·
  [`<textarea>`](https://react.dev/reference/react-dom/components/textarea)
- [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)
- [daisyUI – Input, Select, Checkbox…](https://daisyui.com/components/input/)
