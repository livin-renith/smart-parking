-- Seed data for Smart Parking database
USE smart_parking;

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', 'adminpass', 'admin'),
('Regular User', 'user@example.com', 'userpass', 'user');

INSERT INTO parking_slots (slot_number, status) VALUES
('A1', 'available'),
('A2', 'available'),
('B1', 'available'),
('B2', 'available');
