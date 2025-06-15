import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import LoginPage from "../index";
import { TestProvider } from "../../../__tests__/test-utils";

// Mock des hooks
vi.mock("@hooks/useLogin", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@hooks/usePasswordToggle", () => ({
  usePasswordToggle: vi.fn(),
}));

// Mock des composants de connexion sociale
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: vi.fn(({ onSuccess }) => (
    <button onClick={() => onSuccess("mock-google-token")}>
      Google Login Mock
    </button>
  )),
}));

vi.mock("@greatsumini/react-facebook-login", () => ({
  default: vi.fn(({ onSuccess }) => (
    <button onClick={() => onSuccess("mock-facebook-token")}>
      Facebook Login Mock
    </button>
  )),
}));

import { useLogin } from "@hooks/useLogin";
import { usePasswordToggle } from "@hooks/usePasswordToggle";

const mockUseLogin = {
  form: { email: "", password: "" },
  handleChange: vi.fn(),
  handleSubmit: vi.fn(),
  errors: {},
  loading: false,
  emailRef: { current: null },
  passwordRef: { current: null },
  handleGoogleSuccess: vi.fn(),
  handleFacebookSuccess: vi.fn(),
};

const mockUsePasswordToggle = {
  type: "password" as const,
  show: false,
  setShow: vi.fn(),
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLogin).mockReturnValue(mockUseLogin);
    vi.mocked(usePasswordToggle).mockReturnValue(mockUsePasswordToggle);
  });
  it("should render login form elements", () => {
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /connexion/i })
    ).toBeInTheDocument();
  });
  it("should render logo and title", () => {
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /connexion/i })
    ).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    expect(screen.getByText("Google Login Mock")).toBeInTheDocument();
    expect(screen.getByText("Facebook Login Mock")).toBeInTheDocument();
  });

  it("should handle form input changes", async () => {
    const user = userEvent.setup();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByPlaceholderText("Mot de passe");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");

    expect(mockUseLogin.handleChange).toHaveBeenCalled();
  });
  it("should handle form submission", async () => {
    const user = userEvent.setup();

    // Mock handleSubmit to prevent default form submission
    const mockHandleSubmit = vi.fn(async (e) => {
      e.preventDefault();
    });

    vi.mocked(useLogin).mockReturnValue({
      ...mockUseLogin,
      handleSubmit: mockHandleSubmit,
    });

    const { container } = render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    // Fill the form first
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByPlaceholderText("Mot de passe");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");

    // Submit the form directly
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      // Fallback to button click
      const submitButton = screen.getByRole("button", { name: /connexion/i });
      await user.click(submitButton);
    }

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should display validation errors when present", () => {
    vi.mocked(useLogin).mockReturnValue({
      ...mockUseLogin,
      errors: {
        email: "Email is required",
        password: "Password is required",
      },
    });

    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("should show loading state when submitting", () => {
    vi.mocked(useLogin).mockReturnValue({
      ...mockUseLogin,
      loading: true,
    });

    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );
    const submitButton = screen.getByRole("button", { name: /connexion/i });
    expect(submitButton).toBeDisabled();
  });

  it("should toggle password visibility", async () => {
    const mockSetShow = vi.fn();
    vi.mocked(usePasswordToggle).mockReturnValue({
      ...mockUsePasswordToggle,
      setShow: mockSetShow,
    });

    const user = userEvent.setup();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );
    const toggleButton = screen.getByRole("button", {
      name: /afficher le mot de passe/i,
    });
    await user.click(toggleButton);

    expect(mockSetShow).toHaveBeenCalled();
  });

  it("should handle Google login success", async () => {
    const user = userEvent.setup();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    const googleButton = screen.getByText("Google Login Mock");
    await user.click(googleButton);

    expect(mockUseLogin.handleGoogleSuccess).toHaveBeenCalledWith(
      "mock-google-token"
    );
  });

  it("should handle Facebook login success", async () => {
    const user = userEvent.setup();
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    const facebookButton = screen.getByText("Facebook Login Mock");
    await user.click(facebookButton);

    expect(mockUseLogin.handleFacebookSuccess).toHaveBeenCalledWith(
      "mock-facebook-token"
    );
  });

  it("should render link to register page", () => {
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    const registerLink = screen.getByRole("link", { name: /créer un compte/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should render forgot password link", () => {
    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );

    const forgotPasswordLink = screen.getByRole("link", {
      name: /mot de passe oublié/i,
    });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("should show password as text when visibility is toggled", () => {
    vi.mocked(usePasswordToggle).mockReturnValue({
      type: "text",
      show: true,
      setShow: vi.fn(),
    });

    render(
      <TestProvider>
        <LoginPage />
      </TestProvider>
    );
    const passwordInput = screen.getByPlaceholderText("Mot de passe");
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
