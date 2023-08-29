CREATE TABLE `organization` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(10) UNIQUE
);

CREATE TABLE `organization_member` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `organization_id` INT,
    `nickname` VARCHAR(12),
    `full_name` VARCHAR(40),
    `position` ENUM('chairman', 'vice_chairman'),

    FOREIGN KEY (`organization_id`)
        REFERENCES `organization`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `organization_id_nickname`
    UNIQUE (`organization_id`, `nickname`)
);

CREATE TABLE `vote` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `student_id` INT,
    `organization_member_id` INT,

    FOREIGN KEY (`organization_member_id`)
        REFERENCES `organization_member`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `student_organization_member`
    UNIQUE (`student_id`, `organization_member_id`)
);

--

INSERT INTO
    `organization` (`name`)
VALUES
    ('OSIS'),
    ('MPK');
