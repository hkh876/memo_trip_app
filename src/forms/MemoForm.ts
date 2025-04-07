interface MemoCreateForm {
  title: string;
  contents: string;
  attachFiles: File[] | undefined;
  eventDate: string;
  countryCode: string;
  cityCode: string;
  selectedDate: Date;
}

interface MemoUpdateForm {
  id: number;
  title: string;
  contents: string;
  eventDate: string;
  selectedDate: Date;
}

export type { MemoCreateForm, MemoUpdateForm };
