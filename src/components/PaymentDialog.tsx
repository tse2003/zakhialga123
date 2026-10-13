"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiX, FiRefreshCw, FiLock } from "react-icons/fi";

type PaymentOrder = {
  productName: string; optionName: string; price: string;
  paymentStatus: string; status: string; qrImage?: string;
  bankLinks?: { name: string; link: string }[];
};

export default function PaymentDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [checked, setChecked] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const initialRequest = useRef<Promise<PaymentOrder> | null>(null);

  const readOrder = useCallback(async () => {
    const response = await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Төлбөрийн мэдээлэл уншиж чадсангүй.");
    return data.order as PaymentOrder;
  }, [orderId]);

  const prepare = useCallback(async () => {
    const current = await readOrder();
    if (current.paymentStatus === "paid" || current.status === "cancelled" || current.qrImage) return current;
    const response = await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}/invoice`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "QR үүсгэж чадсангүй.");
    return readOrder();
  }, [orderId, readOrder]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);

  useEffect(() => {
    let active = true;
    initialRequest.current ??= prepare();
    initialRequest.current.then(value => { if (active) setOrder(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Алдаа гарлаа."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [prepare]);

  useEffect(() => {
    if (!order?.qrImage || order.paymentStatus === "paid" || order.status === "cancelled") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try { if (document.visibilityState === "visible") { const value = await readOrder(); if (active) setOrder(value); } }
      catch { /* Manual refresh reports network errors without interrupting payment. */ }
      finally { if (active) timer = setTimeout(poll, 5000); }
    }
    timer = setTimeout(poll, 5000);
    return () => { active = false; clearTimeout(timer); };
  }, [order?.qrImage, order?.paymentStatus, order?.status, readOrder]);

  async function refresh() {
    setBusy(true); setError(""); setChecked(false);
    try { setOrder(await prepare()); setChecked(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Алдаа гарлаа."); }
    finally { setBusy(false); }
  }
  const paid = order?.paymentStatus === "paid";
  const cancelled = order?.status === "cancelled";
  return (
    <dialog ref={dialog} onCancel={onClose} onClose={onClose} aria-labelledby="payment-title" className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/60">
      <div className="relative bg-gradient-to-br from-sky-50 to-cyan-50 px-6 py-7 text-center">
        <button type="button" onClick={onClose} aria-label="Төлбөрийн цонх хаах" className="absolute right-3 top-3 rounded-full bg-white p-3 text-slate-500 focus-visible:outline-2 focus-visible:outline-sky-600"><FiX /></button>
        <p className="mb-2 text-xs font-bold tracking-widest text-sky-600">AQUABLUE · QPAY</p>
        <h2 id="payment-title" className="text-2xl font-bold">{paid ? "Төлбөр баталгаажлаа" : cancelled ? "Захиалга цуцлагдсан" : "Төлбөр төлөх"}</h2>
        <p className="mt-2 text-xs text-slate-500">Захиалга AQ-{orderId.slice(-8).toUpperCase()}</p>
      </div>
      <div className="space-y-5 p-6">
        {order && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"><div><h3 className="font-bold">{order.productName}</h3><p className="mt-1 text-xs text-slate-500">{order.optionName}</p></div><strong className="text-2xl text-sky-700">{order.price}</strong></div>}
        {busy && <p role="status" className="text-center text-sm text-sky-700">Төлбөрийн мэдээллийг бэлдэж байна…</p>}
        {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><p className="mt-2">Захиалга бүртгэгдсэн. Дахин захиалах шаардлагагүй.</p></div>}
        {paid ? <div role="status" className="py-5 text-center text-emerald-700"><FiCheckCircle className="mx-auto mb-4 h-14 w-14" /><p className="font-bold">Төлбөр амжилттай баталгаажлаа!</p><p className="mt-2 text-sm">Та захиалгын төлөвөө «Миний бүртгэл» хэсгээс хянаарай.</p></div> : cancelled ? <p className="text-center text-sm">Энэ захиалгын төлбөрийг төлөх боломжгүй.</p> : order?.qrImage && <>
          <img src={`data:image/png;base64,${order.qrImage}`} alt="Захиалгын QPay төлбөрийн QR код" width={240} height={240} className="mx-auto max-w-full rounded-xl border border-slate-200 bg-white p-3" />
          <p className="text-center text-sm leading-6 text-slate-500">Банкны апп-аараа QR код уншуулах эсвэл доорх банкны аппыг сонгон төлөөрэй.</p>
          <div className="grid grid-cols-2 gap-2">{order.bankLinks?.filter(bank => /^[a-z][a-z0-9+.-]*:/i.test(bank.link) && !/^(javascript|data|file|vbscript):/i.test(bank.link)).map(bank => <a key={bank.link} href={bank.link} className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-3 text-center text-sm font-semibold text-sky-800 hover:bg-sky-100">{bank.name}</a>)}</div>
          {checked && !busy && <p role="status" className="text-center text-sm text-amber-700">Төлбөр одоогоор баталгаажаагүй байна. Төлсөн бол түр хүлээгээд дахин шалгана уу.</p>}
        </>}
        {!paid && !cancelled && <button type="button" disabled={busy} onClick={refresh} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-bold text-white hover:bg-sky-700 disabled:opacity-50"><FiRefreshCw />{error ? "Дахин оролдох" : "Төлбөр шалгах"}</button>}
        <Link href="/account" className="block text-center text-sm font-semibold text-sky-700">Миний захиалгууд руу очих</Link>
        <p className="flex items-center justify-center gap-2 text-xs text-slate-400"><FiLock /> Төлбөрийг банкны апп дотроо баталгаажуулна.</p>
      </div>
    </dialog>
  );
}
