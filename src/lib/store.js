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
<title>Invoice ${inv.invoiceNo}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #222; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #D4919E; padding-bottom: 24px; }
  .brand h1 { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 600; color: #3D2B35; letter-spacing: 4px; }
  .brand p { font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
  .inv-meta { text-align: right; }
  .inv-meta h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #C57D8E; letter-spacing: 2px; }
  .inv-meta p { font-size: 12px; color: #666; margin-top: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 36px; }
  .party-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C57D8E; margin-bottom: 8px; font-weight: 600; }
  .party-name { font-size: 15px; font-weight: 500; }
  .party-detail { font-size: 13px; color: #555; line-height: 1.6; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #3D2B35; color: #3D2B35; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; padding: 12px 16px; text-align: left; }
  th:last-child, th:nth-child(3), th:nth-child(4) { text-align: right; }
  td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 13px; }
  td:last-child, td:nth-child(3), td:nth-child(4) { text-align: right; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
  .totals-box { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #555; }
  .totals-row.total { border-top: 2px solid #D4919E; padding-top: 12px; margin-top: 4px; font-size: 18px; font-weight: 600; color: #3D2B35; }
  .footer { text-align: center; padding-top: 24px; border-top: 1px solid #eee; }
  .footer p { font-size: 11px; color: #999; line-height: 1.8; }
  .footer a { color: #C57D8E; text-decoration: none; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  .status-pending { background: #FFF3CD; color: #856404; }
  .status-processing { background: #D1ECF1; color: #0C5460; }
  .status-shipped { background: #D4EDDA; color: #155724; }
  .status-delivered { background: #C3E6CB; color: #155724; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>${inv.storeName}</h1>
    <p>${inv.storeTagline}</p>
  </div>
  <div class="inv-meta">
    <h2>INVOICE</h2>
    <p>${inv.invoiceNo}</p>
    <p>${inv.date}</p>
    <p style="margin-top:8px"><span class="status-badge status-${inv.status}">${inv.status}</span></p>
  </div>
</div>
<div class="parties">
  <div>
    <div class="party-label">From</div>
    <div class="party-name">${inv.storeName}</div>
    <div class="party-detail">${inv.storeAddress}<br>${inv.storeEmail}<br>${inv.storeWhatsapp}</div>
  </div>
  <div>
    <div class="party-label">Bill To</div>
    <div class="party-name">${inv.customer.name}</div>
    <div class="party-detail">
      ${inv.customer.phone}${inv.customer.email ? '<br>' + inv.customer.email : ''}
      ${inv.customer.address ? '<br>' + inv.customer.address : ''}
    </div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Variant</th>
      <th>Qty</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    ${inv.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.variant}</td>
      <td>${i.quantity}</td>
      <td>Rs. ${i.price.toLocaleString('en-PK')}</td>
      <td>Rs. ${i.total.toLocaleString('en-PK')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>Rs. ${inv.subtotal.toLocaleString('en-PK')}</span></div>
    <div class="totals-row"><span>Shipping</span><span>${inv.shipping === 0 ? 'Free' : 'Rs. ' + inv.shipping.toLocaleString('en-PK')}</span></div>
    ${inv.tax > 0 ? `<div class="totals-row"><span>Tax</span><span>Rs. ${inv.tax.toLocaleString('en-PK')}</span></div>` : ''}
    <div class="totals-row total"><span>Total</span><span>Rs. ${inv.total.toLocaleString('en-PK')}</span></div>
  </div>
</div>
<div class="footer">
  <p>Payment Method: <strong>${inv.paymentMethod}</strong></p>
  <p style="margin-top:12px">Thank you for shopping with ${inv.storeName}!</p>
  <p>${inv.storeEmail} · ${inv.storeWhatsapp}</p>
</div>
</body>
</html>`
}

// ─── Initial Data Load ──────────────────────────────────
export async function loadAllData() {
  await Promise.all([fetchProducts(), fetchCollections(), fetchCategories(), fetchSettings()])
}
