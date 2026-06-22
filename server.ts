import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';

const PORT = 3000;
const app = express();
app.use(express.json());

// Resolve config securely from server-side filesystem
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  console.warn("firebase-applet-config.json not found. Database operations will fail.");
}

// Initialize Firebase App securely in backend runtime
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

// SEEDED Baseline products to auto-populate if Firestore is empty
const BASELINE_PRODUCTS = [
  {
    skuCode: 'OIL-1L-SF',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    category: 'Groceries',
    originalPrice: 160,
    price: 135,
    unit: 'Per Pack',
    stockQuantity: 140,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    wholesalerUid: 'seller-auto-baseline',
    wholesalerName: 'Baseline Wholesalers'
  },
  {
    skuCode: 'RICE-5K-BS',
    name: 'India Gate Premium Basmati Rice Super 5Kg',
    category: 'Groceries',
    originalPrice: 650,
    price: 520,
    unit: 'Per Bag',
    stockQuantity: 80,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    wholesalerUid: 'seller-auto-baseline',
    wholesalerName: 'Baseline Wholesalers'
  },
  {
    skuCode: 'TEA-1K-TZ',
    name: 'Tata Tea Premium Blend Robust Pack 1Kg',
    category: 'Beverages',
    originalPrice: 420,
    price: 345,
    unit: 'Per Pack',
    stockQuantity: 200,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    wholesalerUid: 'seller-auto-baseline',
    wholesalerName: 'Baseline Wholesalers'
  },
  {
    skuCode: 'DET-4K-RF',
    name: 'Surf Excel Easy Wash Detergent Powder 4Kg',
    category: 'Cleaning',
    originalPrice: 580,
    price: 495,
    unit: 'Per Pack',
    stockQuantity: 110,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    wholesalerUid: 'seller-auto-baseline',
    wholesalerName: 'Baseline Wholesalers'
  }
];

// Helper to seed products if empty
async function autoSeedProductsIfEmpty() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log("Seeding baseline Products catalog to Firestore DB...");
      for (const prod of BASELINE_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: new Date().toISOString()
        });
      }
      console.log("Seeding finished successfully.");
    }
  } catch (error) {
    console.error("Auto seeding failed:", error);
  }
}

// REST API Endpoints

// Synchronous full sync endpoint
app.get('/api/sync', async (req, res, next) => {
  try {
    // Sync Users
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(docSnap => ({ uid: docSnap.id, ...docSnap.data() }));

    // Sync Products
    const productsSnap = await getDocs(collection(db, 'products'));
    let products = productsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    // If Firestore has empty products on server startup, trigger background seeding
    if (products.length === 0) {
      await autoSeedProductsIfEmpty();
      const reSnap = await getDocs(collection(db, 'products'));
      products = reSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    }

    // Sync Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const orders = ordersSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    res.json({ users, products, orders });
  } catch (error: any) {
    next(error);
  }
});

// Auth Login endpoint (direct Firestore lookup bypassing Auth SDK to eliminate providers state)
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    const trimmedPhone = phone.trim();

    // Check users by listing
    const usersSnap = await getDocs(collection(db, 'users'));
    const usersList = usersSnap.docs.map(docSnap => ({ uid: docSnap.id, ...docSnap.data() }) as any);
    const user = usersList.find((u: any) => u.phone === trimmedPhone);

    if (user) {
      return res.json(user);
    }

    // Auto-bootstrap Rajesh Kumar Owner account if it is matches
    if (trimmedPhone === '9999911111') {
      const uid = 'owner-rajesh-kumar-uid';
      const ownerProfile = {
        uid,
        name: 'Rajesh Kumar (Owner)',
        phone: '9999911111',
        whatsapp: '9999911111',
        address: 'Main Wholesale Market Area, Block-C, Delhi',
        pincode: '110006',
        role: 'Owner',
        approvalStatus: 'approved',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uid), ownerProfile);
      return res.json(ownerProfile);
    }

    // Number not registered
    return res.status(404).json({ error: 'This number is not registered on KirranaBazzar. Please create a business account first.' });
  } catch (error: any) {
    next(error);
  }
});

// Auth Registration
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const profileData = req.body;
    if (!profileData.phone || profileData.phone.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    }

    const trimmedPhone = profileData.phone.trim();

    // Ensure no duplication
    const usersSnap = await getDocs(collection(db, 'users'));
    const dupe = usersSnap.docs.some(docSnap => (docSnap.data() as any).phone === trimmedPhone);
    if (dupe) {
      return res.status(400).json({ error: 'This mobile number is already registered. Please go back and log in.' });
    }

    const uid = 'user-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    const profile = {
      ...profileData,
      uid,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), profile);
    res.json(profile);
  } catch (error: any) {
    next(error);
  }
});

// Update standard user profile
app.post('/api/users/update', async (req, res, next) => {
  try {
    const { uid, updates } = req.body;
    await updateDoc(doc(db, 'users', uid), updates);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Admin erase single user node
app.delete('/api/users/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    await deleteDoc(doc(db, 'users', uid));
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Products CRUD
app.post('/api/products', async (req, res, next) => {
  try {
    const product = req.body;
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date().toISOString()
    });
    res.json({ id: docRef.id });
  } catch (error: any) {
    next(error);
  }
});

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await updateDoc(doc(db, 'products', id), updates);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, 'products', id));
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Orders CRUD
app.post('/api/orders', async (req, res, next) => {
  try {
    const order = req.body;
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: new Date().toISOString()
    });
    res.json({ id: docRef.id });
  } catch (error: any) {
    next(error);
  }
});

app.put('/api/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateDoc(doc(db, 'orders', id), { status });
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Admin batch operations
app.post('/api/admin/bulk-delete', async (req, res, next) => {
  try {
    const { type } = req.body;
    if (type === 'orders') {
      const snap = await getDocs(collection(db, 'orders'));
      const promises = snap.docs.map(docSnap => deleteDoc(doc(db, 'orders', docSnap.id)));
      await Promise.all(promises);
    } else if (type === 'products') {
      const snap = await getDocs(collection(db, 'products'));
      const promises = snap.docs.map(docSnap => deleteDoc(doc(db, 'products', docSnap.id)));
      await Promise.all(promises);
    } else if (type === 'users') {
      const snap = await getDocs(collection(db, 'users'));
      // Keep owner account Rajesh Kumar preserves
      const uu = snap.docs.filter(d => (d.data() as any).phone !== '9999911111');
      const promises = uu.map(d => deleteDoc(doc(db, 'users', d.id)));
      await Promise.all(promises);
    }
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Global API error logger
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Express App Engine Error:", err);
  res.status(500).json({ error: err.message || 'System operation failure' });
});

async function bootstrapServer() {
  // Serve frontend assets using standard ESM Node config
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`B2B Portal running secure local port: http://localhost:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error("Bootstrap error:", err);
});
