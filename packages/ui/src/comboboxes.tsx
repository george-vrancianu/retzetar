import { Autocomplete, Box, MuiButton, MuiChip, TextField, useEffect, useState, mergeSx, type ReactNode, type StyleProps } from "./internal.ts";
export type ComboboxOption = { id: string; label: string };
export type SearchComboboxProps = StyleProps & {
  compact?: boolean;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  onSelect: (option: ComboboxOption) => void;
  placeholder?: string;
  loading?: boolean;
  resultsLabel?: string;
};
export function SearchCombobox({
  compact = false,
  label,
  value,
  onChange,
  options,
  onSelect,
  placeholder,
  loading = false,
  resultsLabel = "Search results",
  className,
  sx,
}: SearchComboboxProps) {
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const open = options.length > 0 && !dismissed && (!compact || focused);

  useEffect(() => setActiveIndex(0), [options]);

  return (
    <Autocomplete<ComboboxOption, false, false, true>
      freeSolo
      autoHighlight
      fullWidth
      open={open}
      options={options}
      inputValue={value}
      value={null}
      loading={loading}
      filterOptions={(items) => items}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.label
      }
      isOptionEqualToValue={(option, selected) =>
        typeof selected !== "string" && option.id === selected.id
      }
      onOpen={() => setDismissed(false)}
      onClose={(_, reason) => {
        if (reason === "escape" || reason === "selectOption")
          setDismissed(true);
      }}
      onChange={(_, option) => {
        if (option && typeof option !== "string") {
          onSelect(option);
          setDismissed(true);
        }
      }}
      onHighlightChange={(_, option) => {
        if (!option || typeof option === "string") return;
        const index = options.findIndex((item) => item.id === option.id);
        if (index >= 0) setActiveIndex(index);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" && options.length > 0) {
          setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        } else if (event.key === "ArrowUp" && options.length > 0) {
          setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter" && open) {
          const option = options[activeIndex];
          if (option) {
            event.preventDefault();
            onSelect(option);
            setDismissed(true);
          }
        }
      }}
      onInputChange={(_, nextValue, reason) => {
        if (reason === "input" || reason === "clear") {
          setDismissed(false);
          onChange(nextValue);
        }
      }}
      onFocus={() => {
        setFocused(true);
        setDismissed(false);
      }}
      onBlur={() => setFocused(false)}
      slotProps={{
        listbox: { "aria-label": resultsLabel, "aria-labelledby": undefined },
        popper: { sx: { zIndex: (theme) => theme.zIndex.modal + 1 } },
      }}
      className={className}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={compact ? undefined : label}
          placeholder={placeholder}
          size="small"
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              "aria-label":
                compact && typeof label === "string" ? label : undefined,
            },
          }}
        />
      )}
    />
  );
}


export type MultiSelectComboboxProps = StyleProps & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  selectedOptions: ComboboxOption[];
  onAdd: (option: ComboboxOption) => void;
  onRemove: (option: ComboboxOption) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  resultsLabel?: string;
};

export function MultiSelectCombobox({
  label,
  value,
  onChange,
  options,
  selectedOptions,
  onAdd,
  onRemove,
  placeholder,
  loading = false,
  disabled = false,
  resultsLabel = "Search results",
  className,
  sx,
}: MultiSelectComboboxProps) {
  const [candidate, setCandidate] = useState<ComboboxOption | null>(null);

  const addCandidate = () => {
    if (!candidate || disabled) return;
    onAdd(candidate);
    setCandidate(null);
    onChange("");
  };

  return (
    <Box className={className} sx={mergeSx({ display: "grid", gap: 1 }, sx)}>
      <Autocomplete<ComboboxOption, false, false, true>
        freeSolo
        autoHighlight
        fullWidth
        disabled={disabled}
        options={options}
        inputValue={value}
        value={null}
        loading={loading}
        filterOptions={(items) => items}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        isOptionEqualToValue={(option, selected) =>
          typeof selected !== "string" && option.id === selected.id
        }
        onChange={(_, option) => {
          if (!option || typeof option === "string") return;
          setCandidate(option);
          onChange(option.label);
        }}
        onInputChange={(_, nextValue, reason) => {
          if (reason === "input" || reason === "clear") {
            setCandidate(null);
            onChange(nextValue);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && candidate) {
            event.preventDefault();
            addCandidate();
          }
        }}
        slotProps={{
          listbox: { "aria-label": resultsLabel, "aria-labelledby": undefined },
          popper: { sx: { zIndex: (theme) => theme.zIndex.modal + 1 } },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            size="small"
            slotProps={{
              ...params.slotProps,
              input: {
                ...(params.slotProps?.input ?? {}),
                endAdornment: (
                <>
                  <MuiButton
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={!candidate || disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={addCandidate}
                  >
                    Add
                  </MuiButton>
                  {params.slotProps?.input?.endAdornment}
                </>
                ),
              },
            }}
          />
        )}
      />
      {selectedOptions.length > 0 && (
        <Box
          aria-label={`${label} selected`}
          sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
        >
          {selectedOptions.map((option) => (
            <MuiChip
              key={option.id}
              label={option.label}
              onDelete={() => onRemove(option)}
              deleteIcon={<span aria-hidden="true">x</span>}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
