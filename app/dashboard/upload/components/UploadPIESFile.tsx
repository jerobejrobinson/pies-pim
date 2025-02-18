"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileUp, File } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"


export default function UploadPIESFile() {
    const [filePIES, setFilePIES] = useState<File | null>(null)
    const [fileZIP, setFileZIP] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)

    const { toast } = useToast()

    const handleFilePIESChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFilePIES(e.target.files[0])
        }
    }

    const handleFileZIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFileZIP(e.target.files[0])
        }
    }

    const uploadZIPFile = async (piesFile: File, zipFile: File): Promise<any> => {
        const piesFilePayload = await piesFile
        const zipFilePayload = await zipFile

        const data = new FormData()
        data.append("zip", zipFilePayload)
        data.append("pies", piesFilePayload)
        data.append("name", "image-zip")
        const res = await fetch("http://localhost:3001/pim/upload", {
            method: "POST",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => data)
            .catch((err) => err)
        return res
    }

    const handleImport = async () => {
        if (!filePIES || !fileZIP) {
            toast({
                title: "Error",
                description: "Please upload both a PIES file and a ZIP to import.",
                variant: "destructive",
            })
            return
        }
        setImporting(true)
        setProgress(0)
        try {
            const res = await uploadZIPFile(filePIES, fileZIP)
            console.log(res)
            toast({
                title: "Import Complete",
                description: `Successfully imported products with no errors.`,
            })
            // Simulate progress for demo
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        return 100
                    }
                    return prev + 10
                })
            }, 500)
        } catch (error) {
            console.error("Import failed:", error)
            toast({
                title: "Import Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred during import. Check console logs for more information.",
                variant: "destructive",
            })
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Import PIES Data</CardTitle>
                    <CardDescription>
                        Upload your PIES XML file and corresponding ZIP file containing images to import product data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="file-upload">PIES File (XML)</Label>
                            <div className="relative">
                                <Input id="file-upload" type="file" accept=".xml" onChange={handleFilePIESChange} className="pl-10" />
                                <File className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                            {filePIES && <p className="text-sm text-muted-foreground">Selected: {filePIES.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zip-upload">Images Archive (ZIP)</Label>
                            <div className="relative">
                                <Input id="zip-upload" type="file" accept=".zip" onChange={handleFileZIPChange} className="pl-10" />
                                <FileUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                            {fileZIP && <p className="text-sm text-muted-foreground">Selected: {fileZIP.name}</p>}
                        </div>
                    </div>

                    {importing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Importing files...</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleImport} disabled={!filePIES || !fileZIP || importing} className="w-full" size="lg">
                        <Upload className="mr-2 h-4 w-4" />
                        {importing ? "Importing..." : "Start Import"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

