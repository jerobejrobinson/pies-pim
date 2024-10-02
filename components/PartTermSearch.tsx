'use client'

import { useState, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Search } from "lucide-react"
import categories from '@/lib/partterms'

interface Category {
  id: number
  uid: string
  name: string
  level: number
  parent_id: number
  children?: Category[]
}

function CategoryTree({ categories, search, level = 0 }: { categories: Category[], search: string, level?: number }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const toggleExpand = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault()
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const filterCategories = useCallback((cats: Category[]): Category[] => {
    return cats.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(search.toLowerCase())
      const hasMatchingChildren = category.children && filterCategories(category.children).length > 0
      return matchesSearch || hasMatchingChildren
    })
  }, [search])

  const filteredCategories = filterCategories(categories)

  return (
    <ul className={`pl-${level * 4}`}>
      {filteredCategories.map(category => (
        <li key={category.id} className="my-1">
          <div className="flex items-center">
            {category.children && category.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 mr-1"
                onClick={(e) => toggleExpand(category.id, e)}
              >
                {expanded[category.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <p className={search && category.name.toLowerCase().includes(search.toLowerCase()) ? "bg-yellow-200" : ""}>{category.name} </p>
            <span>{' '} -{' '}</span>
            <span className='font-bold'>{category.id}</span> 
          </div>
          {category.children && category.children.length > 0 && expanded[category.id] && (
            <CategoryTree categories={category.children} search={search} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Component() {
  const [search, setSearch] = useState('')

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-slate-300">
      <h1 className="text-2xl font-bold mb-4">Part Terminology ID Finder</h1>
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      <div className="border rounded-lg p-4 bg-white shadow">
        <CategoryTree categories={categories} search={search} />
      </div>
    </div>
  )
}