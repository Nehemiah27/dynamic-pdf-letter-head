
import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './db.js';
import { ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mapId = (entity) => {
  if (!entity) return entity;
  const { _id, ...rest } = entity;
  return { ...rest, id: _id.toString() };
};

async function seedDatabase() {
  const db = await connectToDatabase();
  
  // Seed Default Admin User
  const adminUser = await db.collection('users').findOne({ email: 'admin@reviranexgen.com' });
  if (!adminUser) {
    console.log('Seeding master administrator: admin@reviranexgen.com');
    await db.collection('users').insertOne({
      name: 'Hareram Sharma',
      email: 'admin@reviranexgen.com',
      role: 'Administrator',
      createdAt: new Date().toISOString()
    });
  }

  // Seed Initial Branding
  const brandingCount = await db.collection('branding').countDocuments();
  if (brandingCount === 0) {
    console.log('Generating initial branding profile...');
    await db.collection('branding').insertOne({
      logo: 'https://reviranexgen.com/assets/logo-with-name.png', 
      logoBackgroundColor: '#ffffff',
      headerText: 'Blueprint of Commitment - Client Delight.',
      footerText: 'This is a computer generated document.',
      brandColor: '#2E3191',
      registry: {
        name: 'Revira nexGen Structures Pvt. Ltd.',
        cin: 'U16222DL2025PTC459465',
        email: 'info@reviranexgen.com',
        website: 'www.reviranexgen.com',
        regionalAddress: 'Plot No. 302, 3rd Floor Rajat Residency, Nagpur',
        headOfficeAddress: '28, E2 Block, Shivram Park Nangloi Delhi - 110041',
        nagpurOffice: 'Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023',
        delhiOffice: '28, E2 Block, Shivram Park Nangloi Delhi - 110041',
        phone1: '+91 839 049 1843',
        phone2: '+91 99684 22442'
      }
    });
  }

  // Seed Default DB Config
  const configCount = await db.collection('dbConfig').countDocuments();
  if (configCount === 0) {
    console.log('Initializing system DB orchestration...');
    await db.collection('dbConfig').insertOne({
      uri: 'mongodb://localhost:27017',
      dbName: 'revira_nexgen_erp',
      apiEndpoint: `http://localhost:${PORT}/revira/api`,
      status: 'Connected',
      lastSync: new Date().toISOString()
    });
  }
}

app.post('/api/auth/login', async (req, res) => {
  console.log('recd')
  try {
    const { email, pass } = req.body;
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    console.log(user)

    if (user && pass === 'admin@123') {
      const token = `jwt_${new ObjectId().toString()}`;
      res.json({ user: mapId(user), token });
    } else {
      res.status(401).json({ message: 'Authorization Failure: Invalid credentials' });
    }
  } catch (error) {
    console.error('API Logic Exception:', error);
    res.status(503).json({ message: 'Service Temporarily Unavailable: Database Link Fault' });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [users, clients, projects, quotations, branding, dbConfig] = await Promise.all([
      db.collection('users').find().toArray(),
      db.collection('clients').find().toArray(),
      db.collection('projects').find().toArray(),
      db.collection('quotations').find().toArray(),
      db.collection('branding').findOne({}),
      db.collection('dbConfig').findOne({})
    ]);

    res.json({
      users: users.map(mapId),
      clients: clients.map(mapId),
      projects: projects.map(mapId),
      quotations: quotations.map(mapId),
      branding: branding ? mapId(branding) : {},
      dbConfig: dbConfig ? mapId(dbConfig) : {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to synchronize with backend registry' });
  }
});

const collections = ['clients', 'projects', 'quotations', 'users'];
collections.forEach(coll => {
  app.post(`/api/${coll}`, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const result = await db.collection(coll).insertOne({ ...req.body, createdAt: new Date().toISOString() });
      const saved = await db.collection(coll).findOne({ _id: result.insertedId });
      res.json(mapId(saved));
    } catch (e) {
      res.status(500).json({ error: 'Create Operation Fault' });
    }
  });

  app.put(`/api/${coll}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await connectToDatabase();
      await db.collection(coll).updateOne({ _id: new ObjectId(id) }, { $set: req.body });
      const updated = await db.collection(coll).findOne({ _id: new ObjectId(id) });
      res.json(mapId(updated));
    } catch (e) {
      res.status(500).json({ error: 'Update Operation Fault' });
    }
  });

  app.delete(`/api/${coll}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await connectToDatabase();
      await db.collection(coll).deleteOne({ _id: new ObjectId(id) });
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: 'Delete Operation Fault' });
    }
  });
});

app.put('/api/branding', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('branding').updateOne({}, { $set: req.body }, { upsert: true });
    const updated = await db.collection('branding').findOne({});
    res.json(mapId(updated));
  } catch (e) {
    res.status(500).json({ error: 'Branding Registry Fault' });
  }
});

async function startServer() {
  try {
    console.log('Initializing Revira nexGen Registry...');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`[SYS] Uplink Established: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.warn('[!] INFRASTRUCTURE WARNING: Real-time database unavailable. Seeding skipped.');
    app.listen(PORT, () => console.log(`[SYS] API Started in Edge Simulation Mode on Port ${PORT}`));
  }
}

startServer();
