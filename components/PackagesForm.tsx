'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function PackageForm({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [shippingHeight, setShippingHeight] = useState('')
  const [shippingWidth, setShippingWidth] = useState('')
  const [shippingLength, setShippingLength] = useState('')
  const [weight, setWeight] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let dimW = parseFloat(shippingLength) * parseFloat(shippingWidth) * parseFloat(shippingHeight) / 139
    const { error } = await supabase
      .from('packages')
      .insert([
        { 
          partnumber: partNumber || pn,
          brandaaiaid: brandAAIAID || brand,
          merchandisingheight: parseFloat(shippingHeight),
          merchandisingwidth: parseFloat(shippingWidth),
          merchandisinglength: parseFloat(shippingLength),
          shippingheight: parseFloat(shippingHeight),
          shippingwidth: parseFloat(shippingWidth),
          shippinglength: parseFloat(shippingLength),
          weight: parseFloat(weight),
          dimensionalweight: dimW.toFixed(4)
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
        description: "Package information added successfully",
      })
      // Reset form
      setShippingHeight('')
      setShippingWidth('')
      setShippingLength('')
      setWeight('')
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
          <SelectTrigger>
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
        <Label htmlFor="shippingDimensions">Shipping Dimensions (H x W x L)</Label>
        <div className="flex space-x-2">
          <Input 
            id="shippingHeight" 
            type="number" 
            step="0.01"
            value={shippingHeight} 
            onChange={(e) => setShippingHeight(e.target.value)} 
            placeholder="Height" 
            required 
          />
          <Input 
            id="shippingWidth" 
            type="number" 
            step="0.01"
            value={shippingWidth} 
            onChange={(e) => setShippingWidth(e.target.value)} 
            placeholder="Width" 
            required 
          />
          <Input 
            id="shippingLength" 
            type="number" 
            step="0.01"
            value={shippingLength} 
            onChange={(e) => setShippingLength(e.target.value)} 
            placeholder="Length" 
            required 
          />
        </div>
      </div>
      <div>
        <Label htmlFor="weight">Weight</Label>
        <Input 
          id="weight" 
          type="number" 
          step="0.01" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value)} 
          required 
        />
      </div>
      <Button type="submit" className="w-full">Add Package Information</Button>
    </form>
  )
}