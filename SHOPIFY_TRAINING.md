# Shopify App Mini Project Training

Muc tieu: Tu mot Shopify template, ban xay duoc mot mini app co cac nang luc cot loi:

- Xac thuc embedded app
- Doc/ghi du lieu bang Admin GraphQL
- To chuc route loader/action
- Xu ly webhook co ban

## Pre-check

1. Chay app: `npm run dev`
2. Cai app vao dev store bang Shopify CLI prompt
3. Mo route training: `/app/training`

## Day 1 - Hieu bo cuc app

1. Doc `app/shopify.server.ts` de hieu auth + session storage
2. Doc `app/routes/app.tsx` de hieu embedded layout + app nav
3. Mo `/app/training` va xac nhan Step 1 hien products

Expected output:
- Hieu tai sao `authenticate.admin(request)` phai goi trong loader/action

## Day 2 - Query products sau hon

1. Sua query trong `app/routes/app.training.tsx`:
- Them `totalInventory`
- Them `vendor`
2. Hien thi them field trong JSON block

Expected output:
- Nhan du lieu dung schema Admin API
   
## Day 3 - Tao product theo input

1. Them form input `title`
2. Truyen title vao mutation `productCreate`
3. Validate title khong rong

Expected output:
- Tao duoc product voi ten do nguoi dung nhap

## Day 4 - Metafield nang cao

1. Doi namespace/key training_note
2. Them gia tri la JSON (`json` type) neu can
3. Them button doc lai metafield vua set

Expected output:
- Hieu vong doi custom data (write + read)

## Day 5 - Pagination

1. Doi query products sang connection (`edges`, `pageInfo`)
2. Them button next page bang `endCursor`

Expected output:
- Hieu cursor-based pagination cua Shopify GraphQL

## Day 6 - Webhook co ban

1. Mo file `app/routes/webhooks.app.uninstalled.tsx`
2. Log thong tin webhook va xu ly idempotent
3. Trigger webhook test bang CLI

Expected output:
- Hieu luong server-to-server cua Shopify

## Day 7 - Refactor mini project

1. Tach GraphQL query/mutation sang module rieng, vi du `app/services/training.server.ts`
2. Them typing ro rang cho response GraphQL
3. Viet test cho business logic (neu ban them test framework)

Expected output:
- Code clean hon, de mo rong thanh production feature

## Mini challenge

1. Tao route moi `/app/discount-lab`
2. Them action tao automatic discount
3. Hien danh sach discount vua tao

Neu lam duoc challenge nay, ban da nam kha chac luong CRUD + auth + action pattern trong Shopify app.
