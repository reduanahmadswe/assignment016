import { cache } from 'react';
import api from '@/lib/api';

// Event Services - Server-side data fetching with caching
export const getEvents = cache(async (params?: any) => {
    const response = await api.get('/events', { params });
    return response.data;
});

export const getEventBySlug = cache(async (slug: string) => {
    const response = await api.get(`/events/slug/${slug}`);
    return response.data;
});

export const getFeaturedEvents = cache(async (limit = 3) => {
    const response = await api.get(`/events/featured?limit=${limit}`);
    return response.data;
});

export const getUpcomingEvents = cache(async (limit = 6) => {
    const response = await api.get(`/events/upcoming?limit=${limit}`);
    return response.data;
});

export const getOngoingEvents = cache(async (limit = 6) => {
    const response = await api.get(`/events/ongoing?limit=${limit}`);
    return response.data;
});

export const getPastEvents = cache(async (page = 1, limit = 10) => {
    const response = await api.get(`/events/past?page=${page}&limit=${limit}`);
    return response.data;
});

// Blog Services
export const getBlogs = cache(async (params?: any) => {
    const response = await api.get('/blogs', { params });
    return response.data;
});

export const getBlogBySlug = cache(async (slug: string) => {
    const response = await api.get(`/blogs/slug/${slug}`);
    return response.data;
});

export const getRecentBlogs = cache(async (limit = 5) => {
    const response = await api.get(`/blogs/recent?limit=${limit}`);
    return response.data;
});

// Host Services
export const getHosts = cache(async (params?: any) => {
    const response = await api.get('/hosts', { params });
    return response.data;
});

export const getHostById = cache(async (id: number) => {
    const response = await api.get(`/hosts/${id}`);
    return response.data;
});

// Page Services
export const getPageBySlug = cache(async (slug: string) => {
    const response = await api.get(`/pages/${slug}`);
    return response.data;
});

// Certificate Services
export const verifyCertificate = cache(async (certificateId: string) => {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response.data;
});
