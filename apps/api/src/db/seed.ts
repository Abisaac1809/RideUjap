import { auth } from "../modules/auth/auth";
import { client, db } from "./index";
import {
  account,
  driverProfile,
  reservations,
  session,
  trips,
  user,
  vehicle,
  verification,
  type NewDriverProfile,
  type NewReservation,
  type NewTrip,
  type NewVehicle,
} from "./schema";

type DemoUser = {
  email: string;
  password: string;
  name: string;
  phone: string;
  image?: string;
};

const demoUsers: DemoUser[] = [
  {
    email: "ana@ujap.edu.ve",
    password: "password123",
    name: "Ana González",
    phone: "+584141234567",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    email: "bruno@ujap.edu.ve",
    password: "password123",
    name: "Bruno Pérez",
    phone: "+584249876543",
  },
  {
    email: "carla@ujap.edu.ve",
    password: "password123",
    name: "Carla Rodríguez",
    phone: "+584125550000",
  },
  // Sin reservas ni viajes: es el pasajero libre para probar los casos de
  // rechazo (viaje lleno, solicitud rechazada) sin tocar los datos de arriba.
  {
    email: "diego@ujap.edu.ve",
    password: "password123",
    name: "Diego Salas",
    phone: "+584267778899",
  },
];

function tomorrowAt(hh: number, mm: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function yesterdayAt(hh: number, mm: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hh, mm, 0, 0);
  return d;
}

async function main() {
  await db.delete(reservations);
  await db.delete(trips);
  await db.delete(vehicle);
  await db.delete(driverProfile);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);

  const ids: string[] = [];
  for (const u of demoUsers) {
    const res = await auth.api.signUpEmail({
      body: {
        email: u.email,
        password: u.password,
        name: u.name,
        phone: u.phone,
        ...(u.image ? { image: u.image } : {}),
      },
    });
    ids.push(res.user.id);
  }

  const [ana, bruno, carla] = ids as [string, string, string, string];

  // diego se queda solo como pasajero, para probar los flujos sin perfil de conductor.
  const demoDriverProfiles: NewDriverProfile[] = [
    { userId: ana, licenseNumber: "V-12345678", licenseExpiry: "2028-06-30" },
    { userId: bruno, licenseNumber: "V-23456789", licenseExpiry: "2027-11-15" },
    { userId: carla, licenseNumber: "V-34567890", licenseExpiry: "2026-09-01" },
  ];
  const insertedDriverProfiles = await db
    .insert(driverProfile)
    .values(demoDriverProfiles)
    .returning();

  const driverProfileByUserId = new Map(insertedDriverProfiles.map((p) => [p.userId, p]));

  const demoVehicles: NewVehicle[] = [
    {
      driverProfileId: driverProfileByUserId.get(ana)!.id,
      make: "Toyota",
      model: "Corolla",
      year: 2019,
      color: "Blanco",
      plate: "AB123CD",
      seats: 4,
    },
    {
      driverProfileId: driverProfileByUserId.get(bruno)!.id,
      make: "Chevrolet",
      model: "Aveo",
      year: 2016,
      color: "Gris",
      plate: "CD456EF",
      seats: 4,
    },
    {
      driverProfileId: driverProfileByUserId.get(carla)!.id,
      make: "Ford",
      model: "Fiesta",
      year: 2021,
      color: "Rojo",
      plate: "EF789GH",
      seats: 4,
    },
  ];
  await db.insert(vehicle).values(demoVehicles);

  const demoTrips: NewTrip[] = [
    {
      driverId: ana,
      direction: "inbound",
      pointLat: 10.2402,
      pointLng: -68.0201,
      pointText: "Naguanagua — Av. Universidad",
      departureTime: tomorrowAt(6, 45),
      totalSeats: 3,
      availableSeats: 3,
      admissionMode: "auto",
      farePerPassenger: "210.00",
    },
    {
      driverId: ana,
      direction: "outbound",
      pointLat: 10.2745,
      pointLng: -67.9412,
      pointText: "San Diego — Los Molinos",
      departureTime: tomorrowAt(12, 30),
      totalSeats: 4,
      availableSeats: 4,
      admissionMode: "request",
      farePerPassenger: "140.00",
    },
    {
      driverId: bruno,
      direction: "outbound",
      pointLat: 10.1621,
      pointLng: -68.0077,
      pointText: "Valencia — Av. Bolívar Norte",
      departureTime: tomorrowAt(18, 0),
      totalSeats: 2,
      availableSeats: 2,
      admissionMode: "auto",
      farePerPassenger: null,
    },
    // Un solo puesto libre: sirve para probar dos reservas simultáneas.
    {
      driverId: bruno,
      direction: "inbound",
      pointLat: 10.1801,
      pointLng: -68.0043,
      pointText: "Valencia — La Viña",
      departureTime: tomorrowAt(7, 15),
      totalSeats: 1,
      availableSeats: 1,
      admissionMode: "auto",
      farePerPassenger: "180.00",
    },
    // Viaje lleno: no debe aceptar más reservas.
    {
      driverId: carla,
      direction: "outbound",
      pointLat: 10.2531,
      pointLng: -67.9987,
      pointText: "Naguanagua — Terrazas de Guaparo",
      departureTime: tomorrowAt(17, 30),
      totalSeats: 2,
      availableSeats: 0,
      admissionMode: "auto",
      farePerPassenger: "200.00",
    },
    // Viaje pasado: aparece en el historial de "mis viajes".
    {
      driverId: ana,
      direction: "inbound",
      pointLat: 10.2402,
      pointLng: -68.0201,
      pointText: "Naguanagua — Av. Universidad",
      departureTime: yesterdayAt(7, 0),
      totalSeats: 3,
      availableSeats: 2,
      admissionMode: "auto",
      farePerPassenger: "210.00",
      status: "completed",
    },
  ];

  const insertedTrips = await db.insert(trips).values(demoTrips).returning();

  const demoReservations: NewReservation[] = [
    { tripId: insertedTrips[0]!.id, passengerId: carla, status: "enrolled" },
    { tripId: insertedTrips[1]!.id, passengerId: carla, status: "requested" },
    { tripId: insertedTrips[1]!.id, passengerId: bruno, status: "rejected" },
    { tripId: insertedTrips[4]!.id, passengerId: ana, status: "enrolled" },
    { tripId: insertedTrips[4]!.id, passengerId: bruno, status: "enrolled" },
    { tripId: insertedTrips[5]!.id, passengerId: carla, status: "enrolled" },
  ];
  await db.insert(reservations).values(demoReservations);

  console.log(
    `Seed done: ${ids.length} users, ${insertedDriverProfiles.length} drivers, ${insertedTrips.length} trips, ${demoReservations.length} reservations.`,
  );
  await client.end();
}

main().catch(async (err) => {
  console.error("Seed error:", err);
  await client.end();
  process.exit(1);
});
