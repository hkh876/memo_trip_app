import { FeatureCollection, GeometryCollection } from "geojson"

const getGeoJsonData = async (filePath: string): Promise<FeatureCollection<GeometryCollection>> => {
  const response = await fetch(filePath)
  const data = await response.json()

  return data
}

export { getGeoJsonData }
