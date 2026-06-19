import type { ReactNode } from "react";
import SortDriver from "./widgets/SortDriver";
import SortParsons from "./widgets/SortParsons";
import BinarySearchDrive from "./widgets/BinarySearchDrive";

export interface PracticeMode {
  id: string;
  label: string;
  render: () => ReactNode;
}

const REGISTRY: Record<string, PracticeMode[]> = {
  "sorting-race": [
    { id: "drive", label: "Drive it", render: () => <SortDriver /> },
    { id: "order", label: "Order the code", render: () => <SortParsons /> },
  ],
  "binary-search": [
    { id: "probe", label: "Probe it", render: () => <BinarySearchDrive /> },
  ],
};

export function interactiveModes(conceptId: string): PracticeMode[] {
  return REGISTRY[conceptId] ?? [];
}
