import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "@components/core/ui/Loader";

describe("Loader", () => {
  it("should render loader with default styling", () => {
    render(<Loader />);

    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("aria-label", "Chargement");
  });

  it("should apply custom className when provided", () => {
    render(<Loader className="custom-loader" />);

    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("custom-loader");
  });
  it("should render logo and loading elements", () => {
    const { container } = render(<Loader />);

    // Vérifier que le logo est présent
    const logo = container.querySelector('img[alt="SupChat Logo"]');
    expect(logo).toBeInTheDocument();

    // Vérifier que le texte SUPCHAT est présent
    const loadingText = container.querySelector('[class*="loadingText"]');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveTextContent("SUPCHAT");

    // Vérifier que les points de chargement sont présents
    const loadingDots = container.querySelector('[class*="loadingDots"]');
    expect(loadingDots).toBeInTheDocument();

    // Vérifier qu'il y a 3 points
    const dots = container.querySelectorAll('[class*="loadingDots"] span');
    expect(dots).toHaveLength(3);
  });

  it("should have proper accessibility attributes", () => {
    render(<Loader />);

    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("role", "status");
    expect(loader).toHaveAttribute("aria-label", "Chargement");
  });
  it("should handle className not being provided", () => {
    render(<Loader />);

    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should handle empty className gracefully", () => {
    render(<Loader className="" />);

    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  it("should apply multiple class names correctly", () => {
    render(<Loader className="class1 class2" />);

    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("class1");
    expect(loader).toHaveClass("class2");
  });
});
