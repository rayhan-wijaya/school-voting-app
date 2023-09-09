INSERT INTO
    `organization_pair` (`organization_id`, `pair_id`)
VALUES
    (2, 1),
    (2, 2);

INSERT INTO
    `organization_member` (`organization_id`, `pair_id`, `nickname`, `position`, `image_file_name`)
VALUES
    (2, 1, 'Syahira', 'chairman', 'syahira.jpg'),
    (2, 1, 'Haekal', 'vice_chairman', 'haekal.jpg'),

    (2, 2, 'Jasmin', 'chairman', 'jasmin.jpg'),
    (2, 2, 'Neora', 'vice_chairman', 'neora.jpg');
