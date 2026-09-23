/**
 * @file route.model.js
 * @description Route Database Operations Model (MySQL with Frontend Mapping & Full Support for Fare/Stops)
 */

import db from '../database/db.js';

class RouteModel {
  /**
   * Sabhi routes ko database se fetch karne ka method (Cities table ke sath join karke)
   */
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        r.id, 
        r.route_name AS routeName,
        r.source_city_id AS sourceCityId,
        r.destination_city_id AS destinationCityId,
        sc.city_name AS origin,
        dc.city_name AS destination, 
        r.distance_km AS distanceKm,
        r.estimated_duration_minutes AS estimatedDurationMinutes,
        CONCAT(ROUND(r.estimated_duration_minutes / 60, 1), ' hours') AS estimatedHours,
        r.fare_price AS farePrice,
        r.stops,
        CASE WHEN r.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS status
      FROM routes r
      LEFT JOIN cities sc ON r.source_city_id = sc.id
      LEFT JOIN cities dc ON r.destination_city_id = dc.id
    `;
    
    const queryParams = [];
    const conditions = [];

    if (filters.search) {
      conditions.push(`r.route_name LIKE ?`);
      queryParams.push(`%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY r.id DESC`;

    const [rows] = await db.query(query, queryParams);
    
    // Stops ko JSON array ya string se parse karna agar zaroorat ho
    return rows.map(row => ({
      ...row,
      stops: row.stops ? (typeof row.stops === 'string' ? JSON.parse(row.stops) : row.stops) : []
    }));
  }

  static async getAllRoutes() {
    return this.getAll();
  }

  /**
   * ID ke zariye specific route fetch karne ka method
   */
  static async getById(id) {
    const query = `
      SELECT 
        r.id, 
        r.route_name AS routeName,
        r.source_city_id AS sourceCityId,
        r.destination_city_id AS destinationCityId,
        sc.city_name AS origin,
        dc.city_name AS destination, 
        r.distance_km AS distanceKm,
        r.estimated_duration_minutes AS estimatedDurationMinutes,
        CONCAT(ROUND(r.estimated_duration_minutes / 60, 1), ' hours') AS estimatedHours,
        r.fare_price AS farePrice,
        r.stops,
        CASE WHEN r.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS status
      FROM routes r
      LEFT JOIN cities sc ON r.source_city_id = sc.id
      LEFT JOIN cities dc ON r.destination_city_id = dc.id
      WHERE r.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    
    if (!rows[0]) return null;

    const route = rows[0];
    // Stops ko array format mein safely parse karna
    if (route.stops) {
      try {
        route.stops = typeof route.stops === 'string' ? JSON.parse(route.stops) : route.stops;
      } catch (e) {
        route.stops = [];
      }
    } else {
      route.stops = [];
    }

    return route;
  }

  static async getRouteById(id) {
    return this.getById(id);
  }

  /**
   * Naya route database mein insert karne ka method (fare_price aur stops ke sath)
   */
  static async create(data) {
    const { 
      route_name, 
      source_city_id, 
      destination_city_id, 
      distance_km, 
      estimated_duration_minutes, 
      fare_price,
      stops,
      is_active 
    } = data;
    
    const isActive = is_active !== undefined ? Number(is_active) : 1;
    // Agar stops array ki surat mein hain toh unhe JSON string bana kar save karna
    const stopsJson = stops ? JSON.stringify(stops) : JSON.stringify([]);
    const farePrice = fare_price !== undefined ? Number(fare_price) : 0;

    const query = `
      INSERT INTO routes (route_name, source_city_id, destination_city_id, distance_km, estimated_duration_minutes, fare_price, stops, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(query, [
      route_name, 
      source_city_id, 
      destination_city_id, 
      distance_km, 
      estimated_duration_minutes,
      farePrice,
      stopsJson,
      isActive
    ]);
    
    return this.getById(result.insertId);
  }

  /**
   * Maujooda route ko update karne ka method
   */
 /**
   * Maujooda route ko update karne ka method (CamelCase aur SnakeCase dono payload support ke sath)
   */
/**
   * Maujooda route ko update karne ka method (Direct Snake_Case Mapping)
   */
  static async update(id, data) {
    const { 
      route_name, 
      source_city_id, 
      destination_city_id, 
      distance_km, 
      estimated_duration_minutes, 
      fare_price,
      stops,
      is_active 
    } = data;
    
    // Values ko properly format karna
    const isActive = is_active !== undefined ? Number(is_active) : undefined;
    const stopsJson = stops !== undefined ? JSON.stringify(stops) : undefined;
    const farePriceVal = fare_price !== undefined ? Number(fare_price) : undefined;
    const durationVal = estimated_duration_minutes !== undefined ? Number(estimated_duration_minutes) : undefined;

    const query = `
      UPDATE routes 
      SET route_name = COALESCE(?, route_name),
          source_city_id = COALESCE(?, source_city_id),
          destination_city_id = COALESCE(?, destination_city_id),
          distance_km = COALESCE(?, distance_km),
          estimated_duration_minutes = COALESCE(?, estimated_duration_minutes),
          fare_price = COALESCE(?, fare_price),
          stops = COALESCE(?, stops),
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [
      route_name || null, 
      source_city_id || null, 
      destination_city_id || null, 
      distance_km || null, 
      durationVal !== undefined ? durationVal : null,
      farePriceVal !== undefined ? farePriceVal : null,
      stopsJson !== undefined ? stopsJson : null,
      isActive !== undefined ? isActive : null, 
      id
    ]);
    
    return result.affectedRows > 0 ? this.getById(id) : null;
  }

  /**
   * Route delete karne ka method
   */
  static async delete(id) {
    const query = `DELETE FROM routes WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }
}

export default RouteModel;