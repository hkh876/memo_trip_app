import CustomDatePicker from "@/components/CustomDatePicker"
import Loading from "@/components/Loading"
import { EmptyDto } from "@/dtos/CommonDto"
import { MemoInfoResDto } from "@/dtos/MemoDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { MemoUpdateForm } from "@/forms/MemoForm"
import { useGetQueryEx, usePutQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/memo/Update.module.css"
import { Box, Button, Grid2, TextField, Typography } from "@mui/material"
import classNames from "classnames"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"

const Update = () => {
  // router
  const router = useRouter()
  const { id, countryName, cityName } = router.query

  // state
  const [isConnectMobile, setIsConnectMobile] = useState(false)

  // query
  const { data, isLoading: readIsLoading } = useGetQueryEx<MemoInfoResDto>({
    queryKey: QueryKeyEnum.READ_MEMO_INFO,
    url: "/api/v1/memo/info",
    params: {
      id: id as string
    },
    enabled: !!id
  })

  const onResSuccess = () => {
    toast.success(
      "수정 되었습니다.", 
      { onClose: () => { router.back() }, autoClose: 2000 })
  }

  const { mutate, isLoading: updateIsLoading } = usePutQueryEx<MemoUpdateForm, EmptyDto>({
    url: "/api/v1/memo/update",
    onSuccess: onResSuccess
  })

  // form
  const onUpdateSubmit: SubmitHandler<MemoUpdateForm> = (formData) => {
    if (confirm("수정 하시겠습니까?")) {
      mutate(formData)
    }
  }

  const onUpdateError: SubmitErrorHandler<MemoUpdateForm> = (errors) => {
    if (errors.title) {
      toast.error(errors.title.message, { autoClose: 2000 })
    } else if (errors.eventDate) {
      toast.error(errors.eventDate.message, { autoClose: 2000 })
    }
  }

  const { control, handleSubmit, setValue, reset, watch } = useForm<MemoUpdateForm>({
    defaultValues: {
      id: 0,
      title: "",
      contents: "",
      eventDate: "",
      selectedDate: new Date()
    }
  })

  // event
  const onCancelClick = () => {
    router.back()
  }

  // values
  const title = (countryName && cityName) ? `${countryName}\n(${cityName})` : ""
  const watchedSelectedDate = watch("selectedDate")

  useEffect(() => {
    setIsConnectMobile(isMobile)
  }, [])

  useEffect(() => {
    setValue("eventDate", format(watchedSelectedDate, "yyyy-MM-dd"))
  }, [watchedSelectedDate, setValue])

  useEffect(() => {
    if (data) {
      reset({
        id: data.id,
        title: data.title,
        contents: data.contents,
        selectedDate: new Date(data.eventDate)
      })
    }
  }, [data, reset])

  return (
    <>
      <Box className={styles.memoUpdateContainer}>
        <Box className={styles.contentsContainer}>
          <Typography component={"h2"} className={styles.titleText}>{title}</Typography>
          <Grid2 className={styles.gridInputContainer} columnGap={1.5} container>
            <Grid2>
              <Typography>날짜 : </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Controller 
                control={control}
                name={"selectedDate"}
                rules={{ required: "날짜를 선택해 주세요." }}
                render={({ field }) => 
                  <CustomDatePicker
                    isConnectMobile={isConnectMobile}
                    minDate={new Date("1900-01-01")}
                    field={field}
                  />
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 className={styles.gridInputContainer} columnGap={1.5} container>
            <Grid2>
              <Typography>제목 : </Typography>
            </Grid2>
            <Grid2 className={classNames([styles.inputGrid], [styles.title])}>
              <Controller 
                control={control}
                name={"title"}
                rules={{
                  required: "제목을 입력해 주세요.", maxLength: 100,
                  validate: {
                    noWhiteSpace: (value) => value.trim() !== "" || "제목을 입력해 주세요."
                  }
                }}
                render={({ field }) => 
                  <TextField 
                    { ...field }
                    variant={"outlined"}
                    size={"small"}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                    inputRef={(element) => field.ref(element)}
                    fullWidth
                  />
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 className={classNames([styles.gridInputContainer], [styles.contents])} columnGap={1.5} container>
            <Grid2>
              <Typography>내용 : </Typography>
            </Grid2>
            <Grid2 className={classNames([styles.inputGrid], [styles.contents])}>
              <Controller 
                control={control}
                name={"contents"}
                render={({ field }) => 
                  <TextField 
                    { ...field }  
                    variant={"outlined"}
                    size={"small"}
                    rows={6}
                    inputRef={(element) => field.ref(element)}
                    multiline
                    fullWidth
                  />
                }
              />
            </Grid2>
          </Grid2>
          <Box className={styles.actionContainer}>
            <Button
              variant={"contained"}
              color={"success"}
              onClick={handleSubmit(onUpdateSubmit, onUpdateError)}
            >
              수정
            </Button>
            <Button
              variant={"contained"}
              className={styles.cancelButton}
              onClick={onCancelClick}
            >
              취소
            </Button>
          </Box>
        </Box>
      </Box>
      <Loading open={readIsLoading || updateIsLoading} />
      <ToastContainer position={"top-center"} />
    </>
  )
}

export default Update