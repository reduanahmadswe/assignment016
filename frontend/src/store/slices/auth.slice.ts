import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

// Types
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'super_admin';
    avatar?: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Async thunks
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = Cookies.get('accessToken');

        if (!token) {
            return rejectWithValue('No token found');
        }

        try {
            const response = await authAPI.getMe();
            return response.data.user;
        } catch (error: any) {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            return rejectWithValue(error.response?.data?.message || 'Authentication failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (
        { accessToken, refreshToken, user }: { accessToken: string; refreshToken: string; user: User },
        { rejectWithValue }
    ) => {
        try {
            // Check if we're in production (HTTPS)
            const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
            
            const cookieOptions = {
                expires: 7,
                sameSite: 'Lax' as const,
                path: '/',
                secure: isProduction, // Only set secure flag in production (HTTPS)
            };
            
            const refreshCookieOptions = {
                expires: 30,
                sameSite: 'Lax' as const,
                path: '/',
                secure: isProduction,
            };
            
            Cookies.set('accessToken', accessToken, cookieOptions);
            Cookies.set('refreshToken', refreshToken, refreshCookieOptions);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
        }
        return null;
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Check Auth
        builder
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            });
    },
});

export const { setUser, updateUser, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
