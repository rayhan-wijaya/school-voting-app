CREATE TABLE `organization` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(10) UNIQUE NOT NULL,
    `full_name` VARCHAR(35) UNIQUE NOT NULL
);

CREATE TABLE `organization_pair` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `organization_id` INT NOT NULL,
    `pair_id` INT NOT NULL,

    INDEX `organization_id_index` (`organization_id`),
    INDEX `pair_id_index` (`pair_id`),

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `organization_pair`
    UNIQUE (`organization_id`, `pair_id`)
);

CREATE TABLE `organization_member` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `organization_id` INT NOT NULL,
    `pair_id` INT NOT NULL,
    `nickname` VARCHAR(12) NOT NULL,
    `full_name` VARCHAR(40),
    `position` ENUM('chairman', 'vice_chairman') NOT NULL,
    `image_file_name` varchar(255),

    INDEX `organization_id_index` (`organization_id`),
    INDEX `pair_id_index` (`pair_id`),

    FOREIGN KEY (`pair_id`)
        REFERENCES `organization_pair`(`pair_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization_pair`(`organization_id`)
        ON DELETE CASCADE,

    CONSTRAINT `organization_pair_nickname`
    UNIQUE (`organization_id`, `pair_id`, `nickname`)
);

CREATE TABLE `vote` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `student_id` INT,
    `organization_id` INT,
    `pair_id` INT,

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization_pair`(`organization_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`pair_id`)
        REFERENCES `organization_pair`(`pair_id`)
        ON DELETE CASCADE,

    CONSTRAINT `student_pair_organization`
    UNIQUE (`student_id`, `pair_id`, `organization_id`)
);

CREATE TABLE `admin` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(30) UNIQUE,
    `hashed_password` VARCHAR(64)
);

CREATE TABLE `admin_session` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `token` VARCHAR(64) UNIQUE
);

--

INSERT INTO
    `organization` (`name`, `full_name`)
VALUES
    ('OSIS', 'Organisasi Siswa Intra Sekolah'),
    ('MPK', 'Majelis Perwakilan Kelas');
