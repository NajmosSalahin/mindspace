import { api } from './api';

export const eventService = api.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({ url: '/events', params }),
      providesTags: ['Events'],
    }),
    getEventById: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    getTrendingEvents: builder.query({
      query: () => '/events/trending',
      providesTags: ['Events'],
    }),
    getFeaturedEvents: builder.query({
      query: () => '/events/featured',
      providesTags: ['Events'],
    }),
    getEventsByCategory: builder.query({
      query: (slug) => `/events/category/${slug}`,
    }),
    createEvent: builder.mutation({
      query: (data) => {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (k === 'ticketTypes' || k === 'tags') fd.append(k, JSON.stringify(v));
          else if (k === 'banner' && v) fd.append('banner', v);
          else if (k === 'images') v.forEach((img) => fd.append('images', img));
          else fd.append(k, v);
        });
        return { url: '/events', method: 'POST', body: fd };
      },
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (k === 'ticketTypes' || k === 'tags') fd.append(k, JSON.stringify(v));
          else if (k === 'banner' && v) fd.append('banner', v);
          else fd.append(k, v);
        });
        return { url: `/events/${id}`, method: 'PATCH', body: fd };
      },
      invalidatesTags: ['Event', 'Events'],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
    }),
    toggleWishlist: builder.mutation({
      query: (id) => ({ url: `/events/${id}/toggle-wishlist`, method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    getEventSessions: builder.query({
      query: (id) => `/events/${id}/sessions`,
    }),
    getEventSpeakers: builder.query({
      query: (id) => `/events/${id}/speakers`,
    }),
    getEventReviews: builder.query({
      query: (id) => `/events/${id}/reviews`,
    }),
    updateEventStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/events/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Event', 'Events'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetTrendingEventsQuery,
  useGetFeaturedEventsQuery,
  useGetEventsByCategoryQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useToggleWishlistMutation,
  useGetEventSessionsQuery,
  useGetEventSpeakersQuery,
  useGetEventReviewsQuery,
  useUpdateEventStatusMutation,
} = eventService;
