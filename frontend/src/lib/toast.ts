/**
 * Centralized Toast Utility
 * Uses react-hot-toast for consistent toast notifications across the app
 * 
 * This utility wraps react-hot-toast to provide:
 * - Consistent styling across all toasts
 * - Centralized configuration
 * - Type-safe API
 * - Easy maintenance and updates
 */

import reactHotToast, { ToastOptions } from 'react-hot-toast';

/**
 * Default toast configuration
 */
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '500px',
  },
};

/**
 * Success toast configuration
 */
const successOptions: ToastOptions = {
  ...defaultOptions,
  duration: 4000,
  style: {
    ...defaultOptions.style,
    background: '#D1FAE5',
    color: '#065F46',
    border: '2px solid #059669',
  },
  icon: '✅',
  iconTheme: {
    primary: '#059669',
    secondary: '#D1FAE5',
  },
};

/**
 * Error toast configuration
 */
const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 6000,
  style: {
    ...defaultOptions.style,
    background: '#FEE2E2',
    color: '#7F1D1D',
    border: '2px solid #DC2626',
  },
  icon: '❌',
  iconTheme: {
    primary: '#DC2626',
    secondary: '#FEE2E2',
  },
};

/**
 * Loading toast configuration
 */
const loadingOptions: ToastOptions = {
  ...defaultOptions,
  duration: Infinity,
  style: {
    ...defaultOptions.style,
    background: '#F3F4F6',
    color: '#374151',
    border: '2px solid #9CA3AF',
  },
};

/**
 * Show a success toast notification
 * @param message - The message to display
 * @param options - Optional toast configuration overrides
 */
export const success = (message: string, options?: ToastOptions) => {
  return reactHotToast.success(message, { ...successOptions, ...options });
};

/**
 * Show an error toast notification
 * @param message - The message to display
 * @param options - Optional toast configuration overrides
 */
export const error = (message: string, options?: ToastOptions) => {
  return reactHotToast.error(message, { ...errorOptions, ...options });
};

/**
 * Show a loading toast notification
 * Returns the toast ID that can be used to dismiss or update it
 * @param message - The message to display
 * @param options - Optional toast configuration overrides
 */
export const loading = (message: string, options?: ToastOptions) => {
  return reactHotToast.loading(message, { ...loadingOptions, ...options });
};

/**
 * Show a custom toast notification
 * @param message - The message to display
 * @param options - Optional toast configuration
 */
export const custom = (message: string, options?: ToastOptions) => {
  return reactHotToast(message, { ...defaultOptions, ...options });
};

/**
 * Handle promise-based toasts
 * Automatically shows loading, success, and error states
 * @param promise - The promise to track
 * @param messages - Messages for each state
 * @param options - Optional toast configuration
 */
export const promise = <T,>(
  promiseToTrack: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) => {
  return reactHotToast.promise(
    promiseToTrack,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      ...defaultOptions,
      ...options,
      success: { ...successOptions, ...options },
      error: { ...errorOptions, ...options },
      loading: { ...loadingOptions, ...options },
    }
  );
};

/**
 * Dismiss a specific toast or all toasts
 * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
 */
export const dismiss = (toastId?: string) => {
  reactHotToast.dismiss(toastId);
};

/**
 * Remove a specific toast from the DOM
 * @param toastId - Optional toast ID to remove. If not provided, removes all toasts
 */
export const remove = (toastId?: string) => {
  reactHotToast.remove(toastId);
};

/**
 * Main toast object with all methods
 * This is the primary export and should be used throughout the app
 */
const toastUtil = {
  success,
  error,
  loading,
  custom,
  promise,
  dismiss,
  remove,
};

// Default export for convenience
export default toastUtil;

