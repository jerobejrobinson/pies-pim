import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Plus, X } from 'lucide-react'

export default function DescriptionsEditor({ partNumber, brandAAIAID }: {partNumber: string; brandAAIAID: string}) {
  const [descriptions, setDescriptions] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
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

  const handleEdit = (index: any) => {
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

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Descriptions</h3>
      {descriptions.map((desc: any, index: any) => (
        <div key={desc.id} className="mb-2 p-2 border rounded flex justify-between items-center">
          <div>
            <p><strong>Text:</strong> {desc._text}</p>
            <p><strong>Code:</strong> {desc._descriptioncode}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
            <Pencil className="h-4 w-4" />
          </Button>
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