'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaClockRotateLeft,
  FaHouse,
  FaMagnifyingGlass,
  FaPen,
  FaPlus,
  FaRotate,
  FaTrash,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';

type FilterSchedule = {
  filterNumber: number;
  name: string;
  intervalMonths: number;
  lastChangedAt: string;
  nextChangeAt: string;
};

type Customer = {
  _id: string;
  customerCode: string;
  name: string;
  phone: string;
  alternatePhone: string;
  district: string;
  khoroo: string;
  address: string;
  purifierModel: string;
  installedAt: string;
  active: boolean;
  notes: string;
  filterSchedules: FilterSchedule[];
  createdAt: string;
};

type ServiceHistory = {
  _id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  replacedAt: string;
  filters: Array<{
    filterNumber: number;
    name: string;
    nextChangeAt: string;
  }>;
  workerName: string;
  price: number;
  paymentStatus: 'paid' | 'unpaid';
  notes: string;
};

type CustomerForm = Omit<
  Customer,
  '_id' | 'customerCode' | 'filterSchedules' | 'createdAt'
> & { _id?: string };

type ReminderStatus = 'overdue' | 'today' | 'upcoming' | 'ok' | 'inactive';
type View = 'customers' | 'history';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100';
const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60';

const todayInput = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ulaanbaatar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const emptyCustomer = (): CustomerForm => ({
  name: '',
  phone: '',
  alternatePhone: '',
  district: '',
  khoroo: '',
  address: '',
  purifierModel: 'AQUABLUE 4 шатлалт цорготой ус цэвэршүүлэгч',
  installedAt: todayInput(),
  active: true,
  notes: '',
});

async function jsonRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: options?.body
      ? { 'Content-Type': 'application/json', ...options.headers }
      : options?.headers,
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Үйлдэл амжилтгүй боллоо.');
  }
  return data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('mn-MN', {
    timeZone: 'Asia/Ulaanbaatar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function dateInput(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ulaanbaatar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function daysUntil(value: string) {
  const due = new Date(`${dateInput(value)}T00:00:00+08:00`).getTime();
  const today = new Date(`${todayInput()}T00:00:00+08:00`).getTime();
  return Math.round((due - today) / 86_400_000);
}

function scheduleStatus(schedule: FilterSchedule): ReminderStatus {
  const days = daysUntil(schedule.nextChangeAt);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 30) return 'upcoming';
  return 'ok';
}

function customerStatus(customer: Customer): ReminderStatus {
  if (!customer.active) return 'inactive';
  const statuses = customer.filterSchedules.map(scheduleStatus);
  if (statuses.includes('overdue')) return 'overdue';
  if (statuses.includes('today')) return 'today';
  if (statuses.includes('upcoming')) return 'upcoming';
  return 'ok';
}

const statusLabel: Record<ReminderStatus, string> = {
  overdue: 'Хугацаа хэтэрсэн',
  today: 'Өнөөдөр солих',
  upcoming: 'Удахгүй солих',
  ok: 'Хугацаа хэвийн',
  inactive: 'Идэвхгүй',
};

const statusClass: Record<ReminderStatus, string> = {
  overdue: 'border-rose-200 bg-rose-50 text-rose-700',
  today: 'border-amber-200 bg-amber-50 text-amber-700',
  upcoming: 'border-sky-200 bg-sky-50 text-sky-700',
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-slate-200 bg-slate-100 text-slate-500',
};

