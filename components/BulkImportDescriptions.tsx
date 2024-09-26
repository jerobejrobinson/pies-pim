'use client'

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

interface DescriptionData {
  partnumber: string;
  brandaaiaid: string;
  description: string;
  descriptioncode: string;
}

interface ImportError {
  partnumber: string;
  brandaaiaid: string;
  description: string;
  descriptioncode: string;
  reason: string;
  code?: string;
}

export default function BulkImportDescriptions() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null)
  const [failedImports, setFailedImports] = useState<ImportError[]>([])

  const supabase = createClient()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const parseFile = async (file: File): Promise<DescriptionData[]> => {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    
    const delimiter = text.includes(',') ? ',' : '\t'
    
    const headers = lines[0].split(delimiter)
    const requiredHeaders = ['PartNumber', 'BrandAAIAID', 'Description', 'DescriptionCode']
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
    }

    return lines.slice(1)
      .map((line, index) => {
        const columns = line.split(delimiter)
        if (columns.length !== headers.length) {
          console.warn(`Line ${index + 2} has ${columns.length} columns, expected ${headers.length}`)
        }
        const data: DescriptionData = {
          partnumber: columns[headers.indexOf('PartNumber')]?.trim() ?? '',
          brandaaiaid: columns[headers.indexOf('BrandAAIAID')]?.trim() ?? '',
          description: columns[headers.indexOf('Description')]?.trim() ?? '',
          descriptioncode: columns[headers.indexOf('DescriptionCode')]?.trim() ?? '',
        }
        return data
      })
      .filter(data => data.partnumber && data.brandaaiaid && data.description && data.descriptioncode)
  }

  const importDescriptions = async (descriptions: DescriptionData[]) => {
    let successCount = 0
    let failedCount = 0
    const errors: ImportError[] = []

    for (let i = 0; i < descriptions.length; i++) {
      const description = descriptions[i]
      try {
        const { error } = await supabase
          .from('descriptions')
          .insert([
            { 
              partnumber: description.partnumber,
              brandaaiaid: description.brandaaiaid,
              _text: description.description,
              _descriptioncode: description.descriptioncode,
            }
          ])

        if (error) {
          failedCount++
          errors.push({
            ...description,
            reason: error.message,
            code: error.code
          })
        } else {
          successCount++
        }
      } catch (error) {
        failedCount++
        errors.push({
          ...description,
          reason: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof Error ? error.name : undefined
        })
      }

      setProgress(((i + 1) / descriptions.length) * 100)
    }

    setFailedImports(errors)
    return { success: successCount, failed: failedCount }
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    setProgress(0)
    setFailedImports([])
    try {
      const descriptions = await parseFile(file)
      const results = await importDescriptions(descriptions)
      setImportResults(results)
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} descriptions. ${results.failed} failed.`,
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

  const handleModifyAndDownload = () => {
    const modifiedImports = failedImports.filter(error => error.code === '23503')
    if (modifiedImports.length === 0) {
      toast({
        title: "No Data",
        description: "There are no failed imports with error code 23503 to download.",
        variant: "destructive",
      })
      return
    }

    // Create a Set to store unique part numbers
    const uniqueParts = new Set<string>()

    // Collect all unique part numbers and their brand AAIA IDs
    modifiedImports.forEach(error => {
      uniqueParts.add(`${error.partnumber},${error.brandaaiaid}`)
    })

    // Convert the Set to an array and join with newlines
    const modifiedContent = Array.from(uniqueParts).join('\n')

    // Add the header row
    const contentWithHeader = `PartNumber,BrandAAIAID\n${modifiedContent}`

    const blob = new Blob([contentWithHeader], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parts_to_import.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 mb-6">
      <div>
        <Label htmlFor="file-upload">Upload CSV or TXT file</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="mt-1"
        />
      </div>
      <Button onClick={handleImport} disabled={!file || importing}>
        <Upload className="mr-2 h-4 w-4" />
        {importing ? 'Importing...' : 'Import Descriptions'}
      </Button>
      {importing && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Importing descriptions...</div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
      {importResults && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Results</AlertTitle>
          <AlertDescription>
            Successfully imported {importResults.success} descriptions.
            {importResults.failed > 0 && (
              <>
                {' '}{importResults.failed} descriptions failed to import.{' '}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View Failed Imports</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Failed Imports</DialogTitle>
                      <DialogDescription>
                        The following descriptions failed to import. You can review the reasons and take appropriate action.
                      </DialogDescription>
                    </DialogHeader>
                    {failedImports.some(error => error.code === '23503') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleModifyAndDownload}
                        className="mb-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Modified File for Parts Import
                      </Button>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Brand AAIA ID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Description Code</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {failedImports.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.partnumber}</TableCell>
                            <TableCell>{error.brandaaiaid}</TableCell>
                            <TableCell>{error.description}</TableCell>
                            <TableCell>{error.descriptioncode}</TableCell>
                            <TableCell>
                              {error.code === '23503' ? (
                                <>
                                  Part Number / Brand AAIA ID combination not found. Please add the part(s) using the Parts Bulk Import feature first.
                                </>
                              ) : (
                                error.reason
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}