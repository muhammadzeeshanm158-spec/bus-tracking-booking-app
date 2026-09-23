 USE bus_tracking_booking_db;
 
 
 create table cities(
  id int auto_increment primary key,
  city_name varchar(100) not null unique,
   province varchar(100) not null,
    created_at  timestamp  default current_timestamp,
     updated_at timestamp  default current_timestamp ON UPDATE CURRENT_TIMESTAMP,
     is_active BOOLEAN DEFAULT TRUE
 );
 
 describe cities;
 
 
 