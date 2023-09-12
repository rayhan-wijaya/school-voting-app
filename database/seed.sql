INSERT INTO
    `organization_pair` (`organization_id`, `pair_id`, `name`, `image_file_name`)
VALUES
    (1, 1, 'Maylaff & Rafa', 'maylaff_rafa.webp'),
    (1, 2, 'Flo & Ael', 'flo_ael.webp'),
    (1, 3, 'Raras & Kyoshi', 'raras_kyoshi.webp'),

    (2, 1, 'Syahira & Haekal', 'syahira_haekal.webp'),
    (2, 2, 'Jasmin & Neora', 'jasmin_neora.webp');

INSERT INTO
    `organization_member` (`organization_id`, `pair_id`, `nickname`, `position`, `image_file_name`)
VALUES
    (1, 1, 'Maylaff', 'chairman', 'maylaff.webp'),
    (1, 1, 'Rafa', 'vice_chairman', 'rafa.webp'),
    (1, 2, 'Flo', 'chairman', 'flo.webp'),
    (1, 2, 'Ael', 'vice_chairman', 'ael.webp'),
    (1, 3, 'Raras', 'chairman', 'raras.webp'),
    (1, 3, 'Kyoshi', 'vice_chairman', 'kyoshi.webp'),

    (2, 1, 'Syahira', 'chairman', 'syahira.webp'),
    (2, 1, 'Haekal', 'vice_chairman', 'haekal.webp'),
    (2, 2, 'Jasmin', 'chairman', 'jasmin.webp'),
    (2, 2, 'Neora', 'vice_chairman', 'neora.webp');

INSERT INTO
    `admin` (`username`, `hashed_password`)
VALUES
    ('admin', '9151259f305d1e8f5430498b133ae352e1b657df2d63bbefdcfdc07908e21b89'); -- spjhebat1013 (seed data)
