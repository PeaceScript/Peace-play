# Peace Play Domain Cutover Runbook

สถานะปัจจุบัน:
- Firebase Project (ใหม่): `peace-play-official`
- Live URL ปัจจุบัน: `https://peace-play-official-d6c9e.web.app`
- ต้องการย้ายกลับ URL เดิม: `https://peace-play-official.web.app`
- ข้อจำกัดปัจจุบัน: Site ID `peace-play-official` ถูก Firebase reserve ชั่วคราว

## 1) ตรวจสถานะก่อน cutover

```powershell
firebase use peace-play-official
firebase hosting:sites:list --project peace-play-official
firebase hosting:sites:list --project peace-script-ai
```

เงื่อนไขที่ควรเห็น:
- `peace-script-ai` ต้องไม่มี site `peace-play-official`
- `peace-play-official` project มี site ชั่วคราว `peace-play-official-d6c9e`

## 2) ลองสร้าง Site ID เดิมในโปรเจกต์ใหม่

```powershell
firebase hosting:sites:create peace-play-official --project peace-play-official --non-interactive
```

ถ้าสำเร็จ ให้ทำข้อ 3 ทันที

## 3) สลับ target ไปโดเมนเดิม

แก้ `.firebaserc` ให้ target `peace-play` ชี้ site `peace-play-official` แล้ว deploy:

```powershell
npm run build
firebase deploy --only hosting --project peace-play-official
```

## 4) ตรวจหลัง cutover

```powershell
firebase hosting:sites:list --project peace-play-official
```

ต้องเห็น:
- `peace-play-official` อยู่ใน project `peace-play-official`
- เว็บใช้งานได้ที่ `https://peace-play-official.web.app`

## 5) ทางเลือก cleanup หลัง cutover

เมื่อมั่นใจว่าโดเมนเดิมทำงานแล้ว สามารถลบ site ชั่วคราวได้:

```powershell
firebase hosting:sites:delete peace-play-official-d6c9e --project peace-play-official --force
```

> คำเตือน: การลบ site จะลบ history ของ site นั้นถาวร
