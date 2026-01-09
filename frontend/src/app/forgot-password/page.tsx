"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authAPI } from "@/lib/api";
import { Alert } from "@/components/ui";
import { ArrowLeft, Mail, Lock, Phone } from "lucide-react";

// --- VALIDATION SCHEMAS ---

// Step 1: Request OTP
const requestOtpSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    // The user requested Phone input. We include it in the schema/UI,
    // but note that the backend primarily uses email for account recovery.
    phone: z.string().min(11, "Phone number must be at least 11 digits").optional().or(z.literal('')),
});

// Step 2: Verify OTP & Reset Password
// Merging these steps because the current backend endpoint (resetPassword) handles both simultaneously.
const resetPasswordSchema = z
    .object({
        otp: z.string().min(6, "OTP must be 6 digits"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1); // 1 = Request OTP, 2 = Reset Password
    const [email, setEmail] = useState(""); // Store email to pass to step 2
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- STEP 1: REQUEST OTP ---
    const {
        register: registerStep1,
        handleSubmit: handleSubmitStep1,
        formState: { errors: errorsStep1 },
    } = useForm<RequestOtpFormData>({
        resolver: zodResolver(requestOtpSchema),
    });

    const onSubmitRequestOtp = async (data: RequestOtpFormData) => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // Backend api call to send OTP
            await authAPI.forgotPassword(data.email);
            setEmail(data.email);
            setSuccess("An OTP has been sent to your email.");
            setStep(2); // Move to next step
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: RESET PASSWORD ---
    const {
        register: registerStep2,
        handleSubmit: handleSubmitStep2,
        formState: { errors: errorsStep2 },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmitResetPassword = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // Backend api call to reset password
            await authAPI.resetPassword({
                email,
                otp: data.otp,
                newPassword: data.newPassword,
            });

            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden p-8 sm:p-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
                        <Lock className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        {step === 1
                            ? "Enter your details to receive a recovery code."
                            : "Enter the code sent to your email and your new password."}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="error" className="mb-6" dismissible onDismiss={() => setError("")}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="mb-6" dismissible onDismiss={() => setSuccess("")}>
                        {success}
                    </Alert>
                )}

                {/* Step 1 Form */}
                {step === 1 && (
                    <form onSubmit={handleSubmitStep1(onSubmitRequestOtp)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                    {...registerStep1("email")}
                                />
                            </div>
                            {errorsStep1.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {errorsStep1.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                                Mobile Number (Optional)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                    {...registerStep1("phone")}
                                />
                            </div>
                            {errorsStep1.phone && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {errorsStep1.phone.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending OTP..." : "Send Reset Code"}
                        </button>
                    </form>
                )}

                {/* Step 2 Form */}
                {step === 2 && (
                    <form onSubmit={handleSubmitStep2(onSubmitResetPassword)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                                OTP Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-center text-lg tracking-widest"
                                {...registerStep2("otp")}
                            />
                            {errorsStep2.otp && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {errorsStep2.otp.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                {...registerStep2("newPassword")}
                            />
                            {errorsStep2.newPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {errorsStep2.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                {...registerStep2("confirmPassword")}
                            />
                            {errorsStep2.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {errorsStep2.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}
