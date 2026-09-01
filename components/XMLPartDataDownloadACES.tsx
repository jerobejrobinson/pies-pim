'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download } from 'lucide-react'
import { XMLBuilder } from "fast-xml-parser"
// Assuming formattedDate is from your utils, keeping it if you need it elsewhere

export default function XMLPartDataDownloadACES() {
    const [isLoading, setIsLoading] = useState(false)

    const supabase = createClient()
    const { toast } = useToast()

    // Added brandId parameter to customize the Document Title if needed
    const convertSupabaseToOriginal = (supabaseData: any[], brandId: string) => {
        let date = new Date()
        return {
            "?xml": {
                "@_version": "1.0",
                "@_encoding": "UTF-8"
            },
            "ACES": {
                "Header": {
                    "Company": "MSP Diesel Solutions",
                    "SenderName": "Jerobe Robinson",
                    "SenderPhone": "901-302-4488",
                    "DocumentTitle": `PIM_ACES_MSP_${brandId}`,
                    "PCdbVersionDate": "2024-12-19",
                    "VcdbVersionDate": "2024-12-19",
                    "QdbVersionDate": "2024-12-19",
                    "BrandAAIAID": brandId,
                    "PartsApprovedFor": {
                        "Country": "US"
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
                        },
                        "PartType": {
                            "@_id": part.parts.partterminologyid 
                        },
                        "Qty": 1,
                        "@_action": "A",
                        "@_id": part.id,
                        "@_validate": "yes"
                    }

                    return XMLObject;
                }),
                "Footer": {
                    "RecordCount": supabaseData.length,
                },
                "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema",
                "@_version": "4.2"
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
    
            // Group the data by BrandAAIAID
            const groupedByBrand = parts.reduce((acc: any, part: any) => {
                const brandId = part.parts?.brandaaiaid || 'UNKNOWN';
                if (!acc[brandId]) {
                    acc[brandId] = [];
                }
                acc[brandId].push(part);
                return acc;
            }, {});
            
            const builder = new XMLBuilder({
                ignoreAttributes: false,
                format: true,
                commentPropName: "comment",
                suppressEmptyNode: true
            });

            const dateString = new Date().toISOString().split('T')[0];
            const brandIds = Object.keys(groupedByBrand);

            // Iterate through each grouped brand and trigger a separate download
            for (let i = 0; i < brandIds.length; i++) {
                const brandId = brandIds[i];
                const brandData = groupedByBrand[brandId];
                
                const convertedData = convertSupabaseToOriginal(brandData, brandId);
                const xmlContent = builder.build(convertedData);
        
                const blob = new Blob([xmlContent], { type: 'application/xml' });
        
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                // Safe filename without slashes
                link.download = `PIM_ACES_DATA_${brandId}_${dateString}.xml`; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href); // Clean up memory

                // Add a small delay between downloads to prevent the browser from blocking multiple pop-ups
                if (i < brandIds.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
    
            toast({
                title: "Success",
                description: `Successfully downloaded ${brandIds.length} XML file(s).`,
            })
        } catch (error) {
            console.error('Error downloading XML:', error)
            toast({
                title: "Error",
                description: "Failed to download XML files",
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
                {isLoading ? 'Preparing ACES XML Files...' : 'ACES Data'}
            </Button>
        </div>
    )
}