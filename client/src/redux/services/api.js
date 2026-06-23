import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401 && result?.error?.data?.code === 'TOKEN_EXPIRED') {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      { ...api, extraOptions },
      extraOptions
    );
    if (refreshResult?.data?.success) {
      const user = api.getState().auth.user;
      api.dispatch(setCredentials({ ...refreshResult.data.data, user }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      window.location.href = '/login';
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth', 'User', 'Events', 'Event', 'Tickets', 'Ticket',
    'Orders', 'Reviews', 'Notifications', 'Coupons',
    'Waitlist', 'Surveys', 'Certificates', 'Admin',
  ],
  endpoints: () => ({}),
});
