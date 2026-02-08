"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { useAuth } from "@/context/AuthContext";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }

      router.push("/"); // Redirect to home after signup
    } catch (err: any) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิก: " + (err.message || "โปรดตรวจสอบข้อมูลอีกครั้ง"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        router.push("/");
    } catch (error) {
        console.error("Google login error", error);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold text-[#2F5D86]">สมัครสมาชิก Peace Play</h1>
          <p className="text-sm text-gray-500">สร้างบัญชีเพื่อเริ่มต้นใช้งาน</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              type="text"
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อของคุณ"
              value={name}
              onValueChange={setName}
              required
              variant="bordered"
            />
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
              placeholder="กำหนดรหัสผ่าน"
              value={password}
              onValueChange={setPassword}
              required
              variant="bordered"
            />
            <Input
              type="password"
              label="ยืนยันรหัสผ่าน"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
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
              สมัครสมาชิก
            </Button>
          </form>

          <div className="flex items-center gap-4 my-4">
              <Divider className="flex-1" />
              <p className="text-xs text-gray-500">หรือ</p>
              <Divider className="flex-1" />
          </div>

          <button 
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    style={{ fill: "#4285F4" }}
                />
                <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    style={{ fill: "#34A853" }}
                />
                <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    style={{ fill: "#FBBC05" }}
                />
                <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    style={{ fill: "#EA4335" }}
                />
            </svg>
            สมัครสมาชิกด้วย Google
          </button>

        </CardBody>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/signIn" className="text-[#2F5D86] font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;
