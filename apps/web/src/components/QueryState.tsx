import type { ReactNode } from "react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <p className="card animate-pulse text-slate-600" role="status">
      {label}…
    </p>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="card border-red-200" role="alert">
      <p className="font-semibold text-red-800">{message}</p>
      {retry && (
        <button className="btn-secondary mt-3" type="button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="card text-center">
      <p className="font-semibold">{title}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
