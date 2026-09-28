import {
  createElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type ClassNameProp = { className?: string };
type PolymorphicProps<T extends ElementType, OwnProps = object> = OwnProps &
  ClassNameProp & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof OwnProps | "as" | "className"
  >;

export function AppShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("min-h-screen", className)} {...props} />;
}

export function AppHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cx("border-b border-herb-100 bg-white", className)}
      {...props}
    />
  );
}

export function AppHeaderInner({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cx(
        "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function AppMain({
  wide = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"main"> & { wide?: boolean }) {
  return (
    <main
      className={cx(
        "mx-auto px-4 py-8",
        wide ? "max-w-[100rem]" : "max-w-6xl",
        className,
      )}
      {...props}
    />
  );
}

export function Table({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <table
      className={cx("w-full text-left text-sm whitespace-nowrap", className)}
      {...props}
    />
  );
}

export function TableHead(props: ComponentPropsWithoutRef<"thead">) {
  return <thead {...props} />;
}

export function TableBody(props: ComponentPropsWithoutRef<"tbody">) {
  return <tbody {...props} />;
}

export function TableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cx("border-b border-slate-200 last:border-0", className)}
      {...props}
    />
  );
}

export function TableHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cx("px-3 py-3 font-semibold text-slate-600", className)}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return <td className={cx("px-3 py-3 align-middle", className)} {...props} />;
}

export function CenteredLayout({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cx(
        "flex min-h-screen items-center justify-center bg-herb-50 px-4 py-12",
        className,
      )}
      {...props}
    />
  );
}

export type PageProps<T extends ElementType = "section"> = PolymorphicProps<T>;
export function Page<T extends ElementType = "section">({
  as,
  className,
  ...props
}: PageProps<T>) {
  return createElement(as ?? "section", {
    ...props,
    className: cx("", className),
  });
}

export function PageHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cx(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
      {...props}
    />
  );
}

export type SectionProps<T extends ElementType = "section"> = PolymorphicProps<
  T,
  { spacing?: "none" | "sm" | "md" | "lg" }
>;
export function Section<T extends ElementType = "section">({
  as,
  spacing = "none",
  className,
  ...props
}: SectionProps<T>) {
  const spacingClasses = {
    none: "",
    sm: "mt-4",
    md: "mt-6",
    lg: "mt-8",
  };
  return createElement(as ?? "section", {
    ...props,
    className: cx(spacingClasses[spacing], className),
  });
}

export type CardProps<T extends ElementType = "div"> = PolymorphicProps<
  T,
  { variant?: "default" | "compact" | "flush" | "hero" }
>;
export function Card<T extends ElementType = "div">({
  as,
  variant = "default",
  className,
  ...props
}: CardProps<T>) {
  const variants = {
    default: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
    compact: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
    flush:
      "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
    hero: "rounded-3xl bg-herb-700 px-6 py-10 text-white sm:px-10",
  };
  return createElement(as ?? "div", {
    ...props,
    className: cx(variants[variant], className),
  });
}

export type FlexRowProps = ComponentPropsWithoutRef<"div"> & {
  align?: "center" | "start" | "between";
  gap?: "sm" | "md" | "lg";
  wrap?: boolean;
};
export function FlexRow({
  align = "center",
  gap = "md",
  wrap = false,
  className,
  ...props
}: FlexRowProps) {
  const alignments = {
    center: "items-center",
    start: "items-start",
    between: "items-center justify-between",
  };
  const gaps = { sm: "gap-2", md: "gap-3", lg: "gap-4" };
  return (
    <div
      className={cx(
        "flex",
        alignments[align],
        gaps[gap],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

export type FlexColProps<T extends ElementType = "div"> = PolymorphicProps<
  T,
  { gap?: "none" | "sm" | "md" | "lg" }
>;
export function FlexCol<T extends ElementType = "div">({
  as,
  gap = "md",
  className,
  ...props
}: FlexColProps<T>) {
  const gaps = { none: "", sm: "gap-2", md: "gap-3", lg: "gap-5" };
  return createElement(as ?? "div", {
    ...props,
    className: cx("flex flex-col", gaps[gap], className),
  });
}

export type GridProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "cards" | "two" | "sidebar" | "detail" | "fields";
};
export function Grid({ variant = "cards", className, ...props }: GridProps) {
  const variants = {
    cards: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
    two: "grid gap-5 md:grid-cols-2",
    sidebar: "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]",
    detail: "grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]",
    fields: "grid grid-cols-2 gap-3",
  };
  return <div className={cx(variants[variant], className)} {...props} />;
}

export type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  level?: 1 | 2 | 3;
  variant?: "page" | "display" | "section" | "card";
};
export function Heading({
  level = 1,
  variant = "page",
  className,
  ...props
}: HeadingProps) {
  const variants = {
    page: "text-3xl font-black sm:text-4xl",
    display: "text-4xl font-black sm:text-5xl",
    section: "text-2xl font-bold",
    card: "text-xl font-bold",
  };
  return createElement(`h${level}`, {
    ...props,
    className: cx(variants[variant], className),
  });
}

export type TextProps<T extends ElementType = "p"> = PolymorphicProps<
  T,
  {
    variant?:
      | "body"
      | "muted"
      | "subtle"
      | "small"
      | "label"
      | "eyebrow"
      | "metric"
      | "danger"
      | "success";
  }
>;
export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  className,
  ...props
}: TextProps<T>) {
  const variants = {
    body: "",
    muted: "text-slate-600",
    subtle: "text-sm text-slate-500",
    small: "text-sm",
    label: "font-semibold",
    eyebrow: "font-semibold text-herb-100",
    metric: "text-3xl font-black text-herb-700",
    danger: "text-sm text-red-700",
    success: "text-sm font-semibold text-herb-700",
  };
  return createElement(as ?? "p", {
    ...props,
    className: cx(variants[variant], className),
  });
}

