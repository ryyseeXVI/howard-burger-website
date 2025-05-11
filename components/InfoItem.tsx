export default function InfoItem({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline block break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
