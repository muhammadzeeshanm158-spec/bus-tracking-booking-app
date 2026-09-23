USE bus_tracking_booking_db;

create table if not exists users(
 id_role int auto_increment primary key,
 full_name varchar(150) not null,
 email varchar(255) not null unique ,
 phone_number varchar(20) not null unique,
 password varchar(255) not null,
 gender enum("Male", "Female", "other") not null,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_users_role
         FOREIGN KEY (role_id)
     REFERENCES roles(id)
    ON UPDATE CASCADE
         ON DELETE RESTRICT
);

show tables;
desc users;


  
