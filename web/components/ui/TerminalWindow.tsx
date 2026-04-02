export default function TerminalWindow({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-[#ff5f57]" />
        <div className="terminal-dot bg-[#febc2e]" />
        <div className="terminal-dot bg-[#28c840]" />
        {title && (
          <span className="text-xs text-slate-500 ml-2 font-mono">{title}</span>
        )}
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed">{children}</div>
    </div>
  );
}
