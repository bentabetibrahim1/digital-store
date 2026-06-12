import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// ── Products ───────────────────────────────────────────────────────────────

export async function fetchProducts() {
  const snap = await getDocs(collection(db, 'products'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addProduct(data) {
  const ref = await addDoc(collection(db, 'products'), data)
  return { id: ref.id, ...data }
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, 'products', id), data)
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id))
}

// ── Orders ─────────────────────────────────────────────────────────────────

export async function placeOrder(orderData) {
  const ref = await addDoc(collection(db, 'orders'), orderData)
  return ref.id
}

export async function fetchOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ docId: d.id, ...d.data() }))
}

export async function updateOrderStatus(docId, status) {
  await updateDoc(doc(db, 'orders', docId), { status })
}

export async function deliverOrder(docId, deliveryContent) {
  await updateDoc(doc(db, 'orders', docId), {
    status: 'delivered',
    deliveryContent,
    deliveredAt: new Date().toISOString(),
  })
}

export function watchOrder(orderId, callback) {
  const q = query(collection(db, 'orders'), where('orderId', '==', orderId))
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null)
    } else {
      callback({ docId: snap.docs[0].id, ...snap.docs[0].data() })
    }
  })
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function adminSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function adminSignOut() {
  return signOut(auth)
}
