import { Entry } from "@/app/data";

type EntryListProps = {
  entries: Entry[];
  onDelete: (id: number) => void;
};

export const EntryList = ({ entries, onDelete }: EntryListProps) => {
  return (
    <div>
      <h2 className="mb-2 font-medium">Jelentkezések ({entries.length})</h2>
      {entries.length == 0 ? (
        <p className="text-gray-400 italic">Még nincs jelentkezés.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <li className="flex items-center justify-between py-2 text-sm" key={entry.id}>
              <span>
                <span className="font-bold">{entry.name}</span> {"\u2014"} {entry.ticketLabel},{" "}
                {entry.guests} kísérő
              </span>
              <span className="flex items-center gap-3">
                <span className="text-right font-semibold tabular-nums">{entry.total} Ft</span>
                <button
                  className="btn btn-ghost btn-xs"
                  title="Törlés"
                  type="button"
                  onClick={() => {
                    onDelete(entry.id);
                  }}
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
