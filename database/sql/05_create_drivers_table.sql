 use bus_tracking_booking_db;
 
 create table dirvers(
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    license_number VARCHAR(100) NOT NULL UNIQUE,

    experience_years INT DEFAULT 0,

    joining_date DATE NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_drivers_user
        FOREIGN KEY (user_id)
         REFERENCES users(id)
       ON UPDATE CASCADE
      ON DELETE RESTRICT
 );
 
 show tables;
 desc dirvers;
 SHOW CREATE TABLE drivers;
 
 
 