Read src/app/page.tsx.

Find the bottom CTA button in the ebook section. It currently looks like this (button that calls setLeadPopupOpen):
- Contains text "내게 맞는 전자책 50% 할인권 받기" or similar
- It's a <button> element near the checkpoints (✓ 내 투자 상태에 맞는...)
- Located after the 3 book cards, in the "max-w-2xl mx-auto text-center" div

Replace that <button> element with an <a> tag:
```jsx
<a
  href="https://moneystep.imweb.me/"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-emerald-500/10"
>
  내게 맞는 전자책 보러가기 →
</a>
```

Do NOT change the Vol.1 "50% 할인권 받기" button or the Vol.2/3 "출시 알림 신청하기" buttons — only change the large bottom CTA button.

Then build and push:
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
git add . && git commit -m "fix: ebook bottom CTA - link to moneystep.imweb.me" && git push origin master
