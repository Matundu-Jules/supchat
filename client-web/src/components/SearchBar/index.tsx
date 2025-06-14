import { useState, useEffect } from "react";
import useDebounce from "@hooks/useDebounce";
import { searchAll } from "@services/searchApi";
import styles from "./SearchBar.module.scss";

interface Results {
  messages: any[];
  channels: any[];
  files: any[];
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({
    messages: [],
    channels: [],
    files: [],
  });

  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({ messages: [], channels: [], files: [] });
      return;
    }
    searchAll(debounced)
      .then((data) => setResults(data))
      .catch((e) => console.error(e));
  }, [debounced]);

  return (
    <div className={styles["container"]}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Recherche..."
        className={styles["input"]}
      />
      {(results.messages.length || results.channels.length || results.files.length) && (
        <ul className={styles["results"]}>
          {results.messages.length > 0 && (
            <>
              <li className={styles["type-heading"]}>Messages</li>
              {results.messages.map((m) => (
                <li key={m._id} className={styles["result-item"]}>
                  {(m.text || m.content || "").slice(0, 80)}
                </li>
              ))}
            </>
          )}
          {results.files.length > 0 && (
            <>
              <li className={styles["type-heading"]}>Fichiers</li>
              {results.files.map((f) => (
                <li key={f._id} className={styles["result-item"]}>
                  {f.originalName || f.filename}
                </li>
              ))}
            </>
          )}
          {results.channels.length > 0 && (
            <>
              <li className={styles["type-heading"]}>Canaux</li>
              {results.channels.map((c) => (
                <li key={c._id} className={styles["result-item"]}>
                  {c.name}
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
