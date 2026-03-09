export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground tracking-tight">
            IELTS<span className="text-primary">PREP</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {"\u00A9"} {year} BELAIDI ABDELLAH. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Terms {"&"} Support
          </span>
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Privacy Policy
          </span>
        </div>
      </div>
    </footer>
  );
}
