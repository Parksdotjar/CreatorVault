export default function Loading() {
  const blocks = Array.from({ length: 12 });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="grid grid-cols-4 gap-2">
        {blocks.map((_, index) => (
          <div
            key={index}
            className="h-6 w-6 rounded-sm bg-gradient-to-br from-vault-500 via-accent-500 to-vault-900 shadow-glow motion-safe:animate-block-build"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
      <div className="text-lg font-semibold tracking-[0.3em] text-accent-400">
        CreatorVault
      </div>
    </div>
  );
}
