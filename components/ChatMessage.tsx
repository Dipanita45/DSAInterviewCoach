import { useState } from "react";
import { Copy, Check } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
  loading?: boolean;
};

type ContentSegment =
  | { type: "text"; value: string }
  | { type: "code"; value: string };

function parseContent(content: string): ContentSegment[] {
  const regex = /```[\w]*\n([\s\S]*?)```/g;

  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.slice(lastIndex, match.index).trim(),
      });
    }

    segments.push({
      type: "code",
      value: match[1].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.slice(lastIndex).trim(),
    });
  }

  return segments.filter((s) => s.value.length > 0);
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-2xl bg-[var(--code-bg)] px-4 py-3 text-[0.88rem] leading-6 text-[var(--code-text)]">
        <code>{code}</code>
      </pre>

      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/10 px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function ChatMessage({
  role,
  content,
  loading = false,
}: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";
  const segments = parseContent(content);

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "rounded-[22px] px-4 py-3 transition-all shadow-sm",
          isUser
            ? "max-w-[320px] bg-[var(--color-primary)] text-white rounded-br-md"
            : isSystem
              ? "max-w-[80%] border border-amber-200 bg-amber-50 text-amber-900 rounded-bl-md"
              : "max-w-[80%] bg-white/90 text-slate-900 rounded-bl-md",
        ].join(" ")}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
          {isUser ? "You" : isSystem ? "System" : "Coach"}
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-[0.95rem]">
            <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.4s]" />
            <span className="ml-2 opacity-70">Thinking...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {segments.map((segment, idx) =>
              segment.type === "code" ? (
                <CodeBlock key={idx} code={segment.value} />
              ) : (
                <p
                  key={idx}
                  className="whitespace-pre-wrap text-[0.95rem] leading-7"
                >
                  {segment.value}
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}