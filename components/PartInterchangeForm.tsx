'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, X, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Part {
  partnumber: string;
  brandaaiaid: string;
}

export default function PartInterchangeForm({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [interchangeParts, setInterchangeParts] = useState([{ partNumber: '', brandAAIAID: '' }])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [isSearchPerformed, setIsSearchPerformed] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if(pn && brand) {
      setPartNumber(pn)
      setBrandAAIAID(brand)
    }
  }, [pn, brand])

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setFilteredParts([])
      setIsSearchPerformed(false)
      return
    }

    const { data, error } = await supabase
      .from('parts')
      .select('partnumber, brandaaiaid')
      .or(`partnumber.ilike.%${searchTerm}%,brandaaiaid.ilike.%${searchTerm}%`)
      .limit(50)

    if (error) {
      console.error('Error searching parts:', error)
      toast({
        title: "Error",
        description: "Failed to search parts. Please try again.",
        variant: "destructive",
      })
    } else {
      setFilteredParts(data || [])
      setIsSearchPerformed(true)
    }
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
      {!pn && !brand && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search by Part Number or Brand AAIA ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {isSearchPerformed && (
            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Brand AAIA ID</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.length > 0 ? (
                    filteredParts.map((part) => (
                      <TableRow key={`${part.partnumber}|${part.brandaaiaid}`}>
                        <TableCell>{part.partnumber}</TableCell>
                        <TableCell>{part.brandaaiaid}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPartNumber(part.partnumber)
                              setBrandAAIAID(part.brandaaiaid)
                            }}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No results found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {(partNumber && brandAAIAID) || (pn && brand) ? (
        <>
          <div>
            <Label htmlFor="selectedPart">Selected Part</Label>
            <Input id="selectedPart" value={`${partNumber || pn} - ${brandAAIAID || brand}`} disabled />
          </div>

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
        </>
      ) : null}
    </form>
  )
}