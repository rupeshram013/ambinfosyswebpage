
create table users (
	token int primary key ,
	firstname varchar (32),
	secondname varchar(32),
	username varchar(32) unique,
	usermail varchar(255) unique,
	phone varchar(13),
	userpass varchar(32),
	spending int,
	admin int 
);

create table products (
	id int primary key,
    pname varchar(255),
    image int ,
    pindex int ,
    imagepath varchar(255),
    specification varchar(255),
    brand varchar(255),
    rating int ,
    price int ,
    warranty int ,
    quantity int ,
    category varchar(255)
);

create table laptop(
	id int primary key ,
    model varchar(255),
	series varchar(255),
    type varchar(255),
    processor varchar(255),
    graphics varchar(255),
    ram varchar(255),
    display varchar(255),
    os varchar(255),
    battery varchar(255),
    camera varchar(255),
    ports varchar(255),
    generation varchar(255)
    
);

create table monitor(
	id int primary key,
    resolution varchar(255),
    size varchar(255),
    ports varchar(255),
    type varchar(255),
    panel varchar(255),
    color varchar(255),
    response varchar(255),
    ratio varchar(255),
    refresh varchar(255)
);


create table productorder (
	id int,
	customername varchar(64),
	email varchar(255),
	phonenum varchar(20),
	city varchar(32),
	payment varchar (32),
	address varchar(255),
	total int,token int,
	category varchar(128),
	size varchar(32),
	ordercode int,
	quantity int
);

use ambinfosys;
select * from products;
drop table products;
