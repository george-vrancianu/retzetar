import { MuiTable, MuiTableBody, MuiTableCell, MuiTableHead, MuiTableRow, mergeSx, type ComponentPropsWithoutRef, type StyleProps } from "./internal.ts";
export function Table({
  sx,
  ...props
}: ComponentPropsWithoutRef<"table"> & StyleProps) {
  return (
    <MuiTable
      size="small"
      sx={mergeSx({ minWidth: "100%", whiteSpace: "nowrap" }, sx)}
      {...props}
    />
  );
}

export function TableHead(props: ComponentPropsWithoutRef<"thead">) {
  return <MuiTableHead {...props} />;
}

export function TableBody(props: ComponentPropsWithoutRef<"tbody">) {
  return <MuiTableBody {...props} />;
}

export function TableRow({
  sx,
  ...props
}: ComponentPropsWithoutRef<"tr"> & StyleProps) {
  return <MuiTableRow sx={sx} {...props} />;
}

export function TableHeader({
  sx,
  ...props
}: ComponentPropsWithoutRef<"th"> & StyleProps) {
  return (
    <MuiTableCell
      component="th"
      sx={mergeSx({ px: 1.5, py: 1.5 }, sx)}
      {...(props as object)}
    />
  );
}

export function TableCell({
  sx,
  ...props
}: ComponentPropsWithoutRef<"td"> & StyleProps) {
  return (
    <MuiTableCell
      sx={mergeSx({ px: 1.5, py: 1.5, verticalAlign: "middle" }, sx)}
      {...(props as object)}
    />
  );
}

