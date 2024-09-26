import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Plus, X, Trash2 } from 'lucide-react'

export default function PartInterchangeEditor({ partNumber, brandAAIAID }: {partNumber: string; brandAAIAID: string}) {
  const [interchanges, setInterchanges] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newInterchange, setNewInterchange] = useState({
    interchangepartnumber: '',
    _brandaaiaid: ''
  })

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchInterchanges()
  }, [partNumber, brandAAIAID])

  const fetchInterchanges = async () => {
    const { data, error } = await supabase
      .from('partinterchange')
      .select('*')
      .eq('partnumber', partNumber)
      .eq('brandaaiaid', brandAAIAID)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch part interchanges.",
        variant: "destructive",
      })
    } else {
      setInterchanges(data || [])
    }
  }

  const handleEdit = (index: number) => {
    setIsEditing(true)
    setEditingIndex(index)
    setNewInterchange(interchanges[index])
  }

  const handleSave = async () => {
    if (editingIndex !== null) {
      const { error } = await supabase
        .from('partinterchange')
        .update(newInterchange)
        .eq('id', interchanges[editingIndex].id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update part interchange.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Part interchange updated successfully.",
        })
        fetchInterchanges()
      }
    } else {
      const { error } = await supabase
        .from('partinterchange')
        .insert({
          ...newInterchange,
          partnumber: partNumber,
          brandaaiaid: brandAAIAID
        })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add new part interchange.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "New part interchange added successfully.",
        })
        fetchInterchanges()
      }
    }

    setIsEditing(false)
    setEditingIndex(null)
    setNewInterchange({
      interchangepartnumber: '',
      _brandaaiaid: ''
    })
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('partinterchange')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete part interchange.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Part interchange deleted successfully.",
      })
      fetchInterchanges()
    }
  }

  return (
    <div className="mt-6">
      {interchanges.map((interchange: any, index: number) => (
        <div key={interchange.id} className="mb-2 p-2 border rounded flex justify-between items-center">
          <div>
            <p><strong>Interchange Part Number:</strong> {interchange.interchangepartnumber}</p>
            <p><strong>Brand AAIA ID:</strong> {interchange._brandaaiaid}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(interchange.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {isEditing && (
        <div className="mt-4 p-4 border rounded">
          <Label htmlFor="interchangePartNumber">Interchange Part Number</Label>
          <Input
            id="interchangePartNumber"
            value={newInterchange.interchangepartnumber}
            onChange={(e) => setNewInterchange({...newInterchange, interchangepartnumber: e.target.value})}
            className="mb-2"
          />
          <Label htmlFor="brandAAIAID">Brand AAIA ID</Label>
          <Input
            id="brandAAIAID"
            value={newInterchange._brandaaiaid}
            onChange={(e) => setNewInterchange({...newInterchange, _brandaaiaid: e.target.value})}
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
          <Plus className="h-4 w-4 mr-2" /> Add Part Interchange
        </Button>
      )}
    </div>
  )
}