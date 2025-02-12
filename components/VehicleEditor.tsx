'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Trash2, Plus, } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function VehicleEditor({ partNumber, brandAAIAID }: { partNumber: string; brandAAIAID: string; }) {
    const [vehicles, setVehicles] = useState<any>([])
    const [year, setYear] = useState<any>(null)
    const [selectedYear, setSelectedYear] = useState<any>(null)
    const [make, setMake] = useState<any>(null)
    const [selectedMake, setSelectedMake] = useState<any>(null)
    const [model, setModel] = useState<any>(null)
    const [selectedModel, setSelectedModel] = useState<any>(null)

    const supabase = createClient()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        fetchYear()
        if(selectedYear) {
            fetchMake()
        }
        if(selectedMake) {
            fetchModel()
        }
        if(selectedModel) {
            fetchVehicles()
        }
    }, [selectedYear, selectedMake, selectedModel])

    useEffect(() => {
        fetchVehicles()
    }, [partNumber, brandAAIAID])

    const fetchVehicles = async () => {
        const { data, error } = await supabase
            .from('vehicle_parts')
            .select('*, vehicles (year, make, model, id)')
            .eq('partnumber', partNumber)
            .eq('brandaaiaid', brandAAIAID)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch vehicles.",
                variant: "destructive",
            })
        } else {
            setVehicles(data)
        }
    }

    
    // Function called when year is selected
    // const handleYearChange = (year: string) => {
    //     setSelectedYear(year)
    // }
    // const handleMakeChange = (make: string) => {
    //     setSelectedMake(make)
    // }
    // const handleModelChange = (model: string) => {
    //     setSelectedModel(model)
    // }

    const fetchYear = async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('year')
            .order('year', {ascending: false})
        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch vehicles years.",
                variant: "destructive",
            })
        } else {
            setYear(Array.from(new Map(data.map(item => [item.year, item])).values()))
        }
    }

    const fetchMake = async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('make')
            .eq('year', selectedYear)
            .order('year', {ascending: false})
        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch vehicles makes.",
                variant: "destructive",
            })
        } else {
            // console.log(Array.from(new Map(data.map(item => [item.make, item])).values()))
            setMake(Array.from(new Map(data.map(item => [item.make, item])).values()))
        }
    }
    
    const fetchModel = async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('model')
            .eq('year', selectedYear)
            .eq('make', selectedMake)
            .order('year', {ascending: false})
        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch vehicles models.",
                variant: "destructive",
            })
        } else {
            setModel(Array.from(new Map(data.map(item => [item.model, item])).values()))
        }
    }

    const handleAddVehicle = async () => {
        const { data: selectFromVehicle, error: selectFromVehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('year', selectedYear)
            .eq('make', selectedMake)
            .eq('model', selectedModel)
            .single()
        if (selectFromVehicleError) {
            toast({
                title: "Error",
                description: "Failed to fetch vehicles.",
                variant: "destructive",
            })
        } 
        const { data: insertFromVehicleParts, error: insertFromVehiclePartsError } = await supabase.from('vehicle_parts').insert([
            {partnumber: partNumber, brandaaiaid: brandAAIAID, vehicleid: selectFromVehicle.id} 
        ]).select()
        if (insertFromVehiclePartsError) {
            toast({
                title: "Error",
                description: "Failed to link vehicle to part.",
                variant: "destructive",
            })
        }
        if(insertFromVehicleParts) {
            toast({
                title: "Success",
                description: "vehicle link added successfully.",
            })
            fetchVehicles()
        }
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
          .from('vehicle_parts')
          .delete()
          .eq('id', id)
    
        if (error) {
          toast({
            title: "Error",
            description: "Failed to delete vehicle link.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "vehicle link deleted successfully.",
          })
          fetchVehicles()
        }
      }
    return (
        <div className="mt-6">
            {/* <h3 className="text-lg font-semibold mb-2">Packages</h3> */}
            <div className="w-full p-4 flex flex-row justify-between gap-4">
                <Select onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Year</SelectLabel>
                            {year && year.map((row: any, index: any) => (
                                <SelectItem value={row.year} key={index}>
                                    {row.year}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedMake} disabled={!selectedYear}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Make" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Make</SelectLabel>
                            {make && make.map((row: any, index: any) => (
                                <SelectItem key={index} value={row.make}>
                                    {row.make}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedModel} disabled={!selectedMake}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Make</SelectLabel>
                            {model && model.map((row: any, index: any) => (
                                <SelectItem key={index} value={row.model}>
                                    {row.model}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button onClick={() => handleAddVehicle()} className="w-full" disabled={!selectedModel}>
                    <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vehicles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No vehicles added yet
                            </TableCell>
                        </TableRow>
                    ) : (
                        vehicles.map((vehicle: any) => (
                            <TableRow key={vehicle.id}>
                                <TableCell>{vehicle.vehicles.id}</TableCell>
                                <TableCell>{vehicle.vehicles.year}</TableCell>
                                <TableCell>{vehicle.vehicles.make}</TableCell>
                                <TableCell>{vehicle.vehicles.model}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}