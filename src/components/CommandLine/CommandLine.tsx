import "./CommandLine.css"
import type { Delivery } from "@/types/delivery";

type CommandLineProps = {
  onInput: (input: Delivery) => void;
};

export default function CommandLine({ onInput }: CommandLineProps) {
  return <div></div>;
}
