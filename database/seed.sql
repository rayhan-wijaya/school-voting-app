INSERT INTO
    `organization_pair` (`organization_id`, `pair_id`)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),

    (2, 1),
    (2, 2);

INSERT INTO
    `organization_member` (`organization_id`, `pair_id`, `nickname`, `position`, `image_file_name`)
VALUES
    (1, 1, 'Maylaff', 'chairman', 'maylaff.jpg'),
    (1, 1, 'Rafa', 'vice_chairman', 'rafa.jpg'),
    (1, 2, 'Flo', 'chairman', 'flo.jpg'),
    (1, 2, 'Ael', 'vice_chairman', 'ael.jpg'),
    (1, 3, 'Raras', 'chairman', 'raras.jpg'),
    (1, 3, 'Kyoshi', 'vice_chairman', 'kyoshi.jpg'),

    (2, 1, 'Syahira', 'chairman', 'syahira.jpg'),
    (2, 1, 'Haekal', 'vice_chairman', 'haekal.jpg'),
    (2, 2, 'Jasmin', 'chairman', 'jasmin.jpg'),
    (2, 2, 'Neora', 'vice_chairman', 'neora.jpg');

INSERT INTO
    `admin` (`username`, `hashed_password`)
VALUES
    ('admin', '9151259f305d1e8f5430498b133ae352e1b657df2d63bbefdcfdc07908e21b89'); -- spjhebat1013 (seed data)
