# Peace Play

สถานะล่าสุดของระบบ (อัปเดต ณ ปัจจุบัน)

- Firebase Project ที่ใช้งาน: `peace-play-official`
- Hosting URL ที่ใช้งานจริงตอนนี้: `https://peace-play-official-d6c9e.web.app`
- URL เดิมที่ต้องการกลับไปใช้: `https://peace-play-official.web.app`
- สถานะ URL เดิม: ยังถูก Firebase `reserved` ชั่วคราว จึงย้ายกลับทันทีไม่ได้

## Architecture ปัจจุบัน

- โค้ด `Peace Play` แยก repo/โฟลเดอร์แล้ว
- Firebase Project ของ `Peace Play` แยกจาก `peace-script-ai` แล้ว
- Cross-app login ใช้แนวทาง API/Token SSO (`idToken` handoff) ไม่พึ่งแชร์ session ข้ามโดเมน

## ใช้งานระหว่างรอปลดโดเมนเดิม

- ให้ทุกระบบที่ link มา Peace Play ชี้ไป:
  - `https://peace-play-official-d6c9e.web.app`

ไฟล์อ้างอิงสำหรับฝั่ง Studio:
- `STUDIO_INTEGRATION_GUIDE.md`

## เอกสารปฏิบัติการ (สำคัญ)

- แผนแยกระบบ + SSO: `FIREBASE_SPLIT_AND_SSO_PLAN.md`
- Runbook ย้ายกลับโดเมนเดิม: `DOMAIN_CUTOVER_RUNBOOK.md`
- เทมเพลตส่ง Firebase Support: `FIREBASE_SUPPORT_REQUEST_TEMPLATE.md`
- สคริปต์ retry cutover: `scripts/retry-domain-cutover.ps1`

## คำสั่งหลัก

```bash
npm run build
firebase deploy --only hosting
firebase use
```

## หมายเหตุ

ถ้า Firebase Support ปลด reserve ของชื่อ `peace-play-official` แล้ว ให้ทำ cutover ตาม `DOMAIN_CUTOVER_RUNBOOK.md` ได้ทันที
