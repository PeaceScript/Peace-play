import React from "react";
import { useAuth } from "@/context/AuthContext";
import { openExternalWithSso } from "@/utils/sso";
import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NavBarTop = ({ hasSidebar = false }: { hasSidebar?: boolean }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "peace-play";

  const handleNavigateToExternalApp = async (url: string) => {
    await openExternalWithSso({
      user,
      targetUrl: url,
      sourceApp: appName,
    });
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            {hasSidebar && (
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 darks:text-gray-400 darks:hover:bg-gray-700 darks:focus:ring-gray-600"
              >
                <span className="sr-only kanit">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
            )}
            <a className="flex items-center gap-2" href="/">
              {/* Logo / Text */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                   <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="self-center text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                PEACE PLAY
              </span>
            </a>
          </div>

          <div className="hidden lg:flex gap-8 items-center">
            <a
              href="/"
              className="font-extrabold text-[#B8B8B8] cursor-pointer hover:text-[#2F5D86]"
            >
              หน้าหลัก
            </a>
            <a
              href="/project"
              className="font-extrabold text-[#B8B8B8] cursor-pointer hover:text-[#2F5D86]"
            >
              โปรเจคทั้งหมด
            </a>
            <a
              href="/project"
              className="font-extrabold text-[#2F5D86] cursor-pointer hover:text-[#2F5D86]"
            >
              คลังความรู้
            </a>
            <a
              href="/myProject"
              className="font-extrabold text-[#B8B8B8] cursor-pointer hover:text-[#2F5D86]"
            >
              โปรเจคของฉัน
            </a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="cursor-pointer flex">
                   <Avatar
                      isBordered
                      className="transition-transform"
                      src={user.photoURL || "/assets/profile-picture-5.jpg"} // Use fallback if no photo
                    />
                  </div>
                </DropdownTrigger>

                <DropdownMenu 
                  aria-label="Profile Actions" 
                  variant="flat" 
                  className="bg-white rounded-xl shadow-xl text-black"
                >
                  <DropdownItem key="profile" textValue="ข้อมูลผู้ใช้" className="h-14 gap-2 border-b border-gray-100">
                    <p className="font-semibold text-black">เข้าสู่ระบบโดย</p>
                    <p className="font-semibold text-gray-600">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="my_project" textValue="โปรเจคของฉัน" className="text-gray-800" onClick={() => router.push("/myProject")}>
                    โปรเจคของฉัน
                  </DropdownItem>
                  <DropdownItem 
                    key="settings" 
                    textValue="ตั้งค่าส่วนตัว"
                    className="text-gray-800" 
                    onClick={() => router.push("/myProject/profile/editProfile")}
                  >
                    ตั้งค่าส่วนตัว
                  </DropdownItem>
                  <DropdownItem 
                    key="peace_studio" 
                    textValue="Peace Studio"
                    className="text-cyan-600 font-bold"
                    onClick={() => handleNavigateToExternalApp(process.env.NEXT_PUBLIC_STUDIO_URL || "https://peace-script-ai.web.app/")}
                  >
                    Peace Studio
                  </DropdownItem>
                  <DropdownItem 
                    key="market_peace" 
                    textValue="Market Peace"
                    className="text-[#FFD700] font-bold"
                    onClick={() => handleNavigateToExternalApp(process.env.NEXT_PUBLIC_MARKET_URL || "https://market-peace.web.app/")}
                  >
                    Market Peace
                  </DropdownItem>
                  <DropdownItem key="logout" textValue="ออกจากระบบ" className="text-red-500" color="danger" onClick={logout}>
                    ออกจากระบบ
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <div className="flex gap-2">
                <Link href="/signIn">
                  <Button variant="light" className="text-[#2F5D86] font-bold">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/signUp">
                  <Button className="bg-[#2F5D86] text-white font-bold">
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBarTop;
