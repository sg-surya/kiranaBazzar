import { UserProfile, Product, Order } from '../types';

/**
 * Backend API HTTP proxy service layer.
 * Keeps all Firebase credentials and keys 100% on the server side to protect user secrets.
 */

export async function signInWithPhone(phone: string): Promise<UserProfile> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Authentication failed. Please verify connection.');
  }

  return response.json();
}

export async function registerWithPhone(profileData: Omit<UserProfile, 'uid' | 'createdAt'>): Promise<UserProfile> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Registration failed.');
  }

  return response.json();
}

/**
 * Signs out the currently authenticated user session.
 */
export async function logOutUser(): Promise<void> {
  // Pure client side session reset as server operates statelessly
  return Promise.resolve();
}

/**
 * Updates an existing user's approval status or profile details.
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const response = await fetch('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, updates })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to update user profile.');
  }
}

/**
 * Deletes a single user account from the backend database.
 */
export async function deleteSingleUserFromDb(uid: string): Promise<void> {
  const response = await fetch(`/api/users/${uid}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to erase user profile.');
  }
}

/**
 * Adds a new product to the wholesale catalog.
 */
export async function addProductToDb(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to register product.');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Updates an existing product's catalog details.
 */
export async function updateProductInDb(productId: string, updates: Partial<Product>): Promise<void> {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to update product listings.');
  }
}

/**
 * Deletes a product representation from the marketplace.
 */
export async function deleteProductFromDb(productId: string): Promise<void> {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to remove SKU listing.');
  }
}

/**
 * Places an order securely inside the database.
 */
export async function placeOrderInDb(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to place wholesale order.');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Updates status or other fields of an existing wholesale order.
 */
export async function updateOrderInDb(orderId: string, status: Order['status']): Promise<void> {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to update order status.');
  }
}

/**
 * Admin action: delete all orders bulk.
 */
export async function deleteAllOrdersFromDb(): Promise<void> {
  const response = await fetch('/api/admin/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'orders' })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to clear orders database.');
  }
}

/**
 * Admin action: delete all products bulk.
 */
export async function deleteAllProductsFromDb(): Promise<void> {
  const response = await fetch('/api/admin/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'products' })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to clear products database.');
  }
}

/**
 * Admin action: delete all users (except owner) bulk.
 */
export async function deleteUsersFromDb(): Promise<void> {
  const response = await fetch('/api/admin/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'users' })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to flush user registers.');
  }
}
