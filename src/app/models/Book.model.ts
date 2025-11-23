export interface DownloadResponseDto {
  isSuccess: boolean;
  message: string;
  fileName?: string;
  contentType?: string;
  base64Data?: string;
}
