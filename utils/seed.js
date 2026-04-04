const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const users = [
      {
        employeeId: 'ADMIN001',
        name: 'System Administrator',
        email: 'admin@rinl.vizag.gov.in',
        password: 'Admin@1234',
        role: 'admin',
        department: 'IT & ERP',
        zone: 'All',
        designation: 'System Admin'
      },
      {
        employeeId: 'EIC001',
        name: 'K.N.N.S. Yadav',
        email: 'eic@rinl.vizag.gov.in',
        password: 'Eic@1234',
        role: 'eic',
        department: 'IT & ERP',
        zone: 'All',
        designation: 'Engineer-in-Charge'
      },
      {
        employeeId: 'COORD001',
        name: 'Priya Sharma',
        email: 'coordinator@rinl.vizag.gov.in',
        password: 'Coord@1234',
        role: 'coordinator',
        department: 'IT & ERP',
        zone: 'Zone-A',
        designation: 'Zone Coordinator'
      },
      {
        employeeId: 'ETL001',
        name: 'G. Sanjib Kumar',
        email: 'contractor@etl.com',
        password: 'Contractor@123',
        role: 'contractor',
        department: 'UPS Maintenance',
        zone: 'Zone-A',
        designation: 'UPS Technician'
      }
    ];

    for (const u of users) {
      const exists = await User.findOne({ employeeId: u.employeeId });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Seeded: ${u.employeeId} (${u.role})`);
      }
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = { seedAdmin };
