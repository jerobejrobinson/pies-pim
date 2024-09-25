'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload } from 'lucide-react'

export default function PartImageUpload({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [assetType, setAssetType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [parts, setParts] = useState<any>([])

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if(!pn && !brand) {
      fetchParts()
    }
  }, [])

  const fetchParts = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select('partnumber, brandaaiaid')
    if (data) setParts(data)
    if (error) console.error('Error fetching parts:', error)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
      setFileType(e.target.files[0].type)
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
      setFileType('')
      setAssetType('')
      setFile(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      {!pn && !brand && (<div>
        <Label htmlFor="partSelect">Select Part</Label>
        <Select onValueChange={(value) => {
          const [pn, baaid] = value.split('|')
          setPartNumber(pn)
          setBrandAAIAID(baaid)
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a part" />
          </SelectTrigger>
          <SelectContent>
            {parts.map((part: any) => (
              <SelectItem key={`${part.partnumber}|${part.brandaaiaid}`} value={`${part.partnumber}|${part.brandaaiaid}`}>
                {part.partnumber} - {part.brandaaiaid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>)}

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
    </form>
  )
}