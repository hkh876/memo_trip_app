import { CityCountResDto } from "@/dtos/MemoDto";
import styles from "@/styles/ComplexCityMap.module.css";
import { Box, Button } from "@mui/material";
import classNames from "classnames";
import * as d3 from "d3";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, GeometryCollection, GeometryObject } from "geojson";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ComplexCityMapProps {
  geoJsonData: FeatureCollection<GeometryCollection, GeoJsonProperties>;
  codes?: CityCountResDto[];
  onClick: (code: string, name: string, hasData: boolean) => void;
}

const ComplexCityMap = ({ geoJsonData, codes=[], onClick }: ComplexCityMapProps) => {
  // ref
  const svgRef = useRef<SVGSVGElement>(null)

  // state
  const [selectCityCode, setSelectedCityCode] = useState("0")

  // event
  const onCityClick = (code: string) => {
    setSelectedCityCode(code)
  }

  // values
  const complexCity = useMemo(() => [
    "41111", "41113", "41115", "41117", // 수원시
    "41131", "41133", "41135",  // 성남시
    "41171", "41173", // 안양시
    "41271", "41273", // 안산시
    "41281", "41285", "41287", // 고양시
    "41461", "41463", "41465", // 용인시
    // 인천 광역시
    "28110", "28140", "28177", "28185", "28200", 
    "28237", "28245", "28260"
  ], [])
  const features = geoJsonData.features

  // SVG create
  const drawMap = useCallback(() => {
    if (!svgRef.current || !geoJsonData) {
      return
    }

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
    const scale = (height / distance / Math.sqrt(2)) * 0.6

    // set projection
    const projection = d3.geoMercator()
                        .center(center)
                        .scale(scale)
                        .translate([width / 2, height / 2])
    
    const path = d3.geoPath().projection(projection)

    // remove map
    svg.selectAll("path").remove()
    svg.selectAll("text").remove()

    // draw map
    svg.selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", (d: Feature<GeometryObject>) => path(d) as string)
      .attr("fill", (d: Feature<GeometryObject>) => 
        codes.length > 0 && codes.some(code => code.cityCode === d.properties?.SIG_CD) ? "#69b3a2" : "#ffffff"
      )
      .attr("stroke", (d: Feature<GeometryObject>) => d.properties?.SIG_CD === selectCityCode ? "#ff0000" : "#000000")
      .attr("stroke-width", (d: Feature<GeometryObject>) => d.properties?.SIG_CD === selectCityCode ? 2 : 0.5)
      .on("click", (_, d: Feature<GeometryCollection<Geometry>, GeoJsonProperties>) => {
        const hasData = codes.length > 0 && codes.some(code => code.cityCode === d.properties?.SIG_CD)
        onClick(d.properties?.SIG_CD, d.properties?.SIG_KOR_NM, hasData)
      })

    // draw text
    svg.selectAll("text")
      .data(features)
      .enter()
      .append("text")
      .attr("x", (d: Feature<GeometryObject>) => path.centroid(d)[0])
      .attr("y", (d: Feature<GeometryObject>) => path.centroid(d)[1])
      .text((d: Feature<GeometryObject>) => 
        complexCity.some((cityCode) => cityCode === d.properties?.SIG_CD) ? "" : d.properties?.SIG_KOR_NM
      ) 
      .attr("text-anchor", "middle")
      .attr("font-size", "6px")
      .attr("fill", "#000000")
      .style("pointer-events", "none")
  }, [geoJsonData, codes, selectCityCode, features, complexCity, onClick])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  return (
    <>
      <Box className={styles.mapContainer}>
        <Box className={styles.cityGroupContainer}>
          { features.map(feature => 
            complexCity.some((cityCode) => cityCode === feature.properties?.SIG_CD) && 
            <Button 
              variant={"outlined"} 
              size={"small"}
              className={classNames([styles.cityButton], {[styles.active]: selectCityCode === feature.properties?.SIG_CD})} 
              onClick={() => onCityClick(feature.properties?.SIG_CD)}
              key={feature.properties?.SIG_CD}
            >
              {feature.properties?.SIG_KOR_NM}
            </Button>
          )}
        </Box>
        <Box className={styles.svgContainer}>
          <svg ref={svgRef} className={styles.mapSvg} />
        </Box>
      </Box>
    </>
  )
}

export default ComplexCityMap