export type VisuallyHiddenProps<T extends ElementType = "span"> =
  PolymorphicProps<T>;
export function VisuallyHidden<T extends ElementType = "span">({
  as,
  className,
  ...props
}: VisuallyHiddenProps<T>) {
  return createElement(as ?? "span", {
    ...props,
    className: cx("sr-only", className),
  });
}

export type FormProps = ComponentPropsWithoutRef<"form"> & {
  spacing?: "default" | "none";
};
export function Form({ spacing = "default", className, ...props }: FormProps) {
  return (
    <form
      className={cx(spacing === "default" && "space-y-4", className)}
      {...props}
    />
  );
}

export type FormFieldProps = ComponentPropsWithoutRef<"label"> & {
  label: ReactNode;
  hint?: ReactNode;
};
export function FormField({
  label,
  hint,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <label
      className={cx(
        "block font-semibold [&>input]:mt-1 [&>select]:mt-1 [&>textarea]:mt-1",
        className,
      )}
      {...props}
    >
      {label}
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cx(
        "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cx(
        "min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cx(
        "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function Option({
  className,
  ...props
}: ComponentPropsWithoutRef<"option">) {
  return <option className={cx("", className)} {...props} />;
}

export type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label?: ReactNode;
};
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  const control = <input type="checkbox" className="shrink-0" {...props} />;
  return label ? (
    <label
      className={cx("flex items-center gap-2 text-sm font-semibold", className)}
    >
      {control}
      {label}
    </label>
  ) : (
    <input type="checkbox" className={cx("shrink-0", className)} {...props} />
  );
}

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "default" | "small";
  block?: boolean;
};
export function Button({
  variant = "primary",
  size = "default",
  block = false,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-herb-700 text-white hover:bg-herb-600 disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "border border-slate-300 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
    text: "text-herb-700 hover:text-herb-600 disabled:opacity-60",
    danger: "text-red-700 hover:text-red-600 disabled:opacity-60",
  };
  const sizes = {
    default: "min-h-11 px-4 py-2",
    small: "min-h-9 px-3 py-1 text-sm",
  };
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-semibold",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}

export type ActionLinkProps<T extends ElementType = "a"> = PolymorphicProps<
  T,
  {
    variant?: "primary" | "secondary" | "text" | "title" | "brand" | "nav";
    active?: boolean;
    block?: boolean;
  }
>;
export function ActionLink<T extends ElementType = "a">({
  as,
  variant = "text",
  active = false,
  block = false,
  className,
  ...props
}: ActionLinkProps<T>) {
  const variants = {
    primary:
      "inline-flex min-h-11 items-center justify-center rounded-lg bg-herb-700 px-4 py-2 font-semibold text-white hover:bg-herb-600",
    secondary:
      "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50",
    text: "font-semibold text-herb-700 hover:underline",
    title: "font-bold text-herb-700 hover:underline",
    brand: "text-2xl font-black tracking-tight text-herb-700",
    nav: cx(
      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold aria-[current=page]:bg-herb-100 aria-[current=page]:text-herb-700 aria-[current=page]:hover:bg-herb-100",
      active
        ? "bg-herb-100 text-herb-700"
        : "text-slate-600 hover:bg-slate-100",
    ),
  };
  return createElement(as ?? "a", {
    ...props,
    className: cx(variants[variant], block && "w-full", className),
  });
}

export type NavigationProps = ComponentPropsWithoutRef<"nav"> & {
  gap?: "sm" | "lg";
};
export function Navigation({
  gap = "sm",
  className,
  ...props
}: NavigationProps) {
  const gaps = { sm: "gap-1", lg: "gap-4" };
  return <nav className={cx("flex", gaps[gap], className)} {...props} />;
}

export type ListProps = ComponentPropsWithoutRef<"ul"> & {
  ordered?: boolean;
  variant?: "plain" | "stack" | "compact" | "results";
};
export function List({
  ordered = false,
  variant = "plain",
  className,
  ...props
}: ListProps) {
  const variants = {
    plain: "",
    stack: "space-y-3",
    compact: "space-y-2",
    results: "max-h-40 overflow-auto rounded-lg border border-slate-200",
  };
  return createElement(ordered ? "ol" : "ul", {
    ...props,
    className: cx(variants[variant], className),
  });
}

export function ListItem({
  className,
  ...props
}: ComponentPropsWithoutRef<"li">) {
  return <li className={cx("", className)} {...props} />;
}

export type MediaProps = ClassNameProp & {
  src?: string | null;
  alt: string;
  fallback?: ReactNode;
  variant?: "card" | "detail";
};
export function Media({
  src,
  alt,
  fallback = "Recipe",
  variant = "card",
  className,
}: MediaProps) {
  const variants = {
    card: "h-44 w-full object-cover",
    detail: "max-h-96 w-full rounded-3xl object-cover",
  };
  if (src) {
    return (
      <img className={cx(variants[variant], className)} src={src} alt={alt} />
    );
  }
  return (
    <div
      className={cx(
        variants[variant],
        "flex items-center justify-center bg-herb-50 text-herb-700",
        className,
      )}
      aria-hidden="true"
    >
      {fallback}
    </div>
  );
}

export type AlertProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "error" | "info";
};
export function Alert({ variant = "error", className, ...props }: AlertProps) {
  const variants = {
    error: "bg-red-50 text-red-800",
    info: "bg-herb-50 text-herb-700",
  };
  return (
    <div
      className={cx("rounded-lg p-3 text-sm", variants[variant], className)}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    />
  );
}

