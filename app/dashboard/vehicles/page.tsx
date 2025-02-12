import { getVehicles } from './actions'
import VehicleTable from './VehicleTable'

export default async function VehiclesPage() {
  const vehicles = await getVehicles()
  
  return <VehicleTable initialVehicles={vehicles} />
}