/**
 * @file schedule.model.js
 * @description Schedule Database Operations Model (Fixed & Cleaned)
 */

import db from '../database/db.js';

class ScheduleModel {

  // Helper function: MySQL rows ko Frontend ke format ke mutabiq map karna
  static #mapToFrontendFormat(row) {
    if (!row) return null;
    
    let depDate = '';
    let depTime = '';
    if (row.departure_datetime) {
      const dt = new Date(row.departure_datetime);
      depDate = dt.toISOString().split('T')[0]; // "YYYY-MM-DD"
      depTime = dt.toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"
    }

    let arrTime = '';
    if (row.arrival_datetime) {
      const dt = new Date(row.arrival_datetime);
      arrTime = dt.toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"
    }

    // Route name handle karna
    let computedRouteName = row.route_name || 'N/A';
    let depCity = '';
    let arrCity = '';
    
    // Agar route_name "Karachi to Sukkur" ya similar format mein hai toh unhein split kar lo
    if (computedRouteName) {
       const parts = computedRouteName.split(/ to | - | ➔ /i);
       if(parts.length >= 2) {
            depCity = parts[0].trim();
            arrCity = parts[1].trim();
       } else {
            depCity = computedRouteName;
            arrCity = '';
       }
    }

    return {
      id: row.id?.toString(),
      scheduleCode: row.schedule_code || `SCH-${row.id}`,
      
      // Bus details mapping
      busId: row.bus_id?.toString(),
      busNumber: row.bus_number || 'N/A',
      busType: row.bus_type || 'Standard',
      
      // Route details mapping
      routeId: row.route_id?.toString(),
      routeName: computedRouteName,
      
      // Driver details mapping (Name aur Phone dono)
      driverId: row.driver_id?.toString() || undefined,
      driverName: row.driver_name || 'Unassigned',
      driverPhone: row.driver_phone || 'N/A', 
      
      // Travel routing & timing mapping
      departureCity: depCity,
      arrivalCity: arrCity,
      departureDate: depDate,
      departureTime: depTime,
      arrivalTime: arrTime,
      
      // Pricing aur Seat capacity
      fare: parseFloat(row.fare) || 0,
      totalSeats: row.total_seats || 50,
      availableSeats: row.available_seats ?? 50,
      
      // Operational Status
      status: row.status || 'Scheduled',
      created_at: row.created_at
    };
  }

  // 1. Get all schedules (Fixed query without missing columns)
  static async getAll() {
    const query = `
      SELECT s.*, 
             b.bus_number, b.bus_type, b.total_seats,
             r.route_name,
             COALESCE(u.full_name, 'Unassigned') AS driver_name,
             u.phone_number AS driver_phone
      FROM schedules s
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY s.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows.map(row => this.#mapToFrontendFormat(row));
  }

  // 2. Get schedule by ID (Fixed query)
  static async getById(id) {
    const query = `
      SELECT s.*, 
             b.bus_number, b.bus_type, b.total_seats,
             r.route_name,
             COALESCE(u.full_name, 'Unassigned') AS driver_name,
             u.phone_number AS driver_phone
      FROM schedules s
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE s.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] ? this.#mapToFrontendFormat(rows[0]) : null;
  }

  // 3. Create new schedule
  static async create(data) {
    const {
      bus_id, busId,
      route_id, routeId,
      driver_id, driverId,
      departure_datetime,
      arrival_datetime,
      fare,
      available_seats,
      status = 'Scheduled'
    } = data;

    const finalBusId = bus_id || busId;
    const finalRouteId = route_id || routeId;
    const finalDriverId = driver_id || driverId; 

    const query = `
      INSERT INTO schedules (
        bus_id, route_id, driver_id, departure_datetime, arrival_datetime, fare, available_seats, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      finalBusId, finalRouteId, finalDriverId, departure_datetime, arrival_datetime, fare, available_seats, status
    ];

    const [result] = await db.execute(query, values);
    return this.getById(result.insertId);
  }

  // 4. Update schedule
  static async update(id, data) {
    const {
      bus_id, busId,
      route_id, routeId,
      driver_id, driverId,
      departure_datetime,
      arrival_datetime,
      fare,
      available_seats,
      status
    } = data;

    const finalBusId = bus_id || busId;
    const finalRouteId = route_id || routeId;
    const finalDriverId = driver_id || driverId;

    const query = `
      UPDATE schedules 
      SET bus_id = COALESCE(?, bus_id),
          route_id = COALESCE(?, route_id),
          driver_id = COALESCE(?, driver_id),
          departure_datetime = COALESCE(?, departure_datetime),
          arrival_datetime = COALESCE(?, arrival_datetime),
          fare = COALESCE(?, fare),
          available_seats = COALESCE(?, available_seats),
          status = COALESCE(?, status),
          updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      finalBusId, finalRouteId, finalDriverId, departure_datetime, arrival_datetime, fare, available_seats, status, id
    ];

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0 ? this.getById(id) : null;
  }

  // 5. Delete schedule
  static async delete(id) {
    const query = `DELETE FROM schedules WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

export default ScheduleModel;