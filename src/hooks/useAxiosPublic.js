import { axiosPublic } from '../api/axiosInterceptor';

// Public endpoints: login, registration, and other unauthenticated requests.
export default function useAxiosPublic() {
  return axiosPublic;
}
