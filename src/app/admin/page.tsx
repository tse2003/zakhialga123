'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FormEvent, ReactNode } from 'react';
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

/* =========================
   TYPES
========================= */

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

type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

type Order = {
  _id: string;
  productName: string;
  optionName: string;
  price: string;
  phone: string;
  address: string;
  status: OrderStatus;
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

/* =========================
   DEFAULT DATA
========================= */

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

/* =========================
   STYLES
========================= */

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'mb-2 block text-sm font-bold text-slate-700';

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-blue-800 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50';

const dangerButton =
  'inline-flex items-center justify-center rounded-xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700';

/* =========================
   HELPERS
========================= */

async function jsonRequest(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    ...options,
    headers: options?.body
      ? {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      : options?.headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || 'Үйлдэл амжилтгүй боллоо.'
    );
  }

  return data;
}

const statusOptions: Array<{
  value: OrderStatus;
  label: string;
}> = [
  { value: 'new', label: 'Шинэ' },
  { value: 'confirmed', label: 'Баталгаажсан' },
  { value: 'completed', label: 'Дууссан' },
  { value: 'cancelled', label: 'Цуцалсан' },
];

const statusStyles: Record<OrderStatus, string> = {
  new: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-700',
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
};

const accentStyles: Record<
  Filter['accent'],
  { background: string; text: string; dot: string }
