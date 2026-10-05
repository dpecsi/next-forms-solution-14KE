import { Entry } from "@/app/data";

type EntryListProps = {
  entries: Entry[];
  onDelete: (id: number) => void;
};

export const EntryList = ({ entries }: EntryListProps) => {
  return (
    <div>
      <h2 className="mb-2 font-medium">Jelentkezések ({entries.length})</h2>
      {entries.length == 0 ? (
        <p className="text-gray-400 italic">Még nincs jelentkezés.</p>
      ) : (
        entries.map((entry) => (
          <p className="text-sm" key={entry.id}>
            <span className="font-bold">{entry.name}</span> {"\u2014"} {entry.ticketLabel},{" "}
            {entry.guests} kísérő
          </p>
        ))
      )}
    </div>
  );
};
