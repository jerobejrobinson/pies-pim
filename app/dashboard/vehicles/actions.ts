'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getVehicles() {
  const supabase = createClient()
  try {
    const { data: vehicles, error } = await supabase.from('vehicles').select('*')
    if (error) throw error
    return vehicles
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }
}

export async function addVehicle(formData: FormData) {
  const supabase = createClient()
  const vehicle = {
    id: formData.get('id') as string,
    year: formData.get('year') as string,
    make: formData.get('make') as string,
    model: formData.get('model') as string,
  }

  try {
    const { error } = await supabase
      .from('vehicles')
      .insert(vehicle)

    if (error) throw error
    
    revalidatePath('/vehicles')
    return { success: true }
  } catch (error) {
    console.error('Error adding vehicle:', error)
    return { success: false, error: 'Failed to add vehicle' }
  }
}

export async function updateVehicle(formData: FormData) {
  const supabase = createClient()
  const vehicle = {
    id: formData.get('id') as string,
    year: formData.get('year') as string,
    make: formData.get('make') as string,
    model: formData.get('model') as string,
  }

  try {
    const { error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', vehicle.id)

    if (error) throw error
    
    revalidatePath('/vehicles')
    return { success: true }
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return { success: false, error: 'Failed to update vehicle' }
  }
}

export async function deleteVehicle(id: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    revalidatePath('/vehicles')
    return { success: true }
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return { success: false, error: 'Failed to delete vehicle' }
  }
}