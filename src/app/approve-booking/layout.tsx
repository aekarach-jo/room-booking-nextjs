export default function ApproveBookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        colorScheme: 'light',
        '--background': 'oklch(0.985 0.002 247)',
        '--foreground': 'oklch(0.145 0.015 260)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.145 0.015 260)',
        '--popover': 'oklch(1 0 0)',
        '--popover-foreground': 'oklch(0.145 0.015 260)',
        '--secondary': 'oklch(0.96 0.015 260)',
        '--secondary-foreground': 'oklch(0.25 0.02 260)',
        '--muted': 'oklch(0.96 0.01 260)',
        '--muted-foreground': 'oklch(0.5 0.02 260)',
        '--accent': 'oklch(0.92 0.04 260)',
        '--accent-foreground': 'oklch(0.25 0.02 260)',
        '--destructive': 'oklch(0.577 0.245 27.325)',
        '--border': 'oklch(0.9 0.02 260)',
        '--input': 'oklch(0.92 0.015 260)',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
