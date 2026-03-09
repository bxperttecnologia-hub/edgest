USE centro_gestao;

INSERT INTO users (first_name,last_name,email,password_hash,password_salt,role) VALUES
('Admin','Local','joelgonga2020@gmail.com','placeholder','placeholder','admin');

INSERT INTO courses (code,title,description,duration_hours,level,price,payment_parcelas,language,active) VALUES
('CURS001','Excel Avançado','Curso de Excel para utilização avançada',40,'Intermédio',30000.00,3,'PT',1),
('CURS002','Gestão Financeira','Noções de contabilidade e finanças básicas',60,'Básico',45000.00,6,'PT',1);
