import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageInput from "@components/core/forms/MessageInput";
import "@tests/setup";

describe("MessageInput", () => {
  it("sends message text", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput onSend={onSend} />);
    const input = screen.getByRole("textbox");
    const btn = screen.getByRole("button", { name: /envoyer/i });
    await user.type(input, "hello");
    await user.click(btn);
    expect(onSend).toHaveBeenCalledWith("hello", null, expect.any(Object));
  });
});
