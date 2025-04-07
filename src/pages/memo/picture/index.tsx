import FileProgressing from "@/components/FileProgressing"
import Loading from "@/components/Loading"
import PictureCard from "@/components/picture/PictureCard"
import { EmptyDto } from "@/dtos/CommonDto"
import { PictureDeleteReqDto, PictureResDto } from "@/dtos/PictureDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { PictureUploadForm } from "@/forms/PictureForm"
import { useDeleteQueryEx, useGetQueryEx, usePostQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/picture/List.module.css"
import { Box, Button, InputBase, Typography } from "@mui/material"
import { AxiosProgressEvent } from "axios"
import { useRouter } from "next/router"
import { ChangeEvent, useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"

const Picture = () => {
  // router
  const router = useRouter()
  const { memoId } = router.query

  // state
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)

  // query
  const onDeleteResSuccess = () => {
    toast.success(
      "삭제 되었습니다.",
      { onClose: () => router.reload(), autoClose: 2000 }
    )
  }

  const onUploadResSuccess = () => {
    toast.success(
      "파일 업로드 완료 하였습니다.",
      { onClose: () => router.reload(), autoClose: 2000 }
    )

    setProgressOpen(false)
  }

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percent)
    }
  }

  const onUploadError = () => {
    setProgressOpen(false)
  }

  const { data, isLoading: readIsLoading } = useGetQueryEx<PictureResDto[]>({
    queryKey: QueryKeyEnum.READ_PICTURE_LIST,
    url: "/api/v1/memo/picture/list",
    params: {
      memoId: memoId as string
    },
    enabled: !!memoId
  })

  const { mutate: deleteMutate, isLoading: deleteIsLoading } = useDeleteQueryEx<PictureDeleteReqDto, EmptyDto>({
    url: "/api/v1/memo/picture/delete",
    onSuccess: onDeleteResSuccess
  })

  const { mutate: uploadMutate } = usePostQueryEx<PictureUploadForm, EmptyDto>({
    url: "/api/v1/memo/picture/upload",
    contentType: "multipart/form-data",
    onSuccess: onUploadResSuccess,
    onError: onUploadError,
    onProgress: onProgress
  })

  // form
  const onUploadSubmit: SubmitHandler<PictureUploadForm> = (formData) => {
    if (!formData.attachFiles) {
      toast.error(
        "파일을 선택해 주세요.", { autoClose: 2000 }
      )
    } else if (confirm("파일 업로드 하시겠습니까?")) {
      setProgressOpen(true)
      uploadMutate(formData)
    }
  }

  const { handleSubmit, setValue } = useForm<PictureUploadForm>({
    defaultValues: {
      memoId: 0,
      attachFiles: undefined
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

  const onBackClick = () => {
    router.back()
  }

  const onDeleteClick = (id: number) => {
    if (confirm("삭제 하시겠습니까?")) {
      deleteMutate({ id: id })
    }
  }

  useEffect(() => {
    if (memoId) {
      setValue("memoId", Number(memoId))
    }
  }, [memoId, setValue])

  return (
    <>
      <Box className={styles.pictureListContainer}>
        <Box className={styles.contentsContainer}>
          <Box className={styles.uploadContainer}>
            <InputBase 
              type={"file"}
              inputProps={{ accept: "image/*", multiple: true }}
              onChange={onChange}
              className={styles.fileInput}
            />
            <Box className={styles.actionContainer}>
              <Button variant={"contained"} color={"primary"} onClick={handleSubmit(onUploadSubmit)}>업로드</Button>
              <Button variant={"contained"} className={styles.backButton} onClick={onBackClick}>이전</Button>  
              <Typography className={styles.countText}>{data?.length}장</Typography>
            </Box>
          </Box>
          { readIsLoading ? <></> : (data && data.length > 0) ? (
            data.map((picture) => 
              <PictureCard id={picture.id} onDeleteClick={onDeleteClick} key={picture.id} />
            )) : <Typography className={styles.emptyText}>데이터가 없습니다.</Typography>
          }     
        </Box>
      </Box>
      <Loading open={readIsLoading || deleteIsLoading} />
      <FileProgressing open={progressOpen} progress={progress} />
      <ToastContainer position={"top-center"} />
    </>
  )
}

export default Picture