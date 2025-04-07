import { CityCountResDto, CountryCountResDto } from "@/dtos/MemoDto";
import styles from "@/styles/MapComponent.module.css";
import { Box } from "@mui/material";
import * as d3 from "d3";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, GeometryCollection, GeometryObject } from "geojson";
import { useCallback, useEffect, useRef } from "react";

interface MapComponentProps {
  mapType: "country" | "city";
  geoJsonData: FeatureCollection<GeometryCollection, GeoJsonProperties>;
  codes?: CountryCountResDto[] | CityCountResDto[];
  onClick: (code: string, name: string, hasData: boolean) => void;
}

const MapComponent = ({ mapType, geoJsonData, codes=[], onClick }: MapComponentProps) => {
  // ref
  const svgRef = useRef<SVGSVGElement>(null)

  // SVG create
  const getFillColor = useCallback((d: Feature<GeometryObject>, mapType: string) => {
    if (mapType === "country") {
      const items = codes as CountryCountResDto[]
      return items.length > 0 && items.some(item => item.countryCode === d.properties?.CTPRVN_CD) ? "#69b3a2" : "#ffffff"
    } else {
      const items = codes as CityCountResDto[]
      return items.length > 0 && items.some(item => item.cityCode === d.properties?.SIG_CD) ? "#69b3a2" : "#ffffff"
    }
  }, [codes])

  const onMapClick = useCallback((d: Feature<GeometryObject>) => {
    if (mapType === "country") {
      onClick(d.properties?.CTPRVN_CD, d.properties?.CTP_KOR_NM, false)
    } else {
      const items = codes as CityCountResDto[]
      const hasData = items.length > 0 && items.some(item => item.cityCode === d.properties?.SIG_CD)
      
      onClick(d.properties?.SIG_CD, d.properties?.SIG_KOR_NM, hasData)
    }
  }, [codes, mapType, onClick])

  const drawMap = useCallback(() => {
    if (!svgRef.current || !geoJsonData) {
      return
    }

    const features = geoJsonData.features

    // SVG initialize
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const svg = d3.select(svgRef.current)
                  .attr("width", width)
                  .attr("height", height)

    // get bounds from geojson
    const bounds = d3.geoBounds(geoJsonData)
    
    // compute center
    const center = d3.geoCentroid(geoJsonData)

    // compute the angular distance between bound corners
    const distance = d3.geoDistance(bounds[0], bounds[1])
    const scale = (height / distance / Math.sqrt(2)) * (mapType === "country" ? 1.2 : 0.6)

    // set projection
    const projection = d3.geoMercator()
                        .center(center)
                        .scale(scale)
                        .translate([width / 2, height / 2])
    
    const path = d3.geoPath().projection(projection)

    // draw map
    svg.selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", (d: Feature<GeometryObject>) => path(d) as string)
      .attr("fill", (d: Feature<GeometryObject>) => getFillColor(d, mapType))
      .attr("stroke", "#000000")
      .attr("stroke-width", 0.5)
      .on("click", (_, d: Feature<GeometryCollection<Geometry>, GeoJsonProperties>) => onMapClick(d))

    // draw text
    svg.selectAll("text")
      .data(features)
      .enter()
      .append("text")
      .attr("x", (d: Feature<GeometryObject>) => path.centroid(d)[0])
      .attr("y", (d: Feature<GeometryObject>) => path.centroid(d)[1])
      .text((d: Feature<GeometryObject>) => mapType === "country" ? d.properties?.CTP_KOR_NM : d.properties?.SIG_KOR_NM) 
      .attr("text-anchor", "middle")
      .attr("font-size", "6px")
      .attr("fill", "#000000")
      .style("pointer-events", "none")
  }, [geoJsonData, mapType, getFillColor, onMapClick])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  return (
    <>
      <Box className={styles.mapContainer}>
        <svg ref={svgRef} className={styles.mapSvg} />
      </Box>
    </>
  )
}

export default MapComponent