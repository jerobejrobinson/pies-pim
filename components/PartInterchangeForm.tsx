'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, X } from 'lucide-react'

export default function PartInterchangeForm({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [interchangeParts, setInterchangeParts] = useState([{ partNumber: '', brandAAIAID: '' }])

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

  const handleAddInterchangePart = () => {
    setInterchangeParts([...interchangeParts, { partNumber: '', brandAAIAID: '' }])
  }

  const handleRemoveInterchangePart = (index: number) => {
    const newInterchangeParts = interchangeParts.filter((_, i) => i !== index)
    setInterchangeParts(newInterchangeParts)
  }

  const handleInterchangePartChange = (index: number, field: string, value: string) => {
    const newInterchangeParts: {
        partNumber: string;
        brandAAIAID: string;
        [key: string]: string;
    }[] = [...interchangeParts]
    newInterchangeParts[index][field] = value
    setInterchangeParts(newInterchangeParts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const insertPromises = interchangeParts.map(interchangePart => 
      supabase.from('partinterchange').insert([
        { 
          partnumber: partNumber,
          brandaaiaid: brandAAIAID,
          interchangepartnumber: interchangePart.partNumber,
          _brandaaiaid: interchangePart.brandAAIAID
        }
      ])
    )

    try {
      await Promise.all(insertPromises)
      toast({
        title: "Success",
        description: "Part interchange information added successfully",
      })
      // Reset form
      setInterchangeParts([{ partNumber: '', brandAAIAID: '' }])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add part interchange information",
        variant: "destructive",
      })
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
      
      {interchangeParts.map((interchangePart, index) => (
        <div key={index} className="space-y-2">
          <Label>Interchange Part {index + 1}</Label>
          <div className="flex space-x-2">
            <Input 
              placeholder="Part Number"
              value={interchangePart.partNumber}
              onChange={(e) => handleInterchangePartChange(index, 'partNumber', e.target.value)}
              required
            />
            <Input 
              placeholder="Brand AAIA ID"
              value={interchangePart.brandAAIAID}
              onChange={(e) => handleInterchangePartChange(index, 'brandAAIAID', e.target.value)}
              required
            />
            {index > 0 && (
              <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveInterchangePart(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={handleAddInterchangePart} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Interchange Part
      </Button>

      <hr />
      <Button type="submit" className="w-full">Add Part Interchange Information</Button>
    </form>
  )
}