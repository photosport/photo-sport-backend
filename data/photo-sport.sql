CREATE TABLE userphotosport (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isVerified BOOLEAN,
    role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
);
