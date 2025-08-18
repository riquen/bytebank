export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex flex-col flex-1 container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
