CREATE TABLE `organization` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(10) UNIQUE
);

CREATE TABLE `organization_pair` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `organization_id` INT,
    `pair_id` INT,

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `organization_pair`
    UNIQUE (`organization_id`, `pair_id`)
);

CREATE TABLE `organization_member` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `pair_id` INT,
    `nickname` VARCHAR(12),
    `full_name` VARCHAR(40),
    `position` ENUM('chairman', 'vice_chairman'),

    FOREIGN KEY (`pair_id`)
        REFERENCES `organization_pair`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `pair_id_nickname`
    UNIQUE (`pair_id`, `nickname`)
);

CREATE TABLE `student` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `full_name` VARCHAR(40),
    `hashed_password` VARCHAR(64) -- sha256
);

CREATE TABLE `vote` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `student_id` INT,
    `organization_id` INT,
    `pair_id` INT,

    FOREIGN KEY (`student_id`)
        REFERENCES `student`(`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization_pair`(`organization_id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`pair_id`)
        REFERENCES `organization_pair`(`pair_id`)
        ON DELETE CASCADE,

    CONSTRAINT `student_pair`
    UNIQUE (`student_id`, `pair_id`)
);

--

INSERT INTO
    `organization` (`name`)
VALUES
    ('OSIS'),
    ('MPK');
