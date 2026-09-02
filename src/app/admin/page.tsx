'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaBoxOpen,
  FaCheck,
  FaClipboardList,
  FaDroplet,
  FaGear,
  FaPen,
  FaPlus,
  FaRightFromBracket,
  FaTrash,
  FaXmark,
} from 'react-icons/fa6';

type PriceOption = {
  id: string;
  name: string;
  shortName: string;
  oldPrice: string;
  price: string;
  image: string;
  badge: string;
  description: string;
  recommended: boolean;
  items: string[];
};

type Product = {
  _id?: string;
  slug: string;
  name: string;
  type: string;
  image: string;
  gallery: string[];
  badge: string;
  category: 'winix' | 'faucet' | 'other';
  description: string;
  sortOrder: number;
  active: boolean;
  options: PriceOption[];
};

type Filter = {
  _id?: string;
  stage: string;
  name: string;
  englishName: string;
  image: string;
  description: string;
  duration: string;
  price: string;
  accent: 'rose' | 'green' | 'blue' | 'orange';
  sortOrder: number;
  active: boolean;
};

type Order = {
  _id: string;
  productName: string;
  optionName: string;
  price: string;
  phone: string;
  address: string;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
};

type Settings = {
  siteName: string;
  logo: string;
  homeBadge: string;
  homeTitle: string;
  homeSubtitle: string;
  phoneNumbers: string[];
  facebookUrl: string;
  orderEmail: string;
};

type Tab = 'products' | 'filters' | 'orders' | 'settings';

const emptyOption = (): PriceOption => ({
  id: `option-${Date.now()}`,
  name: '',
  shortName: '',
  oldPrice: '',
  price: '',
  image: '',
  badge: '',
  description: '',
  recommended: false,
  items: [],
});

const emptyProduct = (): Product => ({
  slug: '',
  name: '',
  type: '',
  image: '',
  gallery: [],
  badge: '',
  category: 'other',
  description: '',
  sortOrder: 0,
  active: true,
  options: [emptyOption()],
});

