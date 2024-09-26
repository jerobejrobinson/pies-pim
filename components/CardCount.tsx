'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Package, FileText, Image, Repeat, Boxes } from 'lucide-react'
import { ButtonLink } from './ButtonLink'

interface CountCardProps {
  title: string
  table: string
  icon: 'parts' | 'descriptions' | 'digitalAssets' | 'interchanges' | 'packages'
}

export default function CountCard({ title, table, icon }: CountCardProps) {
  const [count, setCount] = useState<number | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCount() {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        toast({
          title: "Error",
          description: `Failed to fetch ${title.toLowerCase()} count.`,
          variant: "destructive",
        })
      } else {
        setCount(count)
      }
    }

    fetchCount()
  }, [supabase, toast, table, title])

  const IconComponent = {
    parts: Package,
    descriptions: FileText,
    digitalAssets: Image,
    interchanges: Repeat,
    packages: Boxes
  }[icon]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <IconComponent className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count !== null ? count : 'Loading...'}</div>
        {table !== 'parts' && (<ButtonLink href={`/dashboard/${table}`} className='mt-2 text-sm'>Add {title}</ButtonLink>)}
        {table == 'parts' && (<ButtonLink href={`/dashboard`} className='mt-2 text-sm'>Search for Parts</ButtonLink>)}
      </CardContent>
    </Card>
  )
}