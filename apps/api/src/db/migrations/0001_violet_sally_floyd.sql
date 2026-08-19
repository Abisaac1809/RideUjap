CREATE UNIQUE INDEX "reservations_trip_passenger_active_uidx" ON "reservations" USING btree ("trip_id","passenger_id") WHERE "reservations"."status" <> 'rejected';--> statement-breakpoint
CREATE INDEX "reservations_passenger_idx" ON "reservations" USING btree ("passenger_id");--> statement-breakpoint
CREATE INDEX "reservations_trip_idx" ON "reservations" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trips_driver_idx" ON "trips" USING btree ("driver_id");