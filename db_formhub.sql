-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 03-Nov-2025 às 15:22
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `db_formhub`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) NOT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `instructor_id` bigint(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duration_hours` int(11) DEFAULT NULL,
  `level` varchar(100) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `payment_parcelas` int(11) DEFAULT 1,
  `language` varchar(50) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) NOT NULL,
  `student_id` bigint(20) DEFAULT NULL,
  `class_id` bigint(20) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'confirmed',
  `parcelas_total` int(11) DEFAULT NULL,
  `parcelas_pagas` int(11) DEFAULT 0,
  `valor_por_parcela` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `instructors`
--

CREATE TABLE `instructors` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `login_sessions`
--

CREATE TABLE `login_sessions` (
  `id` bigint(20) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `userType` enum('admin','staff','student') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `login_sessions`
--

INSERT INTO `login_sessions` (`id`, `session_id`, `user_id`, `ip_address`, `user_agent`, `userType`, `created_at`, `expires_at`, `is_active`) VALUES
(1, '446932bd2b2d459d0c99389a6812b7b5875dcf60c11453945b1a45b7f7fc151189bfa4ec937c9492daa966eed8024d3aa177eba5a6ef0d6ae17e3dd1470ff72d', 1, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-24 12:24:42', '2025-10-24 15:24:42', 1),
(2, '5bca6df18f2f8941b3c174dca30990086360e10cc35308bd954b90ca34e9296ebfdcb92ff2f15d7061add22ce5582974f7a16a170817ea17c222458ee671f958', 1, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-24 12:27:10', '2025-10-24 15:27:10', 1),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2VsZ29uZ2EyMDIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTMwOTgxNywiZXhwIjoxNzYxOTE0NjE3fQ.14oOtYctjktXr1UfTmv8Y6Me1quRRaEf5ec8OJ9EiTw', 1, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-24 12:43:37', '2025-10-24 15:43:37', 1),
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2VsZ29uZ2EyMDIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTMxMDExNywiZXhwIjoxNzYxOTE0OTE3fQ.R9fkN7YzKV8DWkNSe4K-lsK3NMQkVm786rSW0FjFYe4', 1, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-24 12:48:37', '2025-10-24 15:48:37', 1),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2VsZ29uZ2EyMDIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTY1NjU4NCwiZXhwIjoxNzYyMjYxMzg0fQ.4QbulVyR1PpicZDhTkj6otsSbRb2PudmjEkmYXKOQlY', 2, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-28 13:03:35', '2025-10-28 16:03:35', 1),
(6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2VsZ29uZ2EyMDIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTY1NjY4MSwiZXhwIjoxNzYyMjYxNDgxfQ.FkVB0lYllbYNQSmagdgA94ToQaynWTrlh9eLEJoyNn0', 2, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-28 13:04:41', '2025-10-28 16:04:41', 1),
(7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2VsZ29uZ2EyMDIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTY1Njk4OSwiZXhwIjoxNzYyMjYxNzg5fQ.I_aBZutcp9pPTHJQVAIyZwB6YfGIkm6Jhafr8pExv74', 2, '::ffff:127.0.0.1', 'Insomnia/2023.5.6', 'admin', '2025-10-28 13:09:49', '2025-10-28 16:09:49', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `enrollment_id` bigint(20) DEFAULT NULL,
  `student_id` bigint(20) DEFAULT NULL,
  `parcela_numero` int(11) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'AOA',
  `method` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `transaction_reference` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `students`
--

CREATE TABLE `students` (
  `id` bigint(20) NOT NULL,
  `student_number` varchar(100) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `identity_type` enum('BI','Passaporte') DEFAULT NULL,
  `identity_number` varchar(50) DEFAULT NULL,
  `identity_valid_data` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'prospective',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `students`
--

INSERT INTO `students` (`id`, `student_number`, `name`, `email`, `nationality`, `birth_date`, `identity_type`, `identity_number`, `identity_valid_data`, `address`, `contact`, `status`, `created_at`) VALUES
(1, '1102025', 'José Alberto Silva', 'josesilva@gmail.com', 'Angolano', '2001-10-12', 'BI', '0040550399LA041', '2026-02-05', 'Icole e Bengo, Zango 3, Rua 3 das Amarelas', '931874731', 'prospective', '2025-10-24 13:10:21');

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `first_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `photo` text DEFAULT NULL,
  `password_hash` varchar(256) NOT NULL,
  `password_salt` varchar(64) NOT NULL,
  `role` varchar(50) DEFAULT 'student',
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `photo`, `password_hash`, `password_salt`, `role`, `active`, `created_at`) VALUES
(1, '', '', 'josesilva@gmail.com', NULL, '5a57f28f65b2ba04a4b5c7ac0ef879deb0d02d64cf50a52ec23697ed47955df33289c9b17588e60e118d289ad757da184b489db0c842fbeacbbd6306c80bc36d', 'ee30bd055cfcf4030bbfd995b462cc32', 'student', 1, '2025-10-24 13:10:22'),
(2, '', '', 'joelgonga2020@gmail.com', NULL, 'b7ddfe9793d1d60183d57bdf4591071e17b6da197c4aa143481bab6142b5a704d11149448ef90344345562018d7e22beea4bbe62a021ee691617a21f3fb23638', '5a2dbb8b8ac5f9d4fc9bab2be6b28b4a', 'admin', 1, '2025-10-24 13:22:13'),
(3, '', '', 'joelgonga2020@hotmail.com', NULL, 'f4e373909d19ad3a9ba17d82a9596b543b0745a7cb4adaa85ec0b65578bee851da9e258d7a5d61c0ef963eea77273ef9c5ec6d5644d20de1fc5c53444fa267e1', '04242a5c2224119b2454c9e460d7962c', 'staff', 1, '2025-10-24 13:22:33');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Índices para tabela `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Índices para tabela `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Índices para tabela `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_id` (`enrollment_id`);

--
-- Índices para tabela `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `instructors`
--
ALTER TABLE `instructors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
