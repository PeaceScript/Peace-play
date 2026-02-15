# Peace Play: Split Firebase Project + SSO Plan

เอกสารนี้ใช้สำหรับแยก `Peace Play` ออกจาก `peace-script-ai` ให้เป็นโปรเจกต์ Firebase ของตัวเอง และเชื่อมต่อกับแอปอื่นผ่าน API/Token SSO

## เป้าหมาย

- แยก deployment และ billing ของ `Peace Play` ออกจากระบบอื่น
- ลดผลกระทบข้ามระบบเวลา deploy ผิดพลาด
- ใช้การเชื่อมต่อข้ามโดเมนด้วย `idToken` (ไม่แชร์ session/cookie ข้ามโดเมน)

## สถานะปัจจุบัน

- โค้ดของ `Peace Play` อยู่ใน repo/โฟลเดอร์แยกแล้ว
- Hosting site ปัจจุบัน: `peace-play-official-d6c9e.web.app`
- Firebase project ที่ผูก deploy ปัจจุบัน: `peace-play-official`

## ขั้นตอนแยก Firebase Project

1. สร้าง Firebase project ใหม่สำหรับ Peace Play (เช่น `peace-play-prod`)
2. สร้าง Hosting site ใน project ใหม่ (เช่น `peace-play-official`)
3. ย้ายหรือสร้าง Web App ใน project ใหม่ แล้วคัดลอกค่า config ใหม่
4. อัปเดตค่าใน `.env.local`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
5. อัปเดต `.firebaserc` ให้ `projects.default` ชี้ไป project ใหม่ของ Peace Play
6. ตรวจสอบ `firebase.json` target/hosting ให้ตรง site ใหม่
7. รัน build + deploy

## ขั้นตอน SSO ระหว่างแอป

Peace Play จะส่งค่า query string ไปปลายทาง:

- `from=peace-play`
- `idToken=<firebase id token>` (ถ้าผู้ใช้ล็อกอินอยู่)
- `returnUrl=<url ต้นทาง>`

ปลายทาง (เช่น Market Peace) ต้องทำ 3 อย่าง:

1. อ่าน `idToken` จาก query string
2. ส่ง `idToken` ไป API ฝั่ง server ของตัวเองเพื่อตรวจสอบกับ Firebase Admin SDK
3. ออก session ของระบบปลายทางเอง (เช่น cookie/JWT ของโดเมนปลายทาง)

> หมายเหตุ: ไม่ควรถือว่าแค่มี token ใน URL = login สำเร็จ ต้อง verify token ที่ server ทุกครั้ง

## เช็คลิสต์ก่อนขึ้น production

- [x] Firebase project ของ Peace Play แยกเป็นของตัวเอง
- [x] Secrets และ env แยกระหว่าง Peace Play / Market Peace / Peace Script AI
- [ ] Market Peace รองรับรับ `idToken` และ verify ผ่าน server
- [ ] เปิดใช้งาน analytics/monitoring แยกต่อระบบ
- [ ] ทดสอบ login flow จาก Peace Play -> Market Peace แบบ end-to-end

## สถานะปิดงานที่ยังค้าง

- โดเมนเดิม `peace-play-official.web.app` ยังติด reserved ชั่วคราวจาก Firebase
- ระหว่างนี้ระบบใช้งานผ่าน `peace-play-official-d6c9e.web.app` ได้ปกติ
- เมื่อปลด reserved แล้ว ให้ทำขั้นตอนใน `DOMAIN_CUTOVER_RUNBOOK.md`
