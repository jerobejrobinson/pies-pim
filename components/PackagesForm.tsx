'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Search } from 'lucide-react'
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

export default function PackageForm({pn, brand}: {pn?: string; brand?: string}) {
  const [partNumber, setPartNumber] = useState('')
  const [brandAAIAID, setBrandAAIAID] = useState('')
  const [shippingHeight, setShippingHeight] = useState('')
  const [shippingWidth, setShippingWidth] = useState('')
  const [shippingLength, setShippingLength] = useState('')
  const [weight, setWeight] = useState('')
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
        </>
      ) : null}
    </form>
  )
}