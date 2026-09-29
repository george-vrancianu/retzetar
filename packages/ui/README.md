# @retzetar/ui

Shared semantic React primitives backed by Material UI and the Retzetar theme.

Wrap the application in `RetzetarUiProvider` once at its entry point. Prefer named variants for supported visual states and the MUI `sx` prop for contextual layout adjustments.

`PhotoPicker` provides separate camera and file actions. Pass the selected `files` and update them through `onFilesChange`. Set `multiple` to allow several files and later additions. Pass `uploading` while a request is running; optional `progress` (0–100) shows a measured percentage, otherwise the bar remains indeterminate. The caller owns the upload or scan request.
