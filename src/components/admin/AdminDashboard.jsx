import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchOrders,
  fetchCustomers,
  fetchStats,
  fetchAnalytics,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrder,
  deleteOrder,
  updateCustomer,
  updateStock,
  bulkUpdateProducts,
  bulkDeleteProducts,
  bulkUpdateOrders,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  logout,
  exportToCSV,
  exportToJSON,
  printInvoice,
  getSettings,
  updateSettings,
  saveSettings,
  formatPKR,
  uploadImage,
  changePassword,
  fetchHeroImages,
  updateHeroImage,
  deleteHeroImage,
  compressImage,
  generateAutoSKU,
} from '../../lib/store';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
  { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
  { id: 'inventory', label: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'customers', label: 'Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const COLLECTIONS = ['Bridal', 'Traditional', 'Casual', 'Hand', 'Footwear'];
const METALS = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Glass with Gold Foil'];
const GEMSTONES = ['Zircon', 'Pearl', 'Kundan', 'Crystal', 'Pearl & Crystal', 'Polki', 'Emerald', 'None'];
const CATEGORIES = ['Necklace Sets', 'Ear Tops', 'Rings', 'Bangles', 'Nose Pins & Tikka', 'Hand Jewelry', 'Payal & Foot'];
const DEPARTMENTS = ['jewelry', 'decor', 'lingerie'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

const DECOR_COLLECTIONS = ['Luxury', 'Romance', 'Modern', 'Royal', 'Bohemian'];
const DECOR_MATERIALS = ['Crystal & Gold', 'Pearl & LED', 'Ceramic & Rose Gold', 'Velvet & Gold Thread', 'Mirror & Glass', 'Cotton & Jute', 'Wood', 'Metal', 'Glass', 'Paper & Fabric'];
const DECOR_CATEGORIES = ['Candles & Holders', 'Lighting', 'Vases', 'Textiles', 'Wall Art', 'Mirrors', 'Storage', 'Figurines'];

const LINGERIE_COLLECTIONS = ['Elegance', 'Romance', 'Luxury', 'Comfort'];
const LINGERIE_MATERIALS = ['Silk & Lace', 'Lace & Satin', 'Satin', 'Tulle & Embroidery', 'Lace', 'Mulberry Silk', 'Cotton', 'Mesh', 'Chiffon'];
const LINGERIE_CATEGORIES = ['Chemises', 'Bralettes', 'Robes', 'Bodysuits', 'Sets', 'Sleepwear', 'Nightwear', 'Accessories'];

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium bg-red-500/15 text-red-400 border-red-500/20">Out of Stock</span>
  if (stock < 5) return <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium bg-amber-500/15 text-amber-400 border-amber-500/20">Low ({stock})</span>
  if (stock < 20) return <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium bg-blue-500/15 text-blue-400 border-blue-500/20">{stock}</span>
  return <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium bg-emerald-500/15 text-emerald-400 border-emerald-500/20">{stock}</span>
}

function KPICard({ icon, value, label, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 border border-white/5 ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-syne text-white mb-1">{value}</p>
          <p className="text-[11px] tracking-[0.15em] uppercase text-white/50">{label}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#0a0a0a]/[0.05] flex items-center justify-center">
          <svg className="w-5 h-5 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-xl p-6 max-w-sm w-full mx-4 border border-white/10">
        <p className="text-white text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline-gold px-4 py-2 rounded-lg text-xs tracking-wider uppercase">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-xs tracking-wider uppercase bg-white/5 text-rose border border-rose/20 hover:bg-white/10 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, maxHeight = 160 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height: maxHeight }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/50">{d.value > 0 ? `Rs. ${(d.value / 1000).toFixed(0)}k` : ''}</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-rose/60 to-rose/20 transition-all duration-500"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[9px] text-white/30">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let accumulated = 0
  const gradientParts = segments.map(seg => {
    const start = (accumulated / total) * 360
    accumulated += seg.value
    const end = (accumulated / total) * 360
    return `${seg.color} ${start}deg ${end}deg`
  })
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full"
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      />
      <div className="absolute inset-4 rounded-full bg-[#050505] flex items-center justify-center">
        <span className="text-lg font-syne text-white">{total}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, id: null });
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '', icon: '✦', color: '#D4919E', order: 1 });
  const [productForm, setProductForm] = useState({
    name: '', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Zircon',
    material: '', category: 'Necklace Sets', price: '', stock: '', sku: '', weight: '', description: '',
    featured: false, inStock: true, image: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkOrderMode, setBulkOrderMode] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkValue, setBulkValue] = useState('');
  const fileInputRef = useRef(null);

  // Inline stock editing
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState('');

  // Hero images
  const [heroImages, setHeroImages] = useState({ jewelry: '', decor: '', lingerie: '' });
  const [heroUploading, setHeroUploading] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, o, c, a, cats, hero] = await Promise.all([
        fetchStats(), fetchProducts(), fetchOrders(), fetchCustomers(), fetchAnalytics(), fetchCategories(), fetchHeroImages(),
      ]);
      setStats(s);
      setProducts(p || []);
      setOrders(o || []);
      setCustomers(c || []);
      setAnalytics(a);
      setCategories(cats || []);
      setHeroImages(hero || {});
      setSettings(getSettings());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const handleSaveProduct = async () => {
    const price = parseFloat(productForm.price);
    if (!productForm.name || isNaN(price)) return;
    let sku = productForm.sku;
    if (!sku && !editingProduct) {
      sku = await generateAutoSKU(productForm.department, productForm.category);
    }
    const productData = { ...productForm, price, stock: parseInt(productForm.stock) || 0, sku: sku || productForm.sku };
    if (productForm.department !== 'jewelry') {
      delete productData.metal;
      delete productData.gemstone;
    } else {
      delete productData.material;
    }
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }
    setShowProductForm(false);
    setEditingProduct(null);
    resetProductForm();
    loadData();
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', department: 'jewelry', collection: 'Bridal', metal: 'Gold Plated', gemstone: 'Zircon',
      material: '', category: 'Necklace Sets', price: '', stock: '', sku: '', weight: '', description: '',
      featured: false, inStock: true, image: '',
    });
    setImagePreview('');
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '', department: product.department || 'jewelry',
      collection: product.collection || 'Bridal',
      metal: product.metal || 'Gold Plated', gemstone: product.gemstone || 'Zircon',
      material: product.material || '', category: product.category || 'Necklace Sets', price: product.price || '',
      stock: product.stock ?? '', sku: product.sku || '', weight: product.weight || '',
      description: product.description || '', featured: product.featured || false,
      inStock: product.inStock !== false, image: product.images?.[0] || product.image || '',
    });
    setImagePreview(product.images?.[0] || product.image || '');
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id) => {
    setConfirmDelete({ open: true, type: 'product', id });
  };

  // ─── Category CRUD ────────────────────────────────────
  const handleSaveCategory = async () => {
    if (!categoryForm.name) return;
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryForm);
    } else {
      await createCategory(categoryForm);
    }
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ id: '', name: '', description: '', icon: '✦', color: '#D4919E', order: categories.length + 1 });
    loadData();
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ id: cat.id, name: cat.name, description: cat.description || '', icon: cat.icon || '✦', color: cat.color || '#D4919E', order: cat.order || 1 });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (id) => {
    setConfirmDelete({ open: true, type: 'category', id });
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    await updateOrder(orderId, { status });
    loadData();
  };

  const handleExportOrders = () => {
    const data = orders.map(o => ({
      id: o.id, trackingCode: o.trackingCode || '', customer: o.customerName || 'N/A',
      email: o.email || '', phone: o.phone || '',
      date: o.createdAt || '', total: o.total || 0, status: o.status,
      items: (o.items || []).map(i => `${i.name} x${i.quantity}`).join('; '),
    }));
    exportToCSV(data, 'annie-all-orders');
  };

  const handleExportCustomers = () => {
    const data = customers.map(c => ({
      name: c.name, email: c.email, phone: c.phone || '',
      orders: c.totalOrders || 0, totalSpent: c.totalSpent || 0,
      avgOrder: c.totalOrders ? ((c.totalSpent || 0) / c.totalOrders).toFixed(2) : '0',
      notes: c.notes || '',
    }));
    exportToCSV(data, 'annie-customers');
  };

  const handleExportOrderCSV = (order) => {
    const flat = {
      orderId: order.id, customer: order.customerName || '',
      email: order.email || '',
      date: order.createdAt || '', status: order.status,
      total: order.total || 0, paymentMethod: order.paymentMethod || '',
      shipAddress: order.address ? `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.zip}` : '',
      items: (order.items || []).map(i => `${i.name} (${i.variant || ''}) x${i.quantity} @ Rs. ${i.price}`).join('; '),
    };
    exportToCSV([flat], `annie-order-${order.id}`);
  };

  const handleSaveCustomer = async (customerId, data) => {
    await updateCustomer(customerId, data);
    setEditingCustomer(null);
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    alert('Settings saved successfully');
  };

  const handleChangePassword = async () => {
    setPwMsg('');
    setPwError('');
    if (!pwCurrent || !pwNew) { setPwError('Both fields are required.'); return; }
    if (pwNew.length < 4) { setPwError('New password must be at least 4 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError('New passwords do not match.'); return; }
    setPwLoading(true);
    try {
      await changePassword(pwCurrent, pwNew);
      setPwMsg('Password updated successfully.');
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
    } catch (e) {
      setPwError(e.message?.includes('401') ? 'Current password is incorrect.' : 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  // Stock management
  const handleStockEdit = (product) => {
    setEditingStock(product.id);
    setStockValue(String(product.stock ?? 0));
  };

  const handleStockSave = async (productId) => {
    const val = parseInt(stockValue);
    if (!isNaN(val) && val >= 0) {
      await updateStock(productId, val);
      loadData();
    }
    setEditingStock(null);
  };

  // Bulk operations
  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkProductAction = async () => {
    if (selectedProducts.length === 0) return;
    if (bulkAction === 'delete') {
      await bulkDeleteProducts(selectedProducts);
      setSelectedProducts([]);
    } else if (bulkAction === 'price') {
      const price = parseFloat(bulkValue);
      if (!isNaN(price) && price > 0) {
        await bulkUpdateProducts(selectedProducts, { price });
      }
      setSelectedProducts([]);
    } else if (bulkAction === 'collection') {
      if (bulkValue) {
        await bulkUpdateProducts(selectedProducts, { collection: bulkValue });
      }
      setSelectedProducts([]);
    } else if (bulkAction === 'stock') {
      const stock = parseInt(bulkValue);
      if (!isNaN(stock) && stock >= 0) {
        await bulkUpdateProducts(selectedProducts, { stock, inStock: stock > 0 });
      }
      setSelectedProducts([]);
    }
    setBulkAction(null);
    setBulkValue('');
    loadData();
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const handleBulkOrderAction = async () => {
    if (selectedOrders.length === 0) return;
    if (bulkAction === 'status' && bulkValue) {
      await bulkUpdateOrders(selectedOrders, { status: bulkValue });
    } else if (bulkAction === 'delete') {
      for (const id of selectedOrders) {
        await deleteOrder(id);
      }
    }
    setSelectedOrders([]);
    setBulkAction(null);
    setBulkValue('');
    loadData();
  };

  // CSV Import
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return alert('CSV must have a header row and at least one data row');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
        const nameIdx = headers.indexOf('name');
        const priceIdx = headers.indexOf('price');
        const collectionIdx = headers.indexOf('collection');
        const stockIdx = headers.indexOf('stock');
        if (nameIdx === -1 || priceIdx === -1) return alert('CSV must have "name" and "price" columns');
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const name = vals[nameIdx];
          const price = parseFloat(vals[priceIdx]);
          if (!name || isNaN(price)) continue;
          await createProduct({
            name,
            price,
            collection: collectionIdx >= 0 ? vals[collectionIdx] || 'Casual' : 'Casual',
            stock: stockIdx >= 0 ? parseInt(vals[stockIdx]) || 0 : 0,
            metal: 'Gold Plated', gemstone: 'None', category: 'Necklace Sets',
            inStock: true, featured: false, images: [],
          });
          imported++;
        }
        alert(`Successfully imported ${imported} products`);
        loadData();
      } catch (err) {
        alert('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (o.id || '').toLowerCase().includes(q) ||
        (o.trackingCode || '').toLowerCase().includes(q) ||
        (o.customerName || o.customer?.name || '').toLowerCase().includes(q) ||
        (o.email || o.customer?.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.collection || '').toLowerCase().includes(q);
  });

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);
  });

  // Low stock products for alerts
  const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 5);
  const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-xs tracking-[0.2em] uppercase">Loading Console</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white/5 border-r border-white/5 flex-shrink-0">
          <div className="p-6 border-b border-white/5">
            <h1 className="font-syne text-2xl tracking-[0.2em] text-white">ANNIE</h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-rose/60 mt-1">Admin Console</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-rose/10 text-rose border border-rose/15'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="tracking-wider">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-rose hover:bg-red-500/5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="tracking-wider">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Tabs */}
          <div className="lg:hidden flex overflow-x-auto border-b border-white/5 bg-white/5 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-rose text-rose'
                    : 'border-transparent text-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-xs text-rose whitespace-nowrap ml-auto">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 admin-scrollbar">
            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-syne text-2xl lg:text-3xl text-white">Dashboard</h2>
                  <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a0a]/[0.04] text-white/50 hover:text-white text-xs tracking-wider transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {/* Low stock alert banner */}
                {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                  <div className="mb-6 card-premium rounded-xl p-4 border-l-4 border-amber-500 flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div className="flex-1">
                      <p className="text-sm text-amber-400 font-medium">
                        {outOfStockProducts.length > 0 && `${outOfStockProducts.length} out of stock`}
                        {outOfStockProducts.length > 0 && lowStockProducts.length > 0 && ' · '}
                        {lowStockProducts.length > 0 && `${lowStockProducts.length} low stock`}
                      </p>
                      <p className="text-xs text-white/50">Review your <button onClick={() => setActiveTab('inventory')} className="text-rose hover:text-rose/80 underline underline-offset-2">inventory</button> to restock</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <KPICard icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" value={`Rs. ${Number(stats?.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" gradient="bg-gradient-to-br from-rose-pale/20 to-white/60" />
                  <KPICard icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" value={stats?.activeOrders || 0} label="Active Orders" gradient="bg-gradient-to-br from-rose-pale/20 to-white/60" />
                  <KPICard icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" value={`Rs. ${Number(stats?.avgOrderValue || 0).toLocaleString()}`} label="Avg Order Value" gradient="bg-gradient-to-br from-rose-pale/15 to-white/60" />
                  <KPICard icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" value={stats?.totalProducts || products.length} label="Total Products" gradient="bg-gradient-to-br from-rose-pale/10 to-white/60" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="card-premium rounded-xl p-6">
                    <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">Recent Orders</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b border-rose/6 last:border-0">
                          <div>
                            <p className="text-sm text-white">{order.customerName || order.customer?.name || 'N/A'}</p>
                            <p className="text-[11px] text-white/50/50">{order.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gold">Rs. {Number(order.total || 0).toLocaleString()}</p>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-white/50/50 text-sm text-center py-4">No orders yet</p>}
                    </div>
                  </div>

                  <div className="card-premium rounded-xl p-6">
                    <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">Quick Stats</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Total Products', value: products.length },
                        { label: 'Total Customers', value: customers.length },
                        { label: 'Total Orders', value: orders.length },
                        { label: 'Featured Pieces', value: products.filter(p => p.featured).length },
                        { label: 'Low Stock Items', value: (stats?.lowStock || 0) + (stats?.outOfStock || 0), highlight: true },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2">
                          <span className="text-sm text-white/50">{item.label}</span>
                          <span className={`text-sm font-syne ${item.highlight && item.value > 0 ? 'text-amber-400' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PRODUCTS ===== */}
            {activeTab === 'products' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-syne text-2xl lg:text-3xl">Products <span className="text-white/50 text-lg">({filteredProducts.length})</span></h2>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search pieces..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="admin-input flex-1 sm:w-48 px-3 py-2 rounded-lg text-sm text-white placeholder-charcoal-lighter/40"
                    />
                    <button onClick={() => setBulkMode(!bulkMode)} className={`px-3 py-2 rounded-lg text-xs tracking-wider uppercase whitespace-nowrap border transition-all ${bulkMode ? 'bg-rose/10 text-rose border-rose/20' : 'border-white/10 text-white/50 hover:text-white'}`}>
                      {bulkMode ? `${selectedProducts.length} Selected` : 'Bulk'}
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="btn-outline-gold px-3 py-2 rounded-lg text-xs tracking-wider uppercase whitespace-nowrap">
                      Import CSV
                    </button>
                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                    <button
                      onClick={() => { setShowProductForm(!showProductForm); setEditingProduct(null); resetProductForm(); setImagePreview(''); }}
                      className="btn-gold px-4 py-2 rounded-lg text-xs tracking-wider uppercase whitespace-nowrap"
                    >
                      + Add Piece
                    </button>
                  </div>
                </div>

                {/* Bulk action bar */}
                {bulkMode && selectedProducts.length > 0 && (
                  <div className="card-premium rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-white/50">{selectedProducts.length} selected</span>
                    <select value={bulkAction || ''} onChange={e => { setBulkAction(e.target.value); setBulkValue(''); }}
                      className="admin-input px-3 py-2 rounded-lg text-xs text-white border border-white/10">
                      <option value="">Choose action...</option>
                      <option value="delete">Delete Selected</option>
                      <option value="price">Update Price</option>
                      <option value="collection">Change Collection</option>
                      <option value="stock">Set Stock Level</option>
                    </select>
                    {bulkAction === 'price' && (
                      <input type="number" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="New price" className="admin-input px-3 py-2 rounded-lg text-xs text-white w-32" />
                    )}
                    {bulkAction === 'collection' && (
                      <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="admin-input px-3 py-2 rounded-lg text-xs text-white">
                        <option value="">Select collection...</option>
                        {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                    {bulkAction === 'stock' && (
                      <input type="number" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="Stock qty" className="admin-input px-3 py-2 rounded-lg text-xs text-white w-32" />
                    )}
                    <button onClick={handleBulkProductAction} disabled={!bulkAction}
                      className={`px-4 py-2 rounded-lg text-xs tracking-wider uppercase ${bulkAction ? (bulkAction === 'delete' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'btn-gold') : 'opacity-30 cursor-not-allowed border border-white/10 text-white/30'}`}>
                      Apply
                    </button>
                    <button onClick={() => { setBulkMode(false); setSelectedProducts([]); setBulkAction(null); }} className="text-xs text-white/30 hover:text-white/50 ml-auto">Cancel</button>
                  </div>
                )}

                {showProductForm && (
                  <div className="card-premium rounded-xl p-6 mb-6">
                    <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">{editingProduct ? 'Edit Piece' : 'Add New Piece'}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Name</label>
                        <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Piece name" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Department</label>
                        <select value={productForm.department} onChange={e => {
                          const dept = e.target.value;
                          const defaults = dept === 'decor'
                            ? { collection: DECOR_COLLECTIONS[0], material: DECOR_MATERIALS[0], category: DECOR_CATEGORIES[0], metal: '', gemstone: '' }
                            : dept === 'lingerie'
                            ? { collection: LINGERIE_COLLECTIONS[0], material: LINGERIE_MATERIALS[0], category: LINGERIE_CATEGORIES[0], metal: '', gemstone: '' }
                            : { collection: COLLECTIONS[0], metal: METALS[0], gemstone: GEMSTONES[0], category: CATEGORIES[0], material: '' };
                          setProductForm({ ...productForm, department: dept, ...defaults });
                        }} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Collection</label>
                        <select value={productForm.collection} onChange={e => setProductForm({ ...productForm, collection: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                          {(productForm.department === 'decor' ? DECOR_COLLECTIONS : productForm.department === 'lingerie' ? LINGERIE_COLLECTIONS : COLLECTIONS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {productForm.department === 'jewelry' ? (
                        <>
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Metal</label>
                            <select value={productForm.metal} onChange={e => setProductForm({ ...productForm, metal: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                              {METALS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Gemstone</label>
                            <select value={productForm.gemstone} onChange={e => setProductForm({ ...productForm, gemstone: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                              {GEMSTONES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Material</label>
                          <select value={productForm.material} onChange={e => setProductForm({ ...productForm, material: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                            {(productForm.department === 'decor' ? DECOR_MATERIALS : LINGERIE_MATERIALS).map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Category</label>
                        <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white">
                          {(productForm.department === 'decor' ? DECOR_CATEGORIES : productForm.department === 'lingerie' ? LINGERIE_CATEGORIES : CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Price (Rs.)</label>
                        <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Stock</label>
                        <input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">SKU</label>
                        <input value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="SKU code" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Weight</label>
                        <input value={productForm.weight} onChange={e => setProductForm({ ...productForm, weight: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="e.g. 25g" />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Product Image</label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors">
                            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs text-white/40">{uploading ? 'Uploading...' : 'Choose Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const dataUrl = await new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(reader.result);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(file);
                                  });
                                  const compressed = await compressImage(dataUrl, 1080);
                                  const url = await uploadImage(compressed, file.name.replace(/\.[^.]+$/, ''));
                                  setProductForm(prev => ({ ...prev, image: url }));
                                  setImagePreview(url);
                                } catch (err) {
                                  alert('Failed to upload image');
                                } finally {
                                  setUploading(false);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                          {imagePreview && (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => { setProductForm(prev => ({ ...prev, image: '' })); setImagePreview(''); }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors"
                              >x</button>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={productForm.image}
                          onChange={e => { setProductForm({ ...productForm, image: e.target.value }); setImagePreview(e.target.value); }}
                          className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white mt-2"
                          placeholder="Or paste image URL..."
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Description</label>
                        <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white resize-none" placeholder="Describe this piece..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm({ ...productForm, featured: e.target.checked })} className="w-4 h-4 accent-rose rounded" />
                        <span className="text-xs text-white/50 tracking-wider">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm({ ...productForm, inStock: e.target.checked })} className="w-4 h-4 accent-rose rounded" />
                        <span className="text-xs text-white/50 tracking-wider">In Stock</span>
                      </label>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="btn-outline-gold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase">Cancel</button>
                      <button onClick={handleSaveProduct} className="btn-gold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase">{editingProduct ? 'Update' : 'Save'}</button>
                    </div>
                  </div>
                )}

                <div className="card-premium rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {bulkMode && <th className="px-3 py-3.5"><input type="checkbox" checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleAllProducts} className="w-4 h-4 accent-rose rounded" /></th>}
                          {['Piece', 'SKU', 'Price', 'Stock', 'Collection', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-[10px] tracking-[0.2em] uppercase text-white/50/50 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="border-b border-rose/6 hover:bg-white/5 transition-colors">
                            {bulkMode && (
                              <td className="px-3 py-4">
                                <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleProductSelection(product.id)} className="w-4 h-4 accent-rose rounded" />
                              </td>
                            )}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#0a0a0a]/60" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0a]/60 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white/50/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                  </div>
                                )}
                                <span className="text-sm text-white">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-white/50">{product.sku || '-'}</td>
                            <td className="px-5 py-4 text-sm text-gold">Rs. {Number(product.price || 0).toLocaleString()}</td>
                            <td className="px-5 py-4">
                              {editingStock === product.id ? (
                                <div className="flex items-center gap-1">
                                  <input type="number" value={stockValue} onChange={e => setStockValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleStockSave(product.id); if (e.key === 'Escape') setEditingStock(null); }}
                                    className="admin-input w-16 px-2 py-1 rounded text-xs text-white" autoFocus />
                                  <button onClick={() => handleStockSave(product.id)} className="text-emerald-400 hover:text-emerald-300 text-xs">✓</button>
                                  <button onClick={() => setEditingStock(null)} className="text-white/30 hover:text-white/50 text-xs">✕</button>
                                </div>
                              ) : (
                                <button onClick={() => handleStockEdit(product)} className="hover:bg-white/5 rounded px-2 py-1 transition-colors">
                                  <StockBadge stock={product.stock ?? 0} />
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm text-white/50">{product.collection}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] tracking-wider uppercase border font-medium ${product.inStock !== false ? 'bg-emerald-50 bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-500/15 text-rose border-rose/20'}`}>
                                {product.inStock !== false ? 'In Stock' : 'Out'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEditProduct(product)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr><td colSpan={7 + (bulkMode ? 1 : 0)} className="px-5 py-12 text-center text-white/50/50 text-sm">No products found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CATEGORIES ===== */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-syne text-2xl lg:text-3xl">Departments <span className="text-white/50 text-lg">({categories.length})</span></h2>
                  <button onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({ id: '', name: '', description: '', icon: '✦', color: '#D4919E', order: categories.length + 1 }); }} className="btn-gold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase">
                    + Add Department
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="card-premium rounded-xl p-6 mb-6">
                    <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">{editingCategory ? 'Edit Department' : 'Add Department'}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">ID (slug)</label>
                        <input value={categoryForm.id} onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="e.g. decor" disabled={!!editingCategory} />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Name</label>
                        <input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="e.g. Decor" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Description</label>
                        <input value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Short tagline" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Icon</label>
                        <input value={categoryForm.icon} onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="✦" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Color</label>
                        <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Order</label>
                        <input type="number" value={categoryForm.order} onChange={e => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 1 })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" min="1" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }} className="btn-outline-gold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase">Cancel</button>
                      <button onClick={handleSaveCategory} className="btn-gold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase">{editingCategory ? 'Update' : 'Save'}</button>
                    </div>
                  </div>
                )}

                <div className="card-premium rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Order', 'Icon', 'Name', 'Description', 'Color', 'Products', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-[10px] tracking-[0.2em] uppercase text-white/50/50 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => {
                          const productCount = products.filter(p => p.department === cat.id).length;
                          return (
                            <tr key={cat.id} className="border-b border-rose/6 hover:bg-white/5 transition-colors">
                              <td className="px-5 py-4 text-sm text-white/50">{cat.order}</td>
                              <td className="px-5 py-4 text-lg">{cat.icon}</td>
                              <td className="px-5 py-4 font-medium text-sm">{cat.name}</td>
                              <td className="px-5 py-4 text-sm text-white/60">{cat.description}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: cat.color }} />
                                  <span className="text-xs text-white/40">{cat.color}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-white/60">{productCount}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleEditCategory(cat)} className="text-xs text-rose/70 hover:text-rose tracking-wider uppercase">Edit</button>
                                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-red-400/60 hover:text-red-400 tracking-wider uppercase">Del</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ORDERS ===== */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-syne text-2xl lg:text-3xl">Orders <span className="text-white/50 text-lg">({orders.length})</span></h2>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="admin-input flex-1 sm:w-48 px-3 py-2 rounded-lg text-sm text-white placeholder-charcoal-lighter/40"
                    />
                    <button onClick={handleExportOrders} className="btn-outline-gold px-4 py-2 rounded-lg text-xs tracking-wider uppercase whitespace-nowrap">
                      Export All
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                  {['all', ...ORDER_STATUSES].map(s => (
                    <button
                      key={s}
                      onClick={() => setOrderFilter(s)}
                      className={`px-4 py-2 rounded-full text-[11px] tracking-wider uppercase whitespace-nowrap border transition-all ${
                        orderFilter === s
                          ? 'bg-rose/10 text-rose border-rose/20'
                          : 'text-white/50 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>

                <div className="card-premium rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Order ID', 'Tracking', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-[10px] tracking-[0.2em] uppercase text-white/50/50 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="border-b border-rose/6 hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 text-sm text-gold font-mono">{order.id}</td>
                            <td className="px-5 py-4 text-xs text-rose/70 font-mono tracking-wider">{order.trackingCode || '-'}</td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-white">{order.customerName || order.customer?.name || 'N/A'}</p>
                               <p className="text-[11px] text-white/50/50">{order.email || order.customerEmail || ''}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-white/50">{order.date || order.createdAt || '-'}</td>
                            <td className="px-5 py-4 text-sm text-gold">Rs. {Number(order.total || 0).toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="admin-input px-2 py-1.5 rounded-lg text-[11px] tracking-wider uppercase bg-transparent border border-white/10 text-white"
                              >
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors"
                                  title="View Invoice"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </button>
                                <button
                                  onClick={() => { if (confirm('Delete this order?')) deleteOrder(order.id).then(loadData); }}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr><td colSpan={7} className="px-5 py-12 text-center text-white/50/50 text-sm">No orders found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invoice Panel */}
                {expandedOrder && (() => {
                  const order = orders.find(o => o.id === expandedOrder);
                  if (!order) return null;
                  return (
                    <div className="card-premium rounded-xl p-6 mt-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm tracking-[0.15em] uppercase text-white/50">Invoice — {order.id}</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={() => printInvoice(order)} className="btn-gold px-4 py-2 rounded-lg text-[11px] tracking-wider uppercase flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Invoice
                          </button>
                          <button onClick={() => handleExportOrderCSV(order)} className="btn-outline-gold px-4 py-2 rounded-lg text-[11px] tracking-wider uppercase flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                          </button>
                          <button onClick={() => exportToJSON(order, `annie-order-${order.id}`)} className="btn-outline-gold px-4 py-2 rounded-lg text-[11px] tracking-wider uppercase flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export JSON
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-2">Customer</p>
                          <p className="text-sm text-white">{order.customerName || order.customer?.name || 'N/A'}</p>
                          <p className="text-sm text-white/50">{order.email || ''}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-2">Tracking Code</p>
                          <p className="text-sm text-rose font-mono tracking-wider">{order.trackingCode || 'N/A'}</p>
                          <p className="text-[10px] text-white/40 mt-1">Ship To:</p>
                          {order.address ? (
                            <p className="text-sm text-white/50">
                              {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.zip}
                            </p>
                          ) : (
                            <p className="text-sm text-white/50/50">No address</p>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto mb-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/5">
                              {['Item', 'Variant', 'Qty', 'Price', 'Total'].map(h => (
                                <th key={h} className="text-left px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase text-white/50/50 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, idx) => (
                              <tr key={idx} className="border-b border-rose/6">
                                <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-white/50">{item.variant || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white/50">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gold">Rs. {Number(item.price || 0).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gold">Rs. {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="border-t border-white/5 pt-4 flex flex-col items-end gap-1">
                        {order.subtotal != null && <p className="text-sm text-white/50">Subtotal: Rs. {Number(order.subtotal).toLocaleString()}</p>}
                        {order.tax != null && <p className="text-sm text-white/50">Tax: Rs. {Number(order.tax).toLocaleString()}</p>}
                        {order.shipping != null && <p className="text-sm text-white/50">Shipping: Rs. {Number(order.shipping).toLocaleString()}</p>}
                        <p className="text-lg font-syne text-gold mt-1">Total: Rs. {Number(order.total || 0).toLocaleString()}</p>
                        {order.paymentMethod && <p className="text-xs text-white/50/50 mt-1">Payment: {order.paymentMethod}</p>}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ===== INVENTORY ===== */}
            {activeTab === 'inventory' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-syne text-2xl lg:text-3xl">Inventory</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { exportToCSV(products.map(p => ({ name: p.name, sku: p.sku, stock: p.stock ?? 0, collection: p.collection, price: p.price })), 'annie-inventory') }}
                      className="btn-outline-gold px-4 py-2 rounded-lg text-xs tracking-wider uppercase">
                      Export Stock Report
                    </button>
                  </div>
                </div>

                {/* Stock Alerts */}
                {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                  <div className="mb-6 space-y-3">
                    {outOfStockProducts.length > 0 && (
                      <div className="card-premium rounded-xl p-4 border-l-4 border-red-500">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm text-red-400 font-medium">{outOfStockProducts.length} Out of Stock</p>
                            <p className="text-xs text-white/50">{outOfStockProducts.map(p => p.name).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {lowStockProducts.length > 0 && (
                      <div className="card-premium rounded-xl p-4 border-l-4 border-amber-500">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm text-amber-400 font-medium">{lowStockProducts.length} Low Stock (under 5 units)</p>
                            <p className="text-xs text-white/50">{lowStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <KPICard icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" value={products.length} label="Total Products" gradient="bg-gradient-to-br from-rose-pale/20 to-white/60" />
                  <KPICard icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" value={products.filter(p => (p.stock || 0) >= 5).length} label="In Stock" gradient="bg-gradient-to-br from-emerald-500/10 to-white/60" />
                  <KPICard icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" value={lowStockProducts.length} label="Low Stock" gradient="bg-gradient-to-br from-amber-500/10 to-white/60" />
                  <KPICard icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" value={outOfStockProducts.length} label="Out of Stock" gradient="bg-gradient-to-br from-red-500/10 to-white/60" />
                </div>

                {/* Inventory Table */}
                <div className="card-premium rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Product', 'SKU', 'Collection', 'Price', 'Stock Level', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-[10px] tracking-[0.2em] uppercase text-white/50/50 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id} className="border-b border-rose/6 hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 text-sm text-white font-medium">{product.name}</td>
                            <td className="px-5 py-4 text-sm text-white/50 font-mono">{product.sku || '-'}</td>
                            <td className="px-5 py-4 text-sm text-white/50">{product.collection}</td>
                            <td className="px-5 py-4 text-sm text-gold">Rs. {Number(product.price || 0).toLocaleString()}</td>
                            <td className="px-5 py-4">
                              {editingStock === product.id ? (
                                <div className="flex items-center gap-2">
                                  <input type="number" value={stockValue} onChange={e => setStockValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleStockSave(product.id); if (e.key === 'Escape') setEditingStock(null); }}
                                    className="admin-input w-20 px-3 py-1.5 rounded-lg text-sm text-white" autoFocus />
                                  <button onClick={() => handleStockSave(product.id)} className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1">Save</button>
                                  <button onClick={() => setEditingStock(null)} className="text-white/30 hover:text-white/50 text-xs px-2 py-1">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(100, ((product.stock || 0) / 50) * 100)}%`,
                                        backgroundColor: (product.stock || 0) === 0 ? '#ef4444' : (product.stock || 0) < 5 ? '#f59e0b' : (product.stock || 0) < 20 ? '#3b82f6' : '#10b981'
                                      }}
                                    />
                                  </div>
                                  <StockBadge stock={product.stock ?? 0} />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {editingStock !== product.id && (
                                <button onClick={() => handleStockEdit(product)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors" title="Edit stock">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ANALYTICS ===== */}
            {activeTab === 'analytics' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-syne text-2xl lg:text-3xl">Analytics</h2>
                  <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a0a]/[0.04] text-white/50 hover:text-white text-xs tracking-wider transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {analytics ? (
                  <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KPICard icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" value={`Rs. ${Number(analytics.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" gradient="bg-gradient-to-br from-rose-pale/20 to-white/60" />
                      <KPICard icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" value={analytics.totalOrders || 0} label="Total Orders" gradient="bg-gradient-to-br from-rose-pale/15 to-white/60" />
                      <KPICard icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" value={analytics.customerSummary?.total || 0} label="Customers" gradient="bg-gradient-to-br from-rose-pale/10 to-white/60" />
                      <KPICard icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" value={`Rs. ${Number(analytics.customerSummary?.avgValue || 0).toLocaleString()}`} label="Avg Customer Value" gradient="bg-gradient-to-br from-rose-pale/10 to-white/60" />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Monthly Revenue Chart */}
                      <div className="card-premium rounded-xl p-6">
                        <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-6">Monthly Revenue</h3>
                        <BarChart
                          data={Object.entries(analytics.monthlyRevenue || {}).sort().map(([month, value]) => ({
                            label: month.substring(5),
                            value
                          }))}
                          maxHeight={180}
                        />
                        {Object.keys(analytics.monthlyRevenue || {}).length === 0 && (
                          <p className="text-white/30 text-sm text-center py-8">No revenue data</p>
                        )}
                      </div>

                      {/* Order Status Donut */}
                      <div className="card-premium rounded-xl p-6">
                        <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-6">Order Status</h3>
                        <div className="flex items-center gap-8">
                          <DonutChart
                            segments={[
                              { value: analytics.statusBreakdown?.pending || 0, color: '#f59e0b' },
                              { value: analytics.statusBreakdown?.processing || 0, color: '#3b82f6' },
                              { value: analytics.statusBreakdown?.shipped || 0, color: '#8b5cf6' },
                              { value: analytics.statusBreakdown?.delivered || 0, color: '#10b981' },
                              { value: analytics.statusBreakdown?.cancelled || 0, color: '#ef4444' },
                            ].filter(s => s.value > 0)}
                            size={120}
                          />
                          <div className="space-y-2">
                            {[
                              { label: 'Pending', color: '#f59e0b', count: analytics.statusBreakdown?.pending || 0 },
                              { label: 'Processing', color: '#3b82f6', count: analytics.statusBreakdown?.processing || 0 },
                              { label: 'Shipped', color: '#8b5cf6', count: analytics.statusBreakdown?.shipped || 0 },
                              { label: 'Delivered', color: '#10b981', count: analytics.statusBreakdown?.delivered || 0 },
                              { label: 'Cancelled', color: '#ef4444', count: analytics.statusBreakdown?.cancelled || 0 },
                            ].filter(s => s.count > 0).map(s => (
                              <div key={s.label} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                <span className="text-xs text-white/50">{s.label}</span>
                                <span className="text-xs text-white font-medium ml-auto">{s.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Products */}
                      <div className="card-premium rounded-xl p-6">
                        <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">Top Products by Revenue</h3>
                        <div className="space-y-3">
                          {(analytics.topProducts || []).slice(0, 5).map((item, i) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <span className="text-xs text-white/30 w-5">{i + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full bg-rose/40" style={{ width: `${(item.revenue / (analytics.topProducts[0]?.revenue || 1)) * 100}%` }} />
                                  </div>
                                  <span className="text-[10px] text-white/40">{item.quantity} sold</span>
                                </div>
                              </div>
                              <span className="text-xs text-gold font-medium whitespace-nowrap">Rs. {item.revenue.toLocaleString()}</span>
                            </div>
                          ))}
                          {(analytics.topProducts || []).length === 0 && (
                            <p className="text-white/30 text-sm text-center py-4">No sales data</p>
                          )}
                        </div>
                      </div>

                      {/* Collection Performance */}
                      <div className="card-premium rounded-xl p-6">
                        <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">Collection Performance</h3>
                        <div className="space-y-3">
                          {(analytics.collectionRevenue || []).sort((a, b) => b.revenue - a.revenue).map(col => (
                            <div key={col.name} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-white">{col.name}</span>
                                  <span className="text-xs text-gold">Rs. {col.revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-rose/40 to-gold/40" style={{ width: `${(col.revenue / Math.max(...(analytics.collectionRevenue || []).map(c => c.revenue), 1)) * 100}%` }} />
                                  </div>
                                  <span className="text-[10px] text-white/40">{col.productCount} items · {col.totalStock} in stock</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stock Overview */}
                    <div className="card-premium rounded-xl p-6">
                      <h3 className="text-sm tracking-[0.15em] uppercase text-white/50 mb-5">Stock Overview</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Units', value: analytics.stockSummary?.totalStock || 0, color: 'text-white' },
                          { label: 'In Stock (5+)', value: analytics.stockSummary?.inStock || 0, color: 'text-emerald-400' },
                          { label: 'Low Stock (<5)', value: analytics.stockSummary?.lowStock || 0, color: 'text-amber-400' },
                          { label: 'Out of Stock', value: analytics.stockSummary?.outOfStock || 0, color: 'text-red-400' },
                        ].map(s => (
                          <div key={s.label} className="text-center py-4 rounded-xl bg-white/5">
                            <p className={`text-2xl font-syne ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-white/50 mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Loading analytics...</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== CUSTOMERS ===== */}
            {activeTab === 'customers' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-syne text-2xl lg:text-3xl">Customers <span className="text-white/50 text-lg">({filteredCustomers.length})</span></h2>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="admin-input flex-1 sm:w-48 px-3 py-2 rounded-lg text-sm text-white placeholder-charcoal-lighter/40"
                    />
                    <button onClick={handleExportCustomers} className="btn-outline-gold px-4 py-2 rounded-lg text-xs tracking-wider uppercase whitespace-nowrap">
                      Export All
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredCustomers.map(customer => (
                    <div key={customer.id} className="card-premium rounded-xl p-5">
                      {editingCustomer === customer.id ? (
                        <CustomerEditForm
                          customer={customer}
                          onSave={handleSaveCustomer}
                          onCancel={() => setEditingCustomer(null)}
                        />
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-sm font-medium text-white">{customer.name}</h3>
                              <p className="text-xs text-white/50">{customer.email}</p>
                              {customer.phone && <p className="text-xs text-white/50/50">{customer.phone}</p>}
                            </div>
                            <button onClick={() => setEditingCustomer(customer.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-rose transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                              { label: 'Orders', value: customer.totalOrders || 0 },
                              { label: 'Spent', value: `Rs. ${Number(customer.totalSpent || 0).toLocaleString()}` },
                              { label: 'Avg', value: `Rs. ${customer.totalOrders ? ((customer.totalSpent || 0) / customer.totalOrders).toFixed(0) : '0'}` },
                            ].map(s => (
                              <div key={s.label} className="text-center py-2 rounded-lg bg-[#0a0a0a]/[0.02]">
                                <p className="text-xs font-syne text-white">{s.value}</p>
                                <p className="text-[9px] tracking-[0.15em] uppercase text-white/50/50">{s.label}</p>
                              </div>
                            ))}
                          </div>
                          {customer.notes && (
                            <p className="text-xs text-white/50 italic mt-2 border-t border-rose/6 pt-2">{customer.notes}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="sm:col-span-2 text-center py-16 text-white/50/50 text-sm">No customers found</div>
                  )}
                </div>
              </div>
            )}

            {/* ===== SETTINGS ===== */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h2 className="font-syne text-2xl lg:text-3xl mb-8">Settings</h2>
                <div className="card-premium rounded-xl p-6 space-y-5">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Store Logo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-white/20 text-[10px] tracking-wider uppercase">No logo</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <label>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const compressed = await compressImage(reader.result, 1080);
                              const url = await uploadImage(compressed, `logo-${Date.now()}`);
                              setSettings({ ...settings, logo: url });
                            };
                            reader.readAsDataURL(file);
                          }} />
                          <span className="inline-block px-4 py-2 rounded-lg text-[10px] tracking-wider uppercase font-medium border border-white/10 text-white/60 hover:border-rose/30 hover:text-rose transition-all cursor-pointer">
                            {settings.logo ? 'Change' : 'Upload'}
                          </span>
                        </label>
                        {settings.logo && (
                          <button onClick={() => setSettings({ ...settings, logo: '' })}
                            className="px-4 py-2 rounded-lg text-[10px] tracking-wider uppercase font-medium border border-white/10 text-white/60 hover:border-rose/30 hover:text-rose transition-all">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Store Name</label>
                      <input value={settings.storeName || ''} onChange={e => setSettings({ ...settings, storeName: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Tagline</label>
                      <input value={settings.tagline || ''} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Currency Symbol</label>
                      <input value={settings.currencySymbol || ''} onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Tax Rate (%)</label>
                      <input type="number" value={settings.taxRate || ''} onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Shipping Threshold</label>
                      <input type="number" value={settings.shippingThreshold || ''} onChange={e => setSettings({ ...settings, shippingThreshold: parseFloat(e.target.value) || 0 })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Shipping Fee</label>
                      <input type="number" value={settings.shippingFee || ''} onChange={e => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) || 0 })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Brand Colors</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-white/50/50 mb-1.5">Primary</label>
                        <input type="color" value={settings.primaryColor || '#D4919E'} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-white/50/50 mb-1.5">Accent</label>
                        <input type="color" value={settings.accentColor || '#C9A96E'} onChange={e => setSettings({ ...settings, accentColor: e.target.value })} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Contact Info</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Phone Number</label>
                        <input value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="0300-1234567" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">WhatsApp</label>
                        <input value={settings.whatsapp || ''} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="0300-1234567" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Email</label>
                        <input value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="contact@..." />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Address</label>
                        <input value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Lahore, Pakistan" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Social Links</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Instagram URL</label>
                        <input value={settings.instagram || ''} onChange={e => setSettings({ ...settings, instagram: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="https://instagram.com/..." />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Facebook URL</label>
                        <input value={settings.facebook || ''} onChange={e => setSettings({ ...settings, facebook: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="https://facebook.com/..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-1.5">Showroom URL</label>
                        <input value={settings.showroom || ''} onChange={e => setSettings({ ...settings, showroom: e.target.value })} className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Payment Methods</p>
                    <p className="text-xs text-white/40 mb-3">List your accepted payment options (one per line shown below)</p>
                    <div className="space-y-2">
                      {(settings.paymentMethods || []).map((method, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={method} onChange={e => {
                            const methods = [...(settings.paymentMethods || [])]
                            methods[i] = e.target.value
                            setSettings({ ...settings, paymentMethods: methods })
                          }} className="admin-input flex-1 px-3 py-2 rounded-lg text-sm text-white" />
                          <button onClick={() => {
                            const methods = (settings.paymentMethods || []).filter((_, j) => j !== i)
                            setSettings({ ...settings, paymentMethods: methods })
                          }} className="text-white/30 hover:text-rose transition-colors p-1" title="Remove">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setSettings({ ...settings, paymentMethods: [...(settings.paymentMethods || []), ''] })}
                        className="text-[10px] tracking-[0.15em] uppercase text-rose/60 hover:text-rose transition-colors">
                        + Add Payment Method
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Change Admin Password</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-white/50/50 mb-1.5">Current Password</label>
                        <input type="password" value={pwCurrent} onChange={e => { setPwCurrent(e.target.value); setPwError(''); setPwMsg(''); }}
                          className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Enter current password" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-white/50/50 mb-1.5">New Password</label>
                        <input type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); setPwError(''); setPwMsg(''); }}
                          className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Min 4 characters" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-white/50/50 mb-1.5">Confirm New Password</label>
                        <input type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwError(''); setPwMsg(''); }}
                          className="admin-input w-full px-3 py-2.5 rounded-lg text-sm text-white" placeholder="Repeat new password" />
                      </div>
                    </div>
                    {pwError && <p className="mt-2 text-xs text-rose">{pwError}</p>}
                    {pwMsg && <p className="mt-2 text-xs text-green-400">{pwMsg}</p>}
                    <div className="flex justify-end mt-3">
                      <button onClick={handleChangePassword} disabled={pwLoading || !pwCurrent || !pwNew || !pwConfirm}
                        className="px-5 py-2 rounded-lg text-xs tracking-wider uppercase font-medium border border-white/10 text-white/60 hover:border-rose/30 hover:text-rose transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/50/50 mb-3">Category Hero Images</p>
                    <p className="text-xs text-white/40 mb-4">Main image shown on the homepage for each department. Upload, change, or delete.</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {['jewelry', 'decor', 'lingerie'].map(dept => (
                        <div key={dept} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] tracking-[0.15em] uppercase text-white/60 font-medium capitalize">{dept}</span>
                          </div>
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/5">
                            {heroImages[dept] ? (
                              <img src={heroImages[dept]} alt={dept} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No image</div>
                            )}
                            {heroUploading[dept] && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-rose/40 border-t-rose rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <label className="flex-1">
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setHeroUploading(prev => ({ ...prev, [dept]: true }));
                                try {
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const compressed = await compressImage(reader.result, 1080);
                                    const url = await uploadImage(compressed, `hero-${dept}-${Date.now()}`);
                                    await updateHeroImage(dept, url);
                                    setHeroImages(prev => ({ ...prev, [dept]: url }));
                                    setHeroUploading(prev => ({ ...prev, [dept]: false }));
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err) {
                                  console.error('Hero upload failed:', err);
                                  setHeroUploading(prev => ({ ...prev, [dept]: false }));
                                }
                              }} />
                              <span className="block w-full text-center px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-medium border border-white/10 text-white/50 hover:border-rose/30 hover:text-rose transition-all cursor-pointer">
                                {heroImages[dept] ? 'Change' : 'Upload'}
                              </span>
                            </label>
                            {heroImages[dept] && (
                              <button onClick={async () => {
                                if (!confirm(`Reset ${dept} hero image to default?`)) return;
                                const res = await deleteHeroImage(dept);
                                setHeroImages(prev => ({ ...prev, [dept]: res.image }));
                              }}
                                className="px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-medium border border-white/10 text-white/50 hover:border-rose/30 hover:text-rose transition-all">
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sticky bottom-0 flex justify-end pt-2 bg-[#0a0a0a] -mx-6 px-6 pb-6 rounded-b-xl">
                    <button onClick={handleSaveSettings} className="btn-gold px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        message={`Are you sure you want to delete this ${confirmDelete.type}? This action cannot be undone.`}
        onCancel={() => setConfirmDelete({ open: false, type: null, id: null })}
        onConfirm={async () => {
          if (confirmDelete.type === 'product') {
            await deleteProduct(confirmDelete.id);
          } else if (confirmDelete.type === 'category') {
            await deleteCategory(confirmDelete.id);
          }
          setConfirmDelete({ open: false, type: null, id: null });
          loadData();
        }}
      />
    </div>
  );
}

function CustomerEditForm({ customer, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    notes: customer.notes || '',
  });

  return (
    <div className="space-y-3">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input w-full px-3 py-2 rounded-lg text-sm text-white" placeholder="Name" />
      <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="admin-input w-full px-3 py-2 rounded-lg text-sm text-white" placeholder="Email" />
      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="admin-input w-full px-3 py-2 rounded-lg text-sm text-white" placeholder="Phone" />
      <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="admin-input w-full px-3 py-2 rounded-lg text-sm text-white resize-none" placeholder="Notes" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn-outline-gold px-3 py-1.5 rounded-lg text-[11px] tracking-wider uppercase">Cancel</button>
        <button onClick={() => onSave(customer.id, form)} className="btn-gold px-3 py-1.5 rounded-lg text-[11px] tracking-wider uppercase">Save</button>
      </div>
    </div>
  );
}
