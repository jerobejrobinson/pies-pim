import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Plus, X } from 'lucide-react'

export default function PackagesEditor({ partNumber, brandAAIAID }: { partNumber: string; brandAAIAID: string; }) {
  const [packages, setPackages] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newPackage, setNewPackage] = useState({
    shippingheight: '',
    shippingwidth: '',
    shippinglength: '',
    weight: ''
  })

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchPackages()
  }, [partNumber, brandAAIAID])

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('partnumber', partNumber)
      .eq('brandaaiaid', brandAAIAID)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch packages.",
        variant: "destructive",
      })
    } else {
      setPackages(data || [])
    }
  }

  const handleEdit = (index: any) => {
    setIsEditing(true)
    setEditingIndex(index)
    setNewPackage(packages[index])
  }

  const handleSave = async () => {
    if (editingIndex !== null) {
        let dimW = parseFloat(newPackage.shippinglength) * parseFloat(newPackage.shippingwidth) * parseFloat(newPackage.shippingheight) / 139
      const { error } = await supabase
        .from('packages')
        .update({ 
            merchandisingheight: parseFloat(newPackage.shippingheight),
            merchandisingwidth: parseFloat(newPackage.shippingwidth),
            merchandisinglength: parseFloat(newPackage.shippinglength),
            shippingheight: parseFloat(newPackage.shippingheight),
            shippingwidth: parseFloat(newPackage.shippingwidth),
            shippinglength: parseFloat(newPackage.shippinglength),
            weight: parseFloat(newPackage.weight),
            dimensionalweight: dimW.toFixed(4)
          })
        .eq('id', packages[editingIndex].id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update package.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Package updated successfully.",
        })
        fetchPackages()
      }
    } else {
      const { error } = await supabase
        .from('packages')
        .insert({
          ...newPackage,
          partnumber: partNumber,
          brandaaiaid: brandAAIAID
        })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add new package.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "New package added successfully.",
        })
        fetchPackages()
      }
    }

    setIsEditing(false)
    setEditingIndex(null)
    setNewPackage({
      shippingheight: '',
      shippingwidth: '',
      shippinglength: '',
      weight: ''
    })
  }

  return (
    <div className="mt-6">
      {/* <h3 className="text-lg font-semibold mb-2">Packages</h3> */}
      {packages.map((pkg: any, index: any) => (
        <div key={pkg.id} className="mb-2 p-2 border rounded flex justify-between items-center">
          <div>
            <p><strong>Shipping Dimensions (H x W x L):</strong> {pkg.shippingheight} x {pkg.shippingwidth} x {pkg.shippinglength}</p>
            <p><strong>Weight:</strong> {pkg.weight}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {isEditing && (
        <div className="mt-4 p-4 border rounded">
          <Label>Shipping Dimensions</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Height"
              value={newPackage.shippingheight}
              onChange={(e) => setNewPackage({...newPackage, shippingheight: e.target.value})}
            />
            <Input
              placeholder="Width"
              value={newPackage.shippingwidth}
              onChange={(e) => setNewPackage({...newPackage, shippingwidth: e.target.value})}
            />
            <Input
              placeholder="Length"
              value={newPackage.shippinglength}
              onChange={(e) => setNewPackage({...newPackage, shippinglength: e.target.value})}
            />
          </div>
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            value={newPackage.weight}
            onChange={(e) => setNewPackage({...newPackage, weight: e.target.value})}
            className="mb-2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
      {!isEditing && (
        <Button onClick={() => setIsEditing(true)} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add Package
        </Button>
      )}
    </div>
  )
}