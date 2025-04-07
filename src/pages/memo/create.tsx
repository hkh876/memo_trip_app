import CustomDatePicker from "@/components/CustomDatePicker"
import FileProgressing from "@/components/FileProgressing"
import Loading from "@/components/Loading"
import { EmptyDto } from "@/dtos/CommonDto"
import { ErrorCode } from "@/errors/ErrorCode"
import { MemoCreateForm } from "@/forms/MemoForm"
import { ErrorRes, usePostQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/memo/Create.module.css"
import { Box, Button, Grid2, InputBase, TextField, Typography } from "@mui/material"
import { AxiosProgressEvent } from "axios"
import classNames from "classnames"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { ChangeEvent, useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"

const Create = () => {
  // router
  const router = useRouter()
  const { countryCode, countryName, cityCode, cityName } = router.query

  // state
  const [isConnectMobile, setIsConnectMobile] = useState(false)
  const [fileUploadEnabled, setFileUploadEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)

  // query
  const onResSuccess = () => {
    toast.success(
      "저장 되었습니다.",
      { onClose: () => router.back(), autoClose: 2000 }
    )

    setProgressOpen(false)
  }

  const onResError = (error: ErrorRes) => {
    if (error.code === ErrorCode.UPLOAD_SIZE_ERROR) {
      toast.error(error.message, { autoClose: 2000 })
    }

    setProgressOpen(false)
  }

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percent)
    }
  }

  const { mutate, isLoading } = usePostQueryEx<MemoCreateForm, EmptyDto>({
    url: "/api/v1/memo/create",
    contentType: "multipart/form-data",
    onSuccess: onResSuccess,
    onError: onResError,
    onProgress: onProgress
  })

  // form
  const onCreateSubmit: SubmitHandler<MemoCreateForm> = (formData) => {
    if (confirm("저장 하시겠습니까?")) {
      if (formData.attachFiles && formData.attachFiles.length > 0) {
        setFileUploadEnabled(true)
        setProgressOpen(true)
      } else {
        setFileUploadEnabled(false)
        setProgressOpen(false)
      }

      mutate(formData)
    }
  }

  const onCreateError: SubmitErrorHandler<MemoCreateForm> = (errors) => {
    if (errors.title) {
      toast.error(errors.title.message, { autoClose: 2000 })
    } else if (errors.eventDate) {
      toast.error(errors.eventDate.message, { autoClose: 2000 })
    }
  }

  const { control, handleSubmit, setValue, getValues, watch } = useForm<MemoCreateForm>({
    defaultValues: {
      title: "",
      contents: "",
      eventDate: "",
      attachFiles: undefined,
      countryCode: "",
      cityCode: "",
      selectedDate: new Date()
    }
  })

  // event
  const onChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    const filesArray = Array.from(target.files || [])

    // 압축 안함  
    // const compressedFiles: File[] = []

    // for (const file of filesArray) {
    //   const options = { maxSizeMB: 0.5, useWebWorker: true }
    //   const compressedFile = await imageCompression(file, options)

    //   compressedFiles.push(new File([compressedFile], file.name, { type: file.type }))
    // }

    // setValue("attachFiles", compressedFiles)
    setValue("attachFiles", filesArray)
  }

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
    if (countryCode && cityCode) {
      setValue("countryCode", countryCode as string)
      setValue("cityCode", cityCode as string)
    }
  }, [countryCode, cityCode, setValue])

  useEffect(() => {
    setValue("eventDate", format(watchedSelectedDate, "yyyy-MM-dd"))
  }, [watchedSelectedDate, setValue, getValues])

  return (
    <>
      <Box className={styles.memoCreateContainer}>
        <Box className={styles.contentsContainer}>
          <Typography component={"h2"} className={styles.titleText}>{title}</Typography>  
          <Grid2 className={styles.gridInputContainer} columnGap={1.5} container>
            <Grid2>
              <Typography>날짜 : </Typography>
            </Grid2>
            <Grid2 className={styles.inputGrid} size={6}>
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
          <Grid2 className={styles.gridInputContainer} columnGap={1.5} container>
            <Grid2>
              <Typography>첨부 파일 : </Typography>
            </Grid2>
            <Grid2 className={styles.inputGrid}>
              <InputBase 
                type={"file"} 
                inputProps={{ accept: "image/*", multiple: true }} 
                onChange={onChange}
              />
            </Grid2>
          </Grid2>
          <Box className={styles.actionContainer}>
            <Button 
              variant={"contained"} 
              color={"success"}
              onClick={handleSubmit(onCreateSubmit, onCreateError)}
            >
              저장
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
      { fileUploadEnabled ? <FileProgressing open={progressOpen} progress={progress} /> : <Loading open={isLoading} /> }
      <ToastContainer position={"top-center"} />
    </>
  )
}

export default Create
