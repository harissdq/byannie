// ─── Annie Premium State Store ──────────────────────────────
// Reactive store with invoice generation, CSV/JSON export, and store settings.

const state = {
  cart: JSON.parse(localStorage.getItem('annie_cart') || '[]'),
  products: [],
  collections: [],
  categories: [],
  orders: [],
  customers: [],
  stats: null,
  cartOpen: false,
  adminToken: localStorage.getItem('annie_admin_token') || null,
  loading: false,
  searchQuery: '',
  settings: JSON.parse(localStorage.getItem('annie_settings') || JSON.stringify({
    storeName: 'ANNIE',
    storeTagline: "Pakistan's Premier Luxury Artificial Jewelry",
    currency: 'PKR',
    currencySymbol: 'Rs.',
    taxRate: 0,
    shippingThreshold: 2000,
    shippingFee: 150,
    primaryColor: '#D4919E',
    accentColor: '#C9A96E',
    whatsapp: '0300-1234567',
    phone: '0300-1234567',
    email: 'hello@anniejewelry.pk',
    address: 'Lahore, Pakistan',
    logo: '',
    paymentMethods: ['Cash on Delivery', 'JazzCash', 'Easypaisa', 'Bank Transfer'],
    instagram: 'https://instagram.com/harisrsiddiqui',
    facebook: '',
    showroom: '',
  })),
}

// ─── Event Bus ──────────────────────────────────────────
const listeners = new Map()
function emit(event, data) {
  (listeners.get(event) || []).forEach(fn => fn(data))
  window.dispatchEvent(new CustomEvent(`annie:${event}`, { detail: data }))
}
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, [])
  listeners.get(event).push(fn)
  return () => {
    const arr = listeners.get(event)
    if (arr) {
      const idx = arr.indexOf(fn)
      if (idx !== -1) arr.splice(idx, 1)
    }
  }
}

// ─── Settings ───────────────────────────────────────────
export function getSettings() { return { ...state.settings } }
export function updateSettings(partial) {
  state.settings = { ...state.settings, ...partial }
  localStorage.setItem('annie_settings', JSON.stringify(state.settings))
  emit('settings-updated', state.settings)
}

export async function fetchSettings() {
  try {
    const server = await api('/api/settings')
    state.settings = { ...state.settings, ...server }
    localStorage.setItem('annie_settings', JSON.stringify(state.settings))
    emit('settings-updated', state.settings)
    return state.settings
  } catch (e) {
    return state.settings
  }
}

export async function saveSettings(partial) {
  state.settings = { ...state.settings, ...partial }
  localStorage.setItem('annie_settings', JSON.stringify(state.settings))
  emit('settings-updated', state.settings)
  try {
    await api('/api/settings', { method: 'PUT', body: JSON.stringify(state.settings) })
  } catch (e) {
    console.error('Failed to save settings to server:', e)
  }
}

// ─── Cart ───────────────────────────────────────────────
export function getCart() { return [...state.cart] }

export function addToCart(product, variant = null, quantity = 1) {
  const existing = state.cart.find(
    item => item.productId === product.id && item.variant === (variant || product.variants?.[0]?.label || 'Standard')
  )
  if (existing) {
    existing.quantity += quantity
  } else {
    state.cart.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || '',
      price: variant ? (product.variants?.find(v => v.label === variant)?.price || product.price) : product.price,
      variant: variant || product.variants?.[0]?.label || 'Standard',
      quantity,
      sku: product.sku,
    })
  }
  persistCart()
  emit('cart-updated', state.cart)
}

export function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id)
  persistCart()
  emit('cart-updated', state.cart)
}

export function updateCartQuantity(id, quantity) {
  const item = state.cart.find(i => i.id === id)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    item.quantity = quantity
    persistCart()
    emit('cart-updated', state.cart)
  }
}

export function clearCart() {
  state.cart = []
  persistCart()
  emit('cart-updated', state.cart)
}

export function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartCount() {
  return state.cart.reduce((count, item) => count + item.quantity, 0)
}

function persistCart() {
  localStorage.setItem('annie_cart', JSON.stringify(state.cart))
}

// ─── Cart Drawer ────────────────────────────────────────
export function isCartOpen() { return state.cartOpen }
export function openCart() { state.cartOpen = true; emit('cart-open', true) }
export function closeCart() { state.cartOpen = false; emit('cart-open', false) }

