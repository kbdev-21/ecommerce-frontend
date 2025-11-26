import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SimpleSelectDropdown({
  selections,
  onValueChange,
  placeholder = "Select an option",
  initValue,
  className,
}: {
  selections: Array<{ label: string; value: string }>;
  onValueChange: (value: string) => void;
  placeholder?: string;
  initValue?: string;
  className?: string;
}) {
  const combinedClassName = className
    ? `w-[180px] ${className}`
    : "w-[180px]";

  return (
    <Select value={initValue} onValueChange={onValueChange}>
      <SelectTrigger className={combinedClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {selections.map((selection) => (
            <SelectItem
              key={selection.value}
              value={selection.value}
            >
              {selection.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
