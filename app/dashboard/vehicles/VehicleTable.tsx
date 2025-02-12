'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { addVehicle, updateVehicle, deleteVehicle } from './actions'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  year: string
  make: string
  model: string
}

export default function VehicleTable({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateYear = (year: string) => {
    const yearNum = parseInt(year)
    const currentYear = new Date().getFullYear()
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1
  }

  const handleAdd = async (formData: FormData) => {
    if (!validateYear(formData.get('year') as string)) {
      toast({
        title: "Error",
        description: "Please enter a valid year (1900 to next year)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await addVehicle(formData)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add vehicle",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (formData: FormData) => {
    if (!validateYear(formData.get('year') as string)) {
      toast({
        title: "Error",
        description: "Please enter a valid year (1900 to next year)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await updateVehicle(formData)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      })
      setEditingId(null)
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update vehicle",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    const result = await deleteVehicle(id)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete vehicle",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Database</h1>

      <form action={editingId ? handleUpdate : handleAdd} className="grid grid-cols-5 gap-2 mb-4">
        <Input
          name="id"
          placeholder="ID"
          defaultValue={editingId ? initialVehicles.find(v => v.id === editingId)?.id : ''}
          disabled={editingId !== null || isSubmitting}
          required
        />
        <Input
          name="year"
          placeholder="Year"
          defaultValue={editingId ? initialVehicles.find(v => v.id === editingId)?.year : ''}
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          disabled={isSubmitting}
          required
        />
        <Input
          name="make"
          placeholder="Make"
          defaultValue={editingId ? initialVehicles.find(v => v.id === editingId)?.make : ''}
          disabled={isSubmitting}
          required
        />
        <Input
          name="model"
          placeholder="Model"
          defaultValue={editingId ? initialVehicles.find(v => v.id === editingId)?.model : ''}
          disabled={isSubmitting}
          required
        />
        <div className="flex gap-2">
          {editingId === null ? (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          ) : (
            <>
              <Button type="submit" variant="default" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingId(null)} disabled={isSubmitting}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </form>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No vehicles added yet
                </TableCell>
              </TableRow>
            ) : (
              initialVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.id}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  {/* <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(vehicle.id)}
                        disabled={isSubmitting || editingId !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={isSubmitting || editingId !== null}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}