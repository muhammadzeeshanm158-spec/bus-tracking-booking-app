USE bus_tracking_booking_db;

create table roles (
 id int auto_increment primary key,
 role_name varchar(50)  not null unique,
     description varchar(255),
     created_at  timestamp  default current_timestamp,
     updated_at timestamp  default current_timestamp ON UPDATE CURRENT_TIMESTAMP
);
show  tables;

describe roles;
