'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, X, Image as ImageIcon, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function DigitalAssetsEditor({ partNumber, brandAAIAID }: { partNumber: string; brandAAIAID: string }) {
    const [assets, setAssets] = useState<any>([])
    const [isEditing, setIsEditing] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [newAsset, setNewAsset] = useState({
        filename: '',
        filetype: '',
        assettype: '',
        _maintenancetype: '',
        imageurl: ''
    })
    const [uploadingFile, setUploadingFile] = useState<File | null>(null)

    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchAssets()
    }, [partNumber, brandAAIAID])

    const fetchAssets = async () => {
        const { data, error } = await supabase
            .from('digitalfileinformation')
            .select('*')
            .eq('partnumber', partNumber)
            .eq('brandaaiaid', brandAAIAID)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch digital assets.",
                variant: "destructive",
            })
        } else {
            setAssets(data || [])
        }
    }

    const handleEdit = (index: number) => {
        setIsEditing(true)
        setEditingIndex(index)
        setNewAsset(assets[index])
    }

    const handleSave = async () => {
        if (editingIndex !== null) {
            const { error } = await supabase
                .from('digitalfileinformation')
                .update(newAsset)
                .eq('id', assets[editingIndex].id)

            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to update digital asset.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "Digital asset updated successfully.",
                })
                fetchAssets()
            }
        } else {
            const { error } = await supabase
                .from('digitalfileinformation')
                .insert({
                    ...newAsset,
                    partnumber: partNumber,
                    brandaaiaid: brandAAIAID
                })

            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to add new digital asset.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "New digital asset added successfully.",
                })
                fetchAssets()
            }
        }

        setIsEditing(false)
        setEditingIndex(null)
        setNewAsset({
            filename: '',
            filetype: '',
            assettype: '',
            _maintenancetype: '',
            imageurl: ''
        })
    }

    const isImageFile = (filename: string) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        return imageExtensions.includes(extension)
    }

    const getImageUrl = (filename: string) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        return `${supabaseUrl}/storage/v1/object/public/part-images/${filename}`
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadingFile(file)
        }
    }

    const handleUpload = async () => {
        if (!uploadingFile) {
            toast({
                title: "Error",
                description: "Please select a file to upload",
                variant: "destructive",
            })
            return
        }

        const fileExt = uploadingFile.name.split('.').pop()
        const filePath = `${partNumber}${brandAAIAID}/${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('part-images')
            .upload(filePath, uploadingFile)

        if (uploadError) {
            toast({
                title: "Error",
                description: "Failed to upload image.",
                variant: "destructive",
            })
            return
        }

        const imageUrl = getImageUrl(filePath)

        const { error: insertError } = await supabase
            .from('digitalfileinformation')
            .insert({
                partnumber: partNumber,
                brandaaiaid: brandAAIAID,
                filename: filePath,
                filetype: fileExt,
                assettype: 'P01',
                imageurl: imageUrl
            })

        if (insertError) {
            toast({
                title: "Error",
                description: "Failed to add digital asset information.",
                variant: "destructive",
            })
        } else {
            toast({
                title: "Success",
                description: "Image uploaded and asset information added successfully.",
            })
            fetchAssets()
        }

        setUploadingFile(null)
    }

    const handleDelete = async (asset: any) => {
        // Delete from Supabase storage
        const { error: storageError } = await supabase.storage
            .from('part-images')
            .remove([asset.filename])

        if (storageError) {
            toast({
                title: "Error",
                description: "Failed to delete image from storage.",
                variant: "destructive",
            })
            return
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('digitalfileinformation')
            .delete()
            .eq('id', asset.id)

        if (dbError) {
            toast({
                title: "Error",
                description: "Failed to delete digital asset information from database.",
                variant: "destructive",
            })
        } else {
            toast({
                title: "Success",
                description: "Digital asset deleted successfully.",
            })
            fetchAssets()
        }
    }

    return (
        <div className="mt-6">
            {assets.map((asset: any, index: number) => (
                <div key={asset.id} className="mb-2 p-2 border rounded flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        {isImageFile(asset.filename) ? (
                            <div className="relative w-16 h-16 border rounded overflow-hidden">
                                <Image
                                    src={asset.imageurl || getImageUrl(asset.filename)}
                                    alt={`Thumbnail for ${asset.filename}`}
                                    width={64}
                                    height={64}
                                    style={{objectFit:"cover"}}
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-100">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <p><strong>File Name:</strong> {asset.filename}</p>
                            <p><strong>Asset Type:</strong> {asset.assettype === 'P04' ? 'Main' : 'Secondary'}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(asset)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            ))}
            {isEditing && (
                <div className="mt-4 p-4 border rounded">
                    <Label htmlFor="maintenanceType">Change Image Type</Label>
                    <Select onValueChange={(value) => setNewAsset({ ...newAsset, assettype: value })} value={newAsset.assettype || ""}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Image Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="P04">Main Image</SelectItem>
                            <SelectItem value="P01">Secondary Image</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            )}
            {!isEditing && (
                <div className="mt-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            type="file"
                            onChange={handleFileChange}
                            accept=".png, .jpg, .jpeg, .gif, .webp"
                            className="flex-grow"
                        />
                        <Button onClick={handleUpload} disabled={!uploadingFile}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </Button>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Digital Asset
                    </Button>
                </div>
            )}
        </div>
    )
}