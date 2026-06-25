/**
 * Capacitor WebView 로드 방식 설정
 *
 * - '' (비움): dist 번들을 네이티브 앱에 포함해 로드 (기본)
 * - URL 설정: 해당 원격 URL을 WebView에서 로드 (웹 배포 방식)
 *
 * URL 변경 후 반드시 `yarn cap sync` 실행
 *
 * @example 프로덕션
 * export const CAPACITOR_SERVER_URL = 'https://app.example.com';
 *
 * @example 로컬 개발 (실기기, PC IP 사용)
 * export const CAPACITOR_SERVER_URL = 'http://192.168.0.10:5173';
 */
// export const CAPACITOR_SERVER_URL = "";
export const CAPACITOR_SERVER_URL = "http://192.168.0.14:5173";
