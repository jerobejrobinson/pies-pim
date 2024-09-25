'use client'

import { Suspense } from 'react'
import EditPartContent from './EditPartContent'

export default function EditPartPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <EditPartContent />
    </Suspense>
  )
}