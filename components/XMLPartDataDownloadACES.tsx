'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download } from 'lucide-react'
import { XMLBuilder } from "fast-xml-parser"
import { formattedDate } from '@/lib/utils'

export default function XMLPartDataDownloadACES() {
    const [isLoading, setIsLoading] = useState(false)

    const supabase = createClient()
    const { toast } = useToast()

    const convertSupabaseToOriginal = (supabaseData: any[]) => {
        let date = new Date()
        return {
            "?xml": {
                "@_version": "1.0"
            },
            "ACES": {
                "Header": {
                    "Company": "MSP Diesel Solutions",
                    "SenderName": "Jerobe Robinson",
                    "DocumentTitle": "PIM_ACES_MSP",
                    "PCdbVersionDate": "2024-12-19",
                    "VcdbVersionDate": "2024-12-19",
                    "QdbVersionDate": "2024-12-19",
                    "PartsApprovedFor": {
                        "Cuountry": "US"
                    },
                    "EffectiveDate": `${date.toISOString().split('T')[0]}`,
                    "SubmissionType": "Full",
                    "TransferDate": `${date.toISOString().split('T')[0]}`
            },
            "App": supabaseData.map((part: any) => {
                let XMLObject = {
                    "comment": `${part.vehicles.year} ${part.vehicles.make} ${part.vehicles.model}`,
                    "BaseVehicle": {
                        "@_id": part.vehicles.id,
                    },
                    "Part": {
                        "#text": part.parts.partnumber,
                        "@_BrandAAIAID": part.parts.brandaaiaid
                    },
                    
                    "Qty": 1,
                    "@_action": "A",
                    "@_id": part.id
                }

                return XMLObject;
            }),
            "Footer": {
              "RecordCount": supabaseData.length,
            },
            "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema",
            "@_version":"4.0"
          }
        };
    }


    const handleDownload = async () => {
        setIsLoading(true)
        try {
          const { data: parts, error } = await supabase
            .from('vehicle_parts')
            .select('id, parts (partnumber, brandaaiaid, partterminologyid), vehicles (id, year, make, model)')
    
          if (error) throw error
    
          if (!parts || parts.length === 0) {
            toast({
              title: "No Data",
              description: "No part data found in the database.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
    
          const convertedData = convertSupabaseToOriginal(parts)
          
          const builder = new XMLBuilder({
            ignoreAttributes: false,
            format: true,
            commentPropName: "comment",
            suppressEmptyNode: true
          })
    
          const xmlContent = builder.build(convertedData)
    
          // Create a Blob with the XML content
          const blob = new Blob([xmlContent], { type: 'application/xml' })
    
          // Create a download link and trigger the download
          const date = new Date()
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `PIM_ACES_DATA_${date.toLocaleDateString()}.xml`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
    
          toast({
            title: "Success",
            description: "XML file downloaded successfully",
          })
        } catch (error) {
          console.error('Error downloading XML:', error)
          toast({
            title: "Error",
            description: "Failed to download XML file",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4  w-full xl:mx-auto">
            <Button 
                onClick={handleDownload} 
                disabled={isLoading}
                className="w-full"
                variant={'secondary'}
            >
            <Download className="mr-2 h-4 w-4" /> 
            {isLoading ? 'Preparing ACES XML File...' : 'ACES Data'}
            </Button>
        </div>
    )
}