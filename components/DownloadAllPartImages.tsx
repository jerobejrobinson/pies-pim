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
      const imagePromises = fileData.map(async (file, index) => {
        try {
          const response = await fetch(file.imageurl)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const blob = await response.blob()
          
          // Get file extension from the URL or use a default
          const urlParts = file.imageurl.split('.')
          // const fileExtension = urlParts.length > 1 ? `.${urlParts[urlParts.length - 1]}` : '.jpg'
          
          // Use a folder structure in the zip: partnumber_brandaaiaid/filename
          const fileName = `${file.filename}`
          zip.file(fileName, blob, {binary: true})
        } catch (error: any) {
          console.error(`Error downloading image ${file.imageurl}:`, error)
          // Add a text file with error information instead of the image
          zip.file(`error_log/${index}_${file.filename}.txt`, `Error downloading ${file.imageurl}: ${error.message}`)
        }
      })

      await Promise.all(imagePromises)

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Create a download link and trigger the download
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = 'all_part_images.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "All images downloaded successfully. Check error_log folder for any download issues.",
      })
    } catch (error) {
      console.error('Error downloading images:', error)
      toast({
        title: "Error",
        description: "Failed to download images. Please check the console for more details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full xl:mx-auto">
      <Button 
        onClick={handleDownload} 
        disabled={isLoading}
        className="w-full"
        variant={'secondary'}
      >
        <Download className="mr-2 h-4 w-4" /> 
        {isLoading ? 'Preparing Images Download...' : 'Images'}
      </Button>
    </div>
  )
}