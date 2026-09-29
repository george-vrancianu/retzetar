import { useId, useRef } from "react";
import {
  Box,
  LinearProgress,
  Typography,
  mergeSx,
  type StyleProps,
} from "./internal.ts";
import { Button } from "./actions.tsx";

export type PhotoPickerProps = StyleProps & {
  label: string;
  hint?: string;
  files: readonly File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  statusLabel?: string;
};

export function PhotoPicker({
  label,
  hint,
  files,
  onFilesChange,
  multiple = false,
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  uploading = false,
  progress,
  statusLabel = "Uploading photo…",
  sx,
  className,
}: PhotoPickerProps) {
  const id = useId();
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const busy = disabled || uploading;
  const percentage =
    progress == null ? undefined : Math.min(100, Math.max(0, progress));

  function selectFiles(selected: FileList | null) {
    if (!selected?.length) return;
    const next = Array.from(selected);
    onFilesChange(multiple ? [...files, ...next] : [next[0]]);
  }

  return (
    <Box className={className} sx={mergeSx({ display: "grid", gap: 1 }, sx)}>
      <Typography component="span" id={`${id}-label`} sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 1,
        }}
      >
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          Take a photo
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => uploadRef.current?.click()}
        >
          Upload a photo
        </Button>
      </Box>
      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture="environment"
        aria-label="Take photo with camera"
        tabIndex={-1}
        disabled={busy}
        onChange={(event) => {
          selectFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
      <input
        ref={uploadRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-labelledby={`${id}-label`}
        tabIndex={-1}
        disabled={busy}
        onChange={(event) => {
          selectFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
      {files.length > 0 && (
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            display: "grid",
            gap: 0.5,
            overflowWrap: "anywhere",
          }}
        >
          {files.map((file, index) => (
            <Box
              component="li"
              key={`${file.name}-${file.lastModified}-${index}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="body2"
                sx={{ minWidth: 0, overflowWrap: "anywhere" }}
              >
                {file.name}
              </Typography>
              <Button
                type="button"
                variant="text"
                size="small"
                disabled={busy}
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  onFilesChange(
                    files.filter((_, fileIndex) => fileIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
      {uploading && (
        <Box role="status" aria-live="polite">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {percentage == null
              ? statusLabel
              : `${statusLabel} ${Math.round(percentage)}%`}
          </Typography>
          <LinearProgress
            variant={percentage == null ? "indeterminate" : "determinate"}
            value={percentage}
            aria-label={`${label} progress`}
          />
        </Box>
      )}
    </Box>
  );
}