export default function CustomersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceHistory[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReminderStatus | 'all'>('all');
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [replaceCustomer, setReplaceCustomer] = useState<Customer | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [replacedAt, setReplacedAt] = useState(todayInput());
  const [workerName, setWorkerName] = useState('');
  const [price, setPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [serviceNotes, setServiceNotes] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [customerData, historyData] = await Promise.all([
        jsonRequest('/api/admin/customers'),
        jsonRequest('/api/admin/service-history'),
      ]);
      setCustomers(customerData.customers ?? []);
      setServices(historyData.services ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Мэдээлэл авч чадсангүй.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    jsonRequest('/api/admin/session')
      .then(loadData)
      .catch(() => router.replace('/admin'))
      .finally(() => setChecking(false));
  }, [loadData, router]);

  const counts = useMemo(() => {
    const result = { all: customers.length, overdue: 0, today: 0, upcoming: 0, ok: 0, inactive: 0 };
    customers.forEach((customer) => result[customerStatus(customer)]++);
    return result;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('mn-MN');
    return customers.filter((customer) => {
      const matchesStatus = status === 'all' || customerStatus(customer) === status;
      const matchesSearch = !query || [
        customer.customerCode,
        customer.name,
        customer.phone,
        customer.alternatePhone,
        customer.district,
        customer.khoroo,
        customer.address,
      ].join(' ').toLocaleLowerCase('mn-MN').includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [customers, search, status]);

  const saveCustomer = async (event: FormEvent) => {
    event.preventDefault();
    if (!customerForm || saving) return;
    setSaving(true);
    try {
      const editing = Boolean(customerForm._id);
      await jsonRequest(
        editing ? `/api/admin/customers/${customerForm._id}` : '/api/admin/customers',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(customerForm) }
      );
      toast.success(editing ? 'Айлын мэдээлэл шинэчлэгдлээ.' : 'Айл амжилттай бүртгэгдлээ.');
      setCustomerForm(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Хадгалж чадсангүй.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`${customer.customerCode} — ${customer.name} бүртгэлийг устгах уу? Үйлчилгээний түүх хадгалагдана.`)) return;
    try {
      await jsonRequest(`/api/admin/customers/${customer._id}`, { method: 'DELETE' });
      setCustomers((current) => current.filter((item) => item._id !== customer._id));
      toast.success('Айлын бүртгэл устгагдлаа.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Устгаж чадсангүй.');
    }
  };

  const openReplacement = (customer: Customer, filterNumber?: number) => {
    setReplaceCustomer(customer);
    setSelectedFilters(filterNumber ? [filterNumber] : []);
    setReplacedAt(todayInput());
    setWorkerName('');
    setPrice('');
    setPaymentStatus('paid');
    setServiceNotes('');
  };

  const saveReplacement = async (event: FormEvent) => {
    event.preventDefault();
    if (!replaceCustomer || selectedFilters.length === 0 || saving) return;
    setSaving(true);
    try {
      await jsonRequest(`/api/admin/customers/${replaceCustomer._id}/replace`, {
        method: 'POST',
        body: JSON.stringify({
          filterNumbers: selectedFilters,
          replacedAt,
          workerName,
          price,
          paymentStatus,
          notes: serviceNotes,
        }),
      });
      toast.success('Фильтер сольсон мэдээлэл хадгалагдлаа.');
      setReplaceCustomer(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Хадгалж чадсангүй.');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-400" />
          <p className="mt-4 font-bold">Айлын бүртгэл уншиж байна...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 text-white shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded-xl border border-white/15 p-3 transition hover:bg-white/10" aria-label="Админ руу буцах">
              <FaArrowLeft />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Төгс Цэнгэг Ус ХХК</p>
              <h1 className="text-lg font-black sm:text-xl">Айл ба фильтерийн хяналт</h1>
            </div>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/10 disabled:opacity-50">
            <FaRotate className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Шинэчлэх</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat title="Нийт айл" value={counts.all} color="sky" />
          <Stat title="Хугацаа хэтэрсэн" value={counts.overdue} color="rose" />
          <Stat title="Өнөөдөр солих" value={counts.today} color="amber" />
          <Stat title="30 хоногт солих" value={counts.upcoming} color="blue" />
          <Stat title="Хугацаа хэвийн" value={counts.ok} color="green" />
        </section>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <button type="button" onClick={() => setView('customers')} className={`rounded-xl px-5 py-3 text-sm font-black ${view === 'customers' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Айлын бүртгэл
          </button>
          <button type="button" onClick={() => setView('history')} className={`rounded-xl px-5 py-3 text-sm font-black ${view === 'history' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Үйлчилгээний түүх ({services.length})
          </button>
        </div>

        {view === 'customers' ? (
          <section className="mt-6">
            <div className="flex flex-col gap-4 rounded-[24px] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-xl">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-11`} placeholder="Нэр, утас, код, хаягаар хайх..." />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'overdue', 'today', 'upcoming', 'ok', 'inactive'] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${status === item ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
                    {item === 'all' ? 'Бүгд' : statusLabel[item]} ({counts[item]})
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setCustomerForm(emptyCustomer())} className={primaryButton}>
                <FaPlus /> Айл бүртгэх
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Айл</th>
                      <th className="px-5 py-4">Холбоо барих</th>
                      <th className="px-5 py-4">Суурилуулалт</th>
                      <th className="px-5 py-4">Фильтерийн дараагийн хугацаа</th>
                      <th className="px-5 py-4">Төлөв</th>
                      <th className="px-5 py-4 text-center">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => {
                      const currentStatus = customerStatus(customer);
                      return (
                        <tr key={customer._id} className="align-top transition hover:bg-sky-50/30">
                          <td className="px-5 py-5">
                            <p className="font-black text-sky-700">{customer.customerCode}</p>
                            <p className="mt-1 font-black text-slate-900">{customer.name}</p>
                            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{[customer.district, customer.khoroo, customer.address].filter(Boolean).join(', ')}</p>
                          </td>
                          <td className="px-5 py-5">
                            <a href={`tel:${customer.phone}`} className="font-black text-sky-700 hover:underline">{customer.phone}</a>
                            {customer.alternatePhone && <p className="mt-1 text-xs text-slate-500">{customer.alternatePhone}</p>}
                          </td>
                          <td className="px-5 py-5 text-slate-600">
                            <p className="font-bold">{formatDate(customer.installedAt)}</p>
                            <p className="mt-1 max-w-[180px] text-xs">{customer.purifierModel}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="grid grid-cols-2 gap-2">
                              {customer.filterSchedules.map((schedule) => {
                                const itemStatus = customer.active ? scheduleStatus(schedule) : 'inactive';
                                return (
                                  <button key={schedule.filterNumber} type="button" onClick={() => openReplacement(customer, schedule.filterNumber)} className={`rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${statusClass[itemStatus]}`} title="Фильтер сольсон гэж бүртгэх">
                                    <span className="font-black">№{schedule.filterNumber}</span>
                                    <span className="ml-2 text-xs">{formatDate(schedule.nextChangeAt)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-5">
                            <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${statusClass[currentStatus]}`}>{statusLabel[currentStatus]}</span>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex justify-center gap-2">
                              <button type="button" onClick={() => openReplacement(customer)} className="rounded-xl bg-emerald-50 p-3 text-emerald-700 hover:bg-emerald-100" title="Фильтер сольсон"><FaCalendarCheck /></button>
                              <button type="button" onClick={() => setCustomerForm({
                                _id: customer._id,
                                name: customer.name,
                                phone: customer.phone,
                                alternatePhone: customer.alternatePhone,
                                district: customer.district,
                                khoroo: customer.khoroo,
                                address: customer.address,
                                purifierModel: customer.purifierModel,
                                installedAt: dateInput(customer.installedAt),
                                active: customer.active,
                                notes: customer.notes,
                              })} className="rounded-xl bg-sky-50 p-3 text-sky-700 hover:bg-sky-100" title="Засах"><FaPen /></button>
                              <button type="button" onClick={() => deleteCustomer(customer)} className="rounded-xl bg-rose-50 p-3 text-rose-700 hover:bg-rose-100" title="Устгах"><FaTrash /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && filteredCustomers.length === 0 && (
                      <tr><td colSpan={6} className="p-14 text-center text-slate-400">Тохирох айлын бүртгэл олдсонгүй.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-black text-slate-900">Фильтер солиулалтын түүх</h2>
              <p className="mt-1 text-sm text-slate-500">Өмнөх бүх үйлчилгээ огноо, ажилтан, төлбөрийн хамт хадгалагдана.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Огноо</th><th className="px-5 py-4">Айл</th><th className="px-5 py-4">Сольсон фильтер</th><th className="px-5 py-4">Ажилтан</th><th className="px-5 py-4">Төлбөр</th><th className="px-5 py-4">Тэмдэглэл</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => (
                    <tr key={service._id} className="align-top hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold">{formatDate(service.replacedAt)}</td>
                      <td className="px-5 py-4"><p className="font-black text-sky-700">{service.customerCode}</p><p className="font-bold">{service.customerName}</p><p className="text-xs text-slate-500">{service.phone}</p></td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{service.filters.map((filter) => <span key={filter.filterNumber} className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">№{filter.filterNumber}</span>)}</div></td>
                      <td className="px-5 py-4">{service.workerName || '—'}</td>
                      <td className="px-5 py-4"><p className="font-black">{service.price.toLocaleString()}₮</p><span className={`text-xs font-bold ${service.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>{service.paymentStatus === 'paid' ? 'Төлсөн' : 'Төлөөгүй'}</span></td>
                      <td className="max-w-xs px-5 py-4 text-slate-500">{service.notes || '—'}</td>
                    </tr>
                  ))}
                  {!loading && services.length === 0 && <tr><td colSpan={6} className="p-14 text-center text-slate-400">Үйлчилгээний түүх одоогоор алга.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {customerForm && (
        <Modal title={customerForm._id ? 'Айлын мэдээлэл засах' : 'Шинэ айл бүртгэх'} onClose={() => !saving && setCustomerForm(null)}>
          <form onSubmit={saveCustomer} className="grid gap-4 sm:grid-cols-2">
            <Field label="Хэрэглэгчийн нэр"><input required className={inputClass} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} /></Field>
            <Field label="Үндсэн утас"><input required className={inputClass} value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} placeholder="99112233" /></Field>
            <Field label="Нэмэлт утас"><input className={inputClass} value={customerForm.alternatePhone} onChange={(event) => setCustomerForm({ ...customerForm, alternatePhone: event.target.value })} /></Field>
            <Field label="Суурилуулсан огноо"><input required type="date" className={inputClass} value={customerForm.installedAt} onChange={(event) => setCustomerForm({ ...customerForm, installedAt: event.target.value })} /></Field>
            <Field label="Дүүрэг"><input className={inputClass} value={customerForm.district} onChange={(event) => setCustomerForm({ ...customerForm, district: event.target.value })} /></Field>
            <Field label="Хороо"><input className={inputClass} value={customerForm.khoroo} onChange={(event) => setCustomerForm({ ...customerForm, khoroo: event.target.value })} /></Field>
            <Field label="Дэлгэрэнгүй хаяг" wide><textarea required className={`${inputClass} min-h-24 resize-y`} value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} /></Field>
            <Field label="Ус цэвэршүүлэгчийн загвар" wide><input className={inputClass} value={customerForm.purifierModel} onChange={(event) => setCustomerForm({ ...customerForm, purifierModel: event.target.value })} /></Field>
            <Field label="Тэмдэглэл" wide><textarea className={`${inputClass} min-h-20 resize-y`} value={customerForm.notes} onChange={(event) => setCustomerForm({ ...customerForm, notes: event.target.value })} /></Field>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700 sm:col-span-2"><input type="checkbox" className="h-5 w-5 accent-sky-600" checked={customerForm.active} onChange={(event) => setCustomerForm({ ...customerForm, active: event.target.checked })} />Идэвхтэй айл</label>
            {!customerForm._id && <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-800 sm:col-span-2">Суурилуулсан огнооноос №1 — 3 сар, №2 — 6 сар, №3 — 9 сар, №4 — 12 сарын хугацаа автоматаар бодогдоно.</div>}
            <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2"><button type="button" onClick={() => setCustomerForm(null)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Болих</button><button disabled={saving} className={primaryButton}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button></div>
          </form>
        </Modal>
      )}

      {replaceCustomer && (
        <Modal title={`${replaceCustomer.customerCode} — Фильтер сольсон бүртгэл`} onClose={() => !saving && setReplaceCustomer(null)}>
          <form onSubmit={saveReplacement} className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-900">{replaceCustomer.name}</p><p className="mt-1 text-sm text-slate-500">{replaceCustomer.phone} · {replaceCustomer.address}</p></div>
            <Field label="Сольсон фильтерүүд">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {replaceCustomer.filterSchedules.map((schedule) => {
                  const checked = selectedFilters.includes(schedule.filterNumber);
                  return <label key={schedule.filterNumber} className={`cursor-pointer rounded-2xl border p-3 text-center transition ${checked ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'}`}><input type="checkbox" className="sr-only" checked={checked} onChange={() => setSelectedFilters((current) => checked ? current.filter((number) => number !== schedule.filterNumber) : [...current, schedule.filterNumber])} /><span className="block text-lg font-black">№{schedule.filterNumber}</span><span className="text-xs">{schedule.intervalMonths} сар</span></label>;
                })}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Сольсон огноо"><input required type="date" className={inputClass} value={replacedAt} onChange={(event) => setReplacedAt(event.target.value)} /></Field>
              <Field label="Үйлчилгээ үзүүлсэн ажилтан"><input className={inputClass} value={workerName} onChange={(event) => setWorkerName(event.target.value)} /></Field>
              <Field label="Үйлчилгээний үнэ"><input type="number" min="0" className={inputClass} value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" /></Field>
              <Field label="Төлбөрийн төлөв"><select className={inputClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as 'paid' | 'unpaid')}><option value="paid">Төлсөн</option><option value="unpaid">Төлөөгүй</option></select></Field>
              <Field label="Тэмдэглэл" wide><textarea className={`${inputClass} min-h-20 resize-y`} value={serviceNotes} onChange={(event) => setServiceNotes(event.target.value)} /></Field>
            </div>
            {selectedFilters.length === 0 && <p className="flex items-center gap-2 text-sm font-bold text-amber-600"><FaTriangleExclamation /> Дор хаяж нэг фильтер сонгоно уу.</p>}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setReplaceCustomer(null)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Болих</button><button disabled={saving || selectedFilters.length === 0} className={primaryButton}><FaCalendarCheck />{saving ? 'Хадгалж байна...' : 'Сольсон гэж бүртгэх'}</button></div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function Stat({ title, value, color }: { title: string; value: number; color: 'sky' | 'rose' | 'amber' | 'blue' | 'green' }) {
  const colors = { sky: 'bg-sky-600', rose: 'bg-rose-600', amber: 'bg-amber-500', blue: 'bg-blue-600', green: 'bg-emerald-600' };
  return <div className="rounded-[22px] bg-white p-4 shadow-sm sm:p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${colors[color]}`}>{color === 'rose' ? <FaTriangleExclamation /> : color === 'sky' ? <FaHouse /> : color === 'green' ? <FaCalendarCheck /> : <FaClockRotateLeft />}</div><p className="mt-3 text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">{title}</p></div>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5"><h2 className="text-xl font-black text-slate-900">{title}</h2><button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"><FaXmark /></button></div><div className="p-6">{children}</div></div></div>;
}
