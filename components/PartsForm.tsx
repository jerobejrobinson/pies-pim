'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function PartsForm() {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [partTerminologyID, setPartTerminologyID] = useState('')

  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('parts')
      .insert([
        { 
          partnumber: partNumber, 
          brandaaiaid: brandAAIAID, 
          partterminologyid: partTerminologyID ? parseInt(partTerminologyID) : null
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
        description: "Part added successfully",
      })
      // Reset form
      setPartNumber('')
      setBrandAAIAID('')
      setPartTerminologyID('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <div>
        <Label htmlFor="partNumber">Part Number</Label>
        <Input 
          id="partNumber" 
          value={partNumber} 
          onChange={(e) => setPartNumber(e.target.value)} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="brandAAIAID">Brand AAIA ID</Label>
        <Input 
          id="brandAAIAID" 
          value={brandAAIAID} 
          onChange={(e) => setBrandAAIAID(e.target.value)} 
          required 
          maxLength={10}
        />
      </div>
      <div>
        <Label htmlFor="partTerminologyID">Part Terminology ID</Label>
        <Input 
          id="partTerminologyID" 
          type="number" 
          value={partTerminologyID} 
          onChange={(e) => setPartTerminologyID(e.target.value)} 
        />
      </div>
      <Button type="submit" className="w-full">Add Part</Button>
    </form>
  )
}