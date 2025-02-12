import NavMenu from "@/components/NavMenu"
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <NavMenu />
            <main className="flex-grow bg-background">
                <div className="">
                    {children}
                </div>
            </main>
        </div>
    )
}