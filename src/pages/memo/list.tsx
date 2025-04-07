import Loading from "@/components/Loading"
import MemoCard from "@/components/memo/MemoCard"
import { EmptyDto } from "@/dtos/CommonDto"
import { MemoDeleteReqDto, MemoListResDto } from "@/dtos/MemoDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { useDeleteQueryEx, useGetQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/memo/List.module.css"
import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/router"

const List = () => {
  // router
  const router = useRouter()
  const { countryCode, countryName, cityCode, cityName } = router.query

  // query
  const { data, isLoading: readIsLoading } = useGetQueryEx<MemoListResDto[]>({
    queryKey: QueryKeyEnum.READ_MEMO_LIST,
    url: "/api/v1/memo/list",
    params: {
      cityCode: cityCode as string
    },
    enabled: !!cityCode
  })

  const onDeleteResSuccess = () => {
    router.reload()
  }

  const { mutate, isLoading: deleteIsLoading } = useDeleteQueryEx<MemoDeleteReqDto, EmptyDto>({
    url: "/api/v1/memo/delete",
    onSuccess: onDeleteResSuccess
  })

  // event
  const onCreateClick = () => {
    router.push({
      pathname: "/memo/create",
      query: {
        countryCode: countryCode,
        countryName: countryName,
        cityCode: cityCode,
        cityName: cityName
      }
    })
  }

  const onPictureClick = (memoId: number) => {
    router.push({
      pathname: "/memo/picture",
      query: {
        memoId: memoId
      }
    })
  }

  const onUpdateClick = (id: number) => {
    router.push({
      pathname: "/memo/update",
      query: {
        id: id,
        countryName: countryName,
        cityName: cityName
      }
    })
  }

  const onDeleteClick = (id: number) => {
    if (confirm("삭제 하시겠습니까?")) {
      mutate({ id: id })
    }
  }

  const onBackClick = () => {
    router.back()
  }

  // values
  const title = (countryName && cityName) ? `${countryName}\n(${cityName})` : ""

  return (
    <>
      <Box className={styles.memoListContainer}>
        <Box className={styles.contentsContainer}>
          <Typography className={styles.titleText}>{title}</Typography>
          <Box className={styles.actionContainer}>
            <Button variant={"contained"} color={"success"} onClick={onCreateClick}>작성하기</Button>
            <Button variant={"contained"} className={styles.backButton} onClick={onBackClick}>이전</Button>
          </Box>
          { readIsLoading ? <></> : (data && data.length > 0) ? (
            data.map((memo) => 
              <MemoCard 
                memoId={memo.id}
                title={memo.title} 
                contents={memo.contents} 
                eventDate={memo.eventDate}
                onPictureClick={onPictureClick}
                onUpdateClick={onUpdateClick}
                onDeleteClick={onDeleteClick}
                key={memo.id} 
              />
            )) : <Typography className={styles.emptyText}>데이터가 없습니다.</Typography>
          }
        </Box>
      </Box>
      <Loading open={readIsLoading || deleteIsLoading} />
    </>
  )
}

export default List