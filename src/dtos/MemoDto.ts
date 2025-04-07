import { PictureResDto } from "./PictureDto";

interface CountryCountResDto {
  countryCode: string;
  count: number;
}

interface CityCountResDto {
  cityCode: string;
  count: number;
}

interface MemoListResDto {
  id: number;
  title: string;
  contents: string;
  cityCode: string;
  eventDate: string;
  pictures: PictureResDto[];
}

interface MemoInfoResDto {
  id: number;
  title: string;
  contents: string;
  eventDate: string;
}

interface MemoDeleteReqDto {
  id: number;
}

export type { CityCountResDto, CountryCountResDto, MemoDeleteReqDto, MemoInfoResDto, MemoListResDto };

