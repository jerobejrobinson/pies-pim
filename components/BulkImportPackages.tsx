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

interface PackageData {
  partnumber: string;
  brandaaiaid: string;
  weight: string;
  height: string;
  length: string;
  width: string;
}

interface ImportError {
  partnumber: string;
  brandaaiaid: string;
  reason: string;
  code?: string;
}

export default function BulkImportPackages() {
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

  const parseFile = async (file: File): Promise<PackageData[]> => {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    
    const delimiter = text.includes(',') ? ',' : '\t'
    
    const headers = lines[0].split(delimiter)
    const requiredHeaders = ['PartNumber', 'BrandAAIAID', 'Weight', 'Height', 'Length', 'Width']
    
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
        const data: PackageData = {
          partnumber: columns[headers.indexOf('PartNumber')]?.trim() ?? '',
          brandaaiaid: columns[headers.indexOf('BrandAAIAID')]?.trim() ?? '',
          weight: columns[headers.indexOf('Weight')]?.trim() ?? '',
          height: columns[headers.indexOf('Height')]?.trim() ?? '',
          length: columns[headers.indexOf('Length')]?.trim() ?? '',
          width: columns[headers.indexOf('Width')]?.trim() ?? '',
        }
        return data
      })
      .filter(data => data.partnumber && data.brandaaiaid)
  }

  const importPackages = async (packages: PackageData[]) => {
    let successCount = 0
    let failedCount = 0
    const errors: ImportError[] = []

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i]
      try {
        const dimW = (parseFloat(pkg.length) * parseFloat(pkg.width) * parseFloat(pkg.height) / 139).toFixed(4)

        const { error } = await supabase
          .from('packages')
          .upsert(
            { 
              partnumber: pkg.partnumber,
              brandaaiaid: pkg.brandaaiaid,
              merchandisingheight: parseFloat(pkg.height),
              merchandisingwidth: parseFloat(pkg.width),
              merchandisinglength: parseFloat(pkg.length),
              shippingheight: parseFloat(pkg.height),
              shippingwidth: parseFloat(pkg.width),
              shippinglength: parseFloat(pkg.length),
              weight: parseFloat(pkg.weight),
              dimensionalweight: dimW
            },
            { onConflict: 'partnumber,brandaaiaid' }
          )

        if (error) {
          failedCount++
          errors.push({
            partnumber: pkg.partnumber,
            brandaaiaid: pkg.brandaaiaid,
            reason: error.message,
            code: error.code
          })
        } else {
          successCount++
        }
      } catch (error) {
        failedCount++
        errors.push({
          partnumber: pkg.partnumber,
          brandaaiaid: pkg.brandaaiaid,
          reason: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof Error ? error.name : undefined
        })
      }

      setProgress(((i + 1) / packages.length) * 100)
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
      const packages = await parseFile(file)
      const results = await importPackages(packages)
      setImportResults(results)
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} packages. ${results.failed} failed.`,
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

    const modifiedContent = modifiedImports.reduce((acc, error) => {
      return acc + `${error.partnumber},${error.brandaaiaid}\n`
    }, 'PartNumber,BrandAAIAID\n')

    const blob = new Blob([modifiedContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modified_part_numbers.csv'
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
        {importing ? 'Importing...' : 'Import Packages'}
      </Button>
      {importing && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Importing packages...</div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
      {importResults && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Results</AlertTitle>
          <AlertDescription>
            Successfully imported {importResults.success} packages.
            {importResults.failed > 0 && (
              <>
                {' '}{importResults.failed} packages failed to import.{' '}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View Failed Imports</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Failed Imports</DialogTitle>
                      <DialogDescription>
                        The following packages failed to import. You can review the reasons and take appropriate action.
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
                        Download Modified File
                      </Button>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Brand AAIA ID</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {failedImports.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.partnumber}</TableCell>
                            <TableCell>{error.brandaaiaid}</TableCell>
                            <TableCell>
                              {error.code === '23503' ? (
                                <>
                                  Part Name / Brand AAIA ID must be setup first. Remove weights and dimensions from file and upload the modified file to Part Number Upload instead.
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