package org.example.be.repository;

import org.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // tìm tối đa 10 user có username bắt đầu với prefix (không phân biệt hoa thường)
    List<User> findTop10ByUsernameStartingWithIgnoreCaseOrderByUsernameAsc(String prefix);
}