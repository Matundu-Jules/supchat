import React, { useState, useRef } from "react";
import styles from "./SearchBar.module.scss";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  autoFocus,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={styles["searchBarWrapper"]}>
      <input
        ref={ref}
        type="search"
        className={styles["searchBar"]}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Rechercher..."}
        autoFocus={autoFocus}
        aria-label="Recherche globale"
      />
      {value && (
        <button
          className={styles["clearBtn"]}
          type="button"
          aria-label="Effacer la recherche"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;
