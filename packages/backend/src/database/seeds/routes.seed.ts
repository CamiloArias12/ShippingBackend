import mysql from 'mysql2/promise';

export async function seedRoutes(db: mysql.Connection): Promise<void> {
  
  const routes = [
    {
      name: 'CDMX - Guadalajara',
      origin: 'Ciudad de México',
      destination: 'Guadalajara, Jalisco',
      distance: 552.8,
      estimated_time: 360 
    },
    {
      name: 'CDMX - Monterrey',
      origin: 'Ciudad de México',
      destination: 'Monterrey, Nuevo León',
      distance: 906.5,
      estimated_time: 600
    },
    {
      name: 'Guadalajara - Monterrey',
      origin: 'Guadalajara, Jalisco',
      destination: 'Monterrey, Nuevo León',
      distance: 784.3,
      estimated_time: 480 
    },
    {
      name: 'CDMX - Puebla',
      origin: 'Ciudad de México',
      destination: 'Puebla, Puebla',
      distance: 135.7,
      estimated_time: 120 
    },
    {
      name: 'Guadalajara - Puerto Vallarta',
      origin: 'Guadalajara, Jalisco',
      destination: 'Puerto Vallarta, Jalisco',
      distance: 307.9,
      estimated_time: 300 
    }
  ];

  for (const route of routes) {
    try {
      const [exists] = await db.execute(
        'SELECT id FROM route WHERE name = ?',
        [route.name]
      );

      if (Array.isArray(exists) && exists.length > 0) {
        console.log(`Route ${route.name} already exists, skipping`);
        continue;
      }

      await db.execute(
        `INSERT INTO route 
        (name, origin, destination, distance, estimated_time) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          route.name, 
          route.origin, 
          route.destination, 
          route.distance, 
          route.estimated_time
        ]
      );
      
      console.log(`Inserted route: ${route.name}`);
    } catch (error) {
      console.error(`Error seeding route ${route.name}:`, error);
    }
  }
  
  console.log('Routes seeding completed');
}