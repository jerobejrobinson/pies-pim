'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Package, FileText, Image, Repeat, Boxes } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const dataForOpticat = [
  {id: "BBRH", code: "MOT", desc: "Motorcraft"},
  {id: "BCVC", code: "ACD", desc: "ACDELCO"},
  {id: "CLVL", code: "ALL", desc: "Alliant Power"},
  {id: "BNJK", code: "AMB", desc: "AMBAC International"},
  {id: "GGGV", code: "ARP", desc: "ARP Headstuds"},
  {id: "BFDG", code: "BAL", desc: "Baldwin Filters"},
  {id: "BGDG", code: "CLA", desc: "Stanadyne"},
  {id: "BBHK", code: "BOS", desc: "Bosch"},
  {id: "ZZZZ", code: "BQS", desc: "Bosch Quality Scan By MSP"},
  {id: "BCVQ", code: "BOR", desc: "Borg Warner"},
  {id: "BBMZ", code: "HRT", desc: "Hartridge Test Equipment"},
  {id: "BBBN", code: "REM", desc: "Delco Remy"},
  {id: "CBXQ", code: "CUM", desc: "Cummins"},
  {id: "CBDD", code: "CON", desc: "Contennial Batteries"},
  {id: "BGDG", code: "STD", desc: "Stanadyne"},
  {id: "BBMX", code: "DEL", desc: "Delphi"},
  {id: "BBNF", code: "DEN", desc: "Denso"},
  {id: "DWRT", code: "DOR", desc: "Dorman"},
  {id: "BDZH", code: "FPD", desc: "FP Diesel - Felpro"},
  {id: "BDZW", code: "GAR", desc: "Garret"},
  {id: "BBSC", code: "GAT", desc: "Gates"},
  {id: "DWBX", code: "HOR", desc: "Horton"},
  {id: "JKMF", code: "IMB", desc: "Interstate McBee"},
  {id: "DGBV", code: "KYS", desc: "KYSOR-AC"},
  {id: "BFKC", code: "LUB", desc: "Luber-Finer"},
  {id: "FLHQ", code: "MAH", desc: "Mahle"},
  {id: "JPKB", code: "MAX", desc: "Maxiforce"},
  {id: "JWTR", code: "MSP", desc: "MSP Diesel Solutions"},
  {id: "FHHC", code: "NPD", desc: "Nippon Diesel"},
  {id: "BCFM", code: "OTC", desc: "OTC"},
  {id: "HNZR", code: "PPT", desc: "Pure Power Tech"},
  {id: "BCKG", code: "RAC", desc: "Racor"},
  {id: "BDBL", code: "RAY", desc: "Raybestos"},
  {id: "DWKF", code: "REA", desc: "Reach"},
  {id: "GXTN", code: "SUN", desc: "Sunair"},
  {id: "BGMW", code: "YAN", desc: "Yanmar"},
  {id: "BCVB", code: "ZEX", desc: "Zexel"},
  {id: "JWJS", code: "GPN", desc: "Global Parts Network"},
  {id: "BFCM", code: "GRZ", desc: "Grizzly"},
  {id: "JGHG", code: "HOL", desc: "Holset"},
  {id: "CGGR", code: "INT", desc: "Volunteer International"},
  {id: "JGNS", code: "LUC", desc: "LUCAS"},
  {id: "BFQT", code: "PAI", desc: "PAI"},
  {id: "CGGR", code: "CHM", desc: "Chemicals and fluids"},
  {id: "CGGR", code: "WOG", desc: "Peaker Services"},
  {id: "HLKH", code: "RWR", desc: "Roadwarrior"},
  {id: "DKHD", code: "WAL", desc: "Walker Products"}
]

export default function WeightConverter() {
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

      // Replace "BrandCode" with "BrandAAIA" in the header
      const newHeader = header.map(col => col === "BrandCode" ? "BrandAAIAID" : col)

      const convertedData = data.map(row => {
        const brandCode = row[0]
        const newBrandCode = dataForOpticat.find(item => item.code === brandCode)?.id || brandCode
        return [newBrandCode, ...row.slice(1)]
      })

      setConvertedData([newHeader, ...convertedData])
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
    link.download = 'converted_weights.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Weight Converter</h1>
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload TXT file</Label>
        <Input id="file-upload" type="file" onChange={handleFileChange} accept=".txt" />
      </div>
      <Button onClick={handleConvert} disabled={!file || isLoading}>
        {isLoading ? (
          <>
            <Package className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            Convert
          </>
        )}
      </Button>
      {convertedData.length > 0 && (
        <>
          <Button onClick={handleDownload} className='ml-4'>
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