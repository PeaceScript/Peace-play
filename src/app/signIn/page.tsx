"use client";

import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { useAuth } from "@/context/AuthContext";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnUrlParam, setReturnUrlParam] = useState<string | null>(null);
  const [sourceParam, setSourceParam] = useState<string | null>(null);
  const router = useRouter();
  const { loginWithGoogle, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setReturnUrlParam(params.get("returnUrl"));
    setSourceParam(params.get("from"));
  }, []);

  const getSafeRedirect = () => {
    if (sourceParam === "peace-script") {
      return "/";
    }

    const rawReturnUrl = returnUrlParam;
    if (!rawReturnUrl) return "/";

    try {
      const decoded = decodeURIComponent(rawReturnUrl);
      const returnUrl = new URL(decoded);
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";

      if (returnUrl.origin === currentOrigin) {
        return returnUrl.toString();
      }
    } catch {
      return "/";
    }

    return "/";
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.replace(getSafeRedirect());
    }
  }, [authLoading, user, router, sourceParam, returnUrlParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace(getSafeRedirect());
    } catch (err: any) {
      // Handle explicit auth errors
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        // Do not console.error for expected validation errors to keep console clean
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "เข้าสู่ระบบผิดพลาดบ่อยเกินไป โปรดลองใหม่ภายหลัง";
      } else {
        console.error("Login error:", err); // Log only unexpected errors
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setError("");
        await loginWithGoogle(getSafeRedirect());
    } catch (err: any) {
        let errorMessage = "ไม่สามารถเข้าสู่ระบบด้วย Google ได้";

        if (err?.code === "auth/popup-closed-by-user") {
          errorMessage = "คุณปิดหน้าต่าง Google Login ก่อนยืนยัน";
        } else if (err?.code === "auth/popup-blocked") {
          errorMessage = "เบราว์เซอร์บล็อก popup กรุณาอนุญาต popup แล้วลองอีกครั้ง";
        } else if (err?.code === "auth/unauthorized-domain") {
          errorMessage = "โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication";
        }

        setError(errorMessage);
        console.error("Google login error", err);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold text-[#2F5D86]">เข้าสู่ระบบ Peace Play</h1>
          <p className="text-sm text-gray-500">ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="email"
              label="อีเมล"
              placeholder="กรอกอีเมลของคุณ"
              value={email}
              onValueChange={setEmail}
              required
              variant="bordered"
            />
            <Input
              type="password"
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={password}
              onValueChange={setPassword}
              required
              variant="bordered"
            />
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              color="primary" 
              className="w-full bg-[#2F5D86]"
              isLoading={loading}
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="w-full flex flex-col gap-4 mt-6">
            <div className="relative flex items-center justify-center w-full">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-4">
                    <span className="text-sm text-gray-500">หรือ</span>
                </div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition duration-300 ease-in-out shadow-sm transform active:scale-[0.98]"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>

        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            ยังไม่มีบัญชีใช่หรือไม่?{" "}
            <Link href="/signUp" className="text-[#2F5D86] font-semibold hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
