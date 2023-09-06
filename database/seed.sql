INSERT INTO
    `organization_pair` (`organization_id`, `pair_id`)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),

    (2, 1),
    (2, 2);

INSERT INTO
    `organization_member` (`organization_id`, `pair_id`, `nickname`, `full_name`, `position`)
VALUES
    (1, 1, 'Rayhan', 'Rayhan Satria Wijaya', 'vice_chairman'),
    (1, 1, 'Malik', 'Malik Syarif Akbar', 'chairman'),
    (1, 2, 'Akesh', 'Gede Akesh', 'vice_chairman'),
    (1, 2, 'Daffa', 'Daffa Prawono', 'chairman'),
    (1, 3, 'Akesh', 'Gede Akesh', 'vice_chairman'),
    (1, 3, 'Daffa', 'Daffa Prawono', 'chairman'),

    (2, 1, 'Rayhan', 'Rayhan Satria Wijaya', 'vice_chairman'),
    (2, 1, 'Malik', 'Malik Syarif Akbar', 'chairman'),
    (2, 2, 'Akesh', 'Gede Akesh', 'vice_chairman'),
    (2, 2, 'Daffa', 'Daffa Prawono', 'chairman');
