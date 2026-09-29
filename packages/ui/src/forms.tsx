import { Box, FormControlLabel, MuiCheckbox, TextField, Typography, cloneElement, forwardRef, isValidElement, mergeSx, useId, type ComponentPropsWithoutRef, type ReactElement, type ReactNode, type StyleProps } from "./internal.ts";
export type FormProps = ComponentPropsWithoutRef<"form"> &
  StyleProps & { spacing?: "default" | "none" };
export function Form({ spacing = "default", sx, ...props }: FormProps) {
  return (
    <Box
      component="form"
      sx={mergeSx({ display: "grid", gap: spacing === "default" ? 2 : 0 }, sx)}
      {...props}
    />
  );
}

export type FormFieldProps = ComponentPropsWithoutRef<"label"> &
  StyleProps & {
    label: ReactNode;
    hint?: ReactNode;
  };
export function FormField({
  label,
  hint,
  children,
  sx,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, {
        id: (children.props as { id?: string }).id ?? generatedId,
      })
    : children;
  const controlId = isValidElement(child)
    ? (child.props as { id?: string }).id
    : generatedId;
  return (
    <Box
      sx={mergeSx({ display: "grid", gap: 0.5, fontWeight: 600 }, sx)}
      {...(props as object)}
    >
      <Typography
        component="label"
        htmlFor={controlId}
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      {child}
      {hint && (
        <Typography component="span" variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export type InputProps = ComponentPropsWithoutRef<"input"> & StyleProps;
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { sx, className, ...props },
  ref,
) {
  return (
    <TextField
      inputRef={ref}
      fullWidth
      className={className}
      sx={sx}
      type={props.type}
      value={props.value}
      defaultValue={props.defaultValue}
      placeholder={props.placeholder}
      disabled={props.disabled}
      required={props.required}
      autoComplete={props.autoComplete}
      onChange={props.onChange}
      slotProps={{
        htmlInput: {
          ...props,
          style: undefined,
          className: undefined,
        },
      }}
    />
  );
});

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & StyleProps;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ sx, className, ...props }, ref) {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        multiline
        minRows={4}
        className={className}
        sx={sx}
        value={props.value}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        disabled={props.disabled}
        required={props.required}
        onChange={props.onChange}
        slotProps={{
          htmlInput: { ...props, style: undefined, className: undefined },
        }}
      />
    );
  },
);

export function Select({
  sx,
  ...props
}: ComponentPropsWithoutRef<"select"> & StyleProps) {
  return (
    <Box
      component="select"
      sx={mergeSx(
        {
          width: "100%",
          minHeight: 44,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 1.5,
          py: 1,
          font: "inherit",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
          "&:disabled": { bgcolor: "grey.50", color: "text.secondary" },
        },
        sx,
      )}
      {...props}
    />
  );
}

export function Option(props: ComponentPropsWithoutRef<"option">) {
  return <option {...props} />;
}

export type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> &
  StyleProps & {
    label?: ReactNode;
  };
export function Checkbox({ label, sx, className, ...props }: CheckboxProps) {
  const control = (
    <MuiCheckbox
      className={className}
      sx={sx}
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      disabled={props.disabled}
      readOnly={props.readOnly}
      required={props.required}
      onChange={props.onChange}
      slotProps={{ input: props as ComponentPropsWithoutRef<"input"> }}
    />
  );
  return label ? (
    <FormControlLabel control={control} label={label} sx={{ m: 0 }} />
  ) : (
    control
  );
}

