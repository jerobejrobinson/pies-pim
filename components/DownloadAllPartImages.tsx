'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download } from 'lucide-react'
import JSZip from 'jszip'

export default function AllPartImagesDownload() {
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      // Fetch all image URLs
      const { data: fileData, error: fileError } = await supabase
        .from('digitalfileinformation')
        .select('imageurl, filename, partnumber, brandaaiaid')

      if (fileError) throw fileError

      if (!fileData || fileData.length === 0) {
        toast({
          title: "No Images",
          description: "No images found in the database.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create a new zip file
      const zip = new JSZip()

      // Add each image to the zip file
      const imagePromises = fileData.map(async (file) => {
        const response = await fetch(file.imageurl)
        const blob = await response.blob()
        // Use a folder structure in the zip: partnumber_brandaaiaid/filename
        zip.file(`${file.filename}`, blob)
      })

      await Promise.all(imagePromises)

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Create a download link and trigger the download
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `all_part_images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "All images downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading images:', error)
      toast({
        title: "Error",
        description: "Failed to download images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto mt-10">
      <Button 
        onClick={handleDownload} 
        disabled={isLoading}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" /> 
        {isLoading ? 'Preparing Download...' : 'Download All Part Images'}
      </Button>
    </div>
  )
}