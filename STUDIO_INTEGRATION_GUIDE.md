# คู่มือการเชื่อมต่อ Peace Studio ไปยัง Peace Play

เพื่อทำให้ผู้ใช้งานสามารถกดสลับกลับมาที่หน้า Peace Play ได้จากฝั่ง Peace Studio (https://peace-script-ai.web.app/) ให้ทำตามขั้นตอนดังนี้:

## 1. เปิดโปรเจกต์ Peace Studio
เปิดโปรเจกต์ Peace Script AI ใน VS Code ของคุณ

## 2. แก้ไขไฟล์ Navbar
ไปที่ไฟล์ Component Navbar ของ Studio (น่าจะอยู่ที่ `src/components/layouts/Navbar.tsx` หรือใกล้เคียง)

## 3. เพิ่มปุ่ม "Peace Play"
เพิ่มโค้ดปุ่มนี้ลงไปในส่วนของ Menu List หรือ Profile Dropdown:

```tsx
// ตัวอย่างการเพิ่มปุ่มด้วย NextUI หรือปุ่ม HTML ธรรมดา

<button 
  className="flex items-center gap-2 px-4 py-2 text-cyan-400 font-bold hover:bg-cyan-500/10 rounded-lg transition-all"
  onClick={() => window.open("https://peace-play-official-d6c9e.web.app/", "_blank")}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
  <span>Peace Play</span>
</button>
```

หรือถ้าเป็น Dropdown Item:

```tsx
<DropdownItem 
  key="peace_play"
  className="text-cyan-500 font-bold"
  onClick={() => window.open("https://peace-play-official-d6c9e.web.app/", "_blank")}
>
   🎬 ไปที่ Peace Play
</DropdownItem>
```

## 4. Deploy
ทำการ Build และ Deploy ฝั่ง Studio ใหม่อีกครั้ง เท่านี้ก็จะสามารถเชื่อมต่อทั้ง 2 เว็บเข้าหากันได้สมบูรณ์ครับ
