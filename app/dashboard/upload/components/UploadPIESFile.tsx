'use client'

import { XMLParser } from "fast-xml-parser"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, AlertCircle, Download } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ImportError {
    partnumber: string;
    brandaaiaid: string;
    interchangepartnumber: string;
    interchangebrandaaiaid: string;
    reason: string;
    code?: string;
}

export default function UploadPIESFile() {
    const [filePIES, setFilePIES] = useState<File | null>(null)
    const [fileZIP, setFileZIP] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null)
    const [failedImports, setFailedImports] = useState<ImportError[]>([])

    const supabase = createClient()
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

    const parsePIESFile = async (file: File): Promise<any> => {
        const string = await file.text()
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix : "@_"
        };
        const parser = new XMLParser(options);
        const output = parser.parse(string);
        console.log(output)
    }
    const uploadZIPFile = async (piesFile: File, zipFile: File): Promise<any> => {
        const piesFilePayload = await piesFile
        const zipFilePayload = await zipFile

        const data = new FormData()
        data.append('zip', zipFilePayload)
        data.append('pies', piesFilePayload)
        data.append('name', 'image-zip')
        const res = await fetch('http://localhost:3001/pim/upload', {
            method: "POST",
            body: data
        }).then((res) => res.json()).then(data => data).catch(err => err)
        return res
    }

    const handleImport = async () => {
        if (!filePIES || !fileZIP) {
            toast({
                title: "Error",
                description: "Please upload both a PIES file and a ZIP to import.",
                variant: "destructive",
            })
            return;
        }

        setImporting(true)
        setProgress(0)
        setFailedImports([])
        try {
            // const parsedPIESData = await parsePIESFile(filePIES)
            const res = await uploadZIPFile(filePIES, fileZIP)
            // const results = await importPartInterchanges(interchanges)
            // setImportResults(results)
            console.log(res)
            toast({
                title: "Import Complete",
                description: `Successfully imported ${res.success} part interchanges.`,
            })
        } catch (error) {
            console.error('Import failed:', error)
            toast({
                title: "Import Failed",
                description: error instanceof Error ? error.message : "An error occurred during import. Please try again.",
                variant: "destructive",
            })
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="flex flex-row">
            <div>
                <Label htmlFor="file-upload">PIES File</Label>
                <Input
                    id="file-upload"
                    type="file"
                    accept=".xml"
                    onChange={handleFilePIESChange}
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="zip-upload">Images ZIP File</Label>
                <Input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleFileZIPChange}
                    className="mt-1"
                />
            </div>
            <Button onClick={handleImport} disabled={(!filePIES || !fileZIP) || importing}>
                <Upload className="mr-2 h-4 w-4" />
                {importing ? 'Importing...' : 'Import PIES File'}
            </Button>
            {importing && (
                <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Importing PIES File...</div>
                    <Progress value={progress} className="w-full" />
                </div>
            )}
        </div>
    )
}