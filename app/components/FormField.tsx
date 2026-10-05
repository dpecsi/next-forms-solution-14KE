// --- 2. lépés: keret komponens a children proppal ---
// Minden mező ugyanúgy néz ki: címke, maga a mező, alatta az esetleges hibaüzenet.

import { ErrorMessage } from "@/app/components/ErrorMessage";

// A mezőt (input, select, textarea) a hívó adja át children-ként, a FormField csak "körbeöleli".
type FormFieldProps = {
  label: string;
  htmlFor: string; // a mező id-je: erre mutat a címke, így a címkére kattintva a mező kap fókuszt
  error?: string;
  children: React.ReactNode;
};

export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <ErrorMessage message={error} />
    </div>
  );
}
