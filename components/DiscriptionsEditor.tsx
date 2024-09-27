import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Plus, X, Trash2 } from 'lucide-react'
import CDATARenderer from '@/components/CDATARender'

export default function DescriptionsEditor({ partNumber, brandAAIAID }: {partNumber: string; brandAAIAID: string}) {
  const [descriptions, setDescriptions] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newDescription, setNewDescription] = useState({
    _text: '',
    _descriptioncode: ''
  })

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchDescriptions()
  }, [partNumber, brandAAIAID])

  const fetchDescriptions = async () => {
    const { data, error } = await supabase
      .from('descriptions')
      .select('*')
      .eq('partnumber', partNumber)
      .eq('brandaaiaid', brandAAIAID)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch descriptions.",
        variant: "destructive",
      })
    } else {
      setDescriptions(data || [])
    }
  }

  const handleEdit = (index: number) => {
    setIsEditing(true)
    setEditingIndex(index)
    setNewDescription(descriptions[index])
  }

  const handleSave = async () => {
    if (editingIndex !== null) {
      const { error } = await supabase
        .from('descriptions')
        .update(newDescription)
        .eq('id', descriptions[editingIndex].id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update description.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Description updated successfully.",
        })
        fetchDescriptions()
      }
    } else {
      const { error } = await supabase
        .from('descriptions')
        .insert({
          ...newDescription,
          partnumber: partNumber,
          brandaaiaid: brandAAIAID
        })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add new description.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "New description added successfully.",
        })
        fetchDescriptions()
      }
    }

    setIsEditing(false)
    setEditingIndex(null)
    setNewDescription({
      _text: '',
      _descriptioncode: ''
    })
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('descriptions')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete description.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Description deleted successfully.",
      })
      fetchDescriptions()
    }
  }

  return (
    <div className="mt-6">
      {descriptions.map((desc: any, index: number) => (
        <div key={desc.id} className="mb-2 p-2 border rounded flex justify-between items-center">
          <div>
            <CDATARenderer content={desc._text} />
            <p><strong>Code:</strong> {desc._descriptioncode}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(desc.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {isEditing && (
        <div className="mt-4 p-4 border rounded">
          <Label htmlFor="text">Description Text</Label>
          <Textarea
            id="text"
            value={newDescription._text}
            onChange={(e) => setNewDescription({...newDescription, _text: e.target.value})}
            className="mb-2"
          />
          <Label htmlFor="code">Description Code</Label>
          <Input
            id="code"
            value={newDescription._descriptioncode}
            onChange={(e) => setNewDescription({...newDescription, _descriptioncode: e.target.value})}
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
          <Plus className="h-4 w-4 mr-2" /> Add Description
        </Button>
      )}
    </div>
  )
}