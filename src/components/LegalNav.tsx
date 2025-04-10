import Link from "next/link";

const legalLinks = [
    { href: "/terms", label: "이용약관" },
    { href: "/privacy", label: "개인정보처리방침" },
] as const;

export function LegalNav() {
    return (
        <nav className="flex gap-4 text-sm text-muted-foreground">
            {legalLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
} 