// ─── Products ───────────────────────────────────────────
export function getProducts() { return [...state.products] }
export function getProduct(id) { return state.products.find(p => p.id === id) || null }

// ─── Collections ────────────────────────────────────────
export function getCollections() { return [...state.collections] }

// ─── API Fetch ──────────────────────────────────────────
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (state.adminToken) {
    headers['Authorization'] = `Bearer ${state.adminToken}`
  }
  const res = await fetch(path, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401) {
      state.adminToken = null
      localStorage.removeItem('annie_admin_token')
      emit('auth-changed', false)
    }
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

// ─── Data Fetching ──────────────────────────────────────
export async function fetchProducts() {
  try {
    state.products = await api('/api/products')
    emit('products-loaded', state.products)
    return state.products
  } catch (e) {
    console.error('Failed to load products:', e)
    return []
  }
}

export async function fetchCollections() {
  try {
    state.collections = await api('/api/collections')
    emit('collections-loaded', state.collections)
    return state.collections
  } catch (e) {
    console.error('Failed to load collections:', e)
    return []
  }
}

// ─── Categories (Departments) ──────────────────────
export function getCategories() { return [...state.categories] }

export async function fetchCategories() {
  try {
    state.categories = await api('/api/categories')
    emit('categories-loaded', state.categories)
    return state.categories
  } catch (e) {
    console.error('Failed to load categories:', e)
    return []
  }
}

export async function createCategory(data) {
  const cat = await api('/api/categories', { method: 'POST', body: JSON.stringify(data) })
  await fetchCategories()
  return cat
}

export async function updateCategory(id, data) {
  const cat = await api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await fetchCategories()
  return cat
}

export async function deleteCategory(id) {
  await api(`/api/categories/${id}`, { method: 'DELETE' })
  await fetchCategories()
}

export async function fetchOrders() {
  try {
    state.orders = await api('/api/orders')
    emit('orders-loaded', state.orders)
    return state.orders
  } catch (e) {
    console.error('Failed to load orders:', e)
    return []
  }
}

export async function fetchCustomers() {
  try {
    state.customers = await api('/api/customers')
    emit('customers-loaded', state.customers)
    return state.customers
  } catch (e) {
    console.error('Failed to load customers:', e)
    return []
  }
}

export async function fetchStats() {
  try {
    state.stats = await api('/api/stats')
    return state.stats
  } catch (e) {
    console.error('Failed to load stats:', e)
    return null
  }
}

export async function fetchAnalytics() {
  try {
    return await api('/api/analytics')
  } catch (e) {
    console.error('Failed to load analytics:', e)
    return null
  }
}

export async function updateStock(productId, stock) {
  try {
    const product = await api(`/api/products/${productId}/stock`, {
      method: 'PUT', body: JSON.stringify({ stock })
    })
    await fetchProducts()
    return product
  } catch (e) {
    console.error('Failed to update stock:', e)
    throw e
  }
}

export async function uploadImage(dataUrl, filename) {
  try {
    const result = await api('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image: dataUrl, filename })
    })
    return result.url
  } catch (e) {
    console.error('Failed to upload image:', e)
    throw e
  }
}

// ─── Hero Images ──────────────────────────────────────────
export async function fetchHeroImages() {
  try {
    return await api('/api/hero-images')
  } catch (e) {
    console.error('Failed to fetch hero images:', e)
    return { jewelry: '/images/products/p1-gold-necklace.jpg', decor: '/images/products/p25-gold-vase.jpg', lingerie: '/images/products/p13-bathrobe.jpg' }
  }
}

export async function updateHeroImage(department, image) {
  const res = await api(`/api/hero-images/${department}`, {
    method: 'PUT',
    body: JSON.stringify({ image })
  })
  emit('hero-images-updated', { department, image })
  return res
}

export async function deleteHeroImage(department) {
  const res = await api(`/api/hero-images/${department}`, { method: 'DELETE' })
  emit('hero-images-updated', { department, image: res.image })
  return res
}

