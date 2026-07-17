import Label from "../atoms/Label";
import Input from "../atoms/Input";
import ErrorText from "../atoms/ErrorText";

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoFocus,
  disabled,
  autoComplete,
  rightSlot,
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete={autoComplete}
        hasError={Boolean(error)}
        rightSlot={rightSlot}
      />
      <ErrorText>{error}</ErrorText>
    </div>
  );
}