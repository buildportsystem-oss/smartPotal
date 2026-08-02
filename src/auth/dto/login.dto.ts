export class LoginDto {
  loginId!: string;
  password!: string;
  captchaToken?: string; // 프론트엔드에서 보내주는 구글 reCAPTCHA 토큰
}
