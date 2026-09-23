/**
 * @file tracking.model.js
 * @description Bus Live Tracking Database Operations Model (Mapped to match TrackingInfo Interface)
 */

import db from '../database/db.js';

export default class Tracking {
  /**
   * Database row ko TrackingInfo interface ke mutabiq format karne ke liye helper function
   */
  static formatTrackingData(row) {
    if (!row) return null;
    return {
      id: row.id.toString(),
      busId: row.busId ? row.busId.toString() : '',
      busNumber: row.busNumber || '',
      scheduleId: row.scheduleId ? row.scheduleId.toString() : '',
      driverName: row.driverName || 'Unassigned Driver',
      driverPhone: row.driverPhone || 'N/A',
      routeOrigin: row.routeOrigin || 'Origin',
      routeDestination: row.routeDestination || 'Destination',
      currentLocation: {
        lat: row.latitude ? parseFloat(row.latitude) : 24.8607,
        lng: row.longitude ? parseFloat(row.longitude) : 67.0011
      },
      currentCity: row.currentCity || 'Karachi',
      speedKmH: row.speedKmH ? parseFloat(row.speedKmH) : 0,
      heading: row.heading ? parseInt(row.heading, 10) : 0,
      estimatedArrivalTime: row.estimatedArrivalTime || '15 mins',
      distanceRemainingKm: row.distanceRemainingKm ? parseFloat(row.distanceRemainingKm) : 12,
      status: row.status || 'On Time',
      lastUpdated: row.lastUpdated || new Date().toISOString()
    };
  }

  /**
   * Sabhi buses ki live locations fetch karne ke liye
   */
  static async getAllLiveLocations() {
    const [rows] = await db.execute(`
      SELECT 
        t.bus_id AS id, 
        b.id AS busId,
        b.bus_number AS busNumber, 
        b.bus_type AS busType,
        t.latitude, 
        t.longitude, 
        t.speed AS speedKmH, 
        t.heading, 
        t.updated_at AS lastUpdated,
        COALESCE(sc.city_name, 'Karachi') AS routeOrigin,
        COALESCE(dc.city_name, 'Sukkur') AS routeDestination,
        COALESCE(s.status, 'On Time') AS status,
        COALESCE(u.full_name, 'Active Driver') AS driverName,
        u.phone_number AS driverPhone,
        s.id AS scheduleId,
        '12' AS distanceRemainingKm,
        '15 mins' AS estimatedArrivalTime,
        COALESCE(sc.city_name, 'Karachi') AS currentCity
      FROM bus_live_tracking t
      JOIN buses b ON t.bus_id = b.id
      LEFT JOIN schedules s ON b.id = s.bus_id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN cities sc ON r.source_city_id = sc.id
      LEFT JOIN cities dc ON r.destination_city_id = dc.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
    `);
    
    return rows.map(row => this.formatTrackingData(row));
  }

  /**
   * Kisi specific bus ki live location fetch karne ke liye
   */
  static async getBusLocationById(busId) {
    const [rows] = await db.execute(`
      SELECT 
        t.bus_id AS id, 
        b.id AS busId,
        b.bus_number AS busNumber, 
        b.bus_type AS busType,
        t.latitude, 
        t.longitude, 
        t.speed AS speedKmH, 
        t.heading, 
        t.updated_at AS lastUpdated,
        COALESCE(sc.city_name, 'Karachi') AS routeOrigin,
        COALESCE(dc.city_name, 'Sukkur') AS routeDestination,
        COALESCE(s.status, 'On Time') AS status,
        COALESCE(u.full_name, 'Active Driver') AS driverName,
        u.phone_number AS driverPhone,
        s.id AS scheduleId,
        '12' AS distanceRemainingKm,
        '15 mins' AS estimatedArrivalTime,
        COALESCE(sc.city_name, 'Karachi') AS currentCity
      FROM bus_live_tracking t
      JOIN buses b ON t.bus_id = b.id
      LEFT JOIN schedules s ON b.id = s.bus_id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN cities sc ON r.source_city_id = sc.id
      LEFT JOIN cities dc ON r.destination_city_id = dc.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE t.bus_id = ?
    `, [busId]);
    
    return rows[0] ? this.formatTrackingData(rows[0]) : null;
  }

  /**
   * Bus ki GPS location update ya insert karne ke liye
   */
  static async updateLocation(busId, data) {
    const { latitude, longitude, speed, heading } = data;
    
    const [existing] = await db.execute('SELECT id FROM bus_live_tracking WHERE bus_id = ?', [busId]);

    if (existing.length > 0) {
      const query = `
        UPDATE bus_live_tracking 
        SET latitude = ?, longitude = ?, speed = ?, heading = ?
        WHERE bus_id = ?
      `;
      const [result] = await db.execute(query, [latitude, longitude, speed || 0, heading || null, busId]);
      return result;
    } else {
      const query = `
        INSERT INTO bus_live_tracking (bus_id, latitude, longitude, speed, heading) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [busId, latitude, longitude, speed || 0, heading || null]);
      return result;
    }
  }
}