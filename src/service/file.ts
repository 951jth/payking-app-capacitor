import { authInstance } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 파일 업로드(formData) 업로드 버전
  uploadFile: (formData, params = {thumbnail: false, agentId: null}) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/file-stream/v1/upload?${stringifyQuery(params)}`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
      timeout: 1000 * 60 * 3, // 3분
    };
    return authInstance(requestOptions);
  },
};



