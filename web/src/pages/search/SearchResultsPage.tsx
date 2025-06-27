import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchAll, SearchResult } from "@services/searchApi";
import SearchBar from "@components/core/ui/SearchBar";
import Loader from "@components/core/ui/Loader";

const DEBOUNCE = 350;

const SearchResultsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<{
    messages: SearchResult[];
    channels: SearchResult[];
    users: SearchResult[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchAll(q);
      setResults(res);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults(null);
      setParams({});
      return;
    }
    setParams({ q: query });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), DEBOUNCE);
    // eslint-disable-next-line
  }, [query]);

  const handleNavigate = (r: SearchResult) => {
    if (r.type === "message" && r.channelId && r.workspaceId) {
      navigate(
        `/workspaces/${r.workspaceId}/channels/${r.channelId}?highlight=${r.id}`
      );
    } else if (r.type === "channel" && r.workspaceId) {
      navigate(`/workspaces/${r.workspaceId}/channels/${r.id}`);
    } else if (r.type === "user") {
      navigate(`/users/${r.id}`);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Rechercher messages, canaux, utilisateurs..."
        autoFocus
      />
      {loading && <Loader />}
      {error && (
        <div
          style={{
            color: "var(--color-error)",
            textAlign: "center",
            margin: "2rem 0",
          }}
        >
          {error}
        </div>
      )}
      {results && (
        <div style={{ marginTop: "2rem" }}>
          {results.messages.length === 0 &&
          results.channels.length === 0 &&
          results.users.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888" }}>
              Aucun résultat trouvé
            </div>
          ) : (
            <>
              {results.messages.length > 0 && (
                <section style={{ marginBottom: "2rem" }}>
                  <h3>Messages</h3>
                  <ul>
                    {results.messages.map((m) => (
                      <li
                        key={m.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate(m)}
                      >
                        <div style={{ fontWeight: 500 }}>{m.snippet}</div>
                        <div style={{ fontSize: "1.1rem", color: "#888" }}>
                          {m.title}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {results.channels.length > 0 && (
                <section style={{ marginBottom: "2rem" }}>
                  <h3>Canaux</h3>
                  <ul>
                    {results.channels.map((c) => (
                      <li
                        key={c.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate(c)}
                      >
                        <div style={{ fontWeight: 500 }}>{c.title}</div>
                        {c.snippet && (
                          <div style={{ fontSize: "1.1rem", color: "#888" }}>
                            {c.snippet}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {results.users.length > 0 && (
                <section>
                  <h3>Utilisateurs</h3>
                  <ul>
                    {results.users.map((u) => (
                      <li
                        key={u.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate(u)}
                      >
                        <div style={{ fontWeight: 500 }}>{u.title}</div>
                        {u.snippet && (
                          <div style={{ fontSize: "1.1rem", color: "#888" }}>
                            {u.snippet}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