> = {
  rose: {
    background: 'bg-rose-50',
    text: 'text-rose-600',
    dot: 'bg-rose-500',
  },
  green: {
    background: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  blue: {
    background: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  orange: {
    background: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
  },
};

/* =========================
   MAIN COMPONENT
========================= */

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(
    null
  );

  const [productForm, setProductForm] =
    useState<Product | null>(null);

  const [filterForm, setFilterForm] =
    useState<Filter | null>(null);

  const newOrderCount = useMemo(
    () =>
      orders.filter((order) => order.status === 'new').length,
    [orders]
  );

  const activeProductCount = useMemo(
    () => products.filter((product) => product.active).length,
    [products]
  );

  const activeFilterCount = useMemo(
    () => filters.filter((filter) => filter.active).length,
    [filters]
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        productData,
        filterData,
        orderData,
        settingsData,
      ] = await Promise.all([
        jsonRequest('/api/admin/products'),
        jsonRequest('/api/admin/filters'),
        jsonRequest('/api/admin/orders'),
        jsonRequest('/api/admin/settings'),
      ]);

      setProducts(productData.products ?? []);
      setFilters(filterData.filters ?? []);
      setOrders(orderData.orders ?? []);
      setSettings(settingsData.settings ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Мэдээлэл авч чадсангүй.'
      );
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
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [loadData]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);

    try {
      await jsonRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      setAuthenticated(true);
      setPassword('');

      await loadData();

      toast.success('Амжилттай нэвтэрлээ.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Нэвтэрч чадсангүй.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await jsonRequest('/api/admin/logout', {
        method: 'POST',
      });

      setAuthenticated(false);
      setProducts([]);
      setFilters([]);
      setOrders([]);
      setSettings(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Гарч чадсангүй.'
      );
    }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();

    if (!productForm || saving) return;

    setSaving(true);

    try {
      const editing = Boolean(productForm._id);

      await jsonRequest(
        editing
          ? `/api/admin/products/${productForm._id}`
          : '/api/admin/products',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(productForm),
        }
      );

      toast.success(
        editing
          ? 'Бүтээгдэхүүн шинэчлэгдлээ.'
          : 'Бүтээгдэхүүн нэмэгдлээ.'
      );

      setProductForm(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Хадгалж чадсангүй.'
      );
    } finally {
      setSaving(false);
    }
  };

  const saveFilter = async (event: FormEvent) => {
    event.preventDefault();

    if (!filterForm || saving) return;

    setSaving(true);

    try {
      const editing = Boolean(filterForm._id);

      await jsonRequest(
        editing
          ? `/api/admin/filters/${filterForm._id}`
          : '/api/admin/filters',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(filterForm),
        }
      );

      toast.success(
        editing
          ? 'Фильтер шинэчлэгдлээ.'
          : 'Фильтер нэмэгдлээ.'
      );

      setFilterForm(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Хадгалж чадсангүй.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (
    type: 'products' | 'filters',
    id?: string
  ) => {
    if (
      !id ||
      !window.confirm('Энэ мэдээллийг бүр мөсөн устгах уу?')
    ) {
      return;
    }

    try {
      await jsonRequest(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
      });

      toast.success('Амжилттай устгалаа.');
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Устгаж чадсангүй.'
      );
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus
  ) => {
    try {
      await jsonRequest(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === id ? { ...order, status } : order
        )
      );

      toast.success('Захиалгын төлөв шинэчлэгдлээ.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Шинэчилж чадсангүй.'
      );
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();

    if (!settings || saving) return;

    setSaving(true);

    try {
      const data = await jsonRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      setSettings(data.settings);

      toast.success('Сайтын тохиргоо хадгалагдлаа.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Хадгалж чадсангүй.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-400" />

          <p className="mt-5 font-bold text-white">
            Удирдлагын хэсгийг уншиж байна...
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     LOGIN
  ========================= */

  if (!authenticated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950 p-4">
        <Toaster position="top-center" />

        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <form
          onSubmit={login}
          className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-white p-7 shadow-[0_35px_100px_rgba(0,0,0,0.45)] sm:p-10"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-2xl text-white shadow-xl shadow-sky-200">
              <FaDroplet />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-600">
              Төгс Цэнгэг Ус ХХК
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Admin Panel
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Удирдлагын хэсэгт нэвтэрнэ үү
            </p>
          </div>

          <div>
            <label htmlFor="username" className={labelClass}>
              Нэвтрэх нэр
            </label>

            <input
              id="username"
              className={inputClass}
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Нэвтрэх нэр"
              autoComplete="username"
              required
            />
          </div>

          <div className="mt-5">
            <label htmlFor="password" className={labelClass}>
              Нууц үг
            </label>

            <input
              id="password"
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className={`${primaryButton} mt-7 w-full`}
            disabled={loginLoading}
          >
            {loginLoading && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}

            {loginLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </main>
    );
  }

  const tabs = [
    {
      id: 'products' as Tab,
      name: 'Бүтээгдэхүүн',
      icon: FaBoxOpen,
      count: products.length,
    },
    {
      id: 'filters' as Tab,
      name: 'Фильтер',
      icon: FaDroplet,
      count: filters.length,
    },
    {
      id: 'orders' as Tab,
      name: 'Захиалга',
      icon: FaClipboardList,
      count: newOrderCount,
    },
    {
      id: 'settings' as Tab,
      name: 'Тохиргоо',
      icon: FaGear,
    },
  ];

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  return (
    <main className="min-h-screen bg-slate-100">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '14px',
            padding: '14px 18px',
            fontWeight: 600,
          },
        }}
      />

      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-sky-950">
              <FaDroplet />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400 sm:text-xs">
                Төгс Цэнгэг Ус ХХК
              </p>

              <h1 className="mt-0.5 text-lg font-black sm:text-xl">
                Удирдлагын самбар
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold transition hover:bg-white/10 sm:px-4"
          >
            <FaRightFromBracket />

            <span className="hidden sm:inline">Гарах</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Statistics */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Нийт бүтээгдэхүүн"
            value={products.length}
            description={`${activeProductCount} идэвхтэй`}
            icon={<FaBoxOpen />}
            color="sky"
          />

          <StatCard
            title="Нийт фильтер"
            value={filters.length}
            description={`${activeFilterCount} идэвхтэй`}
            icon={<FaDroplet />}
            color="blue"
          />

          <StatCard
            title="Шинэ захиалга"
            value={newOrderCount}
            description={`Нийт ${orders.length} захиалга`}
            icon={<FaClipboardList />}
            color="amber"
          />

          <StatCard
            title="Сайтын төлөв"
            value="ON"
            description="Систем ажиллаж байна"
            icon={<FaCheck />}
            color="green"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Navigation */}
          <aside className="min-w-0">
            <nav className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm lg:sticky lg:top-[100px] lg:flex-col lg:overflow-visible">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex min-w-max items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-bold transition lg:w-full ${
                      active
                        ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="shrink-0" />
                      {item.name}
                    </span>

                    {item.count !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <section className="min-w-0">
            {loading && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
                Мэдээлэл шинэчилж байна...
              </div>
            )}

            {/* Products */}
            {tab === 'products' && (
              <div>
                <SectionHeader
                  title="Бүтээгдэхүүн"
                  description="Нэр, үнэ, зураг, багц болон тайлбарыг удирдана."
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm(emptyProduct())
                      }
                      className={primaryButton}
                    >
                      <FaPlus />
                      Бүтээгдэхүүн нэмэх
                    </button>
                  }
                />

                <div className="grid gap-4 xl:grid-cols-2">
                  {products.map((product) => (
                    <article
                      key={product._id ?? product.slug}
                      className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl sm:flex-row"
                    >
                      <div className="flex h-52 w-full shrink-0 items-center justify-center bg-gradient-to-br from-sky-50 to-white p-5 sm:h-auto sm:w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full max-h-44 w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700">
                                {product.category}
                              </span>

                              <StatusBadge active={product.active} />
                            </div>

                            <h3 className="mt-3 text-lg font-black text-slate-900">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              /{product.slug}
                            </p>
                          </div>

                          {product.badge && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
                          {product.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                            >
                              <span className="truncate text-sm font-semibold text-slate-600">
                                {option.shortName ||
                                  option.name ||
                                  'Үнийн сонголт'}
                              </span>

                              <span className="shrink-0 font-black text-sky-700">
                                {option.price || 'Үнэ оруулаагүй'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-auto flex gap-2 pt-5">
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm(
                                structuredClone(product)
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                          >
                            <FaPen />
                            Засах
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteItem(
                                'products',
                                product._id
                              )
                            }
                            className={dangerButton}
                            aria-label="Бүтээгдэхүүн устгах"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {products.length === 0 && !loading && (
                  <EmptyState
                    icon={<FaBoxOpen />}
                    title="Бүтээгдэхүүн алга"
                    description="Шинэ бүтээгдэхүүн нэмээд эхлээрэй."
                  />
                )}
              </div>
            )}

            {/* Filters */}
            {tab === 'filters' && (
              <div>
                <SectionHeader
                  title="Фильтерүүд"
                  description="Үнэ, хугацаа, зураг болон тайлбарыг удирдана."
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        setFilterForm(emptyFilter())
                      }
                      className={primaryButton}
                    >
                      <FaPlus />
                      Фильтер нэмэх
                    </button>
                  }
                />

                <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filters.map((filter) => {
                    const colors =
                      accentStyles[filter.accent];

                    return (
                      <article
                        key={
                          filter._id ??
                          `${filter.stage}-${filter.name}`
                        }
                        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <div
                          className={`relative flex h-56 items-center justify-center ${colors.background} p-5`}
                        >
                          <span
                            className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full ${colors.dot} text-xs font-black text-white shadow-lg`}
                          >
                            {filter.stage}
                          </span>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={filter.image}
                            alt={filter.name}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p
                              className={`text-xs font-black tracking-wider ${colors.text}`}
                            >
                              {filter.englishName}
                            </p>

                            <StatusBadge
                              active={filter.active}
                            />
                          </div>

                          <h3 className="mt-2 text-lg font-black text-slate-900">
                            {filter.name}
                          </h3>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                            {filter.description}
                          </p>

                          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Солих хугацаа
                              </p>

                              <p className="mt-1 font-black text-slate-700">
                                {filter.duration}
                              </p>
                            </div>

                            <div
                              className={`rounded-xl ${colors.background} p-3`}
                            >
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Үнэ
                              </p>

                              <p
                                className={`mt-1 font-black ${colors.text}`}
                              >
                                {filter.price}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFilterForm(
                                  structuredClone(filter)
                                )
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                            >
                              <FaPen />
                              Засах
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteItem(
                                  'filters',
                                  filter._id
                                )
                              }
                              className={dangerButton}
                              aria-label="Фильтер устгах"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {filters.length === 0 && !loading && (
                  <EmptyState
                    icon={<FaDroplet />}
                    title="Фильтер алга"
                    description="Шинэ фильтер нэмээд эхлээрэй."
                  />
                )}
              </div>
            )}

            {/* Orders */}
            {tab === 'orders' && (
              <div>
                <SectionHeader
                  title="Захиалгууд"
                  description="Сүүлд ирсэн захиалга хамгийн дээр харагдана."
                />

                <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-slate-950 text-white">
                        <tr>
                          <th className="px-5 py-4">
                            Огноо
                          </th>
                          <th className="px-5 py-4">
                            Бүтээгдэхүүн
                          </th>
                          <th className="px-5 py-4">
                            Утас
                          </th>
                          <th className="px-5 py-4">
                            Хаяг
                          </th>
                          <th className="px-5 py-4">
                            Төлөв
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-b border-slate-100 align-top transition last:border-0 hover:bg-slate-50"
                          >
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                              {new Date(
                                order.createdAt
                              ).toLocaleString('mn-MN')}
                            </td>

                            <td className="px-5 py-4">
                              <strong className="block text-slate-900">
                                {order.productName}
                              </strong>

                              <span className="mt-1 block text-slate-500">
                                {order.optionName}

                                {order.price &&
                                  ` • ${order.price}`}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <a
                                href={`tel:${order.phone}`}
                                className="font-black text-sky-700 hover:underline"
                              >
                                {order.phone}
                              </a>
                            </td>

                            <td className="max-w-xs px-5 py-4 leading-6 text-slate-600">
                              {order.address}
                            </td>

                            <td className="px-5 py-4">
                              <select
                                className={`rounded-xl border px-3 py-2.5 text-sm font-bold outline-none transition focus:ring-4 focus:ring-sky-100 ${statusStyles[order.status]}`}
                                value={order.status}
                                onChange={(event) =>
                                  updateOrderStatus(
                                    order._id,
                                    event.target
                                      .value as OrderStatus
                                  )
                                }
                              >
                                {statusOptions.map(
                                  (option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                          </tr>
                        ))}

                        {orders.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-14 text-center text-slate-400"
                            >
                              Одоогоор захиалга ирээгүй байна.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {tab === 'settings' && settings && (
              <form
                onSubmit={saveSettings}
                className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                    <FaGear />
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-slate-900">
                    Сайтын тохиргоо
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Нүүр хуудас болон холбоо барих мэдээллийг
                    засна.
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Компанийн нэр">
                      <input
                        className={inputClass}
                        value={settings.siteName}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            siteName: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Логоны зам">
                      <input
                        className={inputClass}
                        value={settings.logo}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            logo: event.target.value,
                          })
                        }
                        placeholder="/logo.png"
                      />
                    </Field>

                    <Field label="Нүүр хуудасны жижиг гарчиг">
                      <input
                        className={inputClass}
                        value={settings.homeBadge}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            homeBadge: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Нүүр хуудасны үндсэн гарчиг">
                      <input
                        className={inputClass}
                        value={settings.homeTitle}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            homeTitle: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Facebook холбоос">
                      <input
                        type="url"
                        className={inputClass}
                        value={settings.facebookUrl}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            facebookUrl: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Захиалга хүлээн авах email">
                      <input
                        type="email"
                        className={inputClass}
                        value={settings.orderEmail}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            orderEmail: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Нүүр хуудасны тайлбар" wide>
                      <textarea
                        className={`${inputClass} min-h-28 resize-y`}
                        value={settings.homeSubtitle}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            homeSubtitle: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field
                      label="Утасны дугаарууд — нэг мөрөнд нэг"
                      wide
                    >
                      <textarea
                        className={`${inputClass} min-h-32 resize-y`}
                        value={settings.phoneNumbers.join('\n')}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            phoneNumbers:
                              event.target.value
                                .split('\n')
                                .map((value) => value.trim())
                                .filter(Boolean),
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      className={primaryButton}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <FaCheck />
                      )}

                      {saving
                        ? 'Хадгалж байна...'
                        : 'Тохиргоо хадгалах'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>

      {/* Product modal */}
      {productForm && (
        <Modal
          title={
            productForm._id
              ? 'Бүтээгдэхүүн засах'
              : 'Шинэ бүтээгдэхүүн'
          }
          onClose={() => {
            if (!saving) setProductForm(null);
          }}
        >
          <form onSubmit={saveProduct} className="space-y-6">
            <FormSection
              title="Үндсэн мэдээлэл"
              description="Бүтээгдэхүүний нэр, төрөл болон зургийг тохируулна."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Бүтээгдэхүүний нэр">
                  <input
                    required
                    className={inputClass}
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        name: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Slug — англи, зайгүй">
                  <input
                    required
                    className={inputClass}
                    value={productForm.slug}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        slug: event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                  />
                </Field>

                <Field label="Төрөл">
                  <input
                    className={inputClass}
                    value={productForm.type}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        type: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Badge">
                  <input
                    className={inputClass}
                    value={productForm.badge}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        badge: event.target.value,
                      })
                    }
                    placeholder="ХЯМДРАЛ"
                  />
                </Field>

                <Field label="Үндсэн зургийн зам">
                  <input
                    required
                    className={inputClass}
                    value={productForm.image}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        image: event.target.value,
                      })
                    }
                    placeholder="/products/product.png"
                  />
                </Field>

                <Field label="Ангилал">
                  <select
                    className={inputClass}
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        category: event.target
                          .value as Product['category'],
                      })
                    }
                  >
                    <option value="winix">WINIX</option>
                    <option value="faucet">Цорготой</option>
                    <option value="other">Бусад</option>
                  </select>
                </Field>

                <Field
                  label="Дэлгэрэнгүй зургууд — нэг мөрөнд нэг"
                  wide
                >
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={productForm.gallery.join('\n')}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        gallery: event.target.value
                          .split('\n')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>

                <Field label="Тайлбар" wide>
                  <textarea
                    className={`${inputClass} min-h-32 resize-y`}
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        description: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Харагдах дараалал">
                  <input
                    type="number"
                    className={inputClass}
                    value={productForm.sortOrder}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        sortOrder: Number(event.target.value),
                      })
                    }
                  />
                </Field>

                <CheckboxField
                  label="Сайт дээр харуулах"
                  checked={productForm.active}
                  onChange={(checked) =>
                    setProductForm({
                      ...productForm,
                      active: checked,
                    })
                  }
                />
              </div>
            </FormSection>

            <FormSection
              title="Үнийн сонголтууд"
              description="Бүтээгдэхүүний үнэ болон багцын мэдээллийг удирдана."
              action={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                  onClick={() =>
                    setProductForm({
                      ...productForm,
                      options: [
                        ...productForm.options,
                        emptyOption(),
                      ],
                    })
                  }
                >
                  <FaPlus />
                  Сонголт нэмэх
                </button>
              }
            >
              <div className="space-y-4">
                {productForm.options.map((option, index) => (
                  <div
                    key={`${option.id}-${index}`}
                    className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                          Үнийн сонголт
                        </p>

                        <h4 className="mt-1 font-black text-slate-900">
                          Сонголт {index + 1}
                        </h4>
                      </div>

                      {productForm.options.length > 1 && (
                        <button
                          type="button"
                          className={dangerButton}
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              options:
                                productForm.options.filter(
                                  (_, itemIndex) =>
                                    itemIndex !== index
                                ),
                            })
                          }
                          aria-label="Үнийн сонголт устгах"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ['name', 'Нэр'],
                          ['shortName', 'Товч нэр'],
                          ['oldPrice', 'Хуучин үнэ'],
                          ['price', 'Одоогийн үнэ'],
                          ['image', 'Зургийн зам'],
                          ['badge', 'Badge'],
                        ] as const
                      ).map(([key, label]) => (
                        <Field key={key} label={label}>
                          <input
                            required={
                              key === 'name' || key === 'price'
                            }
                            className={inputClass}
                            value={option[key]}
                            onChange={(event) => {
                              const options = [
                                ...productForm.options,
                              ];

                              options[index] = {
                                ...option,
                                [key]: event.target.value,
                              };

                              setProductForm({
                                ...productForm,
                                options,
                              });
                            }}
                          />
                        </Field>
                      ))}

                      <Field label="Тайлбар" wide>
                        <textarea
                          className={`${inputClass} min-h-24 resize-y`}
                          value={option.description}
                          onChange={(event) => {
                            const options = [
                              ...productForm.options,
                            ];

                            options[index] = {
                              ...option,
                              description: event.target.value,
                            };

                            setProductForm({
                              ...productForm,
                              options,
                            });
                          }}
                        />
                      </Field>

                      <Field
                        label="Багцад багтах зүйлс — нэг мөрөнд нэг"
                        wide
                      >
                        <textarea
                          className={`${inputClass} min-h-28 resize-y`}
                          value={option.items.join('\n')}
                          onChange={(event) => {
                            const options = [
                              ...productForm.options,
                            ];

                            options[index] = {
                              ...option,
                              items: event.target.value
                                .split('\n')
                                .map((value) => value.trim())
                                .filter(Boolean),
                            };

                            setProductForm({
                              ...productForm,
                              options,
                            });
                          }}
                        />
                      </Field>

                      <CheckboxField
                        label="Санал болгох сонголт"
                        checked={option.recommended}
                        onChange={(checked) => {
                          const options =
                            productForm.options.map(
                              (item, itemIndex) => ({
                                ...item,
                                recommended:
                                  itemIndex === index
                                    ? checked
                                    : false,
                              })
                            );

                          setProductForm({
                            ...productForm,
                            options,
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

            <FormActions
              saving={saving}
              onCancel={() => setProductForm(null)}
            />
          </form>
        </Modal>
      )}

      {/* Filter modal */}
      {filterForm && (
        <Modal
          title={
            filterForm._id
              ? 'Фильтер засах'
              : 'Шинэ фильтер'
          }
          onClose={() => {
            if (!saving) setFilterForm(null);
          }}
        >
          <form onSubmit={saveFilter}>
            <FormSection
              title="Фильтерийн мэдээлэл"
              description="Нэр, зураг, үнэ болон солих хугацааг тохируулна."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Шат">
                  <input
                    required
                    className={inputClass}
                    value={filterForm.stage}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        stage: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Нэр">
                  <input
                    required
                    className={inputClass}
                    value={filterForm.name}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        name: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Англи нэр">
                  <input
                    className={inputClass}
                    value={filterForm.englishName}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        englishName: event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Зургийн зам">
                  <input
                    required
                    className={inputClass}
                    value={filterForm.image}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        image: event.target.value,
                      })
                    }
                    placeholder="/filter/1.png"
                  />
                </Field>

                <Field label="Солих хугацаа">
                  <input
                    className={inputClass}
                    value={filterForm.duration}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        duration: event.target.value,
                      })
                    }
                    placeholder="3 сар"
                  />
                </Field>

                <Field label="Үнэ">
                  <input
                    required
                    className={inputClass}
                    value={filterForm.price}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        price: event.target.value,
                      })
                    }
                    placeholder="22,000₮"
                  />
                </Field>

                <Field label="Өнгө">
                  <select
                    className={inputClass}
                    value={filterForm.accent}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        accent: event.target
                          .value as Filter['accent'],
                      })
                    }
                  >
                    <option value="rose">Ягаан</option>
                    <option value="green">Ногоон</option>
                    <option value="blue">Цэнхэр</option>
                    <option value="orange">
                      Улбар шар
                    </option>
                  </select>
                </Field>

                <Field label="Харагдах дараалал">
                  <input
                    type="number"
                    className={inputClass}
                    value={filterForm.sortOrder}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        sortOrder: Number(event.target.value),
                      })
                    }
                  />
                </Field>

                <Field label="Тайлбар" wide>
                  <textarea
                    className={`${inputClass} min-h-36 resize-y`}
                    value={filterForm.description}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        description: event.target.value,
                      })
                    }
                  />
                </Field>

                <CheckboxField
                  label="Сайт дээр харуулах"
                  checked={filterForm.active}
                  onChange={(checked) =>
                    setFilterForm({
                      ...filterForm,
                      active: checked,
                    })
                  }
                />
              </div>
            </FormSection>

            <FormActions
              saving={saving}
              onCancel={() => setFilterForm(null)}
            />
          </form>
        </Modal>
      )}
    </main>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  color: 'sky' | 'blue' | 'amber' | 'green';
}) {
  const colors = {
    sky: 'from-sky-500 to-cyan-500 shadow-sky-200',
    blue: 'from-blue-600 to-indigo-600 shadow-blue-200',
    amber:
      'from-amber-400 to-orange-500 shadow-orange-200',
    green:
      'from-emerald-500 to-green-600 shadow-emerald-200',
  };

  return (
    <article className="rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold text-slate-500 sm:text-sm">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </article>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />

      {active ? 'ИДЭВХТЭЙ' : 'НУУЦАЛСАН'}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-slate-700">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-sky-600"
      />

      {label}
    </label>
  );
}

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function FormActions({
  saving,
  onCancel,
}: {
  saving: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className={secondaryButton}
        disabled={saving}
      >
        Болих
      </button>

      <button
        type="submit"
        className={primaryButton}
        disabled={saving}
      >
        {saving ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <FaCheck />
        )}

        {saving ? 'Хадгалж байна...' : 'Хадгалах'}
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-[28px] bg-slate-50 shadow-[0_35px_120px_rgba(0,0,0,0.5)]">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600">
              AQUABLUE ADMIN
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Цонх хаах"
          >
            <FaXmark />
          </button>
        </div>

        <div className="p-4 sm:p-7">{children}</div>
      </div>
    </div>
  );
}