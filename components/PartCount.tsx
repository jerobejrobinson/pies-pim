'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function PartCount() {
  const [count, setCount] = useState<number | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPartCount() {
      const { count, error } = await supabase
        .from('parts')
        .select('*', { count: 'exact', head: true })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch part count.",
          variant: "destructive",
        })
      } else {
        setCount(count)
      }
    }

    fetchPartCount()
  }, [supabase, toast])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count !== null ? count : 'Loading...'}</div>
      </CardContent>
    </Card>
  )
}