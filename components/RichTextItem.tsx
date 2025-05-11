import { Copy } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface RichTextItemProps {
  label?: string;
  value: string;
  withCopyButton?: boolean;
  className?: string;
}

export function RichTextItem({
  label,
  value,
  withCopyButton = true,
  className = "",
}: RichTextItemProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Le texte a été copié dans le presse-papier");
  };

  // Fonction pour détecter et rendre les liens cliquables
  const renderWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div className="relative group">
        <div className="text-sm whitespace-pre-wrap bg-gray-100 p-3 rounded border border-gray-200 font-sans overflow-x-auto">
          {renderWithLinks(value)}
        </div>
        {withCopyButton && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 p-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            title="Copier"
          >
            <Copy className="h-4 w-4 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}
