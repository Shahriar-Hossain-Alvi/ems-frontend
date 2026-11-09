import { axiosSecure } from '../api/axiosInterceptor';

// Protected endpoints: the request interceptor adds the latest JWT automatically.
export default function useAxiosSecure() {
  return axiosSecure;
}
