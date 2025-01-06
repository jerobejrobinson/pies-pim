'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FileText, Upload } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PartsInterchangeConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [convertedData, setConvertedData] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to convert.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const header = lines[0].split('\t')
      const data = lines.slice(1).map(line => line.split('\t'))

      const convertedData: string[][] = [header]

      data.forEach(row => {
        const [brandAAIAID, lineCode, partNumber, interchanges, ...rest] = row
        console.log(row)
        const interchangeList = interchanges.split(',').map(i => i.trim())

        interchangeList.forEach(interchange => {
          convertedData.push([
            brandAAIAID,
            lineCode,
            partNumber,
            interchange,
            ...rest
          ])
        })
      })

      setConvertedData(convertedData)
      setIsLoading(false)

      toast({
        title: "Conversion complete",
        description: "The file has been successfully converted.",
      })
    }

    reader.readAsText(file)
  }

  const handleDownload = () => {
    if (convertedData.length === 0) {
      toast({
        title: "No data to download",
        description: "Please convert a file first.",
        variant: "destructive",
      })
      return
    }

    const csvContent = convertedData.map(row => row.join('\t')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'converted_parts_interchanges.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Parts Interchange Converter</h1>
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload TSV file</Label>
        <Input id="file-upload" type="file" onChange={handleFileChange} accept=".txt,.tsv" />
      </div>
      <Button onClick={handleConvert} disabled={!file || isLoading}>
        {isLoading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Convert
          </>
        )}
      </Button>
      {convertedData.length > 0 && (
        <>
          <Button onClick={handleDownload} className="ml-4">
            <FileText className="mr-2 h-4 w-4" />
            Download Converted File
          </Button>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {convertedData[0].map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {convertedData.slice(1, 11).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {convertedData.length > 11 && (
            <p className="text-sm text-gray-500">Showing first 10 rows of {convertedData.length - 1} total rows</p>
          )}
        </>
      )}
    </div>
  )
}