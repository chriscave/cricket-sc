import "./CommandLine.css";
import { useState } from "react";
import { validateDeliveryInput, type DeliveryInput } from "@/types/delivery";
import { parseText } from "./parseText";

type CommandLineProps = {
  // needsHowOut: the ball took a wicket and how the batter was out is still to be chosen.
  onInput: (input: DeliveryInput, needsHowOut: boolean, needsRunOutBatsman: boolean) => void;
};

// Where balls are typed. It's hidden while the scorer is making a choice in another
// panel, and the text box takes the focus each time it appears.
export default function CommandLine({ onInput }: CommandLineProps) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  return (
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

        onInput(parsed.input, parsed.needsHowOut, parsed.needsRunOutBatsman);
        setErrors([]);
        setText("");
      }}
    >
      <span className="cl-prompt">&gt;</span>
      <input
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
  );
}
