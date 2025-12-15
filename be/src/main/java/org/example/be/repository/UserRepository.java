package org.example.be.repository;

import org.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String email, String username);

    Boolean existsByEmail(String email);

    Boolean existsByUsername(String username);

    List<User> findTop20ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);


}
