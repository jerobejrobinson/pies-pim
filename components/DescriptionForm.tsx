'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function DescriptionForm({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [text, setText] = useState('')
  const [descriptionCode, setDescriptionCode] = useState('')
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
    
    const { error } = await supabase
      .from('descriptions')
      .insert([
        { 
          partnumber: partNumber,
          brandaaiaid: brandAAIAID,
          _text: text,
          _descriptioncode: descriptionCode
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
        description: "Description added successfully",
      })
      // Reset form
      setText('')
      setDescriptionCode('')
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
        <Label htmlFor="text">Description</Label>
        <Textarea 
          id="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="descriptionCode">Description Code</Label>
        <Select onValueChange={(value) => setDescriptionCode(value)}>
            <SelectTrigger>
                <SelectValue placeholder="Select Description Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="DES">
                    DES - Long Description (Summary)
                </SelectItem>
                <SelectItem value="MKT">
                    MKT - Short Description (title)
                </SelectItem>
            </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add Description</Button>
    </form>
  )
}