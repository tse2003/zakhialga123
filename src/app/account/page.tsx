"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
type Order = {
  _id: string;
  productName: string;
  optionName: string;
  price: string;
  paymentStatus: string;
  status: string;
  qrImage?: string;
  bankLinks?: { name: string; link: string }[];
};
export default function AccountPage() {
  const [account, setAccount] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  async function load() {
    const response = await fetch("/api/account/session");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setAccount(data.account);
    if (data.account) {
      const result = await fetch("/api/customer/orders");
      const body = await result.json();
      if (!result.ok) throw new Error(body.error);
      setOrders(body.orders);
    } else setOrders([]);
    setReady(true);
  }
  useEffect(() => {
    load().catch((error) => {
      setMessage(error.message);
      setReady(true);
    });
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/account/${register ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form)),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }
  async function invoice(id: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/customer/orders/${id}/invoice`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Миний бүртгэл</h1>
      {message && (
        <p role="alert" className="text-red-600">
          {message}
        </p>
      )}
      {!ready ? (
        <p>Уншиж байна…</p>
      ) : !account ? (
        <section className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold">
            {register ? "Бүртгүүлэх" : "Нэвтрэх"}
          </h2>
          <form onSubmit={submit} className="grid gap-4 mt-4">
            {register && (
              <input
                name="name"
                aria-label="Нэр"
                placeholder="Нэр"
                required
                maxLength={100}
                className="input input-bordered w-full"
              />
            )}
            <input
              name="phone"
              aria-label="Утас"
              placeholder="8 оронтой утас"
              pattern="[0-9]{8}"
              required
              autoComplete="username"
              className="input input-bordered w-full"
            />
            <input
              name="password"
              aria-label="Нууц үг"
              placeholder="Нууц үг (8-аас дээш тэмдэгт)"
              type="password"
              minLength={8}
              maxLength={128}
              required
              autoComplete={register ? "new-password" : "current-password"}
              className="input input-bordered w-full"
            />
            <button disabled={busy} className="btn btn-primary">
              {register ? "Бүртгүүлэх" : "Нэвтрэх"}
            </button>
          </form>
          <button
            className="btn btn-link"
            onClick={() => setRegister(!register)}
          >
            {register ? "Бүртгэлтэй бол нэвтрэх" : "Шинээр бүртгүүлэх"}
          </button>
        </section>
      ) : (
        <>
          <div className="flex justify-between">
            <p>
              {account.name} · {account.phone}
            </p>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const response = await fetch("/api/account/logout", {
                    method: "POST",
                  });
                  if (!response.ok) throw new Error("Гарч чадсангүй.");
                  await load();
                } catch (error) {
                  setMessage(String(error));
                } finally {
                  setBusy(false);
                }
              }}
              className="btn"
            >
              Гарах
            </button>
          </div>
          <Link href="/" className="btn btn-primary">
            Захиалга өгөх
          </Link>
          <h2 className="text-2xl font-bold">Миний захиалгууд</h2>
          <button
            disabled={busy}
            onClick={() => load().catch((error) => setMessage(error.message))}
            className="btn"
          >
            Төлбөрийн төлөв шинэчлэх
          </button>
          {!orders.length && <p>Одоогоор захиалга алга.</p>}
          {orders.map((order) => (
            <article
              key={order._id}
              className="bg-white p-6 rounded-xl shadow space-y-3"
            >
              <h3 className="font-bold">{order.productName}</h3>
              <p>
                {order.optionName} · {order.price}
              </p>
              <p>Код: AQ-{order._id.slice(-8).toUpperCase()}</p>
              <p>
                {order.paymentStatus === "paid"
                  ? "✅ Төлбөр баталгаажсан"
                  : "Төлбөр хүлээгдэж байна"}{" "}
                · Захиалга: {order.status}
              </p>
              {order.paymentStatus !== "paid" &&
                order.status !== "cancelled" &&
                (order.qrImage ? (
                  <>
                    <img
                      src={`data:image/png;base64,${order.qrImage}`}
                      width={240}
                      height={240}
                      alt="QPay төлбөрийн QR"
                    />
                    <p>
                      Банкны апп-аараа QR уншуулж төлнө үү. Төлсний дараа
                      төлөвөө шинэчилнэ үү.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.bankLinks
                        ?.filter(
                          (bank) =>
                            /^[a-z][a-z0-9+.-]*:/i.test(bank.link) &&
                            !/^(javascript|data|file|vbscript):/i.test(
                              bank.link,
                            ),
                        )
                        .map((bank) => (
                          <a
                            key={bank.link}
                            href={bank.link}
                            className="btn btn-sm"
                          >
                            {bank.name}
                          </a>
                        ))}
                    </div>
                  </>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => invoice(order._id)}
                    className="btn btn-primary"
                  >
                    QR-аар төлөх
                  </button>
                ))}
            </article>
          ))}
        </>
      )}
    </main>
  );
}
