'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Part {
  partnumber: string;
  brandaaiaid: string;
}

export default function PartImageUpload({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [fileName, setFileName] = useState('')
  const [assetType, setAssetType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [isSearchPerformed, setIsSearchPerformed] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if(pn && brand) {
      setPartNumber(pn)
      setBrandAAIAID(brand)
    }
  }, [pn, brand])

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setFilteredParts([])
      setIsSearchPerformed(false)
      return
    }

    const { data, error } = await supabase
      .from('parts')
      .select('partnumber, brandaaiaid')
      .or(`partnumber.ilike.%${searchTerm}%,brandaaiaid.ilike.%${searchTerm}%`)
      .limit(50)

    if (error) {
      console.error('Error searching parts:', error)
      toast({
        title: "Error",
        description: "Failed to search parts. Please try again.",
        variant: "destructive",
      })
    } else {
      setFilteredParts(data || [])
      setIsSearchPerformed(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    const fileExt = fileName.split('.').pop()
    const filePath = `${partNumber}${brandAAIAID}/${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('part-images')
      .upload(filePath, file)

    if (uploadError) {
      console.log(uploadError)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return
    }

    // Get public URL of uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('part-images')
      .getPublicUrl(filePath)

    // Insert file information into the database
    const { data, error } = await supabase
      .from('digitalfileinformation')
      .insert([
        { 
          partnumber: partNumber,
          brandaaiaid: brandAAIAID,
          filename: filePath,
          filetype: fileExt,
          assettype: assetType,
          imageurl: publicUrl
        }
      ])

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Image uploaded and information added successfully",
      })
      // Reset form
      setFileName('')
      setAssetType('')
      setFile(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      {!pn && !brand && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search by Part Number or Brand AAIA ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {isSearchPerformed && (
            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Brand AAIA ID</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.length > 0 ? (
                    filteredParts.map((part) => (
                      <TableRow key={`${part.partnumber}|${part.brandaaiaid}`}>
                        <TableCell>{part.partnumber}</TableCell>
                        <TableCell>{part.brandaaiaid}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPartNumber(part.partnumber)
                              setBrandAAIAID(part.brandaaiaid)
                            }}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No results found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {partNumber && brandAAIAID && (
        <>
          <div>
            <Label htmlFor="selectedPart">Selected Part</Label>
            <Input id="selectedPart" value={`${partNumber} - ${brandAAIAID}`} disabled />
          </div>

          <div>
            <Label htmlFor="file">Upload Image</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange}
              accept=".png, .jpg, .jpeg"
              required 
            />
          </div>

          <div>
            <Label htmlFor="maintenanceType">Image Type</Label>
            <Select onValueChange={(value) => setAssetType(value)} value={assetType || ""}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Image Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P04">Main Image</SelectItem>
                <SelectItem value="P01">Secondary Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Image and Add Information
          </Button>
        </>
      )}
    </form>
  )
}