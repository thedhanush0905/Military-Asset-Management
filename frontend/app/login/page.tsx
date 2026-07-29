"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/ui/forms/FormField";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const performLogin = async (loginEmail: string, loginPassword: string, isPreset: boolean) => {
    setIsLoading(true);
    try {
      const response = await authService.login(loginEmail, loginPassword);
      login(response.data.token, response.data.user);
      
      const successTitle = isPreset ? "Access Granted" : "Authentication Successful";
      const successMsg = isPreset 
        ? `Authenticated as ${response.data.user.name}` 
        : `Welcome back, ${response.data.user.name}. Access granted.`;
        
      toast(successTitle, successMsg, "success");
      router.push("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let errMsg = "An unexpected error occurred.";
      const status = error.response?.status;
      
      if (!error.response) {
        errMsg = "Unable to connect to the server.";
      } else if (status === 400) {
        const details = error.response?.data?.details;
        errMsg = details && Array.isArray(details)
          ? details.join(", ")
          : error.response?.data?.message || "Validation error occurred.";
      } else if (status === 401) {
        errMsg = "Invalid username/email or password.";
      } else if (status === 403) {
        errMsg = "Your account is inactive or you do not have permission to access this system.";
      } else if (status === 500) {
        errMsg = "An unexpected server error occurred. Please try again.";
      } else {
        errMsg = error.response?.data?.message || "Login failed.";
      }
      
      const failTitle = isPreset ? "Access Verification Failed" : "Authentication Failed";
      toast(failTitle, errMsg, "error");

      // Clear password and focus password field
      setValue("password", "");
      setFocus("password");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: LoginSchemaType) => {
    performLogin(data.email, data.password, false);
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E]">
      
      {/* Left Panel: Branding & Artwork (50% width) */}
      <div className="w-full md:w-1/2 bg-[#1A2820] text-[#E6E8E6] flex flex-col justify-between p-8 md:p-12 relative overflow-hidden border-b md:border-b-0 md:border-r border-[#22352B]">
        {/* Camouflage abstract lines overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(#556b2f_2px,transparent_2px)] [background-size:24px_24px] rotate-12" />
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-[#2F4F3A] border border-[#22352B]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-wider">AEGIS</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">Military Asset Command</span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="my-auto py-12 max-w-sm relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-white mb-4">
            National Defense Logistics Platform.
          </h2>
          <p className="text-sm text-[#A4B29E] leading-relaxed mb-6">
            AEGIS coordinates resource streams, vehicle states, personnel allocations, and logistical pipelines for Command Headquarters.
          </p>
          <div className="border-l-2 border-[#2F4F3A] pl-3 py-1 text-[11px] text-[#A4B29E] font-medium italic bg-[#111B15]/50">
            &quot;Providing logistics excellence and operational readiness to National Defense Logistics Headquarters.&quot;
          </div>
        </div>

        {/* Classified Footer warning */}
        <div className="text-[10px] text-muted-foreground/80 flex items-center gap-2 relative z-10">
          <Lock className="h-3 w-3 text-destructive" />
          <span className="tracking-[0.12em] uppercase font-semibold text-destructive">Classified System</span>
          <span>• Authorized personnel access only. Logs audited continuously.</span>
        </div>
      </div>

      {/* Right Panel: Sign In Form (50% width) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-sm bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#1A2820] dark:text-[#F5F5F2] tracking-tight">Access Authorization</h3>
            <p className="text-xs text-muted-foreground mt-1">Please enter your command credentials.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Username or Email"
              placeholder="service.number@aegis.mil"
              type="text"
              error={errors.email?.message}
              disabled={isLoading}
              {...register("email")}
            />

            <div className="relative">
              <FormField
                label="Security Key / Password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                error={errors.password?.message}
                disabled={isLoading}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-muted-foreground hover:text-[#1A2820]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Checkbox
                label="Remember Session"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <button 
                type="button"
                onClick={() => toast("Reset Password", "Contact system administrator at base headquarters for credentials verification.", "info")}
                className="text-xs font-semibold text-[#2F4F3A] dark:text-[#4F7F60] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase py-2.5 rounded-[10px] transition-all mt-2"
            >
              {isLoading ? "Validating..." : "Sign In"}
            </Button>
          </form>


        </div>
      </div>

    </div>
  );
}
