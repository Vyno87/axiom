export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // No sidebar, no padding - full screen for login
    return <>{children}</>;
}
