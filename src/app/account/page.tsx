"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiCheckCircle, FiClock, FiDroplet, FiEye, FiEyeOff, FiGrid, FiLock, FiLogOut, FiPackage, FiRefreshCw, FiShield, FiShoppingBag, FiUser } from "react-icons/fi";
import styles from "./page.module.css";

type Account = { name: string; phone: string };
type Order = {
  _id: string; productName: string; optionName: string; price: string;
  paymentStatus: string; status: string; createdAt?: string;
  qrImage?: string; bankLinks?: { name: string; link: string }[];
};
type Filter = "all" | "pending" | "paid";
const statusLabels: Record<string, string> = { new: "Шинэ захиалга", confirmed: "Баталгаажсан", completed: "Дууссан", cancelled: "Цуцлагдсан" };
const errorText = (error: unknown) => error instanceof Error ? error.message : "Алдаа гарлаа. Дахин оролдоно уу.";

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [ordersReady, setOrdersReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  async function load() {
    const response = await fetch("/api/account/session", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Бүртгэл уншиж чадсангүй.");
    setAccount(data.account);
    if (data.account) {
      const result = await fetch("/api/customer/orders", { cache: "no-store" });
      const body = await result.json();
      if (!result.ok) throw new Error(body.error || "Захиалга уншиж чадсангүй.");
      setOrders(body.orders);
      setOrdersReady(true);
    } else { setOrders([]); setOrdersReady(false); }
  }
  useEffect(() => {
    load().catch(error => setMessage(errorText(error))).finally(() => setReady(true));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage(""); setNotice("");
    try {
      const response = await fetch(`/api/account/${register ? "register" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Нэвтэрч чадсангүй.");
      await load();
    } catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true); setMessage(""); setNotice("");
    try { await load(); setNotice("Мэдээлэл шинэчлэгдлээ."); }
    catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }
  async function invoice(id: string) {
    setBusy(true); setMessage(""); setNotice("");
    try {
      const response = await fetch(`/api/customer/orders/${id}/invoice`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "QR үүсгэж чадсангүй.");
      await load();
    } catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setMessage(""); setNotice("");
    try {
      const response = await fetch("/api/account/logout", { method: "POST" });
      if (!response.ok) throw new Error("Гарч чадсангүй. Дахин оролдоно уу.");
      setAccount(null); setOrders([]); setOrdersReady(false); setFilter("all"); setShowPassword(false);
    } catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }
  const pending = orders.filter(order => order.paymentStatus !== "paid" && order.status !== "cancelled");
  const paid = orders.filter(order => order.paymentStatus === "paid");
  const visibleOrders = filter === "pending" ? pending : filter === "paid" ? paid : orders;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}><Link href="/">Нүүр хуудас</Link><span>/</span><span>Миний бүртгэл</span></div>
        {message && <div role="alert" className={styles.error}>{message}<button disabled={busy} onClick={refresh}>Дахин оролдох</button></div>}
        {notice && <p role="status" className={styles.notice}><FiCheckCircle aria-hidden="true" />{notice}</p>}
        {!ready ? (
          <section className={styles.loading} role="status"><FiDroplet aria-hidden="true" /><h1>Миний бүртгэл</h1><p>Мэдээллийг уншиж байна…</p><div className={styles.skeleton} /></section>
        ) : !account ? (
          <div className={styles.authLayout}>
            <section className={styles.story}>
              <div className={styles.brand}><FiDroplet aria-hidden="true" /> AQUABLUE <span>МИНИЙ ОРОН ЗАЙ</span></div>
              <div className={styles.storyContent}><span className={styles.eyebrow}>ӨДӨР БҮРИЙН ЦЭВЭР УС</span><h1>Цэвэр ус.<br />Тав тухтай<br /><em>амьдрал.</em></h1><p>Таны захиалга, төлбөрийн мэдээлэл.<br />Бүгд нэг дор, илүү хялбар.</p></div>
              <div className={styles.waterArt} aria-hidden="true"><div /><FiDroplet /><span>AQUABLUE</span></div>
              <div className={styles.benefits}><span><FiShoppingBag /> Захиалгаа хянах</span><span><FiGrid /> QPay-аар төлөх</span><span><FiShield /> Хувийн бүртгэл</span></div>
            </section>
            <section className={styles.authCard}>
              <div className={styles.authIcon}><FiUser aria-hidden="true" /></div>
              <h2>{register ? "Тавтай морил!" : "Эргэн тавтай морил!"}</h2>
              <p className={styles.muted}>{register ? "Бүртгэл үүсгээд захиалгаа нэг дор удирдаарай." : "Бүртгэлдээ нэвтэрч захиалгаа хянаарай."}</p>
              <div className={styles.switcher} aria-label="Нэвтрэх эсвэл бүртгүүлэх">
                {[false, true].map(value => <button key={String(value)} type="button" disabled={busy} aria-pressed={register === value} onClick={() => { setRegister(value); setMessage(""); setShowPassword(false); }}>{value ? "Бүртгүүлэх" : "Нэвтрэх"}</button>)}
              </div>
              <form onSubmit={submit} className={styles.form}>
                {register && <label>Таны нэр<input name="name" placeholder="Нэрээ оруулна уу" autoComplete="name" required maxLength={100} disabled={busy} /></label>}
                <label>Утасны дугаар<div className={styles.phoneInput}><span>+976</span><input name="phone" type="tel" inputMode="numeric" placeholder="8 оронтой дугаар" pattern="[0-9]{8}" maxLength={8} required autoComplete="username" disabled={busy} /></div></label>
                <label htmlFor="account-password">Нууц үг</label>
                <div className={styles.passwordInput}><FiLock aria-hidden="true" /><input id="account-password" name="password" placeholder="Нууц үгээ оруулна уу" type={showPassword ? "text" : "password"} minLength={8} maxLength={128} required autoComplete={register ? "new-password" : "current-password"} aria-describedby={register ? "password-hint" : undefined} disabled={busy} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"} aria-pressed={showPassword}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
                {register && <p id="password-hint" className={styles.hint}>8–128 тэмдэгттэй нууц үг үүсгэнэ үү.</p>}
                <button disabled={busy} className={styles.primary} type="submit">{busy ? "Түр хүлээнэ үү…" : register ? "Бүртгэл үүсгэх" : "Нэвтрэх"}<FiArrowRight aria-hidden="true" /></button>
              </form>
              <div className={styles.authFooter}><FiShield aria-hidden="true" /><span>Таны захиалгын мэдээлэл<br />таны бүртгэлд хадгалагдана.</span></div>
              <Link className={styles.backLink} href="/">Бүтээгдэхүүн үзэх <FiArrowRight aria-hidden="true" /></Link>
            </section>
          </div>
        ) : (
          <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
              <div className={styles.profile}><span className={styles.avatar}>{account.name.charAt(0).toUpperCase()}</span><strong>{account.name}</strong><span>{account.phone}</span><small>Хэрэглэгчийн бүртгэл</small></div>
              <nav aria-label="Хэрэглэгчийн цэс"><a href="#orders" className={styles.activeNav}><FiPackage /> Миний захиалгууд</a><Link href="/"><FiShoppingBag /> Бүтээгдэхүүн үзэх</Link><Link href="/filter"><FiDroplet /> Шүүлтүүр захиалах</Link></nav>
              <div className={styles.sidebarNote}><FiShield aria-hidden="true" /><p>Захиалгаа хянаж,<br />төлбөрөө хялбар төлөөрэй.</p></div>
              <button disabled={busy} onClick={logout} className={styles.logout}><FiLogOut aria-hidden="true" /> Бүртгэлээс гарах</button>
            </aside>
            <div className={styles.mainContent}>
              <section className={styles.welcome}><div><span className={styles.eyebrow}>МИНИЙ БҮРТГЭЛ</span><h1>Сайн байна уу,<br /><span>{account.name}!</span></h1><p>Цэвэр усны төлөөх сонголтод тань баярлалаа.</p><Link href="/" className={styles.whiteButton}>Шинэ захиалга <FiArrowRight aria-hidden="true" /></Link></div><FiDroplet className={styles.heroDrop} aria-hidden="true" /></section>
              <div className={styles.stats}>
                {([{ label: "Нийт захиалга", value: orders.length, icon: FiShoppingBag, filter: "all" }, { label: "Төлбөр хүлээгдэж буй", value: pending.length, icon: FiClock, filter: "pending" }, { label: "Төлбөр төлөгдсөн", value: paid.length, icon: FiCheckCircle, filter: "paid" }] as const).map(item => <button key={item.filter} className={styles.stat} onClick={() => setFilter(item.filter)} aria-pressed={filter === item.filter}><span className={styles.statIcon}><item.icon aria-hidden="true" /></span><span><strong>{ordersReady ? item.value.toString().padStart(2, "0") : "—"}</strong><small>{item.label}</small></span></button>)}
              </div>
              <section id="orders" className={styles.ordersSection} aria-busy={busy}>
                <div className={styles.sectionHeading}><div><h2>Миний захиалгууд</h2><p>Сүүлийн 100 хүртэлх захиалгын мэдээлэл</p></div><button disabled={busy} onClick={refresh} className={styles.refresh}><FiRefreshCw aria-hidden="true" />{busy ? "Уншиж байна…" : "Төлөв шинэчлэх"}</button></div>
                <div className={styles.filters} aria-label="Захиалга шүүх">{([{ key: "all", label: "Бүгд", count: orders.length }, { key: "pending", label: "Төлбөр хүлээгдэж буй", count: pending.length }, { key: "paid", label: "Төлөгдсөн", count: paid.length }] as const).map(item => <button key={item.key} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}<span>{ordersReady ? item.count : "—"}</span></button>)}</div>
                {!ordersReady ? <div className={styles.empty}><FiRefreshCw aria-hidden="true" /><h3>Захиалгыг уншиж чадсангүй</h3><p>Төлөв шинэчлэх товчийг дарж дахин оролдоно уу.</p></div> : !visibleOrders.length ? <div className={styles.empty}><FiShoppingBag aria-hidden="true" /><h3>{orders.length ? "Энэ төлөвтэй захиалга алга" : "Таны анхны захиалгыг хүлээж байна"}</h3><p>{orders.length ? "Өөр төлөв сонгон захиалгуудаа хараарай." : "Өөрт тохирох ус цэвэршүүлэгч, шүүлтүүрээ сонгоорой."}</p><Link href="/" className={styles.primary}>Бүтээгдэхүүн үзэх <FiArrowRight aria-hidden="true" /></Link></div> : <div className={styles.orderList}>{visibleOrders.map(order => <article key={order._id} className={styles.order}>
                  <div className={styles.orderMeta}><span>AQ-{order._id.slice(-8).toUpperCase()}</span>{order.createdAt && <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString("mn-MN", { timeZone: "Asia/Ulaanbaatar" })}</time>}<span className={styles.orderStatus}>{statusLabels[order.status] || order.status}</span></div>
                  <div className={styles.orderBody}><span className={styles.productIcon}><FiPackage aria-hidden="true" /></span><div className={styles.productInfo}><h3>{order.productName}</h3>{order.optionName && <p>{order.optionName}</p>}<span className={order.paymentStatus === "paid" ? styles.paid : styles.pending}>{order.paymentStatus === "paid" ? <><FiCheck /> Төлбөр баталгаажсан</> : order.status === "cancelled" ? "Захиалга цуцлагдсан" : <><FiClock /> Төлбөр хүлээгдэж байна</>}</span></div><strong className={styles.price}>{order.price}</strong></div>
                  {order.paymentStatus !== "paid" && order.status !== "cancelled" && (order.qrImage ? <details className={styles.payment}><summary><FiGrid aria-hidden="true" /> QPay төлбөрийн QR харах</summary><div className={styles.qrLayout}><img src={`data:image/png;base64,${order.qrImage}`} width={220} height={220} alt={`${order.productName} захиалгын QPay төлбөрийн QR`} /><div><h4>Банкны апп-аараа төлөх</h4><p>QR кодыг уншуулах эсвэл доорх банкны аппыг сонгоно уу. Төлсний дараа «Төлөв шинэчлэх» товчийг дараарай.</p><div className={styles.bankLinks}>{order.bankLinks?.filter(bank => /^[a-z][a-z0-9+.-]*:/i.test(bank.link) && !/^(javascript|data|file|vbscript):/i.test(bank.link)).map(bank => <a key={bank.link} href={bank.link}>{bank.name}<FiArrowRight aria-hidden="true" /></a>)}</div><button className={styles.refresh} disabled={busy} onClick={refresh}><FiRefreshCw aria-hidden="true" /> Төлөв шинэчлэх</button></div></div></details> : <div className={styles.orderAction}><span>QPay · Банкны апп-аар төлөх</span><button disabled={busy} onClick={() => invoice(order._id)} className={styles.primary}><FiGrid aria-hidden="true" />{busy ? "Түр хүлээнэ үү…" : "QR-аар төлөх"}</button></div>)}
                </article>)}</div>}
              </section>
              <p className={styles.bottomNote}><FiLock aria-hidden="true" /> Зөвхөн таны бүртгэлээр хийсэн захиалгууд энд харагдана.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
