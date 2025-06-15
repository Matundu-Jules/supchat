import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "../index";

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
  it("should render spinner element", () => {
    const { container } = render(<Loader />);

    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).toBeInTheDocument();
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
