export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
        Y
      </div>
      {!collapsed && <span className="font-bold text-lg">Yunto</span>}
    </div>
  );
}