export function Status({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cx("text-sm font-semibold text-herb-700", className)}
      role="status"
      {...props}
    />
  );
}

export function LoadingState({
  label = "Loading",
  className,
  ...props
}: ComponentPropsWithoutRef<"p"> & { label?: string }) {
  return (
    <p
      className={cx(
        "animate-pulse rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm",
        className,
      )}
      role="status"
      {...props}
    >
      {label}…
    </p>
  );
}

export type EmptyStateProps = ComponentPropsWithoutRef<"div"> & {
  title: ReactNode;
  action?: ReactNode;
};
export function EmptyState({
  title,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm",
        className,
      )}
      {...props}
    >
      <p className="font-semibold">{title}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export type ErrorStateProps = ComponentPropsWithoutRef<"div"> & {
  message: ReactNode;
  retry?: () => void;
};
export function ErrorState({
  message,
  retry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-red-200 bg-white p-5 shadow-sm",
        className,
      )}
      role="alert"
      {...props}
    >
      <p className="font-semibold text-red-800">{message}</p>
      {retry && (
        <Button
          className="mt-3"
          variant="secondary"
          type="button"
          onClick={retry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

export type ComboboxOption = { id: string; label: string };
export type SearchComboboxProps = ClassNameProp & {
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
}: SearchComboboxProps) {
  const id = useId();
  const listId = `${id}-listbox`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [focused, setFocused] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>();
  const open = options.length > 0 && !dismissed && (!compact || focused);
  const currentIndex = Math.min(activeIndex, Math.max(options.length - 1, 0));

  // Fixed positioning keeps table search results outside the scroll container.
  useLayoutEffect(() => {
    if (!compact || !open) return;
    const position = () => {
      const bounds = anchor.current?.getBoundingClientRect();
      if (!bounds) return;
      const width = Math.min(bounds.width, window.innerWidth - 16);
      const below = window.innerHeight - bounds.bottom;
      setPopupStyle({
        width,
        left: Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8)),
        top: below >= 176 ? bounds.bottom + 4 : undefined,
        bottom: below < 176 ? window.innerHeight - bounds.top + 4 : undefined,
      });
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [compact, open]);

  const choose = (option: ComboboxOption) => {
    onSelect(option);
    setDismissed(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setDismissed(false);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[currentIndex];
      if (option) choose(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(true);
    }
  };

  return (
    <div ref={anchor} className={cx("relative", className)}>
      <FormField
        label={compact ? <VisuallyHidden>{label}</VisuallyHidden> : label}
      >
        <Input
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={
            open ? `${id}-option-${currentIndex}` : undefined
          }
          value={value}
          placeholder={placeholder}
          onFocus={() => {
            setFocused(true);
            setDismissed(false);
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setActiveIndex(0);
            setDismissed(false);
            onChange(event.target.value);
          }}
          onKeyDown={onKeyDown}
        />
      </FormField>
      {loading && (
        <Status className={compact ? "sr-only" : "mt-2 text-slate-800"}>
          Searching…
        </Status>
      )}
      <ul
        id={listId}
        hidden={!open}
        className={cx(
          "max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg",
          compact ? "fixed z-50" : "absolute z-10 mt-2 w-full",
        )}
        style={compact ? popupStyle : undefined}
        role="listbox"
        aria-label={resultsLabel}
      >
        {options.map((option, index) => (
          <li
            id={`${id}-option-${index}`}
            key={option.id}
            className={cx(
              "cursor-pointer px-3 py-2",
              index === currentIndex && "bg-herb-50",
            )}
            role="option"
            aria-selected={index === currentIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              choose(option);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
