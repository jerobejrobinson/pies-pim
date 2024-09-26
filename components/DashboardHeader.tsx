import React from 'react'
import CardCount from '@/components/CardCount'

interface DashboardHeaderProps {
  title: string
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <CardCount title="Total Parts" table="parts" icon="parts" />
          <CardCount title="Descriptions" table="descriptions" icon="descriptions" />
          <CardCount title="Digital Assets" table="digitalfileinformation" icon="digitalAssets" />
          <CardCount title="Interchanges" table="partinterchange" icon="interchanges" />
          <CardCount title="Packages" table="packages" icon="packages" />
        </div>
      </div>
    </div>
  )
}