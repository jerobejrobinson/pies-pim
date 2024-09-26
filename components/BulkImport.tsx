'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface PartData {
  partnumber: string;
  brandaaiaid: string;
}

export default function BulkImportPartNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null)
  const [progress, setProgress] = useState(0)

  const supabase = createClient()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const parseFile = async (file: File): Promise<PartData[]> => {
    const text = await file.text()
    const lines = text.split(/\r?\n/)
    
    // Determine if it's CSV or tab-delimited
    const delimiter = text.includes(',') ? ',' : '\t'
    
    // Assume the first line is a header
    const headers = lines[0].split(delimiter)
    const partNumberIndex = headers.findIndex(h => h?.toLowerCase().includes('partnumber'))
    const brandAAIAIDIndex = headers.findIndex(h => h?.toLowerCase().includes('brandaaiaid'))

    if (partNumberIndex === -1 || brandAAIAIDIndex === -1) {
      throw new Error('File must contain columns for Part Number and Brand AAIA ID')
    }

    return lines.slice(1) // Skip header row
      .map(line => {
        const columns = line.split(delimiter)
        const partnumber = columns[partNumberIndex]?.trim() ?? ''
        const brandaaiaid = columns[brandAAIAIDIndex]?.trim() ?? ''
        return { partnumber, brandaaiaid }
      })
      .filter(part => part.partnumber && part.brandaaiaid) // Remove empty lines
  }

  const importPartNumbers = async (parts: PartData[]) => {
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!part.partnumber || !part.brandaaiaid) {
        failedCount++
        continue
      }

      const { error } = await supabase
        .from('parts')
        .upsert({ 
          partnumber: part.partnumber, 
          brandaaiaid: part.brandaaiaid 
        }, { 
          onConflict: 'partnumber,brandaaiaid' 
        })

      if (error) {
        console.error(`Failed to import part number ${part.partnumber}:`, error)
        failedCount++
      } else {
        successCount++
      }

      // Update progress
      setProgress(Math.round(((i + 1) / parts.length) * 100))
    }

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
    try {
      const parts = await parseFile(file)
      const results = await importPartNumbers(parts)
      setImportResults(results)
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} parts. ${results.failed} failed.`,
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
    <div className="space-y-6">
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
        {importing ? 'Importing...' : 'Import Parts'}
      </Button>
      {importing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500">{progress}% complete</p>
        </div>
      )}
      {importResults && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Results</AlertTitle>
          <AlertDescription>
            Successfully imported {importResults.success} parts.
            {importResults.failed > 0 && (
              <> {importResults.failed} parts failed to import.</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}