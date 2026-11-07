import "./CommandLine.css";
import { useState } from "react";
import { validateDeliveryInput, type TypedBall } from "@/scoring";
import { parseText } from "./parseText";
import { matchCommands } from "./commands";

type CommandLineProps = {
  // needsHowOut: the ball took a wicket and how the batter was out is still to be chosen.
  onInput: (input: TypedBall, needsHowOut: boolean) => void;
};

// Where balls are typed. It's hidden while the scorer is making a choice in another
// panel, and the text box takes the focus each time it appears. Typing "/" starts a
// command instead: the matching commands are listed above it (↑ ↓ to move, Tab to
// complete, Esc to clear). Commands don't do anything yet.
export default function CommandLine({ onInput }: CommandLineProps) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  // What's been typed after the "/", or null when it isn't a command.
  const commandQuery = text.startsWith("/") ? text.slice(1) : null;
  const matches = commandQuery === null ? [] : matchCommands(commandQuery);
  const highlighted = Math.min(selected, matches.length - 1);

  return (
    <>
      {commandQuery !== null && (
        <ul className="cl-menu" role="listbox" aria-label="Commands">
          {matches.length === 0 ? (
            <li className="cl-menu-empty">No matching commands</li>
          ) : (
            matches.map((c, i) => (
              <li
                key={c.name}
                role="option"
                aria-selected={i === highlighted}
                className={i === highlighted ? "selected" : undefined}
              >
                <span className="cl-menu-name">/{c.name}</span>
                <span className="cl-menu-desc">{c.description}</span>
              </li>
            ))
          )}
        </ul>
      )}
      <form
        className="command-line"
        onSubmit={(e) => {
          e.preventDefault();
          if (commandQuery !== null) return; // commands don't do anything yet
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

          onInput(parsed.input, parsed.needsHowOut);
          setErrors([]);
          setText("");
        }}
      >
        <span className="cl-prompt">&gt;</span>
        <input
          className="cl-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSelected(0);
          }}
          onKeyDown={(e) => {
            if (commandQuery === null) return;
            if (e.key === "ArrowDown") setSelected(Math.min(matches.length - 1, highlighted + 1));
            else if (e.key === "ArrowUp") setSelected(Math.max(0, highlighted - 1));
            else if (e.key === "Tab" && matches[highlighted]) setText("/" + matches[highlighted].name);
            else if (e.key === "Escape") setText("");
            else return;
            e.preventDefault();
          }}
          placeholder="enter a ball, e.g. 4, 1wd, 2lb"
          aria-label="command"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
      </form>
    </>
  );
}
