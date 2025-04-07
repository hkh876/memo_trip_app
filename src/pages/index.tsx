import Loading from "@/components/Loading"
import MapComponent from "@/components/MapComponent"
import { CountryCountResDto } from "@/dtos/MemoDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { useGetQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/Home.module.css"
import { getGeoJsonData } from "@/utils/MapUtil"
import { Box, Typography } from "@mui/material"
import { FeatureCollection, GeometryCollection } from "geojson"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const Home = () => {
  // router
  const router = useRouter()

  // state
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<GeometryCollection>|null>(null)

  // query
  const { data, isLoading } = useGetQueryEx<CountryCountResDto[]>({
    queryKey: QueryKeyEnum.READ_COUNTRY_COUNT_LIST,
    url: "/api/v1/memo/country/count",
    enabled: true
  })

  // event
  const onClick = (code: string, name: string) => {
    router.push({ pathname: "/city", query: { countryCode: code, countryName: name } })
  }

  // geojson load from file
  useEffect(() => {
    getGeoJsonData("/data/country.geojson").then((data) => setGeoJsonData(data))
  }, [])

  return (
    <>
      <Box className={styles.homeContainer}>
        { geoJsonData ? (
          <MapComponent 
            mapType={"country"} 
            geoJsonData={geoJsonData} 
            codes={data}
            onClick={onClick} 
          /> 
          ) : <Typography>Loading...</Typography>
        }
      </Box>
      <Loading open={isLoading} />
    </>
  )
}

export default Home

