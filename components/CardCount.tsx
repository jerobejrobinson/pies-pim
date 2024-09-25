'use client'

import { useState, useEffect } from 'react'
import { createClient} from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CountCardProps {
  title: string
  table: string
}

export default function CountCard({ title, table }: CountCardProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count !== null ? count : 'Loading...'}</div>
      </CardContent>
    </Card>
  )
}