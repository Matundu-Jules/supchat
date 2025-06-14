import SearchBar from "@components/SearchBar";
import styles from "./SearchPage.module.scss";

const SearchPage: React.FC = () => {
  return (
    <section className={styles["searchSection"]}>
      <h1>Recherche</h1>
      <SearchBar />
    </section>
  );
};

export default SearchPage;
