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

INSERT INTO
    `student` (`id`, `full_name`, `password`)
VALUES
    (100, 'Rayhan Satria Wijaya', '532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25'), -- password: Test
    (200, 'Malik Syarif Akbar', '532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25'), -- password: Test
    (300, 'Daffa Prawono', '532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25'), -- password: Test