// ─── Admin CRUD ─────────────────────────────────────────
export async function login(password) {
  const res = await api('/api/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  state.adminToken = res.token
  localStorage.setItem('annie_admin_token', res.token)
  emit('auth-changed', true)
  return res
}

export function isLoggedIn() { return !!state.adminToken }
export function logout() {
  state.adminToken = null
  localStorage.removeItem('annie_admin_token')
  emit('auth-changed', false)
}

export async function createProduct(data) {
  const product = await api('/api/products', { method: 'POST', body: JSON.stringify(data) })
  await fetchProducts()
  return product
}

export async function updateProduct(id, data) {
  const product = await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await fetchProducts()
  return product
}

export async function deleteProduct(id) {
  await api(`/api/products/${id}`, { method: 'DELETE' })
  await fetchProducts()
}

export async function updateOrder(id, data) {
  const order = await api(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await fetchOrders()
  return order
}

export async function deleteOrder(id) {
  await api(`/api/orders/${id}`, { method: 'DELETE' })
  await fetchOrders()
}

export async function bulkUpdateProducts(ids, updates) {
  try {
    const result = await api('/api/products/bulk-update', {
      method: 'POST', body: JSON.stringify({ ids, updates })
    })
    await fetchProducts()
    return result
  } catch (e) {
    console.error('Failed to bulk update products:', e)
    throw e
  }
}

export async function bulkDeleteProducts(ids) {
  try {
    const result = await api('/api/products/bulk-delete', {
      method: 'POST', body: JSON.stringify({ ids })
    })
    await fetchProducts()
    return result
  } catch (e) {
    console.error('Failed to bulk delete products:', e)
    throw e
  }
}

export async function bulkUpdateOrders(ids, updates) {
  try {
    const result = await api('/api/orders/bulk-update', {
      method: 'POST', body: JSON.stringify({ ids, updates })
    })
    await fetchOrders()
    return result
  } catch (e) {
    console.error('Failed to bulk update orders:', e)
    throw e
  }
}

export async function updateCustomer(id, data) {
  const customer = await api(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await fetchCustomers()
  return customer
}

export async function changePassword(currentPassword, newPassword) {
  return await api('/api/admin/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  })
}

// ─── Search & Filter ────────────────────────────────────
export function searchProducts(query) {
  if (!query.trim()) return state.products
  const q = query.toLowerCase()
  return state.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.department?.toLowerCase().includes(q) ||
    p.collection?.toLowerCase().includes(q) ||
    p.metal?.toLowerCase().includes(q) ||
    p.gemstone?.toLowerCase().includes(q) ||
    p.material?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  )
}

// ─── Image Compression ──────────────────────────────────
export function compressImage(dataUrl, maxDim = 1080, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h / w) * maxDim); w = maxDim }
        else { w = Math.round((w / h) * maxDim); h = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ─── Order Tracking ──────────────────────────────────────
export async function trackOrder(code) {
  const res = await fetch(`/api/track/${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error('Order not found')
  return res.json()
}

// ─── Auto-SKU Generation ─────────────────────────────────
export async function generateAutoSKU(department, category) {
  try {
    const result = await api(`/api/products/auto-sku?department=${encodeURIComponent(department)}&category=${encodeURIComponent(category)}`)
    return result.sku
  } catch (e) {
    return null
  }
}

// ─── PKR Currency Formatting ────────────────────────────
export function formatPKR(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-PK')
}

// ─── Invoice Generation ─────────────────────────────────
export function generateInvoice(order) {
  const settings = state.settings
  const now = new Date()
  const invoiceNo = `INV-${order.id?.toUpperCase() || 'INV-' + Date.now()}`
  const date = now.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })

  const items = (order.items || []).map(item => ({
    name: item.name,
    variant: item.variant || 'Standard',
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }))

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const shipping = subtotal > (settings.shippingThreshold || 2000) ? 0 : (settings.shippingFee || 150)
  const tax = Math.round(subtotal * (settings.taxRate || 0) / 100)
  const total = subtotal + shipping + tax

  return {
    invoiceNo,
    date,
    storeName: settings.storeName || 'ANNIE',
    storeTagline: settings.storeTagline || '',
    storeAddress: settings.address || '',
    storeEmail: settings.email || '',
    storeWhatsapp: settings.whatsapp || '',
    customer: {
      name: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address ? `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.zip}` : '',
    },
    items,
    subtotal,
    shipping,
    tax,
    total,
    paymentMethod: order.paymentMethod || 'N/A',
    status: order.status || 'pending',
    orderId: order.id,
    trackingCode: order.trackingCode || '',
    createdAt: order.createdAt,
  }
}

// ─── Export Utilities ────────────────────────────────────
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  data.forEach(row => {
    const values = headers.map(h => {
      let val = row[h]
      if (val === null || val === undefined) val = ''
      if (typeof val === 'object') val = JSON.stringify(val)
      val = String(val).replace(/"/g, '""')
      return `"${val}"`
    })
    csvRows.push(values.join(','))
  })
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export function exportToJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Print Invoice ──────────────────────────────────────
export function printInvoice(order) {
  const inv = generateInvoice(order)
  const html = buildInvoiceHTML(inv)
  const win = window.open('', '_blank', 'width=800,height=600')
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 500)
}

export function buildInvoiceHTML(inv) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${inv.invoiceNo}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; padding: 0; }
  .receipt { max-width: 420px; margin: 0 auto; padding: 32px 28px; }

  /* Top brand */
  .brand { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #D4919E; }
  .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 600; color: #3D2B35; letter-spacing: 6px; text-transform: uppercase; }
  .brand-tag { font-size: 9px; color: #aaa; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
  .brand-contact { font-size: 10px; color: #999; margin-top: 6px; line-height: 1.6; }

  /* Receipt title */
  .title-section { text-align: center; margin-bottom: 24px; }
  .receipt-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: #C57D8E; letter-spacing: 3px; text-transform: uppercase; }

  /* Meta grid */
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-bottom: 24px; padding: 16px; background: #faf8f8; border-radius: 8px; }
  .meta-item { }
  .meta-label { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #C57D8E; font-weight: 600; margin-bottom: 3px; }
  .meta-value { font-size: 12px; color: #333; font-weight: 500; line-height: 1.4; }
  .meta-value.mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 1px; }

  /* Status badge */
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
  .status-pending { background: #FFF3CD; color: #856404; }
  .status-processing { background: #D1ECF1; color: #0C5460; }
  .status-shipped { background: #D4EDDA; color: #155724; }
  .status-delivered { background: #C3E6CB; color: #155724; }
  .status-cancelled { background: #F8D7DA; color: #721C24; }

  /* Items */
  .items-header { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #C57D8E; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; }
  .item-row:last-child { border-bottom: none; }
  .item-info { flex: 1; }
  .item-name { font-size: 12px; font-weight: 500; color: #222; }
  .item-detail { font-size: 10px; color: #888; margin-top: 2px; }
  .item-qty { font-size: 11px; color: #666; text-align: center; min-width: 32px; }
  .item-price { font-size: 12px; color: #333; text-align: right; min-width: 80px; font-weight: 500; }
  .item-price-unit { font-size: 9px; color: #999; display: block; margin-top: 1px; }

  /* Totals */
  .totals { margin-top: 16px; padding-top: 12px; border-top: 2px solid #3D2B35; }
  .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #666; }
  .total-row.grand { padding-top: 10px; margin-top: 6px; border-top: 1px solid #ddd; font-size: 16px; font-weight: 700; color: #3D2B35; font-family: 'Cormorant Garamond', serif; letter-spacing: 1px; }

  /* Tracking */
  .tracking-box { margin-top: 20px; padding: 16px; border: 1.5px solid #D4919E; border-radius: 8px; text-align: center; }
  .tracking-label { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #C57D8E; font-weight: 600; margin-bottom: 4px; }
  .tracking-code { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 500; color: #3D2B35; letter-spacing: 3px; }
  .tracking-note { font-size: 9px; color: #999; margin-top: 6px; line-height: 1.5; }

  /* Footer */
  .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
  .footer-msg { font-family: 'Cormorant Garamond', serif; font-size: 15px; color: #C57D8E; font-style: italic; margin-bottom: 8px; }
  .footer-contact { font-size: 9px; color: #aaa; letter-spacing: 1px; line-height: 1.6; }
  .footer-contact a { color: #C57D8E; text-decoration: none; }
  .footer-url { font-size: 9px; color: #C57D8E; margin-top: 6px; letter-spacing: 1px; }

  /* Dashed divider */
  .divider { border: none; border-top: 1px dashed #ddd; margin: 16px 0; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { padding: 20px 16px; }
  }
</style>
</head>
<body>
<div class="receipt">
  <!-- Brand -->
  <div class="brand">
    <div class="brand-name">${inv.storeName}</div>
    <div class="brand-tag">${inv.storeTagline}</div>
    ${inv.storeAddress || inv.storeEmail || inv.storeWhatsapp ? `<div class="brand-contact">${inv.storeAddress}${inv.storeAddress && inv.storeEmail ? ' · ' : ''}${inv.storeEmail}${(inv.storeAddress || inv.storeEmail) && inv.storeWhatsapp ? ' · ' : ''}${inv.storeWhatsapp}</div>` : ''}
  </div>

  <!-- Title -->
  <div class="title-section">
    <div class="receipt-title">Delivery Receipt</div>
  </div>

  <!-- Meta -->
  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Receipt No</div>
      <div class="meta-value mono">${inv.invoiceNo}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Date</div>
      <div class="meta-value">${inv.date}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Order ID</div>
      <div class="meta-value mono">${inv.orderId || 'N/A'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value"><span class="status-badge status-${inv.status}">${inv.status}</span></div>
    </div>
  </div>

  <!-- Customer -->
  <div class="meta-grid" style="background:none; border:1px solid #eee; padding:14px 16px;">
    <div class="meta-item" style="grid-column: span 2;">
      <div class="meta-label">Customer Details</div>
    </div>
    <div class="meta-item">
      <div class="meta-label" style="color:#888;">Name</div>
      <div class="meta-value">${inv.customer.name}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label" style="color:#888;">Phone</div>
      <div class="meta-value">${inv.customer.phone || 'N/A'}</div>
    </div>
    ${inv.customer.email ? `<div class="meta-item">
      <div class="meta-label" style="color:#888;">Email</div>
      <div class="meta-value">${inv.customer.email}</div>
    </div>` : ''}
    ${inv.customer.address ? `<div class="meta-item" style="grid-column: span 2;">
      <div class="meta-label" style="color:#888;">Address</div>
      <div class="meta-value">${inv.customer.address}</div>
    </div>` : ''}
  </div>

  <hr class="divider">

  <!-- Items -->
  <div class="items-header">Items Ordered</div>
  ${inv.items.map(i => `
  <div class="item-row">
    <div class="item-info">
      <div class="item-name">${i.name}</div>
      <div class="item-detail">${i.variant}</div>
    </div>
    <div class="item-qty">x${i.quantity}</div>
    <div class="item-price">
      Rs. ${i.total.toLocaleString('en-PK')}
      ${i.quantity > 1 ? `<span class="item-price-unit">@ Rs. ${i.price.toLocaleString('en-PK')} each</span>` : ''}
    </div>
  </div>`).join('')}

  <!-- Totals -->
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>Rs. ${inv.subtotal.toLocaleString('en-PK')}</span></div>
    <div class="total-row"><span>Shipping</span><span>${inv.shipping === 0 ? 'Free' : 'Rs. ' + inv.shipping.toLocaleString('en-PK')}</span></div>
    ${inv.tax > 0 ? `<div class="total-row"><span>Tax</span><span>Rs. ${inv.tax.toLocaleString('en-PK')}</span></div>` : ''}
    <div class="total-row grand"><span>Total</span><span>Rs. ${inv.total.toLocaleString('en-PK')}</span></div>
  </div>

  <!-- Payment -->
  <div style="margin-top:12px; font-size:10px; color:#888; text-align:right;">
    Payment: <strong style="color:#555;">${inv.paymentMethod}</strong>
  </div>

  <hr class="divider">

  <!-- Tracking -->
  <div class="tracking-box">
    <div class="tracking-label">Order Tracking Code</div>
    <div class="tracking-code">${inv.trackingCode || 'N/A'}</div>
    <div class="tracking-note">Track your order at anniepk.com/track<br>or use the tracking section on our homepage</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-msg">Thank you for choosing ${inv.storeName}</div>
    <div class="footer-contact">
      ${inv.storeEmail ? `<a href="mailto:${inv.storeEmail}">${inv.storeEmail}</a>` : ''}
      ${inv.storeEmail && inv.storeWhatsapp ? ' · ' : ''}
      ${inv.storeWhatsapp ? `<a href="https://wa.me/${inv.storeWhatsapp.replace(/[^0-9]/g, '')}">${inv.storeWhatsapp}</a>` : ''}
    </div>
  </div>
</div>
</body>
</html>`
}

// ─── Initial Data Load ──────────────────────────────────
export async function loadAllData() {
  await Promise.all([fetchProducts(), fetchCollections(), fetchCategories(), fetchSettings()])
}
