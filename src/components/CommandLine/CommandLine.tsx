import "./CommandLine.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { validateDeliveryInput, type DeliveryInput } from "@/types/delivery";
import { parseText } from "./parseText";

type CommandLineProps = {
  onInput: (input: DeliveryInput) => void;
  // Shown under the bar, e.g. the next-bowler list. It takes the focus while it's
  // shown, and the text box gets it back when it goes.
  children?: ReactNode;
};

export default function CommandLine({ onInput, children }: CommandLineProps) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Back to typing balls once the panel underneath has closed.
  const hasPanel = Boolean(children);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!hasPanel) input.current?.focus();
  }, [hasPanel]);

  return (
    <div className="cl-dock">
      <form
        className="command-line"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = parseText(text);
          if (parsed.ok === false) {
            setErrors([parsed.error]);
            return;
          }

          const result = validateDeliveryInput(parsed.input);
          if (result.valid === false) {
            setErrors(result.errors);
            return;
          }

          onInput(parsed.input);
          setErrors([]);
          setText("");
        }}
      >
        <span className="cl-prompt">&gt;</span>
        <input
          ref={input}
          className="cl-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="enter a ball, e.g. 4, 1wd, 2lb"
          aria-label="command"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
      </form>
      {children}
    </div>
  );
}
