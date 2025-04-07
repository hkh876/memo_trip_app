import { DateValidationError, DesktopDatePicker, LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ko } from "date-fns/locale";
import dayjs from "dayjs";
import { useState } from "react";
import { ControllerRenderProps } from "react-hook-form";

interface CustomFieldProps extends ControllerRenderProps {
  onChange: (value: Date|dayjs.Dayjs|null) => void; // onChange 이벤트
  value: string|Date;                               // 필드 값
}

interface CustomDatePickerProps {
  format?: string;            // 날짜 형식, 기본 형식 (yyyy-MM-dd)
  size?: "small"|"medium";    // 입력 크기, "small" 과 "medium" 만 입력 가능, 기본 (small)
  minDate?: Date;             // 최소 날짜, 기본 (현재 날짜)
  maxDate?: Date;             // 최대 날짜, 기본 ("2099-12-31")
  isConnectMobile?: boolean;  // 모바일 접속 여부
  className?: string;         // 컨테이너 스타일
  field?: CustomFieldProps;   // 컨트롤러 필드
}

const CustomDatePicker = ({ format="yyyy-MM-dd", size="small", minDate=new Date(), maxDate=new Date("2099-12-31"),
  isConnectMobile=false, className, field }: CustomDatePickerProps) => {
  // state
  const [errorMessage, setErrorMessage] = useState<DateValidationError>(null)
  
  // event
  const onBlur = () => {
    if (errorMessage) {
      if (errorMessage === "invalidDate") {
        alert("올바른 날짜를 선택해 주세요.")
      } else if (errorMessage === "minDate") {
        alert("이전 날짜는 선택할 수 없습니다.")
      } else if (errorMessage === "maxDate") {
        alert("선택한 날짜는 최대 날짜 이후일 수 없습니다.")
      } else {
        console.error(errorMessage)
      }

      field?.onChange(null)
    }
  }

  return (
    <>
      {/* To Do : 컴포넌트 단위가 아닌 앱 단위에 적용 */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        { isConnectMobile ? 
          ( field ? 
            <MobileDatePicker
              { ...field }
              value={(typeof field.value === "string") ? new Date(field.value) : field.value}
              format={format}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{ textField: { size: size, onBlur: onBlur } }}
              inputRef={(element) => field.ref(element)}
              className={className}
              onError={(error) => setErrorMessage(error)}
            /> :
            <MobileDatePicker
              format={format}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{ textField: { size: size, onBlur: onBlur } }}
              className={className}
              onError={(error) => setErrorMessage(error)}
            />  
          ) : 
          ( field ?
            <DesktopDatePicker
              { ...field }
              value={(typeof field.value === "string") ? new Date(field.value) : field.value}
              format={format}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{ textField: { size: size, onBlur: onBlur } }}
              inputRef={(element) => field.ref(element)}
              className={className}
              onError={(error) => setErrorMessage(error)}
            /> :
            <DesktopDatePicker
              format={format}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{ textField: { size: size, onBlur: onBlur } }}
              className={className} 
              onError={(error) => setErrorMessage(error)}
            />
          ) 
        }
      </LocalizationProvider>
    </>
  )
}

export default CustomDatePicker