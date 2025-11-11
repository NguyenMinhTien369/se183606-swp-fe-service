type HeaderProps = {
  name: string;
};

export default function Header({ name }: HeaderProps) {
  return (
    <div>
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
