'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import DescriptionsEditor from '@/components/DiscriptionsEditor'
import PartInterchangeEditor from '@/components/PartInterchangeEditor'
import DigitalAssetsEditor from '@/components/DigitalAssetsEditor'
import PackagesEditor from '@/components/PackagesEditor'

export default function EditPartPage() {
  const [part, setPart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [partTerminologyID, setPartTerminologyID] = useState('')

  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const partNumber = searchParams.get('pn')
    const brandAAIAID = searchParams.get('brand')
    
    if (partNumber && brandAAIAID) {
      setPartNumber(partNumber)
      setBrandAAIAID(brandAAIAID)
      fetchPartDetails(partNumber, brandAAIAID)
    } else {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Part number or Brand AAIA ID is missing from the URL.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  const fetchPartDetails = async (partNumber: any, brandAAIAID: any) => {
    setIsLoading(true)
    console.log(partNumber)
    console.log(brandAAIAID)
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('partnumber', partNumber)
      .eq('brandaaiaid', brandAAIAID.toUpperCase())
      .single()

    if (error) {
        console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch part details.",
        variant: "destructive",
      })
    } else if (data) {
      setPart(data)
      setPartTerminologyID(data.partterminologyid || '')
    } else {
      toast({
        title: "Not Found",
        description: "Part not found.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: any) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('parts')
      .update({ partterminologyid: partTerminologyID })
      .eq('partnumber', partNumber)
      .eq('brandaaiaid', brandAAIAID)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update part details.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Part details updated successfully.",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!part) {
    return <div className="flex justify-center items-center h-screen">Part not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Part: {partNumber}</h1>
      
      <form onSubmit={handleUpdate} className="mb-8">
        <div className="mb-4">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input id="partNumber" value={part.partnumber} disabled />
        </div>
        <div className="mb-4">
          <Label htmlFor="brandAAIAID">Brand AAIA ID</Label>
          <Input id="brandAAIAID" value={part.brandaaiaid} disabled />
        </div>
        <div className="mb-4">
          <Label htmlFor="partTerminologyID">Part Terminology ID</Label>
          <Input 
            id="partTerminologyID" 
            value={partTerminologyID} 
            onChange={(e) => setPartTerminologyID(e.target.value)}
          />
        </div>
        <Button type="submit">Update Part</Button>
      </form>

      <div className="mb-8">
        <DescriptionsEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
      </div>

      <div className="mb-8">
        {/* <h2 className="text-xl font-semibold mb-4">Part Images</h2> */}
        <DigitalAssetsEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        {/* <PartImageUpload pn={partNumber} brand={brandAAIAID} /> */}
      </div>

      <div className="mb-8">
        <PartInterchangeEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
      </div>

      <div className="mb-8">
        {/* <h2 className="text-xl font-semibold mb-4">Package Information</h2> */}
        <PackagesEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        {/* <PackageForm pn={partNumber} brand={brandAAIAID} /> */}
      </div>
    </div>
  )
}