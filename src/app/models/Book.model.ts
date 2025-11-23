export interface DownloadResponseDto {
  isSuccess: boolean;
  message: string;
  fileName?: string;
  contentType?: string;
  base64Data?: string;
}

export interface PopularBook {
  rank: number;
  title: string;
  author: string;
  dept: string;
  download: number;
}
