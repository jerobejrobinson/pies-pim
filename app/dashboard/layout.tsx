import Link from 'next/link'
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import AllPartImagesDownload from "@/components/DownloadAllPartImages";
import XMLPartDataDownload from "@/components/XMLPartDataDownload";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col">
            <nav className="bg-[#0066d4] text-primary-foreground shadow-md w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <Link href="/dashboard" className="text-xl font-bold">
                                PIM
                            </Link>
                        </div>
                        <div className="flex space-x-4 items-center">
                            <Link href="/dashboard/add" passHref>
                                <Button variant="secondary">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Part
                                </Button>
                            </Link>
                            <AllPartImagesDownload />
                            <XMLPartDataDownload />
                            <form action={signOutAction}>
                                <Button type="submit" variant={"secondary"}>
                                    Sign out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow bg-background">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}