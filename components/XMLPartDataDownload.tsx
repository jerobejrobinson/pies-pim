'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download } from 'lucide-react'
import { XMLBuilder } from "fast-xml-parser"
import { formattedDate } from '@/lib/utils'

export default function XMLPartDataDownload() {
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  const convertSupabaseToOriginal = (supabaseData: any) => {
    return {
        "PIES": {
            "Header": {
                "PIESVersion": 7.2,
                "SubmissionType": "FULL",
                "TechnicalContact": "MSP Diesel - Tim Rickman",
                "ContactEmail": "trickman@mspdieselsolutions.com",
                "PCdbVersionDate": "2023-03-30"
            },
            "Items": { "Item": supabaseData.map((part: any) => {
                const descriptions = part.descriptions.map((desc: any) => ({
                "#text": desc._text,
                "@_DescriptionCode": desc._descriptioncode,
                "@_MaintenanceType": desc._maintenancetype,
                "@_LanguageCode": desc._languagecode
                }));

                const partInterchangeGrouped = part.partinterchange.reduce((acc: any, interchange: any) => {
                const brandKey = interchange._brandaaiaid;
                if (!acc[brandKey]) {
                    acc[brandKey] = {
                    "PartNumber": [],
                    "@_MaintenanceType": interchange._maintenancetype,
                    "@_LanguageCode": interchange._languagecode,
                    "@_BrandAAIAID": brandKey
                    };
                }
                acc[brandKey].PartNumber.push(interchange.interchangepartnumber);
                return acc;
                }, {});
        
                const partInterchange = Object.values(partInterchangeGrouped);

                const digitalFileInfo = part.digitalfileinformation.map((file: any) => ({
                "FileName": file.filename,
                "FileType": file.filetype,
                "AssetType": file.assettype,
                "@_MaintenanceType": file._maintenancetype
                }));

                const packageData = part.packages.map((pkg: any) => ({
                "QuantityofEaches": pkg.quantityofeaches,
                "PackageUOM": pkg.packageuom,
                "Dimensions": {
                    "MerchandisingHeight": pkg.merchandisingheight,
                    "MerchandisingWidth": pkg.merchandisingwidth,
                    "MerchandisingLength": pkg.merchandisinglength,
                    "ShippingHeight": pkg.shippingheight,
                    "ShippingWidth": pkg.shippingwidth,
                    "ShippingLength": pkg.shippinglength,
                    "@_UOM": pkg._uom
                },
                "Weights": {
                    "Weight": pkg.weight,
                    "DimensionalWeight": pkg.dimensionalweight,
                    "@_UOM": pkg._uom_weight
                },
                "@_MaintenanceType": pkg._maintenancetype
                }));

                let xmlObject: any = {
                "PartNumber": part.partnumber,
                "BrandAAIAID": part.brandaaiaid,
                "PartTerminologyID": part.partterminologyid,
                "Descriptions": { "Description": descriptions },
                "PartInterchangeInfo": { "PartInterchange": partInterchange },
                "DigitalAssets": { "DigitalFileInformation": digitalFileInfo },
                "Packages": { "Package": packageData },
                "@_MaintenanceType": part.maintenancetype
                };

                if(!part.partterminologyid) delete xmlObject["PartTerminologyID"]
                if(descriptions.length == 0) delete xmlObject["Descriptions"]
                if(partInterchange.length == 0) delete xmlObject["PartInterchangeInfo"]
                if(digitalFileInfo.length == 0) delete xmlObject["DigitalAssets"]
                if(packageData.length == 0) delete xmlObject["Packages"]

                return xmlObject
            })},
            "Trailer": {
                "ItemCount": supabaseData.length,
                "TransactionDate": formattedDate()
            },
            "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@_xmlns:xsd":"http://www.w3.org/2001/XMLSchema",
            "@_xmlns": "http://www.autocare.org"
        }
    };
  }

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const { data: parts, error } = await supabase
        .from('parts')
        .select('*, descriptions ( * ), packages ( * ), partinterchange ( * ), digitalfileinformation ( * )')

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
        format: true
      })

      const xmlContent = builder.build(convertedData)

      // Create a Blob with the XML content
      const blob = new Blob([xmlContent], { type: 'application/xml' })

      // Create a download link and trigger the download
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'part_data.xml'
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
    <div className="space-y-4 max-w-md mx-auto mt-10">
      <Button 
        onClick={handleDownload} 
        disabled={isLoading}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" /> 
        {isLoading ? 'Preparing XML...' : 'Download Parts XML'}
      </Button>
    </div>
  )
}