import { auth } from "../auth/auth";
import { client, db } from "./index";
import {
  account,
  reservations,
  session,
  trips,
  user,
  verification,
  type NewReservation,
  type NewTrip,
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
];

function tomorrowAt(hh: number, mm: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hh, mm, 0, 0);
  return d;
}

async function main() {
  await db.delete(reservations);
  await db.delete(trips);
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

  const [ana, bruno, carla] = ids as [string, string, string];

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
  ];

  const insertedTrips = await db.insert(trips).values(demoTrips).returning();

  const demoReservations: NewReservation[] = [
    { tripId: insertedTrips[0]!.id, passengerId: carla, status: "enrolled" },
    { tripId: insertedTrips[1]!.id, passengerId: carla, status: "requested" },
  ];
  await db.insert(reservations).values(demoReservations);

  console.log(
    `Seed done: ${ids.length} users, ${insertedTrips.length} trips, ${demoReservations.length} reservations.`,
  );
  await client.end();
}

main().catch(async (err) => {
  console.error("Seed error:", err);
  await client.end();
  process.exit(1);
});
