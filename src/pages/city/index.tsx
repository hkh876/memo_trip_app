import ComplexCityMap from "@/components/ComplexCityMap"
import Loading from "@/components/Loading"
import MapComponent from "@/components/MapComponent"
import { CityCountResDto } from "@/dtos/MemoDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { useGetQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/City.module.css"
import { getGeoJsonData } from "@/utils/MapUtil"
import { Box, Typography } from "@mui/material"
import { FeatureCollection, GeoJsonProperties, GeometryCollection } from "geojson"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const City = () => {
  // router
  const router = useRouter()
  const { countryCode, countryName } = router.query
  
  // state
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<GeometryCollection>|null>(null)

  // query
  const { data, isLoading } = useGetQueryEx<CityCountResDto[]>({
    queryKey: QueryKeyEnum.READ_CITY_COUNT_LIST,
    url: "/api/v1/memo/city/count",
    enabled: true
  })

  // event
  const onClick = (code: string, name: string, hasData: boolean) => {
    if (hasData) {
      router.push({
        pathname: "/memo/list",
        query: {
          countryCode: countryCode,
          countryName: countryName,
          cityCode: code,
          cityName: name  
        }
      })
    } else {
      router.push({ 
        pathname: "/memo/create", 
        query: { 
          countryCode: countryCode,
          countryName: countryName,
          cityCode: code,
          cityName: name
        } 
      })
    }
  }

  // values
  const filteredData = geoJsonData?.features.filter((feature) => {
    return feature.properties?.SIG_CD.startsWith(countryCode)
  }) ?? []
  const filteredGeoJsonData: FeatureCollection<GeometryCollection, GeoJsonProperties> = {
    "type": "FeatureCollection",
    features: filteredData
  }

  // geojson load from file
  useEffect(() => {
    getGeoJsonData("/data/city.geojson").then((data) => setGeoJsonData(data))
  }, [])

  return (
    <>
      <Box className={styles.cityContainer}>
        { filteredGeoJsonData && filteredGeoJsonData.features.length > 0 ? (
          (countryCode === "41" || countryCode === "28") ? (
            <ComplexCityMap 
              geoJsonData={filteredGeoJsonData} 
              codes={data}
              onClick={onClick} 
            />
          ) : (
            <MapComponent 
              mapType={"city"} 
              geoJsonData={filteredGeoJsonData} 
              codes={data}
              onClick={onClick} 
            />
          )) : <Typography>Loading...</Typography> 
        }
      </Box>
      <Loading open={isLoading} />
    </>
  )
}

export default City