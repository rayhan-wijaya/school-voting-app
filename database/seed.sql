INSERT INTO
    `organization_pair` (`organization_id`)
VALUES
    (1),
    (1),
    (2),
    (2);

INSERT INTO
    `organization_member` (`pair_id`, `nickname`, `full_name`, `position`)
VALUES
    (1, 'Rayhan', 'Rayhan Satria Wijaya', 'vice_chairman'),
    (1, 'Malik', 'Malik Syarif Akbar', 'chairman'),
    (2, 'Akesh', 'Gede Akesh', 'vice_chairman'),
    (2, 'Daffa', 'Daffa Prawono', 'chairman'),

    (3, 'Rayhan', 'Rayhan Satria Wijaya', 'vice_chairman'),
    (3, 'Malik', 'Malik Syarif Akbar', 'chairman'),
    (4, 'Akesh', 'Gede Akesh', 'vice_chairman'),
    (4, 'Daffa', 'Daffa Prawono', 'chairman');