const emptyFilter = (): Filter => ({
  stage: '',
  name: '',
  englishName: '',
  image: '',
  description: '',
  duration: '',
  price: '',
  accent: 'blue',
  sortOrder: 0,
  active: true,
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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100';
const labelClass = 'mb-1.5 block text-sm font-bold text-slate-700';
const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60';

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState<Product | null>(null);
  const [filterForm, setFilterForm] = useState<Filter | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productData, filterData, orderData, settingsData] = await Promise.all([
        jsonRequest('/api/admin/products'),
        jsonRequest('/api/admin/filters'),
        jsonRequest('/api/admin/orders'),
        jsonRequest('/api/admin/settings'),
      ]);
      setProducts(productData.products);
      setFilters(filterData.filters);
      setOrders(orderData.orders);
      setSettings(settingsData.settings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Мэдээлэл авч чадсангүй.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    jsonRequest('/api/admin/session')
      .then(() => {
        setAuthenticated(true);
        return loadData();
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, [loadData]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    try {
      await jsonRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuthenticated(true);
      setPassword('');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Нэвтэрч чадсангүй.');
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await jsonRequest('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setProducts([]);
    setFilters([]);
    setOrders([]);
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!productForm) return;
    try {
      const editing = Boolean(productForm._id);
      await jsonRequest(
        editing ? `/api/admin/products/${productForm._id}` : '/api/admin/products',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(productForm) }
      );
      toast.success(editing ? 'Бүтээгдэхүүн шинэчлэгдлээ.' : 'Бүтээгдэхүүн нэмэгдлээ.');
      setProductForm(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Хадгалж чадсангүй.');
    }
  };

  const saveFilter = async (event: FormEvent) => {
    event.preventDefault();
    if (!filterForm) return;
    try {
      const editing = Boolean(filterForm._id);
      await jsonRequest(
        editing ? `/api/admin/filters/${filterForm._id}` : '/api/admin/filters',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(filterForm) }
      );
      toast.success(editing ? 'Фильтер шинэчлэгдлээ.' : 'Фильтер нэмэгдлээ.');
      setFilterForm(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Хадгалж чадсангүй.');
    }
  };

  const deleteItem = async (type: 'products' | 'filters', id?: string) => {
    if (!id || !window.confirm('Энэ мэдээллийг бүр мөсөн устгах уу?')) return;
    try {
      await jsonRequest(`/api/admin/${type}/${id}`, { method: 'DELETE' });
      toast.success('Амжилттай устгалаа.');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Устгаж чадсангүй.');
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await jsonRequest(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((order) => (order._id === id ? { ...order, status } : order))
      );
      toast.success('Захиалгын төлөв шинэчлэгдлээ.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Шинэчилж чадсангүй.');
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    try {
      const data = await jsonRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSettings(data.settings);
      toast.success('Сайтын тохиргоо хадгалагдлаа.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Хадгалж чадсангүй.');
    }
  };

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Уншиж байна...</div>;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950 p-4">
        <Toaster position="top-center" />
        <form onSubmit={login} className="w-full max-w-md rounded-[28px] border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-xl text-white shadow-lg shadow-sky-200">
              <FaDroplet />
            </div>
            <h1 className="text-2xl font-black text-slate-900">AQUABLUE Admin</h1>
            <p className="mt-2 text-sm text-slate-500">Удирдлагын хэсэгт нэвтрэх</p>
          </div>
          <label className={labelClass}>Нэвтрэх нэр</label>
          <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          <label className={`${labelClass} mt-4`}>Нууц үг</label>
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <button className={`${primaryButton} mt-6 w-full`} disabled={loginLoading}>
            {loginLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </main>
    );
  }

  const tabs = [
    { id: 'products' as Tab, name: 'Бүтээгдэхүүн', icon: FaBoxOpen, count: products.length },
    { id: 'filters' as Tab, name: 'Фильтер', icon: FaDroplet, count: filters.length },
    { id: 'orders' as Tab, name: 'Захиалга', icon: FaClipboardList, count: orders.filter((o) => o.status === 'new').length },
    { id: 'settings' as Tab, name: 'Тохиргоо', icon: FaGear },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <Toaster position="top-center" />
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Төгс Цэнгэг Ус ХХК</p>
            <h1 className="mt-1 text-xl font-black">Удирдлагын самбар</h1>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10">
            <FaRightFromBracket /> Гарах
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">
        <nav className="h-fit rounded-2xl bg-white p-2 shadow-sm lg:sticky lg:top-6">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-bold transition ${
                tab === item.id ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-3"><item.icon />{item.name}</span>
              {item.count !== undefined && <span className={`rounded-full px-2 py-0.5 text-xs ${tab === item.id ? 'bg-white/20' : 'bg-slate-100'}`}>{item.count}</span>}
            </button>
          ))}
        </nav>

        <section className="min-w-0">
          {loading && <div className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">Мэдээлэл шинэчилж байна...</div>}

          {tab === 'products' && (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><h2 className="text-2xl font-black text-slate-900">Бүтээгдэхүүн</h2><p className="mt-1 text-sm text-slate-500">Нэр, үнэ, зураг, багц болон тайлбарыг удирдана.</p></div>
                <button onClick={() => setProductForm(emptyProduct())} className={primaryButton}><FaPlus /> Нэмэх</button>
              </div>
              <div className="grid gap-4">
                {products.map((product) => (
                  <article key={product._id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">{product.name}</h3>
                        {!product.active && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">Нууцалсан</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{product.options.map((o) => `${o.shortName || o.name}: ${o.price}`).join(' • ')}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">{product.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setProductForm(structuredClone(product))} className="rounded-xl bg-sky-50 p-3 text-sky-700 hover:bg-sky-100" aria-label="Засах"><FaPen /></button>
                      <button onClick={() => deleteItem('products', product._id)} className="rounded-xl bg-rose-50 p-3 text-rose-600 hover:bg-rose-100" aria-label="Устгах"><FaTrash /></button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'filters' && (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><h2 className="text-2xl font-black text-slate-900">Фильтерүүд</h2><p className="mt-1 text-sm text-slate-500">Үнэ, солих хугацаа, зураг болон тайлбарыг засна.</p></div>
                <button onClick={() => setFilterForm(emptyFilter())} className={primaryButton}><FaPlus /> Нэмэх</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {filters.map((filter) => (
                  <article key={filter._id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex gap-4">
                      <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={filter.image} alt="" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-sky-600">ШАТ {filter.stage}</p>
                        <h3 className="mt-1 font-black text-slate-900">{filter.name}</h3>
                        <p className="mt-2 text-sm font-bold text-slate-600">{filter.price} • {filter.duration}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button onClick={() => setFilterForm(structuredClone(filter))} className="flex-1 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100">Засах</button>
                      <button onClick={() => deleteItem('filters', filter._id)} className="rounded-xl bg-rose-50 px-4 text-rose-600 hover:bg-rose-100"><FaTrash /></button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <div className="mb-5"><h2 className="text-2xl font-black text-slate-900">Захиалгууд</h2><p className="mt-1 text-sm text-slate-500">Сүүлд ирсэн захиалга хамгийн дээр харагдана.</p></div>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-slate-950 text-white"><tr><th className="p-4">Огноо</th><th className="p-4">Бүтээгдэхүүн</th><th className="p-4">Утас</th><th className="p-4">Хаяг</th><th className="p-4">Төлөв</th></tr></thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-slate-100 align-top">
                          <td className="whitespace-nowrap p-4 text-slate-500">{new Date(order.createdAt).toLocaleString('mn-MN')}</td>
                          <td className="p-4"><strong className="block text-slate-900">{order.productName}</strong><span className="text-slate-500">{order.optionName} {order.price && `• ${order.price}`}</span></td>
                          <td className="p-4 font-bold text-sky-700"><a href={`tel:${order.phone}`}>{order.phone}</a></td>
                          <td className="max-w-xs p-4 text-slate-600">{order.address}</td>
                          <td className="p-4">
                            <select className="rounded-lg border border-slate-200 px-3 py-2" value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value as Order['status'])}>
                              <option value="new">Шинэ</option><option value="confirmed">Баталгаажсан</option><option value="completed">Дууссан</option><option value="cancelled">Цуцалсан</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-400">Одоогоор захиалга ирээгүй байна.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'settings' && settings && (
            <form onSubmit={saveSettings} className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-2xl font-black text-slate-900">Сайтын тохиргоо</h2>
              <p className="mt-1 text-sm text-slate-500">Нүүр хуудас болон холбоо барих мэдээллийг засна.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Компанийн нэр"><input className={inputClass} value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></Field>
                <Field label="Логоны зам"><input className={inputClass} value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} /></Field>
                <Field label="Нүүр хуудасны жижиг гарчиг"><input className={inputClass} value={settings.homeBadge} onChange={(e) => setSettings({ ...settings, homeBadge: e.target.value })} /></Field>
                <Field label="Нүүр хуудасны үндсэн гарчиг"><input className={inputClass} value={settings.homeTitle} onChange={(e) => setSettings({ ...settings, homeTitle: e.target.value })} /></Field>
                <Field label="Facebook холбоос"><input className={inputClass} value={settings.facebookUrl} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })} /></Field>
                <Field label="Захиалга хүлээн авах email"><input type="email" className={inputClass} value={settings.orderEmail} onChange={(e) => setSettings({ ...settings, orderEmail: e.target.value })} /></Field>
                <Field label="Тайлбар" wide><textarea className={`${inputClass} min-h-24`} value={settings.homeSubtitle} onChange={(e) => setSettings({ ...settings, homeSubtitle: e.target.value })} /></Field>
                <Field label="Утасны дугаарууд — нэг мөрөнд нэг" wide><textarea className={`${inputClass} min-h-28`} value={settings.phoneNumbers.join('\n')} onChange={(e) => setSettings({ ...settings, phoneNumbers: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) })} /></Field>
              </div>
              <button className={`${primaryButton} mt-6`}><FaCheck /> Хадгалах</button>
            </form>
          )}
        </section>
      </div>

      {productForm && (
        <Modal title={productForm._id ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн'} onClose={() => setProductForm(null)}>
          <form onSubmit={saveProduct} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Бүтээгдэхүүний нэр"><input required className={inputClass} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></Field>
              <Field label="Slug (англи, зайгүй)"><input required className={inputClass} value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} /></Field>
              <Field label="Төрөл"><input className={inputClass} value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })} /></Field>
              <Field label="Badge"><input className={inputClass} value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} /></Field>
              <Field label="Үндсэн зургийн зам"><input required className={inputClass} value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} /></Field>
              <Field label="Ангилал"><select className={inputClass} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Product['category'] })}><option value="winix">WINIX</option><option value="faucet">Цорготой</option><option value="other">Бусад</option></select></Field>
              <Field label="Дэлгэрэнгүй зургууд — нэг мөрөнд нэг" wide><textarea className={`${inputClass} min-h-24`} value={productForm.gallery.join('\n')} onChange={(e) => setProductForm({ ...productForm, gallery: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) })} /></Field>
              <Field label="Тайлбар" wide><textarea className={`${inputClass} min-h-24`} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></Field>
              <Field label="Дараалал"><input type="number" className={inputClass} value={productForm.sortOrder} onChange={(e) => setProductForm({ ...productForm, sortOrder: Number(e.target.value) })} /></Field>
              <label className="flex items-center gap-3 self-end rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold"><input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })} /> Сайт дээр харуулах</label>
            </div>
            <div className="border-t border-slate-200 pt-5">
              <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-black">Үнийн сонголтууд</h3><button type="button" className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700" onClick={() => setProductForm({ ...productForm, options: [...productForm.options, emptyOption()] })}><FaPlus className="mr-2 inline" />Сонголт нэмэх</button></div>
              <div className="space-y-4">
                {productForm.options.map((option, index) => (
                  <div key={`${option.id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex justify-between"><strong>Сонголт {index + 1}</strong>{productForm.options.length > 1 && <button type="button" className="text-rose-600" onClick={() => setProductForm({ ...productForm, options: productForm.options.filter((_, i) => i !== index) })}><FaTrash /></button>}</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        ['name', 'Нэр'], ['shortName', 'Товч нэр'], ['oldPrice', 'Хуучин үнэ'], ['price', 'Одоогийн үнэ'], ['image', 'Зургийн зам'], ['badge', 'Badge'],
                      ] as const).map(([key, label]) => (
                        <Field key={key} label={label}><input required={key === 'name' || key === 'price'} className={inputClass} value={option[key]} onChange={(e) => { const options = [...productForm.options]; options[index] = { ...option, [key]: e.target.value }; setProductForm({ ...productForm, options }); }} /></Field>
                      ))}
                      <Field label="Тайлбар" wide><textarea className={`${inputClass} min-h-20`} value={option.description} onChange={(e) => { const options = [...productForm.options]; options[index] = { ...option, description: e.target.value }; setProductForm({ ...productForm, options }); }} /></Field>
                      <Field label="Багцад багтах зүйлс — нэг мөрөнд нэг" wide><textarea className={`${inputClass} min-h-24`} value={option.items.join('\n')} onChange={(e) => { const options = [...productForm.options]; options[index] = { ...option, items: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) }; setProductForm({ ...productForm, options }); }} /></Field>
                      <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={option.recommended} onChange={(e) => { const options = productForm.options.map((item, i) => ({ ...item, recommended: i === index ? e.target.checked : false })); setProductForm({ ...productForm, options }); }} /> Санал болгох сонголт</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={() => setProductForm(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">Болих</button><button className={primaryButton}><FaCheck /> Хадгалах</button></div>
          </form>
        </Modal>
      )}

      {filterForm && (
        <Modal title={filterForm._id ? 'Фильтер засах' : 'Шинэ фильтер'} onClose={() => setFilterForm(null)}>
          <form onSubmit={saveFilter}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Шат"><input required className={inputClass} value={filterForm.stage} onChange={(e) => setFilterForm({ ...filterForm, stage: e.target.value })} /></Field>
              <Field label="Нэр"><input required className={inputClass} value={filterForm.name} onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })} /></Field>
              <Field label="Англи нэр"><input className={inputClass} value={filterForm.englishName} onChange={(e) => setFilterForm({ ...filterForm, englishName: e.target.value })} /></Field>
              <Field label="Зургийн зам"><input required className={inputClass} value={filterForm.image} onChange={(e) => setFilterForm({ ...filterForm, image: e.target.value })} /></Field>
              <Field label="Солих хугацаа"><input className={inputClass} value={filterForm.duration} onChange={(e) => setFilterForm({ ...filterForm, duration: e.target.value })} /></Field>
              <Field label="Үнэ"><input required className={inputClass} value={filterForm.price} onChange={(e) => setFilterForm({ ...filterForm, price: e.target.value })} /></Field>
              <Field label="Өнгө"><select className={inputClass} value={filterForm.accent} onChange={(e) => setFilterForm({ ...filterForm, accent: e.target.value as Filter['accent'] })}><option value="rose">Ягаан</option><option value="green">Ногоон</option><option value="blue">Цэнхэр</option><option value="orange">Улбар шар</option></select></Field>
              <Field label="Дараалал"><input type="number" className={inputClass} value={filterForm.sortOrder} onChange={(e) => setFilterForm({ ...filterForm, sortOrder: Number(e.target.value) })} /></Field>
              <Field label="Тайлбар" wide><textarea className={`${inputClass} min-h-32`} value={filterForm.description} onChange={(e) => setFilterForm({ ...filterForm, description: e.target.value })} /></Field>
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold"><input type="checkbox" checked={filterForm.active} onChange={(e) => setFilterForm({ ...filterForm, active: e.target.checked })} /> Сайт дээр харуулах</label>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={() => setFilterForm(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">Болих</button><button className={primaryButton}><FaCheck /> Хадгалах</button></div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className={labelClass}>{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto my-4 w-full max-w-4xl rounded-[24px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[24px] border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"><FaXmark /></button>
        </div>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}
