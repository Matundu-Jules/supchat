import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import SearchBar from "../index";

// Mock du service de recherche
vi.mock("@services/searchApi", () => ({
  searchAll: vi.fn(),
}));

// Mock du hook useDebounce
vi.mock("@hooks/useDebounce", () => ({
  default: vi.fn((value: any) => value),
}));

import { searchAll } from "@services/searchApi";
import useDebounce from "@hooks/useDebounce";

const mockSearchResults = {
  messages: [
    { _id: "msg1", content: "Hello world", author: { name: "John" } },
    { _id: "msg2", content: "Hello everyone", author: { name: "Jane" } },
  ],
  channels: [
    { _id: "ch1", name: "general", description: "General discussion" },
  ],
  files: [{ _id: "file1", originalName: "document.pdf", size: 1024 }],
};

describe("SearchBar", () => {
  const mockSearchAll = vi.mocked(searchAll);
  const mockUseDebounce = vi.mocked(useDebounce);

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchAll.mockResolvedValue(mockSearchResults);
    mockUseDebounce.mockImplementation((value: any) => value);
  });
  it("should render search input", () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    expect(searchInput).toBeInTheDocument();
  });
  it("should update search query when user types", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");

    await user.type(searchInput, "hello");

    expect(searchInput).toHaveValue("hello");
  });
  it("should call searchAll when debounced query changes", async () => {
    mockUseDebounce.mockReturnValue("hello");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "hello" } });

    await waitFor(() => {
      expect(mockSearchAll).toHaveBeenCalledWith("hello");
    });
  });
  it("should not search when query is empty", async () => {
    mockUseDebounce.mockReturnValue("");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      expect(mockSearchAll).not.toHaveBeenCalled();
    });
  });
  it("should not search when query is only whitespace", async () => {
    mockUseDebounce.mockReturnValue("   ");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "   " } });

    await waitFor(() => {
      expect(mockSearchAll).not.toHaveBeenCalled();
    });
  });
  it("should display search results when available", async () => {
    mockUseDebounce.mockReturnValue("hello");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "hello" } });

    await waitFor(() => {
      expect(screen.getByText("Hello world")).toBeInTheDocument();
      expect(screen.getByText("general")).toBeInTheDocument();
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });
  });
  it("should handle search errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSearchAll.mockRejectedValue(new Error("Search failed"));
    mockUseDebounce.mockReturnValue("hello");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "hello" } });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
  it("should clear results when search is cleared", async () => {
    // First set a search query
    mockUseDebounce.mockReturnValue("hello");
    const { rerender } = render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "hello" } });

    await waitFor(() => {
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    // Then clear the search
    mockUseDebounce.mockReturnValue("");
    rerender(<SearchBar />);

    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    });
  });
  it("should use debounced value for search", () => {
    mockUseDebounce.mockReturnValue("debounced-value");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "original-value" } });

    expect(mockUseDebounce).toHaveBeenCalledWith("original-value", 300);
  });
  it("should show no results message when search returns empty results", async () => {
    mockSearchAll.mockResolvedValue({
      messages: [],
      channels: [],
      files: [],
    });
    mockUseDebounce.mockReturnValue("nonexistent");

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Recherche...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      // No results should show - just the query counter "0"
      expect(screen.getByDisplayValue("nonexistent")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});
