"use client";

import { Select } from "./ui/select";

type Props = {
  value?: string;
  onChange?: (val: string) => void;
};

export default function DifficultySelector({ value = "easy", onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="font-medium">Difficulty:</label>
      <Select value={value} onChange={(e) => onChange?.(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="difficult">Difficult</option>
        <option value="expert">Expert</option>
        <option value="nightmare">Nightmare</option>
      </Select>
    </div>
  );
}
