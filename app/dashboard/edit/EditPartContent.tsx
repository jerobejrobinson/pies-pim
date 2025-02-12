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
import VehicleEditor from '@/components/VehicleEditor'

export default function EditPartContent() {
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

  const fetchPartDetails = async (partNumber: string, brandAAIAID: string) => {
    setIsLoading(true)
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

  const handleUpdate = async (e: React.FormEvent) => {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Edit Part: {partNumber}</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Part Details</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input id="partNumber" value={part.partnumber} disabled />
            </div>
            <div>
              <Label htmlFor="brandAAIAID">Brand AAIA ID</Label>
              <Input id="brandAAIAID" value={part.brandaaiaid} disabled />
            </div>
            <div>
              <Label htmlFor="partTerminologyID">Part Terminology ID</Label>
              <Input 
                id="partTerminologyID" 
                value={partTerminologyID} 
                onChange={(e) => setPartTerminologyID(e.target.value)}
              />
            </div>
            <Button type="submit">Update Part</Button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Descriptions</h2>
          <DescriptionsEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Digital Assets</h2>
          <DigitalAssetsEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Part Interchange</h2>
          <PartInterchangeEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Package Information</h2>
          <PackagesEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
          <VehicleEditor partNumber={partNumber} brandAAIAID={brandAAIAID} />
        </div>
      </div>
    </div>
  )
}