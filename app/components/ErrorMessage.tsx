type ErrorMessageProps = {
  message: string | undefined;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-error">{message}</p>;
}
