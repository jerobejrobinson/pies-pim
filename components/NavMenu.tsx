'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { signOutAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { PlusCircle, Menu, X } from 'lucide-react'
import AllPartImagesDownload from "@/components/DownloadAllPartImages"
import XMLPartDataDownload from "@/components/XMLPartDataDownload"
import XMLPartDataDownloadACES from '@/components/XMLPartDataDownloadACES'

export default function NavMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="sticky top-0 z-10 bg-[#0066d4] text-primary-foreground shadow-md w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/dashboard" className="flex items-center">
                            <Image src="/images/logo.svg" alt="Dashboard Logo" className="mr-2 w-16 h-auto" width={0} height={0} />
                            <span className="sr-only">Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex xl:hidden">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className={`${menuOpen ? 
                        'flex flex-col w-full absolute top-16 left-0 bg-[#0066d4] p-4 space-y-4 xl:flex-row xl:space-x-4 xl:items-right xl:relative xl:top-0 xl:space-y-0 xl:p-0' 
                        : 'hidden xl:flex space-x-4 items-right'}`}>
                        <Link href="/dashboard/add" passHref>
                            <Button variant="secondary" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Part
                            </Button>
                        </Link>
                        <Link href="/dashboard/vehicles" passHref>
                            <Button variant="secondary" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> View Vehicle Database
                            </Button>
                        </Link>
                        <AllPartImagesDownload />
                        <XMLPartDataDownload />
                        <XMLPartDataDownloadACES />
                        <form action={signOutAction} className="w-full">
                            <Button type="submit" variant="secondary" className="w-full">Sign out</Button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}