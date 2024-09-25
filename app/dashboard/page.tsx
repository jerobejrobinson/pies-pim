'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import Link from 'next/link'
import { Search, Edit } from 'lucide-react'

export default function PartsDashboard() {
  const [parts, setParts] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchParts()
  }, [currentPage, searchTerm])

  const fetchParts = async () => {
    setIsLoading(true)
    let query = supabase
      .from('parts')
      .select('*', { count: 'exact' })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

    if (searchTerm) {
      query = query.ilike('partnumber', `%${searchTerm}%`)
    }

    const { data, error, count } = await query

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch parts.",
        variant: "destructive",
      })
    } else {
      setParts(data)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    }
    setIsLoading(false)
  }

  const handleSearch = (e: any) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchParts()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Parts Dashboard</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="Search by part number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Brand AAIA ID</TableHead>
                <TableHead>Part Terminology ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part: any) => (
                <TableRow key={`${part.partnumber}-${part.brandaaiaid}`}>
                  <TableCell>{part.partnumber}</TableCell>
                  <TableCell>{part.brandaaiaid}</TableCell>
                  <TableCell>{part.partterminologyid}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/edit?pn=${part.partnumber}&brand=${part.brandaaiaid}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(prev => prev - 1);
                    }}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                    <PaginationLink 
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                    }}
                    isActive={currentPage === i + 1}
                    >
                    {i + 1}
                    </PaginationLink>
                </PaginationItem>
                ))}
                <PaginationItem>
                <PaginationNext 
                    href="#"
                    onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
                </PaginationItem>
            </PaginationContent>
            </Pagination>
        </>
      )}
    </div>
  )
}