import api, { fetchCsrfToken } from "@utils/axiosInstance";

export async function searchAll(query: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get("/search", { params: { q: query } });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors de la recherche"
    );
  }
}
